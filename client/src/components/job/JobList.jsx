import React, { useEffect, useState } from 'react';
import { Filter, ArrowUpDown, Briefcase } from 'lucide-react';
import JobCard from './JobCard';
import EmptyState from '../ui/EmptyState';
import Spinner from '../ui/Spinner';
import { listJobs } from '../../api/jobs.api';
import useJobStore from '../../store/jobStore';

const JobList = ({ onSelect, selectedId }) => {
  const jobs = useJobStore((state) => state.jobs);
  const setJobs = useJobStore((state) => state.setJobs);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const data = await listJobs();
        setJobs(data);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [setJobs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Spinner size={20} className="text-accent" />
      </div>
    );
  }

  return (
    <div className="border bg-surface border-border rounded-xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary">Saved Profiles</h3>
        <div className="flex items-center gap-1">
          <button className="flex items-center justify-center transition-colors rounded-lg w-7 h-7 text-text-muted hover:text-text-secondary hover:bg-elevated">
            <Filter size={13} />
          </button>
          <button className="flex items-center justify-center transition-colors rounded-lg w-7 h-7 text-text-muted hover:text-text-secondary hover:bg-elevated">
            <ArrowUpDown size={13} />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]">
        {jobs.length === 0 ? (
          <EmptyState
            icon={<Briefcase size={18} />}
            title="No jobs saved yet"
            description="Paste a job description on the left to save it."
          />
        ) : (
          jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              selected={job._id === selectedId}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default JobList;
