import { useEffect } from 'react';
import usePipelineStore from '../store/pipelineStore';
import { getAnalysisResult } from '../api/agent.api';

/**
 * useMatchResult
 *
 * Returns the current matchResult from pipelineStore.
 * If status === 'done' but matchResult is null (e.g. SSE was missed),
 * falls back to polling GET /api/agent/result/:sessionId once.
 *
 * Usage:
 *   const matchResult = useMatchResult();
 */
const useMatchResult = () => {
  const { matchResult, status, sessionId, setMatchResult } = usePipelineStore();

  useEffect(() => {
    if (status !== 'done' || matchResult || !sessionId) return;

    // SSE may have closed before the 'done' event was received — poll once
    const poll = async () => {
      try {
        const result = await getAnalysisResult(sessionId);
        if (result) setMatchResult(result);
      } catch (err) {
        console.error('Polling match result failed:', err);
      }
    };

    poll();
  }, [status, matchResult, sessionId, setMatchResult]);

  return matchResult;
};

export default useMatchResult;
