import React from 'react';
import { CheckCircle2, Circle, Loader2, Flag } from 'lucide-react';
import usePipelineStore from '../../store/pipelineStore';

/**
 * Agent step definition.
 * status: 'done' | 'running' | 'waiting' | 'error'
 */
const AGENTS = [
  { key: 'extractor', label: 'Extractor' },
  { key: 'matcher', label: 'Matcher' },
  // Interviewer and Editor run in parallel — shown as a branch
  { key: 'interviewer', label: 'Interviewer', parallel: true },
  { key: 'editor', label: 'Editor', parallel: true },
  { key: 'finalize', label: 'Finalize' },
];

const StatusIcon = ({ status, size = 18 }) => {
  if (status === 'done') return <CheckCircle2 size={size} className="text-emerald-400" />;
  if (status === 'running')
    return <Loader2 size={size} className="text-accent animate-spin" />;
  if (status === 'error') return <Circle size={size} className="text-red-400" />;
  return <Circle size={size} className="text-text-muted" />;
};

const statusLabel = (status, key, agentProgress) => {
  const p = agentProgress?.[key];
  if (status === 'done') return '100% Parsed';
  if (status === 'running') return p?.message ?? 'Running…';
  if (status === 'error') return 'Error';
  return 'Waiting';
};

const AgentProgressBar = () => {
  const { status, agentProgress, sessionId } = usePipelineStore();

  if (status === 'idle') return null;

  // Build per-agent status from agentProgress map
  // agentProgress shape: { extractor: { status, message }, matcher: { status, message }, ... }
  const getStatus = (key) => agentProgress?.[key]?.status ?? 'waiting';

  // Separate linear and parallel agents
  const linearAgents = AGENTS.filter((a) => !a.parallel && a.key !== 'finalize');
  const parallelAgents = AGENTS.filter((a) => a.parallel);
  const finalizeAgent = AGENTS.find((a) => a.key === 'finalize');

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          {/* Spinning cog icon */}
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            className="text-accent animate-spin"
            style={{ animationDuration: '3s' }}
          >
            <path
              d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 3a7 7 0 110 14A7 7 0 0112 5z"
              fill="currentColor" opacity="0.2"
            />
            <path
              d="M12 2C6.477 2 2 6.477 2 12"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            />
          </svg>
          <p className="text-sm font-semibold text-text-primary">Live Agent Progress</p>
        </div>
        {sessionId && (
          <span className="font-mono text-2xs text-text-muted bg-elevated border border-border px-2 py-1 rounded-lg flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            PROCESSING_PID_{sessionId.slice(-4).toUpperCase()}
          </span>
        )}
      </div>

      {/* Progress track */}
      <div className="relative flex items-start">
        {/* Linear agents */}
        {linearAgents.map((agent, i) => {
          const agentStatus = getStatus(agent.key);
          const isLast = i === linearAgents.length - 1;
          return (
            <React.Fragment key={agent.key}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all
                  ${agentStatus === 'done' ? 'border-emerald-500 bg-emerald-500/10' : ''}
                  ${agentStatus === 'running' ? 'border-accent bg-accent/10' : ''}
                  ${agentStatus === 'waiting' ? 'border-border bg-elevated' : ''}
                `}
                >
                  <StatusIcon status={agentStatus} size={16} />
                </div>
                <p
                  className={`text-xs font-semibold mt-2 ${
                    agentStatus === 'running'
                      ? 'text-text-primary'
                      : agentStatus === 'done'
                      ? 'text-emerald-400'
                      : 'text-text-muted'
                  }`}
                >
                  {agent.label}
                </p>
                <p className="text-2xs text-text-muted mt-0.5">
                  {statusLabel(agentStatus, agent.key, agentProgress)}
                </p>
              </div>
              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 mt-4 mx-2">
                  <div
                    className={`h-0.5 w-full rounded-full transition-all ${
                      agentStatus === 'done' ? 'bg-emerald-500/60' : 'bg-border'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Connector to parallel branch */}
        <div className="flex-1 mt-4 mx-2">
          <div
            className={`h-0.5 w-full rounded-full ${
              getStatus('matcher') === 'done' ? 'bg-emerald-500/60' : 'bg-border'
            }`}
          />
        </div>

        {/* Parallel agents (branching) */}
        <div className="flex flex-col gap-3 items-start">
          {parallelAgents.map((agent) => {
            const agentStatus = getStatus(agent.key);
            return (
              <div key={agent.key} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all
                  ${agentStatus === 'done' ? 'border-emerald-500 bg-emerald-500/10' : ''}
                  ${agentStatus === 'running' ? 'border-accent bg-accent/10' : ''}
                  ${agentStatus === 'waiting' ? 'border-border bg-elevated' : ''}
                `}
                >
                  <StatusIcon status={agentStatus} size={14} />
                </div>
                <div>
                  <p
                    className={`text-xs font-semibold ${
                      agentStatus === 'running'
                        ? 'text-text-primary'
                        : agentStatus === 'done'
                        ? 'text-emerald-400'
                        : 'text-text-muted'
                    }`}
                  >
                    {agent.label}
                  </p>
                  <p className="text-2xs text-text-muted">
                    {statusLabel(agentStatus, agent.key, agentProgress)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Connector to finalize */}
        <div className="flex-1 mt-4 mx-2">
          <div
            className={`h-0.5 w-full rounded-full ${
              getStatus('interviewer') === 'done' && getStatus('editor') === 'done'
                ? 'bg-emerald-500/60'
                : 'bg-border'
            }`}
          />
        </div>

        {/* Finalize */}
        {finalizeAgent && (() => {
          const agentStatus = getStatus('finalize');
          return (
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center
                ${agentStatus === 'done' ? 'border-emerald-500 bg-emerald-500/10' : 'border-border bg-elevated'}`}
              >
                <Flag size={15} className={agentStatus === 'done' ? 'text-emerald-400' : 'text-text-muted'} />
              </div>
              <p className="text-xs font-semibold mt-2 text-text-muted">Finalize</p>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default AgentProgressBar;