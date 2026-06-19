import { create } from 'zustand';
import { discoverJobs as discoverJobsApi } from '../api/discover.api';

/**
 * discoveryStore
 *
 * Shape:
 *   jobListings: JobListing[]
 *   filters: { source: string, location: string, minScore: number }
 *   loading: boolean
 *
 * JobListing shape (matches agent_service models/responses.py JobListing):
 *   { id, title, company, location, matchScore, source, applyLink, postedAt }
 *
 */
const useDiscoveryStore = create((set) => ({
  jobListings: [],
  loading: false,
  error: null,
  filters: {
    source: 'all',
    location: '',
    minScore: 0,
  },

  setJobListings: (jobListings) => set({ jobListings, loading: false }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  setFilters: (filters) => set({ filters }),

  discoverJobs: async (resumeId) => {
    if (!resumeId) {
      set({ error: 'Select a resume before discovering jobs.', loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      const data = await discoverJobsApi({ resumeId });
      set({ jobListings: data.jobs ?? [], loading: false });
    } catch (err) {
      set({
        error: err?.response?.data?.message ?? err?.message ?? 'Failed to discover jobs.',
        loading: false,
      });
    }
  },

  reset: () => set({ jobListings: [], loading: false, error: null }),
}));

export default useDiscoveryStore;
