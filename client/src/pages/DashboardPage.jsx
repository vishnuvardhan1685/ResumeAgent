import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Briefcase, Compass, Plus, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useResumeStore from '../store/resumeStore';
import useJobStore from '../store/jobStore';
import usePipelineStore from '../store/pipelineStore';

const QuickCard = ({ icon: Icon, title, description, action, to, accent = false }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(to)}
      className={`bg-surface border rounded-xl p-5 cursor-pointer hover:border-border-active transition-all duration-150 group
        ${accent ? 'border-accent/30 bg-accent/5' : 'border-border'}`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4
        ${accent ? 'bg-accent/20' : 'bg-elevated border border-border'}`}>
        <Icon size={18} className={accent ? 'text-accent' : 'text-text-muted'} />
      </div>
      <p className="text-sm font-semibold text-text-primary mb-1">{title}</p>
      <p className="text-xs text-text-secondary leading-relaxed">{description}</p>
      <div className="flex items-center gap-1 mt-4 text-xs text-accent opacity-0 group-hover:opacity-100 transition-opacity">
        {action}
        <ArrowRight size={12} />
      </div>
    </div>
  );
};

const StatBadge = ({ label, value }) => (
  <div className="bg-surface border border-border rounded-xl p-4 text-center">
    <p className="text-2xl font-bold text-text-primary">{value}</p>
    <p className="text-2xs font-mono uppercase tracking-widest text-text-muted mt-1">{label}</p>
  </div>
);

const DashboardPage = () => {
  const user = useAuthStore((s) => s.user);
  const resumes = useResumeStore((s) => s.resumes);
  const jobs = useJobStore((s) => s.jobs);
  const matchResult = usePipelineStore((s) => s.matchResult);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          {greeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}.
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Here's your resume intelligence dashboard.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatBadge label="Resumes" value={resumes.length} />
        <StatBadge label="Job Profiles" value={jobs.length} />
        <StatBadge label="Last Score" value={matchResult ? `${Math.round(matchResult.overall_score)}%` : '—'} />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-text-primary mb-4">Quick actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <QuickCard
            icon={Plus}
            title="Run new analysis"
            description="Select a resume and job description to start the multi-agent pipeline."
            action="Go to Analyze"
            to="/analyze"
            accent
          />
          <QuickCard
            icon={FileText}
            title="Upload a resume"
            description="Add PDF resumes to your repository for extraction and matching."
            action="Go to Resumes"
            to="/resumes"
          />
          <QuickCard
            icon={Briefcase}
            title="Add a job description"
            description="Paste a job posting to save it for analysis and matching."
            action="Go to Jobs"
            to="/jobs"
          />
          <QuickCard
            icon={Compass}
            title="Discover opportunities"
            description="Let the AI scan Google Jobs and Internshala for roles that match your profile."
            action="Go to Discovery"
            to="/discover"
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
