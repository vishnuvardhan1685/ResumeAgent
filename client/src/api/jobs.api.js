import axiosInstance from './axiosInstance';

/**
 * jobs.api.js
 *
 * Matches backend routes/jobs.js  →  /api/jobs/*
 *
 * Backend endpoints:
 *   POST   /api/jobs            { title, company, jdText } → Job
 *   GET    /api/jobs            → Job[]
 *   GET    /api/jobs/:id        → Job
 *   DELETE /api/jobs/:id        → { message }
 *
 * Job shape: { _id, userId, title, company, jdText, extractedSkills: string[], createdAt }
 *
 * NOTE: extractedSkills on a Job is populated by the FastAPI /parse-pdf endpoint
 * which the backend calls automatically after saving the JD text (via agentClient.js).
 * The frontend doesn't need to trigger this manually.
 */

export const saveJob = async ({ title, company, jdText }) => {
  const { data } = await axiosInstance.post('/api/jobs', { title, company, jdText });
  return data; // Job document
};

export const listJobs = async () => {
  const { data } = await axiosInstance.get('/api/jobs');
  return data; // Job[]
};

export const getJob = async (id) => {
  const { data } = await axiosInstance.get(`/api/jobs/${id}`);
  return data;
};

export const deleteJob = async (id) => {
  const { data } = await axiosInstance.delete(`/api/jobs/${id}`);
  return data;
};