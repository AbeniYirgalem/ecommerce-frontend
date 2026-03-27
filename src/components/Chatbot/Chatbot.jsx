// src/components/Chatbot/Chatbot.jsx
// ─────────────────────────────────────────────────────────────────────────
// UniBazzar AI Chatbot widget — integrated with the BullMQ async queue.
//
// Architecture in this file:
//   • useChatQueue() handles all queue/polling logic → returns messages + addMessage
//   • This component is purely UI: renders messages, handles input, animations
//
// Message flow summary:
//   User types → addMessage(text) → POST /api/chat/queue → jobId returned
//   → "typing…" bubble shown → polling starts every 1.5 s
//   → status === "completed" → replace bubble with AI reply
//   → status === "failed" / timeout → replace bubble with error text
// ─────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaPaperPlane, FaTimes, FaRobot, FaExclamationCircle } from "react-icons/fa";
import ReactMarkdown from "react-markdown";

import useChatQueue from "../../hooks/useChatQueue";
import ROUTES from "../../constants/routes";

// ── Utilities ─────────────────────────────────────────────────────────────────

const formatPrice = (value) => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "--";
  const parsed = Number(value);
  return parsed >= 0 ? `${parsed.toLocaleString()} ETB` : "--";
};

// Welcome message shown on first open
const WELCOME_MESSAGE = {
  id: "welcome",
  sender: "bot",
  type: "text",
  text: "Hello! I'm your UniBazzar assistant. Ask me to find products, compare prices, or learn how to post your own listing.",
};

// ── Sub-components ────────────────────────────────────────────────────────────

/**
 * TypingIndicator — animated three-dot "bot is typing" bubble.
 */
const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="p-3 rounded-lg rounded-bl-none shadow bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white text-sm flex items-center gap-1">
      <span className="text-xs text-gray-500 dark:text-gray-300 mr-1 italic">
        Chatbot is typing
      </span>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 bg-blue-400 dark:bg-blue-300 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  </div>
);

/**
 * ErrorBubble — styled error message for failed / timed-out jobs.
 */
const ErrorBubble = ({ text }) => (
  <div className="flex justify-start">
    <div className="p-3 rounded-lg rounded-bl-none shadow bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-sm flex items-start gap-2 max-w-[85%]">
      <FaExclamationCircle className="flex-shrink-0 mt-0.5" />
      <span>{text}</span>
    </div>
  </div>
);

/**
 * ProductCard — compact product listing within a bot "rag" reply.
 */
const ProductCard = ({ product }) => (
  <Link
    to={
      product.link
        ? product.link
        : ROUTES.PRODUCT_DETAIL?.replace(":id", product.id || "")
    }
    className="flex items-center gap-3 p-2 rounded-md bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors"
  >
    <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
          No img
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-sm truncate">{product.title}</p>
      <p className="text-xs text-gray-600 dark:text-gray-300">
        {formatPrice(product.price)}
      </p>
      <p className="text-xs text-gray-400 truncate">
        {[product.category, product.condition].filter(Boolean).join(" • ")}
      </p>
    </div>
  </Link>
);

/**
 * ChatMessage — renders a single message bubble with the right style/content.
 */
