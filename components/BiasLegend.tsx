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

  // Create a counts object just based on the array provided
  const counts = detectedTypes.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueTypes = Array.from(new Set(detectedTypes));

  return (
    <div className="flex gap-2 overflow-x-auto p-3 border-b scrollbar-hide" style={{ borderColor: 'var(--border)' }}>
      {uniqueTypes.map(type => {
        const isActive = activeFilter === type;
        const color = BIAS_COLORS[type] || '#888';
        const label = type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        
        return (
          <button
            key={type}
            onClick={() => onFilterChange(isActive ? null : type)}
            className={`flex items-center whitespace-nowrap gap-1.5 px-2.5 py-1 text-xs rounded-full border transition-all ${isActive ? 'shadow-sm' : 'opacity-80'}`}
            style={{ 
              backgroundColor: isActive ? `${color}15` : 'transparent',
              borderColor: isActive ? color : 'var(--border)',
              color: 'var(--text-primary)'
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span>{label}</span>
            <span className="font-semibold opacity-60 ml-0.5">{counts[type]}</span>
          </button>
        );
      })}
    </div>
  );
};
