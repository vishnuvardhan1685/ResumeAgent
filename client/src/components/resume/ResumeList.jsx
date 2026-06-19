import React, { useEffect, useState } from 'react';
import { Filter, ArrowUpDown } from 'lucide-react';
import ResumeCard from './ResumeCard';
import EmptyState from '../ui/EmptyState';
import Spinner from '../ui/Spinner';
import Button from '../ui/Button';
import { FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { listResumes } from '../../api/resumes.api';
import useResumeStore from '../../store/resumeStore';

const StatTile = ({ label, value }) => (
  <div className="bg-surface border border-border rounded-xl p-4 flex-1 min-w-0">
    <p className="text-2xs font-mono uppercase tracking-widest text-text-muted mb-2">{label}</p>
    <p className="text-3xl font-bold text-text-primary">{value}</p>
  </div>
);

const ResumeList = () => {
  const navigate = useNavigate();
  const resumes = useResumeStore((s) => s.resumes);
  const setResumes = useResumeStore((s) => s.setResumes);
  const selectResume = useResumeStore((s) => s.selectResume);
  const [loading, setLoading] = useState(true);
  const [sortNewest, setSortNewest] = useState(true);

  useEffect(() => {
    const fetchResumes = async () => {
      setLoading(true);
      try {
        const data = await listResumes();
        setResumes(data);
      } catch (err) {
        console.error('Failed to fetch resumes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResumes();
  }, [setResumes]);

  const total = resumes.length;
  const analyzed = resumes.filter((r) => r.extractedSkills?.length > 0).length;
  const pending = total - analyzed;

  const sorted = [...resumes].sort((a, b) => {
    const aDate = new Date(a.uploadedAt);
    const bDate = new Date(b.uploadedAt);
    return sortNewest ? bDate - aDate : aDate - bDate;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Spinner size={24} className="text-accent" />
      </div>
    );
  }

  return (
    <div>
      {/* Repository header + stats */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Repository Overview</h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Manage and analyze your candidate resumes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" icon={<Filter size={13} />}>
            Filter
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<ArrowUpDown size={13} />}
            onClick={() => setSortNewest(!sortNewest)}
          >
            Sort: {sortNewest ? 'Newest' : 'Oldest'}
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-3 mb-6">
        <StatTile label="Total Resumes" value={total} />
        <StatTile label="Analyzed" value={analyzed} />
        <StatTile label="Pending" value={pending} />
      </div>

      {/* Grid */}
      {sorted.length === 0 ? (
        <EmptyState
          icon={<FileText size={22} />}
          title="No resumes yet"
          description="Upload your first PDF resume to get started."
        />
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <h3 className="text-sm font-semibold text-text-primary">Recent Uploads</h3>
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {sorted.map((resume) => (
              <ResumeCard
                key={resume._id}
                resume={resume}
                onAnalyze={(id) => {
                  selectResume(id);
                  navigate(`/analyze?resumeId=${id}`);
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ResumeList;
