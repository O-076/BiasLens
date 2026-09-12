import React, { useState } from 'react';
import { X, Eye, EyeOff, ExternalLink, Check, ShieldCheck, KeyRound } from 'lucide-react';

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
      onSave(localKey.trim());
    } else if (onApiKeyChange) {
      onApiKeyChange(localKey.trim());
    }
    setSavedStatus(true);
    setTimeout(() => {
      setSavedStatus(false);
      if (onClose) onClose();
    }, 800);
  };

  const isConfigured = Boolean(apiKey || localKey.trim());

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-[var(--bg-primary)] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]/50 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)]">
            <KeyRound size={14} strokeWidth={2} />
          </div>
          <div>
            <h2 className="font-medium text-sm text-[var(--text-primary)] tracking-tight">Preferences & Credentials</h2>
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-mono">Configuration</p>
          </div>
        </div>

        {onClose && (
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] border border-transparent hover:border-[var(--border)] transition-colors"
            title="Close Settings"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col gap-6 flex-1 overflow-y-auto">
        {/* API Key Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] font-mono">
              Google Gemini API Key
            </label>
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${
              isConfigured 
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
            }`}>
              {isConfigured ? 'Ready' : 'Not Configured'}
            </span>
          </div>

          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              placeholder="AIzaSy..."
              spellCheck={false}
              className="w-full py-2 px-3 pr-10 text-xs font-mono rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--text-secondary)] focus:ring-1 focus:ring-[var(--text-secondary)] transition-all"
            />
            <button 
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] p-1 transition-colors"
              title={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
            <span>Free API keys available via AI Studio</span>
            <a 
              href="https://aistudio.google.com/apikey" 
              target="_blank" 
              rel="noreferrer" 
              className="inline-flex items-center gap-1 text-[var(--text-primary)] hover:underline font-medium"
            >
              Get Key <ExternalLink size={10} />
            </a>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={handleSave}
              className={`py-2 px-4 rounded-md text-xs font-medium tracking-tight transition-all duration-150 inline-flex items-center gap-1.5 ${
                savedStatus
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 active:scale-[0.98]'
              }`}
            >
              {savedStatus ? (
                <>
                  <Check size={13} strokeWidth={2.5} />
                  <span>Saved</span>
                </>
              ) : (
                <span>Save Key</span>
              )}
            </button>

            {localKey && localKey !== apiKey && (
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-mono">
                Unsaved changes
              </span>
            )}
          </div>
        </div>

        {/* Security & Privacy Notice */}
        <div className="p-3 rounded-md bg-[var(--bg-secondary)] border border-[var(--border)] flex items-start gap-2.5">
          <ShieldCheck size={16} className="text-[var(--text-secondary)] mt-0.5 shrink-0" />
          <div className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
            <span className="font-semibold text-[var(--text-primary)]">Local Storage Only:</span> Your API key is stored directly in your browser's encrypted extension storage and communicated strictly with Google's official Gemini endpoint. No telemetry or proxy servers are used.
          </div>
        </div>

        <div className="h-px w-full bg-[var(--border)]" />

        {/* Project Metadata */}
        <div className="flex flex-col gap-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
            About This Instrument
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold text-[var(--text-primary)]">BiasLens</span>
            <span className="font-mono text-[11px] text-[var(--text-tertiary)]">v1.0.0</span>
          </div>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            An editorial-grade cognitive bias detector that scrutinizes webpages and passages to reveal loaded rhetoric, selective framing, and informal fallacies.
          </p>

          <div className="mt-2 inline-flex items-center gap-2 p-2.5 rounded-md border border-[var(--border)] bg-[var(--bg-secondary)]">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">
              HyperBloom Hacks 2026 Submission
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
