import React from 'react';
import { Building2, Calendar, Trash2 } from 'lucide-react';
import Badge from '../ui/Badge';
import { deleteJob } from '../../api/jobs.api';
import useJobStore from '../../store/jobStore';

const JobCard = ({ job, onSelect, selected = false }) => {
  const { _id, title, company, createdAt, extractedSkills } = job;

  const isActive = Array.isArray(extractedSkills) && extractedSkills.length > 0;

  const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) : '—';
  
  const handleDelete = async (e) => {
    e.stopPropagation(); // Prevent triggering onSelect when clicking delete
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob(_id);
        useJobStore.getState().removeJob(_id);
      } catch (err) {
        console.error('Failed to delete job:', err);
        alert('Failed to delete job. Please try again.');
      }
    }
  };
  return (
    <div
      onClick={() => onSelect?.(job)}
      className={`
        border rounded-xl p-4 cursor-pointer transition-all duration-150
        ${selected
          ? 'bg-accent/10 border-accent/40'
          : 'bg-elevated border-border hover:border-border-active hover:bg-hover'
        }
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate text-text-primary">{title || 'Untitled'}</p>
          <p className="text-xs text-text-secondary flex items-center gap-1.5 mt-1 truncate">
            <Building2 size={11} className="shrink-0" />
            {company || 'Unknown company'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="flex items-center justify-center w-7 h-7 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
          aria-label="Delete job"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="flex items-center justify-between mt-3">
        <p className="flex items-center gap-1 text-2xs text-text-muted">
          <Calendar size={10} />
          Saved on {formattedDate}
        </p>
        <Badge variant={isActive ? 'success' : 'warning'} dot>
          {isActive ? 'Active' : 'Pending'}
        </Badge>
      </div>
    </div>
  );
};

export default JobCard;
