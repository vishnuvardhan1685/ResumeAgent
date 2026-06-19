import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const SOURCE_CONFIG = {
  google_jobs: { label: 'Google', variant: 'google' },
  internshala: { label: 'Internshala', variant: 'internshala' },
};

const scoreVariant = (score) => {
  if (score >= 90) return 'matched';
  if (score >= 75) return 'success';
  if (score >= 60) return 'warning';
  return 'danger';
};

const JobListingCard = ({ job }) => {
  const { title, company, location, matchScore, source, applyLink } = job;
  const src = SOURCE_CONFIG[source] ?? { label: source, variant: 'default' };

  return (
    <div className="bg-surface border border-border rounded-xl p-4 hover:border-border-active transition-all duration-150 flex flex-col gap-3">
      {/* Source + score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-2xs text-text-muted">
          {/* Source icon placeholder */}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="text-text-muted">
            <rect x="3" y="3" width="8" height="8" rx="1" fill="currentColor" opacity="0.6" />
            <rect x="13" y="3" width="8" height="8" rx="1" fill="currentColor" opacity="0.4" />
            <rect x="3" y="13" width="8" height="8" rx="1" fill="currentColor" opacity="0.4" />
            <rect x="13" y="13" width="8" height="8" rx="1" fill="currentColor" opacity="0.2" />
          </svg>
          {src.label}
        </div>
        {matchScore != null && (
          <Badge variant={scoreVariant(matchScore)}>
            {Math.round(matchScore)}% Match
          </Badge>
        )}
      </div>

      {/* Title + company */}
      <div>
        <p className="text-sm font-semibold text-text-primary leading-snug">{title}</p>
        <p className="text-xs text-text-secondary mt-0.5">{company}</p>
      </div>

      {/* Location */}
      {location && (
        <p className="text-xs text-text-muted flex items-center gap-1">
          <MapPin size={11} />
          {location}
        </p>
      )}

      {/* Apply button */}
      <Button
        variant="secondary"
        size="sm"
        className="w-full mt-auto"
        icon={<ExternalLink size={11} />}
        onClick={() => applyLink && window.open(applyLink, '_blank', 'noopener')}
        disabled={!applyLink}
      >
        Apply Now
      </Button>
    </div>
  );
};

export default JobListingCard;