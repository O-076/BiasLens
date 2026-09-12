import React from 'react';
import { Sun, Moon, Settings, Search } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  showSettings?: boolean;
  onOpenSettings?: () => void;
  onToggleSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  darkMode, 
  onToggleDarkMode, 
  showSettings = false,
  onOpenSettings,
  onToggleSettings 
}) => {
  const handleSettings = onToggleSettings || onOpenSettings || (() => {});

  return (
    <header 
      className="flex items-center justify-between px-3.5 py-2.5 border-b select-none transition-colors"
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 rounded-md flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" strokeOpacity="0.6" />
          </svg>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-semibold text-xs tracking-tight uppercase" style={{ color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
            BiasLens
          </span>
          <span className="text-[10px] font-mono opacity-50 tabular-nums" style={{ color: 'var(--text-secondary)' }}>
            v1.0
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button 
          onClick={onToggleDarkMode} 
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          title={darkMode ? "Switch to light theme" : "Switch to dark theme"}
          aria-label="Toggle theme"
        >
          {darkMode ? (
            <Sun size={14} style={{ color: 'var(--text-secondary)' }} />
          ) : (
            <Moon size={14} style={{ color: 'var(--text-secondary)' }} />
          )}
        </button>
        <button 
          onClick={handleSettings} 
          className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
            showSettings 
              ? 'bg-blue-500/15 text-blue-500' 
              : 'hover:bg-slate-200/60 dark:hover:bg-slate-800'
          }`}
          title={showSettings ? "Close settings" : "Open settings"}
          aria-label="Settings"
        >
          <Settings size={14} style={{ color: showSettings ? 'var(--accent)' : 'var(--text-secondary)' }} />
        </button>
      </div>
    </header>
  );
};
