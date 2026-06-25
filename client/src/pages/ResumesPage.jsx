import React, { useState } from 'react';
import ResumeUpload from '../components/resume/ResumeUpload';
import ResumeList from '../components/resume/ResumeList';
import useResumeStore from '../store/resumeStore';
import useJobStore from '../store/jobStore';
import { useNavigate } from 'react-router-dom';

const ResumesPage = () => {
  const navigate = useNavigate();
  const selectedJobId = useJobStore((s) => s.selectedJobId);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = (resume) => {
    // Trigger ResumeList to refetch
    setRefreshKey((k) => k + 1);
    if (resume?._id && selectedJobId) {
      navigate(`/analyze?resumeId=${resume._id}&jobId=${selectedJobId}&autorun=1`);
    } else if (resume?._id) {
      navigate('/jobs');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">Resume Repository</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Upload, parse, and manage resumes for matching analysis.
        </p>
      </div>

      {/* Upload zone — full width */}
      <ResumeUpload onSuccess={handleSuccess} />

      {/* List + stats below */}
      <ResumeList key={refreshKey} />
    </div>
  );
};

export default ResumesPage;
