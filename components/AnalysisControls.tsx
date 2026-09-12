import React from 'react';
import { Globe, Loader2 } from 'lucide-react';

interface AnalysisControlsProps {
  mode: 'page' | 'text';
  onModeChange: (mode: 'page' | 'text') => void;
  onAnalyzePage: () => void;
  isLoading: boolean;
}

export const AnalysisControls: React.FC<AnalysisControlsProps> = ({ mode, onModeChange, onAnalyzePage, isLoading }) => {
  return (
    <div className="flex flex-col gap-3">
      {/* Segmented Control */}
      <div 
        className="flex p-0.5 rounded-lg border select-none transition-colors"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      >
        <button
          onClick={() => onModeChange('page')}
          className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all ${
            mode === 'page' 
              ? 'bg-white dark:bg-slate-800 shadow-sm font-semibold' 
              : 'opacity-60 hover:opacity-100'
          }`}
          style={{ 
            color: mode === 'page' ? 'var(--text-primary)' : 'var(--text-secondary)'
          }}
        >
          Active Tab
        </button>
        <button
          onClick={() => onModeChange('text')}
          className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all ${
            mode === 'text' 
              ? 'bg-white dark:bg-slate-800 shadow-sm font-semibold' 
              : 'opacity-60 hover:opacity-100'
          }`}
          style={{ 
            color: mode === 'text' ? 'var(--text-primary)' : 'var(--text-secondary)'
          }}
        >
          Manual Text
        </button>
      </div>
      
      {mode === 'page' && (
        <button
          onClick={onAnalyzePage}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-xs tracking-wide uppercase transition-all select-none shadow-sm bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
        >
          {isLoading ? (
            <Loader2 size={14} className="animate-spin text-current" />
          ) : (
            <Globe size={14} className="text-current opacity-80" />
          )}
          <span>{isLoading ? 'Inspecting Page Content...' : 'Inspect Current Page'}</span>
        </button>
      )}
    </div>
  );
};
