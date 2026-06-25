import { create } from 'zustand';
import { streamAnalysis } from '../api/agent.api';

/**
 * pipelineStore
 *
 * Central hub for the analysis pipeline state.
 * AgentProgressBar and AnalyzePage read from this.
 * useSSE hook writes into it via the actions below.
 *
 * status: 'idle' | 'running' | 'done' | 'error'
 *
 * agentProgress shape:
 * {
 *   extractor:   { status: 'done'|'running'|'waiting'|'error', message: string },
 *   matcher:     { ... },
 *   interviewer: { ... },
 *   editor:      { ... },
 *   finalize:    { ... },
 * }
 *
 * matchResult shape (from Agent 2, stored in MongoDB MatchResult):
 * {
 *   overall_score, semantic_similarity, skill_match_pct,
 *   matched_skills, missing_skills, bonus_skills,
 *   strength_areas, gap_areas,
 *   interview_questions: [{ question, type, topic, why_asked, answer_framework }],
 *   suggestions: { suggestions: [...], missing_sections: [], summary_rewrite },
 *   resume_name, job_title, company,
 * }
 */
const usePipelineStore = create((set) => ({
  status: 'idle',
  sessionId: null,
  agentProgress: {},
  matchResult: null,
  error: null,

  // ─── Called by PipelineSelector when Run is clicked ───────────────────────
  run: async (resumeId, jobId) => {
    set({
      status: 'running',
      sessionId: `${resumeId}-${jobId}`,
      agentProgress: {
        extractor: { status: 'running', message: 'Starting analysis…' },
      },
      matchResult: null,
      error: null,
    });

    try {
      const result = await streamAnalysis({
        resumeId,
        jobId,
        onEvent: ({ event, data }) => {
          if (event === 'complete') {
            set({
              matchResult: data,
              status: 'done',
              agentProgress: {
                extractor: { status: 'done', message: 'Resume parsed' },
                matcher: { status: 'done', message: 'Match scored' },
                interviewer: { status: 'done', message: 'Questions ready' },
                editor: { status: 'done', message: 'Suggestions ready' },
                finalize: { status: 'done', message: 'Complete' },
              },
            });
          } else if (data?.agentName) {
            set((state) => ({
              agentProgress: {
                ...state.agentProgress,
                [data.agentName]: { status: data.status, message: data.message ?? '' },
              },
            }));
          }
        },
      });
      return result;
    } catch (err) {
      set({
        status: 'error',
        error: err?.response?.data?.message ?? err?.message ?? 'Failed to start analysis.',
      });
      return null;
    }
  },

  setSessionId: (sessionId) => set({ sessionId }),

  // ─── Called by useSSE on each SSE message ─────────────────────────────────
  setAgentProgress: (agentName, status, message = '') =>
    set((s) => ({
      agentProgress: {
        ...s.agentProgress,
        [agentName]: { status, message },
      },
    })),

  // ─── Called by useSSE when SSE 'done' event fires ─────────────────────────
  setMatchResult: (result) => set({ matchResult: result, status: 'done' }),

  // ─── Called by useSSE if SSE errors ───────────────────────────────────────
  setError: (message) => set({ status: 'error', error: message }),

  reset: () =>
    set({ status: 'idle', sessionId: null, agentProgress: {}, matchResult: null, error: null }),
}));

export default usePipelineStore;
