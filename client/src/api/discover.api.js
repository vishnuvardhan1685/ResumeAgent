import axiosInstance from './axiosInstance';

/**
 * discover.api.js
 *
 * Matches backend routes/discover.js  →  /api/jobs/discover
 *
 * Backend endpoint:
 *   POST /api/jobs/discover   { resumeId } → { jobs: JobListing[] }
 *
 * The backend controller calls agentClient to hit FastAPI POST /discover.
 * FastAPI runs Agent 5 (job_discovery.py) which:
 *   1. Embeds the resume skills vector
 *   2. Calls SerpAPI for Google Jobs results
 *   3. Scrapes Internshala for matching roles
 *   4. Ranks by semantic similarity score
 *   Returns JobListing[]
 *
 * JobListing shape (from agent_service/models/responses.py):
 *   { id, title, company, location, matchScore, source, applyLink, postedAt }
 */

export const discoverJobs = async ({ resumeId }) => {
  const { data } = await axiosInstance.post('/api/jobs/discover', { resumeId });
  return data; // { jobs: JobListing[] }
};