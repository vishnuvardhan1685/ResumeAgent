/**
 * constants.js
 *
 * App-wide constants. Values that differ per environment
 * must come from import.meta.env, not from here.
 */

// ── API ───────────────────────────────────────────────────────────────────────
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

// ── Score bands (used for color-coding everywhere) ────────────────────────────
export const SCORE_BANDS = {
  EXCELLENT: 85,
  STRONG: 75,
  MODERATE: 60,
  PARTIAL: 40,
};

// ── Upload limits ─────────────────────────────────────────────────────────────
export const MAX_RESUME_SIZE_MB = 5;
export const ACCEPTED_RESUME_TYPES = ['application/pdf'];

// ── Agent pipeline step keys (must match FastAPI agentName values) ────────────
export const AGENT_KEYS = ['extractor', 'matcher', 'interviewer', 'editor', 'finalize'];

// ── Interview question types ──────────────────────────────────────────────────
export const QUESTION_TYPES = {
  technical: 'Technical',
  behavioral: 'Behavioral',
  system_design: 'System Design',
};

// ── Job discovery sources ─────────────────────────────────────────────────────
export const JOB_SOURCES = {
  google_jobs: 'Google Jobs',
  internshala: 'Internshala',
};

// ── Pagination ────────────────────────────────────────────────────────────────
export const PAGE_SIZE = 20;