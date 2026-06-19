import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Badge from '../ui/Badge';

const TYPE_VARIANT = {
  technical: 'accent',
  behavioral: 'info',
  system_design: 'warning',
};

const TYPE_LABEL = {
  technical: 'Technical',
  behavioral: 'Behavioral',
  system_design: 'System Design',
};

const QuestionCard = ({ question, index }) => {
  const [expanded, setExpanded] = useState(false);
  const { question: text, type, topic, why_asked, answer_framework } = question;

  return (
    <div className="bg-elevated border border-border rounded-xl overflow-hidden transition-all duration-150 hover:border-border-active">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-4 px-5 py-4 text-left"
      >
        {/* Index number */}
        <span className="font-mono text-2xs text-text-muted mt-0.5 w-5 shrink-0">
          {String(index).padStart(2, '0')}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant={TYPE_VARIANT[type] ?? 'default'}>
              {TYPE_LABEL[type] ?? type}
            </Badge>
            {topic && (
              <span className="text-2xs text-text-muted font-mono">{topic}</span>
            )}
          </div>
          <p className="text-sm text-text-primary leading-relaxed">{text}</p>
        </div>

        <span className="shrink-0 text-text-muted mt-1">
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </span>
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-0 border-t border-border space-y-3 animate-fade-in">
          {why_asked && (
            <div>
              <p className="text-2xs font-mono uppercase tracking-widest text-text-muted mb-1">
                Why it's asked
              </p>
              <p className="text-xs text-text-secondary leading-relaxed">{why_asked}</p>
            </div>
          )}
          {answer_framework && (
            <div>
              <p className="text-2xs font-mono uppercase tracking-widest text-text-muted mb-1">
                Answer framework
              </p>
              <p className="text-xs text-text-secondary leading-relaxed">{answer_framework}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionCard;