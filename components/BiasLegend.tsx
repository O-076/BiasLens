import React from 'react';
import { BiasType } from '@/types/analysis';

// Using local mapped colors to match other components
const BIAS_COLORS: Record<string, string> = {
  framing: '#3b82f6', loaded_language: '#f59e0b', appeal_to_emotion: '#f43f5e',
  false_dichotomy: '#f97316', ad_hominem: '#a855f7', appeal_to_authority: '#14b8a6',
  bandwagon: '#06b6d4', straw_man: '#6366f1', slippery_slope: '#ef4444',
  hasty_generalization: '#22c55e', cherry_picking: '#eab308', false_causation: '#ec4899',
  whataboutism: '#8b5cf6'
};

interface BiasLegendProps {
  detectedTypes: BiasType[];
  activeFilter: BiasType | null;
  onFilterChange: (type: BiasType | null) => void;
}

export const BiasLegend: React.FC<BiasLegendProps> = ({ detectedTypes, activeFilter, onFilterChange }) => {
  if (detectedTypes.length === 0) return null;

  const counts = detectedTypes.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueTypes = Array.from(new Set(detectedTypes));

  return (
    <div className="flex flex-col gap-1.5 select-none">
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider px-0.5 opacity-50" style={{ color: 'var(--text-secondary)' }}>
        <span>Filter by category</span>
        {activeFilter && (
          <button 
            onClick={() => onFilterChange(null)}
            className="hover:text-blue-500 font-semibold transition-colors"
          >
            Clear filter
          </button>
        )}
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {uniqueTypes.map(type => {
          const isActive = activeFilter === type;
          const color = BIAS_COLORS[type] || '#3b82f6';
          const label = type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          
          return (
            <button
              key={type}
              onClick={() => onFilterChange(isActive ? null : type)}
              className={`flex items-center whitespace-nowrap gap-1.5 px-2 py-1 text-[11px] rounded-lg border transition-all ${
                isActive 
                  ? 'ring-1 font-semibold' 
                  : 'hover:bg-slate-500/5'
              }`}
              style={{ 
                backgroundColor: isActive ? `${color}18` : 'var(--bg-secondary)',
                borderColor: isActive ? color : 'var(--border)',
                color: 'var(--text-primary)'
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span>{label}</span>
              <span className="font-mono text-[10px] opacity-50 tabular-nums">
                {counts[type]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
