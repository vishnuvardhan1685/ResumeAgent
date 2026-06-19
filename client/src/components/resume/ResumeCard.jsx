import React, { useState } from 'react';
import { FileText, MoreVertical, Zap, Clock, Trash2, Eye } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { deleteResume } from '../../api/resumes.api';
import useResumeStore from '../../store/resumeStore';

const ResumeCard = ({ resume, onAnalyze }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { _id, fileName, extractedSkills = [], uploadedAt } = resume;

  const skillCount = Array.isArray(extractedSkills) ? extractedSkills.length : 0;
  const isPending = skillCount === 0;

  const formattedDate = uploadedAt
    ? new Date(uploadedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—';

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this resume?')) return;
    setDeleting(true);
    try {
      await deleteResume(_id);
      useResumeStore.getState().removeResume(_id);
    } catch (err) {
      console.error('Delete failed:', err);
      alert(err?.response?.data?.message ?? 'Failed to delete resume. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="relative bg-surface border border-border rounded-xl p-4 hover:border-border-active transition-all duration-150 group">
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <FileText size={18} className="text-red-400" />
        </div>

        {/* Kebab menu */}
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text-secondary hover:bg-elevated opacity-0 group-hover:opacity-100 transition-all"
          >
            <MoreVertical size={14} />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-8 w-36 bg-elevated border border-border rounded-xl shadow-xl z-20 py-1"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-hover transition-colors"
              >
                <Eye size={13} />
                View details
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={13} />
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* File name */}
      <p className="text-sm font-semibold text-text-primary mb-1 truncate" title={fileName}>
        {fileName?.replace('.pdf', '') ?? 'Untitled'}
      </p>
      <p className="text-2xs text-text-muted flex items-center gap-1 mb-4">
        <Clock size={10} />
        Uploaded: {formattedDate}
      </p>

      {/* Skills footer */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xs font-mono uppercase tracking-widest text-text-muted mb-1">
            Extracted Skills
          </p>
          {isPending ? (
            <Badge variant="warning">PENDING</Badge>
          ) : (
            <span className="text-xs font-bold text-accent">{skillCount} DETECTED</span>
          )}
        </div>
        <Button
          size="sm"
          variant={isPending ? 'secondary' : 'primary'}
          icon={<Zap size={12} />}
          onClick={(e) => {
            e.stopPropagation();
            onAnalyze?.(_id);
          }}
        >
          Analyze
        </Button>
      </div>
    </div>
  );
};

export default ResumeCard;
