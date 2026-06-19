import React from 'react';
import JobListingCard from './JobListingCard';
import EmptyState from '../ui/EmptyState';
import Spinner from '../ui/Spinner';
import { Compass } from 'lucide-react';

const DiscoveryGrid = ({ jobs = [], loading = false, filters = {} }) => {
  const filtered = jobs.filter((j) => {
    if (filters.source && filters.source !== 'all' && j.source !== filters.source) return false;
    if (filters.location && !j.location?.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.minScore != null && (j.matchScore ?? 0) < filters.minScore) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Spinner size={28} className="text-accent" />
        <p className="text-sm text-text-secondary">Scanning job boards for the best matches…</p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <EmptyState
        icon={<Compass size={22} />}
        title={jobs.length === 0 ? 'No jobs fetched yet' : 'No jobs match your filters'}
        description={
          jobs.length === 0
            ? 'Click "Find Jobs For Me" to scan Google Jobs and Internshala based on your resume.'
            : 'Try lowering the minimum match score or clearing the location filter.'
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {filtered.map((job, i) => (
        <JobListingCard key={job.id ?? i} job={job} />
      ))}
    </div>
  );
};

export default DiscoveryGrid;