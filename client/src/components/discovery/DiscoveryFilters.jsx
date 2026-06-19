import React from 'react';
import { ChevronDown, MapPin, SlidersHorizontal } from 'lucide-react';

const DiscoveryFilters = ({ filters, onChange }) => {
  const set = (key) => (val) => onChange({ ...filters, [key]: val });

  return (
    <div className="bg-surface border border-border rounded-xl px-5 py-4 flex items-end gap-4 flex-wrap">
      {/* Source */}
      <div className="flex-1 min-w-[160px]">
        <label className="block text-2xs font-mono uppercase tracking-widest text-text-muted mb-1.5">
          Source
        </label>
        <div className="relative">
          <select
            value={filters.source ?? 'all'}
            onChange={(e) => set('source')(e.target.value)}
            className="w-full h-9 pl-3 pr-8 text-sm rounded-lg bg-elevated border border-border text-text-primary appearance-none focus:outline-none focus:border-accent transition-colors cursor-pointer"
          >
            <option value="all">All Sources</option>
            <option value="google_jobs">Google Jobs</option>
            <option value="internshala">Internshala</option>
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
      </div>

      {/* Location */}
      <div className="flex-1 min-w-[180px]">
        <label className="block text-2xs font-mono uppercase tracking-widest text-text-muted mb-1.5">
          Location
        </label>
        <div className="relative">
          <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="e.g. San Francisco, Remote"
            value={filters.location ?? ''}
            onChange={(e) => set('location')(e.target.value)}
            className="w-full h-9 pl-8 pr-3 text-sm rounded-lg bg-elevated border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>

      {/* Min match score */}
      <div className="flex-1 min-w-[200px]">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-2xs font-mono uppercase tracking-widest text-text-muted flex items-center gap-1">
            <SlidersHorizontal size={11} />
            Min Match Score
          </label>
          <span className="text-2xs font-mono text-accent">{filters.minScore ?? 0}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={filters.minScore ?? 0}
          onChange={(e) => set('minScore')(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none bg-elevated cursor-pointer accent-indigo-500"
          style={{
            background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${filters.minScore ?? 0}%, #252840 ${filters.minScore ?? 0}%, #252840 100%)`,
          }}
        />
      </div>
    </div>
  );
};

export default DiscoveryFilters;