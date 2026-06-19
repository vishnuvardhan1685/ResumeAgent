import React from 'react';
import ScoreGauge from './ScoreGauge';
import SkillRadarChart from './SkillRadarChart';
import SkillBadges from './SkillBadges';
import StrengthGapPanel from './StrengthGapPanel';
import EmptyState from '../ui/EmptyState';
import { BarChart2 } from 'lucide-react';

/**
 * matchResult shape (from pipelineStore / SPEC Agent 2 output):
 * {
 *   overall_score, semantic_similarity, skill_match_pct,
 *   matched_skills, missing_skills, bonus_skills,
 *   strength_areas, gap_areas,
 *   resume_name, job_title, company
 * }
 */
const MatchReportPanel = ({ matchResult }) => {
  if (!matchResult) {
    return (
      <EmptyState
        icon={<BarChart2 size={22} />}
        title="Awaiting Analysis Results"
        description="The scoring matrix is currently being computed by the Matcher agent. Detailed analytics will populate here once the process advances."
      />
    );
  }

  const radarData = [
    { subject: 'Skills', score: Math.round((matchResult.skill_match_pct ?? 0)) },
    { subject: 'Experience', score: Math.round((matchResult.semantic_similarity ?? 0) * 80) },
    { subject: 'Keywords', score: Math.round((matchResult.skill_match_pct ?? 0) * 0.9) },
    { subject: 'Projects', score: Math.round((matchResult.overall_score ?? 0) * 0.85) },
    { subject: 'Education', score: Math.round((matchResult.overall_score ?? 0) * 0.7) },
    { subject: 'Seniority', score: Math.round((matchResult.overall_score ?? 0) * 0.75) },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      {(matchResult.job_title || matchResult.company) && (
        <div>
          <h2 className="text-2xl font-bold text-text-primary">
            {matchResult.job_title} Match
          </h2>
          {matchResult.resume_name && matchResult.company && (
            <p className="text-sm text-text-secondary mt-1">
              Candidate: {matchResult.resume_name} • Company: {matchResult.company}
            </p>
          )}
        </div>
      )}

      {/* Score + Radar row */}
      <div className="grid grid-cols-2 gap-4">
        <ScoreGauge score={matchResult.overall_score ?? 0} />
        <SkillRadarChart data={radarData} />
      </div>

      {/* Skill badges */}
      <SkillBadges
        matchedSkills={matchResult.matched_skills ?? []}
        missingSkills={matchResult.missing_skills ?? []}
        bonusSkills={matchResult.bonus_skills ?? []}
      />

      {/* Strength/gap breakdown */}
      <StrengthGapPanel
        strengthAreas={matchResult.strength_areas ?? []}
        gapAreas={matchResult.gap_areas ?? []}
      />
    </div>
  );
};

export default MatchReportPanel;