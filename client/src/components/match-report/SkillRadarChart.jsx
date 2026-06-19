import React from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-elevated border border-border rounded-lg px-3 py-2 text-xs">
      <p className="text-text-primary font-semibold">{payload[0]?.payload?.subject}</p>
      <p className="text-accent">{payload[0]?.value} / 100</p>
    </div>
  );
};

/**
 * @param {{ subject: string, score: number }[]} data
 * Default axes: Skills, Experience, Keywords, Projects, Education, Seniority
 */
const SkillRadarChart = ({ data }) => {
  const defaultData = [
    { subject: 'Skills', score: 0 },
    { subject: 'Experience', score: 0 },
    { subject: 'Keywords', score: 0 },
    { subject: 'Projects', score: 0 },
    { subject: 'Education', score: 0 },
    { subject: 'Seniority', score: 0 },
  ];

  const chartData = data ?? defaultData;

  return (
    <div className="bg-surface border border-border rounded-xl p-6 h-full">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Dimensional Analysis</h3>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid
            stroke="#252840"
            gridType="polygon"
          />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#8b8fa8', fontSize: 11, fontFamily: 'Inter' }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.2}
            strokeWidth={2}
            dot={{ fill: '#6366f1', r: 3 }}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillRadarChart;