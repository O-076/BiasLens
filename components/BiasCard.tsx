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

const SEVERITY_BADGES = {
  low: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  medium: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  high: 'text-rose-500 bg-rose-500/10 border-rose-500/20'
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
      className="rounded-xl border transition-all overflow-hidden"
      style={{ 
        backgroundColor: 'var(--bg-secondary)', 
        borderColor: isExpanded ? 'var(--border)' : 'var(--border)'
      }}
    >
      <div 
        onClick={onToggle}
        className="p-3.5 flex items-start justify-between cursor-pointer hover:bg-slate-500/5 transition-colors select-none"
      >
        <div className="flex flex-col gap-1.5 flex-1 pr-3">
          <div className="flex items-center gap-2">
            <span 
              className="w-2 h-2 rounded-full shrink-0" 
              style={{ backgroundColor: typeColor }} 
            />
            <span className="font-semibold text-xs tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {displayType}
            </span>
            <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border font-semibold tracking-wider ${SEVERITY_BADGES[bias.severity]}`}>
              {bias.severity}
            </span>
          </div>

          {!isExpanded && (
            <p className="text-xs italic truncate opacity-70 font-serif" style={{ color: 'var(--text-secondary)' }}>
              "{bias.quote}"
            </p>
          )}
        </div>

        <button 
          className="p-1 rounded opacity-50 hover:opacity-100 transition-opacity shrink-0 mt-0.5"
          aria-label={isExpanded ? "Collapse finding" : "Expand finding"}
        >
          {isExpanded ? (
            <ChevronUp size={14} style={{ color: 'var(--text-primary)' }} />
          ) : (
            <ChevronDown size={14} style={{ color: 'var(--text-primary)' }} />
          )}
        </button>
      </div>

      {isExpanded && (
        <div 
          className="p-3.5 pt-0 flex flex-col gap-3.5 border-t text-xs animate-fade-in"
          style={{ borderColor: 'var(--border)' }}
        >
          {/* Quoted Text Block */}
          <div 
            className="p-3 mt-3 rounded-lg border font-serif italic text-xs leading-relaxed"
            style={{ 
              backgroundColor: 'var(--bg-primary)', 
              borderColor: 'var(--border)', 
              color: 'var(--text-primary)' 
            }}
          >
            "{bias.quote}"
          </div>
          
          {/* Critique Section */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider opacity-50 block" style={{ color: 'var(--text-secondary)' }}>
              Analysis & Impact
            </span>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {bias.explanation}
            </p>
          </div>
          
          {/* Neutral Alternative */}
          <div 
            className="p-2.5 rounded-lg border flex flex-col gap-1"
            style={{ 
              backgroundColor: 'rgba(34, 197, 94, 0.05)', 
              borderColor: 'rgba(34, 197, 94, 0.2)' 
            }}
          >
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
              Balanced Alternative
            </span>
            <p className="text-xs leading-relaxed text-emerald-800 dark:text-emerald-200">
              {bias.suggestion}
            </p>
          </div>

          {onLocate && (
            <button 
              onClick={(e) => { e.stopPropagation(); onLocate(); }}
              className="flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-medium rounded-md border hover:bg-slate-500/10 transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              <MapPin size={12} />
              <span>Highlight on page</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
