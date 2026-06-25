import React, { useEffect, useRef, useState } from 'react';
import { Play, ChevronDown } from 'lucide-react';
import Button from '../ui/Button';
import usePipelineStore from '../../store/pipelineStore';
import useResumeStore from '../../store/resumeStore';
import useJobStore from '../../store/jobStore';
import { listResumes } from '../../api/resumes.api';
import { listJobs } from '../../api/jobs.api';

const Select = ({ label, value, onChange, options, placeholder }) => (
  <div className="flex-1 min-w-0">
    <label className="block text-2xs font-mono uppercase tracking-widest text-text-muted mb-1.5">
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 pl-3 pr-8 text-sm transition-colors border rounded-lg appearance-none cursor-pointer bg-elevated border-border text-text-primary focus:outline-none focus:border-accent"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute -translate-y-1/2 pointer-events-none right-3 top-1/2 text-text-muted"
      />
    </div>
  </div>
);

const PipelineSelector = ({ defaultResumeId, defaultJobId, autoRun = false }) => {
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [resumeId, setResumeId] = useState(defaultResumeId ?? '');
  const [jobId, setJobId] = useState(defaultJobId ?? '');
  const autoRunStarted = useRef(false);
  const setStoreResumes = useResumeStore((s) => s.setResumes);
  const selectResume = useResumeStore((s) => s.selectResume);
  const setStoreJobs = useJobStore((s) => s.setJobs);
  const selectJob = useJobStore((s) => s.selectJob);

  const { run, status } = usePipelineStore();
  const isRunning = status === 'running';

  useEffect(() => {
    const load = async () => {
      try {
        const [r, j] = await Promise.all([listResumes(), listJobs()]);
        setStoreResumes(r);
        setStoreJobs(j);
        setResumes(r.map(x => ({ value: x._id, label: x.fileName })));
        setJobs(j.map(x => ({ value: x._id, label: `${x.title} — ${x.company}` })));
      } catch (err) {
        console.error('Failed to load pipeline options:', err);
      }
    };
    load();
  }, [setStoreJobs, setStoreResumes]);

  useEffect(() => {
    if (!autoRun || autoRunStarted.current || !resumeId || !jobId || !resumes.length || !jobs.length) return;
    autoRunStarted.current = true;
    selectResume(resumeId);
    selectJob(jobId);
    run(resumeId, jobId);
  }, [autoRun, jobId, jobs.length, resumeId, resumes.length, run, selectJob, selectResume]);

  const handleRun = () => {
    if (!resumeId || !jobId) return;
    selectResume(resumeId);
    selectJob(jobId);
    run(resumeId, jobId);
  };

  return (
    <div className="p-5 border bg-surface border-border rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
        <p className="font-mono tracking-widest uppercase text-2xs text-text-muted">
          Analysis Configuration
        </p>
      </div>

      <div className="flex items-end gap-3">
        <Select
          label="Target Resume"
          value={resumeId}
          onChange={setResumeId}
          options={resumes}
          placeholder="Select a resume..."
        />
        <Select
          label="Job Description"
          value={jobId}
          onChange={setJobId}
          options={jobs}
          placeholder="Select a JD..."
        />
        <Button
          variant="primary"
          size="md"
          loading={isRunning}
          disabled={!resumeId || !jobId}
          icon={!isRunning && <Play size={13} />}
          onClick={handleRun}
          className="self-end h-10 shrink-0"
        >
          {isRunning ? 'Analyzing…' : 'Run Analysis'}
        </Button>
      </div>
    </div>
  );
};

export default PipelineSelector;
