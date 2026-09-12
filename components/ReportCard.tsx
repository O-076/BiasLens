import React, { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { AnalysisResult } from '@/types/analysis';

interface ReportCardProps {
  result: AnalysisResult;
}

export const ReportCard: React.FC<ReportCardProps> = ({ result }) => {
  const getScoreColor = (score: number) => {
    if (score < 34) return '#ef4444'; // Red
    if (score < 67) return '#f59e0b'; // Amber
    return '#22c55e'; // Green
  };

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    result.biases.forEach(b => {
      const label = b.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([subject, A]) => ({ subject, A }));
  }, [result.biases]);

  const severityCounts = {
    high: result.biases.filter(b => b.severity === 'high').length,
    medium: result.biases.filter(b => b.severity === 'medium').length,
    low: result.biases.filter(b => b.severity === 'low').length,
  };

  const topBiasType = chartData.length > 0 
    ? chartData.reduce((prev, current) => (prev.A > current.A) ? prev : current).subject 
    : 'None';

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Score and Chart Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center justify-center p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" className="opacity-10" style={{ color: 'var(--text-primary)' }} />
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke={getScoreColor(result.neutralityScore)} 
                strokeWidth="10"
                strokeDasharray={`${(result.neutralityScore / 100) * 283} 283`}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{result.neutralityScore}</span>
            </div>
          </div>
          <span className="mt-2 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Neutrality</span>
        </div>

        <div className="p-2 rounded-xl border h-36 flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-tertiary)', fontSize: 8 }} />
                <Radar name="Biases" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>No biases found</span>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex divide-x rounded-xl border py-3 px-2 text-center" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', divideColor: 'var(--border)' }}>
        <div className="flex-1 flex flex-col px-2">
          <span className="text-xs opacity-70" style={{ color: 'var(--text-secondary)' }}>Total</span>
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{result.biases.length}</span>
        </div>
        <div className="flex-1 flex flex-col px-2">
          <span className="text-xs opacity-70" style={{ color: 'var(--text-secondary)' }}>Primary</span>
          <span className="font-semibold text-xs mt-1 truncate" style={{ color: 'var(--text-primary)' }}>{topBiasType}</span>
        </div>
        <div className="flex-1 flex flex-col px-2">
          <span className="text-xs opacity-70" style={{ color: 'var(--text-secondary)' }}>Severity</span>
          <span className="font-semibold text-xs mt-1" style={{ color: 'var(--text-primary)' }}>
            {severityCounts.high}H {severityCounts.medium}M {severityCounts.low}L
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>AI Summary</h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{result.summary}</p>
      </div>
    </div>
  );
};
