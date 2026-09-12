import React, { useState } from 'react';
import { X, Eye, EyeOff, ExternalLink } from 'lucide-react';

interface SettingsProps {
  apiKey: string;
  onApiKeyChange?: (key: string) => void;
  onSave?: (key: string) => void;
  onClose?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ apiKey, onApiKeyChange, onSave, onClose }) => {
  const [localKey, setLocalKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [savedStatus, setSavedStatus] = useState(false);

  const handleSave = () => {
    if (onSave) {
      onSave(localKey);
    } else if (onApiKeyChange) {
      onApiKeyChange(localKey);
    }
    setSavedStatus(true);
    setTimeout(() => {
      setSavedStatus(false);
      if (onClose) onClose();
    }, 1000);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col shadow-2xl animate-fade-in" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Settings</h2>
        {onClose && (
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Close Settings"
          >
            <X size={20} style={{ color: 'var(--text-secondary)' }} />
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col gap-6 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Gemini API Key</label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full p-2.5 pr-10 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
            <button 
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
            Get a free API key at 
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-0.5">
              aistudio.google.com <ExternalLink size={10} />
            </a>
          </p>
          
          <button
            onClick={handleSave}
            className="mt-2 py-2 px-4 rounded-lg font-medium text-white shadow-sm bg-blue-600 hover:bg-blue-700 transition-colors self-start"
          >
            {savedStatus ? 'Saved!' : 'Save API Key'}
          </button>
        </div>

        <div className="h-px w-full" style={{ backgroundColor: 'var(--border)' }} />

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>About</h3>
          <p className="text-sm font-bold mt-1" style={{ color: 'var(--text-primary)' }}>BiasLens v1.0.0</p>
          <p className="text-xs leading-relaxed mb-1" style={{ color: 'var(--text-secondary)' }}>
            An AI-powered cognitive bias detector that analyzes webpages and text to reveal loaded language, framing, and logical fallacies.
          </p>
          <p className="text-xs font-medium mt-2 p-2 rounded-md bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-indigo-700 dark:text-indigo-400">
            Built for HyperBloom Hacks 2026
          </p>
        </div>
      </div>
    </div>
  );
};
