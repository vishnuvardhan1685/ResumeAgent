import { useEffect, useRef } from 'react';
import usePipelineStore from '../store/pipelineStore';

/**
 * useSSE
 *
 * Opens an EventSource (SSE) connection to the agent stream URL.
 * Drives pipelineStore.setAgentProgress and .setMatchResult automatically.
 * Cleans up the connection when the component unmounts or url changes.
 *
 * Usage in AnalyzePage.jsx:
 *   useSSE(sseUrl);   // sseUrl = null until sessionId is available
 *
 * SSE event contract (FastAPI → Node proxy → client):
 *
 *   Progress event (type = 'message'):
 *     data: JSON.stringify({ agentName, status, message })
 *     agentName: 'extractor' | 'matcher' | 'interviewer' | 'editor' | 'finalize'
 *     status: 'running' | 'done' | 'error'
 *
 *   Completion event (type = 'done'):
 *     data: JSON.stringify({ type: 'done', result: MatchResult })
 *
 *   Error event (type = 'error' or onerror):
 *     data: JSON.stringify({ type: 'error', message: string })
 */
const useSSE = (url) => {
  const esRef = useRef(null);
  const { setAgentProgress, setMatchResult, setError } = usePipelineStore();

  useEffect(() => {
    if (!url) return;

    // Close any existing connection
    if (esRef.current) {
      esRef.current.close();
    }

    const es = new EventSource(url);
    esRef.current = es;

    // ── Default 'message' event — agent progress ──────────────────────────
    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);

        if (payload.type === 'done') {
          setMatchResult(payload.result);
          es.close();
          return;
        }

        if (payload.type === 'error') {
          setError(payload.message ?? 'Pipeline error');
          es.close();
          return;
        }

        // Progress event
        if (payload.agentName) {
          setAgentProgress(payload.agentName, payload.status, payload.message);
        }
      } catch (err) {
        console.error('[useSSE] Failed to parse event data:', e.data, err);
      }
    };

    // ── Named 'done' event (if server sends event: done) ─────────────────
    es.addEventListener('done', (e) => {
      try {
        const payload = JSON.parse(e.data);
        setMatchResult(payload.result ?? payload);
      } catch {
        setError('Failed to parse final result');
      }
      es.close();
    });

    // ── Named 'error' event ───────────────────────────────────────────────
    es.addEventListener('error', (e) => {
      try {
        const payload = JSON.parse(e.data);
        setError(payload.message ?? 'Stream error');
      } catch {
        // onerror already handles connection errors
      }
    });

    // ── Connection error (network, 401, etc.) ─────────────────────────────
    es.onerror = () => {
      setError('Lost connection to agent stream. Please retry.');
      es.close();
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [url, setAgentProgress, setError, setMatchResult]);
};

export default useSSE;
