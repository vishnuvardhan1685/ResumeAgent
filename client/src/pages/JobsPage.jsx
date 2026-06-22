import React, { useState } from 'react';
import JDForm from '../components/job/JDForm';
import JobList from '../components/job/JobList';
import useJobStore from '../store/jobStore';
import useResumeStore from '../store/resumeStore';
import { useNavigate } from 'react-router-dom';

const JobsPage = () => {
  const [selectedId, setSelectedId] = useState(null);
  const navigate = useNavigate();
  const selectedResumeId = useResumeStore((s) => s.selectedResumeId);
  const { addJob, selectJob } = useJobStore();

  const handleSaved = (job) => {
    if (job?._id) {
      addJob(job);
      setSelectedId(job._id);
      selectJob(job._id);
      if (selectedResumeId) {
        navigate(`/analyze?resumeId=${selectedResumeId}&jobId=${job._id}&autorun=1`);
      }
    }
  };

  const handleSelect = (job) => {
    setSelectedId(job._id);
    selectJob(job._id);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Job Description Repository</h1>
        <p className="text-sm text-text-secondary mt-1">
          Store and manage target roles for resume matching analysis.
        </p>
      </div>

      <div className="grid grid-cols-[1fr_380px] gap-6">
        {/* Left: form */}
        <JDForm onSaved={handleSaved} />

        {/* Right: saved profiles */}
        <JobList onSelect={handleSelect} selectedId={selectedId} />
      </div>
    </div>
  );
};

export default JobsPage;
