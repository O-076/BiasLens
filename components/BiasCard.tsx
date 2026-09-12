import React from 'react';
import { ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { BiasInstance } from '@/types/analysis';

// Fallback color mapping
const BIAS_COLORS: Record<string, string> = {
  framing: '#3b82f6', loaded_language: '#f59e0b', appeal_to_emotion: '#f43f5e',
  false_dichotomy: '#f97316', ad_hominem: '#a855f7', appeal_to_authority: '#14b8a6',
  bandwagon: '#06b6d4', straw_man: '#6366f1', slippery_slope: '#ef4444',
  hasty_generalization: '#22c55e', cherry_picking: '#eab308', false_causation: '#ec4899',
  whataboutism: '#8b5cf6'
};

const SEVERITY_COLORS = {
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
};

interface BiasCardProps {
  bias: BiasInstance;
  isExpanded: boolean;
  onToggle: () => void;
  onLocate?: () => void;
}

export const BiasCard: React.FC<BiasCardProps> = ({ bias, isExpanded, onToggle, onLocate }) => {
  const typeColor = BIAS_COLORS[bias.type] || '#3b82f6';
  const displayType = bias.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div 
      className="rounded-xl overflow-hidden mb-3 border transition-all"
      style={{ 
        backgroundColor: 'var(--bg-secondary)', 
        borderColor: 'var(--border)',
        borderLeftWidth: '4px',
        borderLeftColor: typeColor
      }}
    >
      <div 
        onClick={onToggle}
        className="p-3 flex items-center justify-between cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex flex-col gap-1.5 flex-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: typeColor }} />
            <span className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{displayType}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${SEVERITY_COLORS[bias.severity]}`}>
              {bias.severity.charAt(0).toUpperCase() + bias.severity.slice(1)}
            </span>
          </div>
          {!isExpanded && (
            <p className="text-xs truncate italic opacity-80" style={{ color: 'var(--text-secondary)' }}>
              "{bias.quote.length > 50 ? bias.quote.substring(0, 50) + '...' : bias.quote}"
            </p>
          )}
        </div>
        <button className="p-1 opacity-50 hover:opacity-100 transition-opacity">
          {isExpanded ? <ChevronUp size={16} style={{ color: 'var(--text-primary)' }}/> : <ChevronDown size={16} style={{ color: 'var(--text-primary)' }}/>}
        </button>
      </div>

      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden`}
        style={{ maxHeight: isExpanded ? '500px' : '0' }}
      >
        <div className="p-3 pt-0 border-t flex flex-col gap-3" style={{ borderColor: 'var(--border)' }}>
          <div className="p-2.5 mt-2 rounded-lg bg-black/5 dark:bg-white/5 text-sm italic border-l-2" style={{ borderLeftColor: typeColor, color: 'var(--text-primary)' }}>
            "{bias.quote}"
          </div>
          
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-tertiary)' }}>Why it's biased:</span>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{bias.explanation}</p>
          </div>
          
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-tertiary)' }}>Neutral alternative:</span>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{bias.suggestion}</p>
          </div>

          {onLocate && (
            <button 
              onClick={(e) => { e.stopPropagation(); onLocate(); }}
              className="mt-1 flex items-center justify-center gap-1.5 w-full py-2 text-xs font-medium rounded-lg border hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              <MapPin size={14} />
              Show on page
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
