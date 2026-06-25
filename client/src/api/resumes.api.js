import axiosInstance from './axiosInstance';

/**
 * resumes.api.js
 *
 * Matches backend routes/resumes.js  →  /api/resumes/*
 *
 * Backend endpoints:
 *   POST   /api/resumes/upload        multipart/form-data { resume: File }
 *                                     → Resume (with extractedSkills populated by FastAPI)
 *   GET    /api/resumes               → Resume[]
 *   GET    /api/resumes/:id           → Resume
 *   DELETE /api/resumes/:id           → { message }
 *
 * Resume shape: { _id, userId, fileName, cloudinaryUrl, parsedText,
 *                 extractedSkills: string[], uploadedAt }
 */

export const uploadResume = async (formData) => {
  // formData must have field 'resume' with the PDF File object
  const { data } = await axiosInstance.post('/api/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120_000,
  });
  return data; // Resume document
};

export const listResumes = async () => {
  const { data } = await axiosInstance.get('/api/resumes');
  return data; // Resume[]
};

export const getResume = async (id) => {
  const { data } = await axiosInstance.get(`/api/resumes/${id}`);
  return data;
};

export const deleteResume = async (id) => {
  const { data } = await axiosInstance.delete(`/api/resumes/${id}`);
  return data;
};