import React, { useEffect } from 'react';
import { AlertCircle, Search } from 'lucide-react';
import DiscoveryFilters from '../components/discovery/DiscoveryFilters';
import DiscoveryGrid from '../components/discovery/DiscoveryGrid';
import Button from '../components/ui/Button';
import useDiscoveryStore from '../store/discoveryStore';
import useResumeStore from '../store/resumeStore';
import { listResumes } from '../api/resumes.api';

const DiscoverPage = () => {
  const { jobListings, loading, error, filters, setFilters, discoverJobs } = useDiscoveryStore();
  const selectedResumeId = useResumeStore((s) => s.selectedResumeId);
  const resumes = useResumeStore((s) => s.resumes);
  const setResumes = useResumeStore((s) => s.setResumes);

  useEffect(() => {
    if (resumes.length > 0) return;

    const loadResumes = async () => {
      try {
        const data = await listResumes();
        setResumes(data);
      } catch (err) {
        console.error('Failed to load resumes for discovery:', err);
      }
    };

    loadResumes();
  }, [resumes.length, setResumes]);

  const handleDiscover = () => {
    const fallbackResumeId = resumes[0]?._id ?? null;
    discoverJobs(selectedResumeId ?? fallbackResumeId);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero section */}
      <div className="bg-surface border border-border rounded-2xl px-8 py-12 text-center">
        <h1 className="text-3xl font-bold text-text-primary mb-3">
          Discover Your Next Opportunity
        </h1>
        <p className="text-sm text-text-secondary max-w-lg mx-auto mb-7 leading-relaxed">
          AI-powered job matching based on your deeply analyzed resume profile.
          We scan top sources to find the best fit.
        </p>
        <Button
          variant="primary"
          size="lg"
          icon={<Search size={15} />}
          loading={loading}
          disabled={resumes.length === 0}
          onClick={handleDiscover}
          className="px-8"
        >
          Find Jobs For Me
        </Button>
        {error && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            <AlertCircle size={13} />
            {error}
          </div>
        )}
      </div>

      {/* Filters */}
      <DiscoveryFilters filters={filters} onChange={setFilters} />

      {/* Results grid */}
      <DiscoveryGrid jobs={jobListings} loading={loading} filters={filters} />
    </div>
  );
};

export default DiscoverPage;
