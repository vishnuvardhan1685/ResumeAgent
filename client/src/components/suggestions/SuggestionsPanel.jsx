import React from 'react';
import SuggestionCard from './SuggestionCard';
import CopyResumeButton from './CopyResumeButton';
import EmptyState from '../ui/EmptyState';
import { Edit3, AlertCircle } from 'lucide-react';

/**
 * suggestions shape (from SPEC Agent 4 output):
 * {
 *   suggestions: [{ original, rewritten, reason }],
 *   missing_sections: string[],
 *   summary_rewrite: string
 * }
 */
const SuggestionsPanel = ({ suggestions, originalResumeText = '' }) => {
  if (!suggestions) {
    return (
      <EmptyState
        icon={<Edit3 size={22} />}
        title="Resume suggestions pending"
        description="The Editor agent will generate targeted bullet rewrites once the analysis completes."
      />
    );
  }

  const { suggestions: bulletSuggestions = [], missing_sections = [], summary_rewrite } = suggestions;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Missing sections alert */}
      {missing_sections.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2.5">
            <AlertCircle size={14} className="text-amber-400" />
            <p className="text-sm font-semibold text-amber-400">Sections to add</p>
          </div>
          <ul className="space-y-1.5">
            {missing_sections.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                <span className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary rewrite */}
      {summary_rewrite && (
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
          <p className="text-2xs font-mono uppercase tracking-widest text-accent mb-2">
            Suggested summary
          </p>
          <p className="text-sm text-text-primary leading-relaxed">{summary_rewrite}</p>
        </div>
      )}

      {/* Bullet rewrites */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-text-primary">
            Bullet Rewrites{' '}
            <span className="text-text-muted font-normal">({bulletSuggestions.length})</span>
          </p>
          <CopyResumeButton
            originalText={originalResumeText}
            suggestions={bulletSuggestions}
            summaryRewrite={summary_rewrite}
          />
        </div>
        <div className="space-y-2">
          {bulletSuggestions.map((s, i) => (
            <SuggestionCard key={i} suggestion={s} index={i + 1} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuggestionsPanel;