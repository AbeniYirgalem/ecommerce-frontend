// src/hooks/useChatQueue.js
// ─────────────────────────────────────────────────────────────────────────
// Custom hook that manages the full lifecycle of an async chatbot message:
//
//   1. User sends message → addMessage() enqueues it via POST /api/chat/queue
//   2. Message appears immediately in the chat as a "user" bubble
//   3. A "bot typing" placeholder is shown while the job runs
//   4. A polling loop calls GET /api/chat/status/:jobId every POLL_INTERVAL ms
//   5. When status === "completed" → replace placeholder with the AI reply
//   6. When status === "failed"    → replace placeholder with an error message
//   7. If MAX_POLL_TIME elapses    → show a timeout error
//
// This hook is PURELY about state + async logic — no JSX inside.
// ─────────────────────────────────────────────────────────────────────────

import { useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { sendMessageAsync, pollJobStatus, sendMessageSync } from "../services/chat.service";

// ── Polling configuration ──────────────────────────────────────────────────
const POLL_INTERVAL_MS   = 1500;  // check every 1.5 s
const MAX_POLL_TIME_MS   = 60_000; // give up after 60 s
const TERMINAL_STATUSES  = new Set(["completed", "failed"]);

// ── Unique ID generator for message list keys ──────────────────────────────
let _uid = 0;
const uid = () => `msg_${Date.now()}_${++_uid}`;

/**
 * useChatQueue
 *
 * @returns {{
 *   messages: Message[],
 *   isProcessing: boolean,
 *   addMessage: (text: string) => Promise<void>,
 *   clearMessages: () => void,
 * }}
 *
 * Message shape:
 *   { id, sender: 'user'|'bot', type: 'text'|'rag'|'help'|'typing'|'error',
 *     text: string, products?: any[], priceBand?: string, jobId?: string }
 */
const useChatQueue = () => {
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Active polling timers — stored in a ref so we can cancel on unmount
  const pollTimersRef = useRef(new Map()); // jobId → { intervalId, timeoutId }

  // Read logged-in userId from Redux (optional — falls back to "anonymous")
  const userId = useSelector((state) => state.auth?.user?._id || state.auth?.user?.id);

  // ── helpers ───────────────────────────────────────────────────────────────

  const appendMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const replaceMessage = useCallback((id, updates) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    );
  }, []);

  const cancelPolling = useCallback((jobId) => {
    const timers = pollTimersRef.current.get(jobId);
    if (timers) {
      clearInterval(timers.intervalId);
      clearTimeout(timers.timeoutId);
      pollTimersRef.current.delete(jobId);
    }
  }, []);

  // ── polling logic ─────────────────────────────────────────────────────────

  /**
   * startPolling — repeatedly calls pollJobStatus until the job is done.
   *
   * @param {string} jobId         - The BullMQ job ID to poll
   * @param {string} placeholderId - The "typing…" message ID to replace
   */
  const startPolling = useCallback(
    (jobId, placeholderId) => {
      const intervalId = setInterval(async () => {
        try {
          const { status, result, error } = await pollJobStatus(jobId);

          if (!TERMINAL_STATUSES.has(status)) return; // still waiting / active

          // ── Job completed ─────────────────────────────────────────────────
          cancelPolling(jobId);

          if (status === "completed" && result) {
            replaceMessage(placeholderId, {
              type: result.type || "text",
              text: result.reply || "Here are the results from UniBazzar!",
              products: result.products || [],
              priceBand: result.priceBand || null,
            });
          } else {
            // Job failed after all retries
            replaceMessage(placeholderId, {
              type: "error",
              text:
                error ||
                "Sorry, the assistant ran into an issue. Please try again.",
            });
          }

          setIsProcessing(false);
        } catch (err) {
          // Network error during polling — don't stop yet, keep trying
          console.warn("[useChatQueue] polling error:", err.message);
        }
      }, POLL_INTERVAL_MS);

      // Safety timeout — give up if job takes too long
      const timeoutId = setTimeout(() => {
        cancelPolling(jobId);
        replaceMessage(placeholderId, {
          type: "error",
          text: "The assistant took too long to respond. Please try again.",
        });
        setIsProcessing(false);
      }, MAX_POLL_TIME_MS);

      pollTimersRef.current.set(jobId, { intervalId, timeoutId });
    },
    [cancelPolling, replaceMessage],
  );

  // ── public API ────────────────────────────────────────────────────────────

  /**
   * addMessage — the main entry point called when a user sends a message.
   *
   * Flow:
   *   1. Optimistically append user bubble
   *   2. Append "typing" placeholder for the bot
   *   3. POST /api/chat/queue → get jobId
   *   4. Start polling until job completes
   *   5. Replace typing bubble with actual result (or error)
   *
   * Falls back to the legacy synchronous endpoint if the queue call fails.
   */
  const addMessage = useCallback(
    async (text) => {
      const trimmed = (text || "").trim();
      if (!trimmed || isProcessing) return;

      setIsProcessing(true);

      // ── Step 1: Show user message immediately ─────────────────────────────
      const userMsgId = uid();
      appendMessage({
        id: userMsgId,
        sender: "user",
        type: "text",
        text: trimmed,
      });

      // ── Step 2: Show "typing…" placeholder ───────────────────────────────
      const placeholderId = uid();
      appendMessage({
        id: placeholderId,
        sender: "bot",
        type: "typing",
        text: "",
      });

      // ── Step 3: Enqueue the job ───────────────────────────────────────────
      try {
        const { jobId } = await sendMessageAsync(trimmed, userId);

        // ── Step 4: Poll until done ────────────────────────────────────────
        startPolling(jobId, placeholderId);
      } catch (queueErr) {
        console.error("[useChatQueue] queue path failed:", queueErr.message);

        // ── Fallback: synchronous call ─────────────────────────────────────
        try {
          const syncResult = await sendMessageSync(trimmed);
          replaceMessage(placeholderId, {
            type: syncResult.type || "text",
            text: syncResult.reply || "Here is what I found.",
            products: syncResult.products || [],
            priceBand: syncResult.priceBand || null,
          });
        } catch (syncErr) {
          replaceMessage(placeholderId, {
            type: "error",
            text:
              syncErr?.response?.data?.message ||
              "Sorry, I ran into an issue. Please try again.",
          });
        }

        setIsProcessing(false);
      }
    },
    [isProcessing, userId, appendMessage, replaceMessage, startPolling],
  );

  /**
   * clearMessages — wipe the chat history (used when the chat widget closes).
   */
  const clearMessages = useCallback(() => {
    // Cancel any pending polls before clearing
    for (const jobId of pollTimersRef.current.keys()) {
      cancelPolling(jobId);
    }
    setMessages([]);
    setIsProcessing(false);
  }, [cancelPolling]);

  return { messages, isProcessing, addMessage, clearMessages };
};

export default useChatQueue;
