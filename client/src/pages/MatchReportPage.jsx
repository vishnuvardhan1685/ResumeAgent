import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import MatchReportPanel from '../components/match-report/MatchReportPanel';
import Button from '../components/ui/Button';
import usePipelineStore from '../store/pipelineStore';

const MatchReportPage = () => {
  const navigate = useNavigate();
  const matchResult = usePipelineStore((s) => s.matchResult);

  return (
    <div className="animate-fade-in">
      {matchResult ? (
        <MatchReportPanel matchResult={matchResult} />
      ) : (
        <div className="flex flex-col items-center justify-center py-24 gap-5">
          <p className="text-base font-semibold text-text-primary">No report available</p>
          <p className="text-sm text-text-secondary text-center max-w-sm">
            Run an analysis first to generate your match report. Select a resume and job
            description from the Analyze page.
          </p>
          <Button
            variant="primary"
            icon={<Play size={13} />}
            onClick={() => navigate('/analyze')}
          >
            Go to Analyze
          </Button>
        </div>
      )}
    </div>
  );
};

export default MatchReportPage;