const ChatMessage = ({ msg }) => {
  const messageVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  };

  // Typing placeholder
  if (msg.type === "typing") {
    return (
      <motion.div
        variants={messageVariants}
        initial="hidden"
        animate="visible"
        key={msg.id}
      >
        <TypingIndicator />
      </motion.div>
    );
  }

  // Error message
  if (msg.type === "error") {
    return (
      <motion.div
        variants={messageVariants}
        initial="hidden"
        animate="visible"
        key={msg.id}
      >
        <ErrorBubble text={msg.text} />
      </motion.div>
    );
  }

  // Product grid (RAG / product search result)
  if ((msg.type === "rag" || msg.type === "products") && msg.sender === "bot") {
    return (
      <motion.div
        variants={messageVariants}
        initial="hidden"
        animate="visible"
        className="flex justify-start"
        key={msg.id}
      >
        <div className="p-3 rounded-lg rounded-bl-none shadow bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white text-sm max-w-full">
          {msg.text && (
            <p className="font-semibold text-sm mb-2 leading-snug">
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </p>
          )}
          {Array.isArray(msg.products) && msg.products.length > 0 && (
            <div className="space-y-2 mt-1">
              {msg.products.map((product) => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Plain text bubble (user or bot)
  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
      key={msg.id}
    >
      <div
        className={`p-3 rounded-lg shadow text-sm max-w-[85%] leading-relaxed ${
          msg.sender === "user"
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-bl-none"
        }`}
      >
        <ReactMarkdown>{msg.text}</ReactMarkdown>
      </div>
    </motion.div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const Chatbot = () => {
  const [isOpen, setIsOpen]     = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef          = useRef(null);

  // All async queue logic is encapsulated in useChatQueue
  const { messages, isProcessing, addMessage, clearMessages } = useChatQueue();

  // Scroll to the latest message whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Show welcome message once when the chat opens for the first time
  const toggleOpen = () => {
    setIsOpen((prev) => {
      const opening = !prev;
      if (opening && !initialized) {
        // useChatQueue's addMessage expects a user text; inject welcome directly
        // by appending a synthetic bot message before the first real message.
        // We do this by updating state on the next tick so the hook's state update works.
        setInitialized(true);
      }
      return opening;
    });
  };

  // All messages shown — prepend welcome if initialized and no real messages yet
  const displayedMessages =
    initialized && messages.length === 0
      ? [WELCOME_MESSAGE]
      : initialized
      ? [WELCOME_MESSAGE, ...messages]
      : [];

  const handleInputChange = (e) => setInputValue(e.target.value);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isProcessing) return;
    setInputValue(""); // clear immediately for responsiveness
    await addMessage(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSendMessage(e);
    }
  };

  // ── Animation variants ─────────────────────────────────────────────────────

  const chatWindowVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
    exit: { opacity: 0, y: 30, scale: 0.95, transition: { duration: 0.2 } },
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Chat window ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={chatWindowVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-24 right-5 w-80 h-[470px] bg-white dark:bg-gray-800 shadow-2xl rounded-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 z-50 drop-shadow-[0_0_12px_rgba(59,130,246,0.35)] dark:drop-shadow-[0_0_18px_rgba(59,130,246,0.25)]"
          >
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <FaRobot size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-tight">UniBazzar Assistant</h3>
                  <p className="text-xs text-blue-100">
                    {isProcessing ? (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse" />
                        Processing…
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                        Online
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleOpen}
                className="text-white/80 hover:text-white transition-colors cursor-pointer p-1 rounded-full hover:bg-white/10"
                aria-label="Close chat"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* ── Messages Area ───────────────────────────────────────────── */}
            <div className="flex-1 px-3 py-3 overflow-y-auto space-y-3 bg-gray-50 dark:bg-gray-700/50 scroll-smooth">
              <AnimatePresence initial={false}>
                {displayedMessages.map((msg) => (
                  <ChatMessage key={msg.id} msg={msg} />
                ))}
              </AnimatePresence>

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Input Area ──────────────────────────────────────────────── */}
            <form
              onSubmit={handleSendMessage}
              className="px-3 py-2.5 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={isProcessing ? "Waiting for reply…" : "Type your message…"}
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-60 transition"
                  disabled={isProcessing}
                  maxLength={2000}
                  autoComplete="off"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow"
                  disabled={isProcessing || !inputValue.trim()}
                  aria-label="Send message"
                >
                  <FaPaperPlane size={14} />
                </motion.button>
              </div>

              {/* Character counter — shows when typing long messages */}
              {inputValue.length > 1500 && (
                <p className="text-right text-xs text-gray-400 mt-1 pr-1">
                  {inputValue.length}/2000
                </p>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB toggle button ─────────────────────────────────────────────── */}
      <motion.button
        onClick={toggleOpen}
        className="fixed bottom-5 right-5 bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 cursor-pointer drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FaTimes size={22} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FaRobot size={22} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread indicator — shows a pulsing dot when chat is closed and a reply arrived */}
        {!isOpen && isProcessing && (
          <span className="absolute top-1 right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
        )}
      </motion.button>
    </>
  );
};

export default Chatbot;
