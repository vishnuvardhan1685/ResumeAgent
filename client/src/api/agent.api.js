import axiosInstance from './axiosInstance';

/**
 * agent.api.js
 *
 * Matches backend routes/agent.js  →  /api/agent/*
 * The Node backend proxies these to the FastAPI agent_service.
 *
 * Backend endpoints:
 *   POST /api/agent/analyze     { resumeId, jobId } → { sessionId }
 *   GET  /api/agent/stream/:sessionId               → SSE stream (EventSource)
 *   GET  /api/agent/result/:sessionId               → MatchResult (poll fallback)
 *
 * SSE event format (from FastAPI /analyze SSE):
 *   data: { agentName, status, message }     (progress events)
 *   data: { type: 'done', result: MatchResult }  (final event)
 *   data: { type: 'error', message: string }
 *
 * The SSE stream URL is constructed below — pass it to useSSE hook.
 * EventSource doesn't support custom headers, so we pass the token as a
 * query param. Your backend auth middleware must accept ?token= as well.
 * See server/src/middleware/auth.js → support req.query.token fallback.
 */

export const triggerAnalyze = async ({ resumeId, jobId }) => {
  const { data } = await axiosInstance.post('/api/agent/analyze', { resumeId, jobId });
  return data; // { sessionId }
};

export const getSSEUrl = (sessionId, accessToken) => {
  const base = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';
  return `${base}/api/agent/stream/${sessionId}?token=${accessToken}`;
};

export const getAnalysisResult = async (sessionId) => {
  const { data } = await axiosInstance.get(`/api/agent/result/${sessionId}`);
  return data; // MatchResult
};