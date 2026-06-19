import { useState, useCallback } from 'react';
import { uploadResume } from '../api/resumes.api';
import useResumeStore from '../store/resumeStore';

/**
 * useResumeUpload
 *
 * Manages file state + calls uploadResume API + updates resumeStore.
 * Used by ResumeUpload.jsx.
 *
 * Returns: { uploading, error, upload }
 *   upload(file: File) → Promise<Resume | null>
 */
const useResumeUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const addResume = useResumeStore((s) => s.addResume);

  const upload = useCallback(async (file) => {
    if (!file) return null;

    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported.');
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5 MB.');
      return null;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const resume = await uploadResume(formData);
      addResume(resume);
      return resume;
    } catch (err) {
      const message = err?.response?.data?.message ?? err?.message ?? 'Upload failed.';
      setError(message);
      return null;
    } finally {
      setUploading(false);
    }
  }, [addResume]);

  return { uploading, error, upload };
};

export default useResumeUpload;
