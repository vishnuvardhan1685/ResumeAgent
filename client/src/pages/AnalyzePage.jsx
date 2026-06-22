import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BarChart2, MessageSquare, Edit3, Code2 } from 'lucide-react';
import PipelineSelector from '../components/pipeline/PipelineSelector';
import AgentProgressBar from '../components/pipeline/AgentProgressBar';
import MatchReportPanel from '../components/match-report/MatchReportPanel';
import InterviewPanel from '../components/interview/InterviewPanel';
import SuggestionsPanel from '../components/suggestions/SuggestionsPanel';
import Tabs from '../components/ui/Tabs';
import EmptyState from '../components/ui/EmptyState';
import usePipelineStore from '../store/pipelineStore';
import useResumeStore from '../store/resumeStore';

const TABS = [
  { id: 'match', label: 'Match Score', icon: <BarChart2 size={14} /> },
  { id: 'interview', label: 'Interview Questions', icon: <MessageSquare size={14} /> },
  { id: 'suggestions', label: 'Resume Suggestions', icon: <Edit3 size={14} /> },
  { id: 'raw', label: 'Raw Data', icon: <Code2 size={14} /> },
];

const AnalyzePage = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('match');

  const { matchResult, error } = usePipelineStore();
  const resumes = useResumeStore((s) => s.resumes);
  const selectedResumeId = useResumeStore((s) => s.selectedResumeId);

  // Build SSE URL once we have a sessionId
  // Open SSE stream — useSSE drives pipelineStore automatically

  // Pre-select resume from URL query param (e.g. from ResumeCard "Analyze" button)
  const defaultResumeId = searchParams.get('resumeId') ?? undefined;
  const defaultJobId = searchParams.get('jobId') ?? undefined;
  const autoRun = searchParams.get('autorun') === '1';
  const activeResumeId = defaultResumeId ?? selectedResumeId;
  const activeResume = resumes.find((resume) => resume._id === activeResumeId);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Step 1: configure */}
      <PipelineSelector defaultResumeId={defaultResumeId} defaultJobId={defaultJobId} autoRun={autoRun} />

      {/* Step 2: live progress — hidden when idle */}
      <AgentProgressBar />

      {/* Step 3: results tabs */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <Tabs
          tabs={TABS}
          active={activeTab}
          onChange={setActiveTab}
          className="px-2"
        />

        <div className="p-5">
          {activeTab === 'match' && (
            <MatchReportPanel matchResult={matchResult} />
          )}

          {activeTab === 'interview' && (
            <InterviewPanel
              questions={matchResult?.interview_questions ?? []}
            />
          )}

          {activeTab === 'suggestions' && (
            <SuggestionsPanel
              suggestions={matchResult?.suggestions ?? null}
              originalResumeText={activeResume?.parsedText ?? ''}
            />
          )}

          {activeTab === 'raw' && (
            <div>
              {matchResult ? (
                <pre className="text-xs font-mono text-text-secondary bg-elevated border border-border rounded-xl p-4 overflow-auto max-h-[60vh] leading-relaxed">
                  {JSON.stringify(matchResult, null, 2)}
                </pre>
              ) : (
                <EmptyState
                  icon={<Code2 size={20} />}
                  title="No raw data yet"
                  description="Run an analysis to see the full JSON output from the agent pipeline."
                />
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyzePage;
