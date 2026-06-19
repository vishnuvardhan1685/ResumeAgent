import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import DiffView from './DiffView';

const SuggestionCard = ({ suggestion, index }) => {
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const { original, rewritten, reason } = suggestion;

  const handleCopy = async (e) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(rewritten);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-elevated border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-hover transition-colors"
      >
        <span className="font-mono text-2xs text-text-muted w-5 shrink-0">
          {String(index).padStart(2, '0')}
        </span>
        <p className="flex-1 text-xs text-text-secondary truncate">{original}</p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-2xs text-text-muted hover:text-accent transition-colors px-2 py-1 rounded-md hover:bg-accent/10"
          >
            {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          {expanded ? (
            <ChevronUp size={14} className="text-text-muted" />
          ) : (
            <ChevronDown size={14} className="text-text-muted" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-border pt-4 animate-fade-in space-y-3">
          <DiffView original={original} rewritten={rewritten} />
          {reason && (
            <div className="bg-accent/5 border border-accent/20 rounded-lg px-4 py-3">
              <p className="text-2xs font-mono uppercase tracking-widest text-accent mb-1">
                Why this change
              </p>
              <p className="text-xs text-text-secondary leading-relaxed">{reason}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SuggestionCard;