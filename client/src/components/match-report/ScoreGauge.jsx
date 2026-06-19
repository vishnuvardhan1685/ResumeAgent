import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const getColor = (score) => {
  if (score >= 75) return { stroke: '#22c55e', text: 'text-emerald-400', label: 'Strong Match', Icon: TrendingUp };
  if (score >= 50) return { stroke: '#f59e0b', text: 'text-amber-400', label: 'Moderate Match', Icon: Minus };
  return { stroke: '#ef4444', text: 'text-red-400', label: 'Weak Match', Icon: TrendingDown };
};

const ScoreGauge = ({ score = 0 }) => {
  // SVG arc gauge — semicircle
  const R = 90;
  const CX = 120;
  const CY = 115;
  const circumference = Math.PI * R; // half circle
  const progress = Math.min(Math.max(score, 0), 100) / 100;
  const dashOffset = circumference * (1 - progress);

  // Needle angle: -180deg (0%) to 0deg (100%)
  const angle = -180 + progress * 180;
  const needleRad = (angle * Math.PI) / 180;
  const nx = CX + (R - 12) * Math.cos(needleRad);
  const ny = CY + (R - 12) * Math.sin(needleRad);

  const { stroke, text, label, Icon } = getColor(score);

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Overall Fit</h3>

      <div className="flex flex-col items-center">
        <svg width="240" height="130" viewBox="0 0 240 130">
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>

          {/* Background track */}
          <path
            d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
            fill="none"
            stroke="#1a1d2a"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Colored gradient arc (full) */}
          <path
            d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="16"
            strokeLinecap="round"
            opacity="0.25"
          />

          {/* Progress arc */}
          <path
            d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
            fill="none"
            stroke={stroke}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
          />

          {/* Needle */}
          <line
            x1={CX} y1={CY}
            x2={nx} y2={ny}
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx={CX} cy={CY} r="5" fill="white" />
        </svg>

        {/* Score number */}
        <div className="-mt-6 text-center">
          <span className="text-6xl font-bold text-text-primary">{Math.round(score)}</span>
          <span className="text-lg text-text-muted">/100</span>
        </div>

        <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${text}`}>
          <Icon size={14} />
          {label}
        </div>
      </div>
    </div>
  );
};

export default ScoreGauge;