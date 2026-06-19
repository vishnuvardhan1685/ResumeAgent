import React from 'react';
import Badge from '../ui/Badge';

const SkillRow = ({ label, skills, variant, count }) => (
  <div className="mb-5 last:mb-0">
    <div className="flex items-center gap-2 mb-2.5">
      <span
        className={`w-2 h-2 rounded-full ${
          variant === 'matched' ? 'bg-emerald-400' :
          variant === 'missing' ? 'bg-red-400' : 'bg-blue-400'
        }`}
      />
      <p className="text-sm font-semibold text-text-primary">
        {label}{' '}
        <span className="text-text-muted font-normal">({count})</span>
      </p>
    </div>
    <div className="flex flex-wrap gap-2">
      {skills.length === 0 ? (
        <span className="text-xs text-text-muted">None detected</span>
      ) : (
        skills.map((skill) => (
          <Badge key={skill} variant={variant}>
            {skill}
          </Badge>
        ))
      )}
    </div>
  </div>
);

const SkillBadges = ({ matchedSkills = [], missingSkills = [], bonusSkills = [] }) => (
  <div className="bg-surface border border-border rounded-xl p-6">
    <h3 className="text-sm font-semibold text-text-primary mb-5">Skills Breakdown</h3>
    <div className="border-t border-border pt-4">
      <SkillRow
        label="Matched Skills"
        skills={matchedSkills}
        variant="matched"
        count={matchedSkills.length}
      />
      <div className="border-t border-border my-4" />
      <SkillRow
        label="Missing Core Skills"
        skills={missingSkills}
        variant="missing"
        count={missingSkills.length}
      />
      <div className="border-t border-border my-4" />
      <SkillRow
        label="Bonus / Adjacent Skills"
        skills={bonusSkills}
        variant="bonus"
        count={bonusSkills.length}
      />
    </div>
  </div>
);

export default SkillBadges;