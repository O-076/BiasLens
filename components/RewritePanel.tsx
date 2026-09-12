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
    <div className="flex flex-col border-y" style={{ borderColor: 'var(--border)' }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Wand2 size={16} className="text-blue-500" />
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>View Neutral Rewrite</span>
        </div>
        {isExpanded ? <ChevronDown size={18} style={{ color: 'var(--text-secondary)' }} /> : <ChevronRight size={18} style={{ color: 'var(--text-secondary)' }} />}
      </button>

      <div 
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isExpanded ? '1000px' : '0' }}
      >
        <div className="p-4 pt-0 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex bg-black/5 dark:bg-white/5 p-0.5 rounded-md" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <button
                onClick={() => setViewMode('clean')}
                className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-all ${viewMode === 'clean' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'opacity-70'}`}
                style={{ color: viewMode === 'clean' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
              >
                Clean
              </button>
              <button
                onClick={() => setViewMode('changes')}
                className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-all ${viewMode === 'changes' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'opacity-70'}`}
                style={{ color: viewMode === 'changes' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
              >
                Changes
              </button>
            </div>
            
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              {copied ? <Check size={14} className="text-green-500" /> : <ClipboardCopy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div 
            className="p-3 rounded-lg text-sm leading-relaxed whitespace-pre-wrap border"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            {viewMode === 'clean' ? rewrittenText : renderDiff()}
          </div>
        </div>
      </div>
    </div>
  );
};
