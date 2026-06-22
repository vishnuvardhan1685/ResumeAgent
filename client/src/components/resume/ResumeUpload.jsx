import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import Spinner from '../ui/Spinner';
import { uploadResume } from '../../api/resumes.api';
import useResumeStore from '../../store/resumeStore';

const ResumeUpload = ({ onSuccess }) => {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are supported.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File must be under 5 MB.');
        return;
      }

      setError(null);
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('resume', file);
        const result = await uploadResume(formData);
        useResumeStore.getState().addResume(result);
        useResumeStore.getState().selectResume(result._id);
        onSuccess?.(result);
      } catch (err) {
        setError(err?.response?.data?.message ?? err?.message ?? 'Upload failed. Please try again.');
      } finally {
        setUploading(false);
      }
    },
    [onSuccess]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      handleFile(file);
    },
    [handleFile]
  );

  const onInputChange = (e) => {
    handleFile(e.target.files[0]);
    e.target.value = '';
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`
        relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed
        transition-all duration-150 cursor-pointer min-h-[200px] p-6
        ${dragging
          ? 'border-accent bg-accent/10 scale-[1.01]'
          : 'border-border hover:border-accent/50 hover:bg-elevated'
        }
        ${uploading ? 'pointer-events-none opacity-70' : ''}
      `}
      onClick={() => !uploading && document.getElementById('resume-file-input').click()}
    >
      <input
        id="resume-file-input"
        type="file"
        accept="application/pdf"
        className="sr-only"
        onChange={onInputChange}
      />

      {uploading ? (
        <>
          <Spinner size={32} className="text-accent mb-3" />
          <p className="text-sm font-medium text-text-primary">Uploading & parsing…</p>
          <p className="text-xs text-text-muted mt-1">Extracting skills and text</p>
        </>
      ) : (
        <>
          <div className="w-14 h-14 rounded-2xl bg-elevated border border-border flex items-center justify-center mb-4">
            <Upload size={22} className="text-text-muted" />
          </div>
          <p className="text-sm font-semibold text-text-primary mb-1">Upload Resume</p>
          <p className="text-xs text-text-secondary text-center">
            Drag and drop PDF files here, or click to browse.
          </p>
          <p className="text-2xs font-mono text-text-muted mt-3 flex items-center gap-1.5">
            <FileText size={11} />
            Supported: PDF only (Max 5MB)
          </p>
        </>
      )}

      {error && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 bg-red-500/10 border border-red-500/25 rounded-lg px-3 py-2">
          <AlertCircle size={13} className="text-red-400 shrink-0" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
