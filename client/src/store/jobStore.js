import { create } from 'zustand';

/**
 * jobStore
 *
 * Shape:
 *   jobs: Job[]
 *   selectedJobId: string | null
 *
 * Job shape (matches server/src/models/Job.js):
 *   { _id, userId, title, company, jdText, extractedSkills: string[], createdAt }
 */
const useJobStore = create((set, get) => ({
  jobs: [],
  selectedJobId: null,

  setJobs: (jobs) => set({ jobs }),

  addJob: (job) =>
    set((s) => ({ jobs: [job, ...s.jobs] })),

  updateJob: (id, partial) =>
    set((s) => ({
      jobs: s.jobs.map((j) => (j._id === id ? { ...j, ...partial } : j)),
    })),

  removeJob: (id) =>
    set((s) => ({
      jobs: s.jobs.filter((j) => j._id !== id),
      selectedJobId: s.selectedJobId === id ? null : s.selectedJobId,
    })),

  selectJob: (id) => set({ selectedJobId: id }),

  getSelected: () => {
    const { jobs, selectedJobId } = get();
    return jobs.find((j) => j._id === selectedJobId) ?? null;
  },
}));

export default useJobStore;
