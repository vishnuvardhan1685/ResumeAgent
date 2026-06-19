import React, { useState } from 'react';
import ResumeUpload from '../components/resume/ResumeUpload';
import ResumeList from '../components/resume/ResumeList';
import useResumeStore from '../store/resumeStore';

const ResumesPage = () => {
  const addResume = useResumeStore((s) => s.addResume);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = (resume) => {
    if (resume?._id) addResume(resume);
    // Trigger ResumeList to refetch
    setRefreshKey((k) => k + 1);
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