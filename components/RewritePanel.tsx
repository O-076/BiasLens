import React, { useState } from 'react';
import { ClipboardCopy, Check, ChevronDown, ChevronRight, Wand2 } from 'lucide-react';

interface RewritePanelProps {
  originalText: string;
  rewrittenText: string;
}

export const RewritePanel: React.FC<RewritePanelProps> = ({ originalText, rewrittenText }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<'clean' | 'changes'>('clean');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(rewrittenText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderDiff = () => {
    // Simple naive word diff for display purposes
    const origWords = originalText.split(/\b/);
    const newWords = rewrittenText.split(/\b/);
    
    // This is a very basic diff just for visual representation
    // A real app would use a proper diffing library like 'diff'
    
    const elements: React.ReactNode[] = [];
    let i = 0; let j = 0;
    let key = 0;
    
    while(i < origWords.length || j < newWords.length) {
      if (origWords[i] === newWords[j]) {
        elements.push(<span key={key++} className="opacity-80">{origWords[i]}</span>);
        i++; j++;
      } else if (j >= newWords.length || (i < origWords.length && origWords[i + 1] === newWords[j])) {
        // Word removed
        if (origWords[i].trim()) elements.push(<del key={key++} className="bg-red-500/20 text-red-700 dark:text-red-400 line-through px-0.5 rounded-sm">{origWords[i]}</del>);
        i++;
      } else {
        // Word added
        if (newWords[j]?.trim()) elements.push(<ins key={key++} className="bg-green-500/20 text-green-700 dark:text-green-400 no-underline px-0.5 rounded-sm">{newWords[j]}</ins>);
        j++;
      }
    }
    return elements;
  };

  return (
    <div 
      className="rounded-xl border overflow-hidden transition-colors"
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3.5 hover:bg-slate-500/5 transition-colors select-none text-left"
      >
        <div className="flex items-center gap-2">
          <Wand2 size={14} className="text-blue-500" />
          <span className="font-semibold text-xs tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Editorial Neutral Rewrite
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />
        ) : (
          <ChevronRight size={14} style={{ color: 'var(--text-secondary)' }} />
        )}
      </button>

      {isExpanded && (
        <div 
          className="p-3.5 pt-0 flex flex-col gap-3 border-t text-xs animate-fade-in"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between pt-2.5">
            <div 
              className="flex p-0.5 rounded-lg border select-none"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}
            >
              <button
                onClick={() => setViewMode('clean')}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                  viewMode === 'clean' 
                    ? 'bg-slate-200/80 dark:bg-slate-800 shadow-sm font-semibold' 
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{ color: viewMode === 'clean' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
              >
                Clean Output
              </button>
              <button
                onClick={() => setViewMode('changes')}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                  viewMode === 'changes' 
                    ? 'bg-slate-200/80 dark:bg-slate-800 shadow-sm font-semibold' 
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{ color: viewMode === 'changes' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
              >
                Diff Comparison
              </button>
            </div>
            
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md border hover:bg-slate-500/10 transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              {copied ? <Check size={12} className="text-emerald-500" /> : <ClipboardCopy size={12} />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Text'}</span>
            </button>
          </div>

          <div 
            className="p-3 rounded-lg text-xs leading-relaxed whitespace-pre-wrap border font-serif"
            style={{ 
              backgroundColor: 'var(--bg-primary)', 
              borderColor: 'var(--border)', 
              color: 'var(--text-primary)' 
            }}
          >
            {viewMode === 'clean' ? rewrittenText : renderDiff()}
          </div>
        </div>
      )}
    </div>
  );
};
