import React, { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { AnalysisResult } from '@/types/analysis';

interface ReportCardProps {
  result: AnalysisResult;
}

export const ReportCard: React.FC<ReportCardProps> = ({ result }) => {
  const getVerdict = (score: number) => {
    if (score >= 85) return { label: 'BALANCED & OBJECTIVE', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20', bar: 'bg-emerald-500' };
    if (score >= 65) return { label: 'MODERATE FRAMING', color: 'text-sky-500', bg: 'bg-sky-500/10 border-sky-500/20', bar: 'bg-sky-500' };
    if (score >= 40) return { label: 'NOTICEABLE BIAS', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20', bar: 'bg-amber-500' };
    return { label: 'HEAVILY SLANTED', color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/20', bar: 'bg-rose-500' };
  };

  const verdict = getVerdict(result.neutralityScore);

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
    <div className="flex flex-col gap-4">
      {/* Editorial Calibration Bar */}
      <div 
        className="p-4 rounded-xl border select-none transition-colors"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider opacity-60 mb-0.5" style={{ color: 'var(--text-secondary)' }}>
              Neutrality Index
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold font-mono tracking-tight tabular-nums" style={{ color: 'var(--text-primary)' }}>
                {result.neutralityScore}
              </span>
              <span className="text-xs font-mono opacity-40" style={{ color: 'var(--text-secondary)' }}>
                /100
              </span>
            </div>
          </div>

          <div className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase border ${verdict.bg} ${verdict.color}`}>
            {verdict.label}
          </div>
        </div>

        {/* Linear Calibration Scale */}
        <div className="space-y-1.5">
          <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
            <div 
              className={`h-full transition-all duration-700 ease-out ${verdict.bar}`} 
              style={{ width: `${Math.max(4, result.neutralityScore)}%` }} 
            />
          </div>
          <div className="flex justify-between text-[9px] font-mono opacity-50 px-0.5" style={{ color: 'var(--text-tertiary)' }}>
            <span>0 HEAVILY SLANTED</span>
            <span>50 MIXED</span>
            <span>100 OBJECTIVE</span>
          </div>
        </div>
      </div>

      {/* Diagnostics Row */}
      <div 
        className="grid grid-cols-3 divide-x rounded-xl border text-center transition-colors"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', divideColor: 'var(--border)' }}
      >
        <div className="p-2.5 flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase font-mono tracking-wider opacity-50" style={{ color: 'var(--text-secondary)' }}>
            Biases
          </span>
          <span className="text-base font-bold font-mono tabular-nums mt-0.5" style={{ color: 'var(--text-primary)' }}>
            {result.biases.length}
          </span>
        </div>
        <div className="p-2.5 flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase font-mono tracking-wider opacity-50" style={{ color: 'var(--text-secondary)' }}>
            Primary
          </span>
          <span className="text-xs font-medium truncate max-w-[90px] mt-0.5" style={{ color: 'var(--text-primary)' }} title={topBiasType}>
            {topBiasType}
          </span>
        </div>
        <div className="p-2.5 flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase font-mono tracking-wider opacity-50" style={{ color: 'var(--text-secondary)' }}>
            Severity
          </span>
          <div className="flex items-center gap-1 mt-1 font-mono text-[10px]">
            <span className="text-rose-500 font-bold">{severityCounts.high}H</span>
            <span className="opacity-30">·</span>
            <span className="text-amber-500 font-bold">{severityCounts.medium}M</span>
            <span className="opacity-30">·</span>
            <span className="text-emerald-500 font-bold">{severityCounts.low}L</span>
          </div>
        </div>
      </div>

      {/* Radar Chart (Distribution) */}
      {chartData.length > 2 && (
        <div 
          className="p-3 rounded-xl border transition-colors flex flex-col gap-1"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          <div className="text-[10px] font-mono uppercase tracking-wider opacity-50 px-1" style={{ color: 'var(--text-secondary)' }}>
            Tactical Vector Distribution
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} margin={{ top: 12, right: 16, bottom: 12, left: 16 }}>
                <PolarGrid stroke="var(--border)" strokeOpacity={0.6} />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 9, fontFamily: 'inherit' }} 
                />
                <Radar 
                  name="Biases" 
                  dataKey="A" 
                  stroke="var(--accent)" 
                  fill="var(--accent)" 
                  fillOpacity={0.25} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Analytical Takeaway */}
      <div 
        className="p-3.5 rounded-xl border transition-colors"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      >
        <div className="text-[10px] font-mono uppercase tracking-wider opacity-50 mb-1.5" style={{ color: 'var(--text-secondary)' }}>
          Editorial Assessment
        </div>
        <p className="text-xs leading-relaxed font-sans" style={{ color: 'var(--text-primary)' }}>
          {result.summary}
        </p>
      </div>
    </div>
  );
};
