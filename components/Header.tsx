import React from 'react';
import { Sun, Moon, Settings, Search } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ darkMode, onToggleDarkMode, onOpenSettings }) => {
  return (
    <header className="flex items-center justify-between px-4 py-2 border-b" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-md text-white text-xs shadow-sm">
          <Search size={14} className="text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>BiasLens</span>
          <span className="text-[10px] opacity-70" style={{ color: 'var(--text-secondary)' }}>See through the bias</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button 
          onClick={onToggleDarkMode} 
          className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun size={16} style={{ color: 'var(--text-secondary)' }} /> : <Moon size={16} style={{ color: 'var(--text-secondary)' }} />}
        </button>
        <button 
          onClick={onOpenSettings} 
          className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          title="Settings"
        >
          <Settings size={16} style={{ color: 'var(--text-secondary)' }} />
        </button>
      </div>
    </header>
  );
};
