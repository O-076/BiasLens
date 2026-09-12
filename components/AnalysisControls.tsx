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
      <div className="flex p-1 rounded-full bg-black/5 dark:bg-white/5" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <button
          onClick={() => onModeChange('page')}
          className={`flex-1 py-1.5 px-3 text-sm font-medium rounded-full transition-all ${mode === 'page' ? 'shadow-sm bg-white dark:bg-zinc-800' : 'opacity-70 hover:opacity-100'}`}
          style={{ color: mode === 'page' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
        >
          Analyze Page
        </button>
        <button
          onClick={() => onModeChange('text')}
          className={`flex-1 py-1.5 px-3 text-sm font-medium rounded-full transition-all ${mode === 'text' ? 'shadow-sm bg-white dark:bg-zinc-800' : 'opacity-70 hover:opacity-100'}`}
          style={{ color: mode === 'text' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
        >
          Paste Text
        </button>
      </div>
      
      {mode === 'page' && (
        <button
          onClick={onAnalyzePage}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-white shadow-md bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Globe size={18} />}
          {isLoading ? 'Analyzing Page...' : 'Analyze This Page'}
        </button>
      )}
    </div>
  );
};
