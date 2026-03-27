// src/services/chat.service.js
// ─────────────────────────────────────────────────────────────────────────
// API layer for chatbot communication with the BullMQ backlog system.
//
// Two paths are available:
//   1. sendMessageAsync()   → POST /api/chat/queue  (async, returns jobId)
//   2. pollJobStatus()      → GET  /api/chat/status/:jobId
//   3. sendMessageSync()    → POST /api/chat  (legacy synchronous fallback)
//
// All functions use the shared `api` Axios instance which attaches JWT tokens
// and handles retries automatically via its interceptors.
// ─────────────────────────────────────────────────────────────────────────

import api from "../lib/axios";
import { API_ENDPOINTS } from "../constants/api";

/**
 * sendMessageAsync
 * ────────────────
 * Enqueues a chatbot message in the BullMQ queue.
 * Returns immediately with a jobId — does NOT wait for the AI response.
 *
 * @param {string} message  - The user's message text
 * @param {string} [userId] - Optional user ID to tag the job (e.g. from Redux auth)
 * @param {number} [priority=5] - Job priority: 1 = highest, 10 = lowest
 * @returns {Promise<{ jobId: string }>}
 */
export const sendMessageAsync = async (message, userId, priority = 5) => {
  const { data } = await api.post(API_ENDPOINTS.CHAT_QUEUE, {
    message: message.trim(),
    userId: userId || "anonymous",
    priority,
  });

  // Backend returns { success: true, jobId: "..." }
  if (!data?.jobId) {
    throw new Error("Queue did not return a jobId");
  }

  return { jobId: data.jobId };
};

/**
 * pollJobStatus
 * ─────────────
 * Fetches the current status and (when done) the result of a queued job.
 *
 * @param {string} jobId  - The job ID returned by sendMessageAsync
 * @returns {Promise<{
 *   status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed',
 *   result: { type: string, reply: string, products?: any[], priceBand?: string } | null,
 *   error: string | null
 * }>}
 */
export const pollJobStatus = async (jobId) => {
  const { data } = await api.get(API_ENDPOINTS.CHAT_STATUS(jobId));
  return {
    status: data.status,
    result: data.result ?? null,
    error: data.error ?? null,
    attemptsMade: data.attemptsMade ?? 0,
  };
};

/**
 * sendMessageSync (legacy fallback)
 * ─────────────────────────────────
 * Calls the original synchronous endpoint. Use this only when Redis is
 * unavailable or as a fallback when the queue endpoint fails.
 *
 * @param {string} message
 * @returns {Promise<{ type: string, reply: string, products?: any[] }>}
 */
export const sendMessageSync = async (message) => {
  const { data } = await api.post(API_ENDPOINTS.CHAT, {
    message: message.trim(),
  });
  return data;
};

export default { sendMessageAsync, pollJobStatus, sendMessageSync };
