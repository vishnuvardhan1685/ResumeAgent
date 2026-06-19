/**
 * formatScore
 * Returns display string and Tailwind color class based on score value.
 */

export const formatScore = (score) => `${Math.round(score)}%`;

export const scoreColorClass = (score) => {
  if (score >= 75) return 'text-emerald-400';
  if (score >= 50) return 'text-amber-400';
  return 'text-red-400';
};

export const scoreBgClass = (score) => {
  if (score >= 75) return 'bg-emerald-500/10 border-emerald-500/25';
  if (score >= 50) return 'bg-amber-500/10 border-amber-500/25';
  return 'bg-red-500/10 border-red-500/25';
};

export const scoreLabel = (score) => {
  if (score >= 85) return 'Excellent Match';
  if (score >= 75) return 'Strong Match';
  if (score >= 60) return 'Moderate Match';
  if (score >= 40) return 'Partial Match';
  return 'Weak Match';
};