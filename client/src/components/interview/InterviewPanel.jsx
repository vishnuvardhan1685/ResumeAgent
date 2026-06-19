import React, { useState } from 'react';
import QuestionCard from './QuestionCard';
import Tabs from '../ui/Tabs';
import EmptyState from '../ui/EmptyState';
import { MessageSquare } from 'lucide-react';

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'technical', label: 'Technical' },
  { id: 'behavioral', label: 'Behavioral' },
  { id: 'system_design', label: 'System Design' },
];

const InterviewPanel = ({ questions = [] }) => {
  const [filter, setFilter] = useState('all');

  const filtered =
    filter === 'all' ? questions : questions.filter((q) => q.type === filter);

  const tabsWithCount = FILTER_TABS.map((t) => ({
    ...t,
    count:
      t.id === 'all'
        ? questions.length
        : questions.filter((q) => q.type === t.id).length,
  }));

  if (questions.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare size={22} />}
        title="No questions generated yet"
        description="Run an analysis to generate tailored interview questions based on the skill gap."
      />
    );
  }

  return (
    <div>
      <Tabs tabs={tabsWithCount} active={filter} onChange={setFilter} className="mb-5" />
      <div className="space-y-2">
        {filtered.map((q, i) => (
          <QuestionCard key={i} question={q} index={i + 1} />
        ))}
      </div>
    </div>
  );
};

export default InterviewPanel;