import React from 'react';
import { TrendingUp, AlertTriangle } from 'lucide-react';

const StrengthGapPanel = ({ strengthAreas = [], gapAreas = [] }) => (
  <div className="grid grid-cols-2 gap-4">
    {/* Strengths */}
    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={14} className="text-emerald-400" />
        <p className="text-sm font-semibold text-emerald-400">Strength Areas</p>
      </div>
      {strengthAreas.length === 0 ? (
        <p className="text-xs text-text-muted">None identified yet</p>
      ) : (
        <ul className="space-y-1.5">
          {strengthAreas.map((area) => (
            <li key={area} className="flex items-center gap-2 text-xs text-text-secondary">
              <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
              {area}
            </li>
          ))}
        </ul>
      )}
    </div>

    {/* Gaps */}
    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={14} className="text-amber-400" />
        <p className="text-sm font-semibold text-amber-400">Gap Areas</p>
      </div>
      {gapAreas.length === 0 ? (
        <p className="text-xs text-text-muted">None identified yet</p>
      ) : (
        <ul className="space-y-1.5">
          {gapAreas.map((area) => (
            <li key={area} className="flex items-center gap-2 text-xs text-text-secondary">
              <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0" />
              {area}
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

export default StrengthGapPanel;