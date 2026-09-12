import React, { useState, useMemo } from 'react';
import { ClipboardCopy, Check, ChevronDown, ChevronRight, Wand2, ArrowRight, Layers, FileText } from 'lucide-react';
import { BiasInstance } from '@/types/analysis';
import { getBiasColor, getBiasTypeLabel } from '@/lib/bias-taxonomy';

interface RewritePanelProps {
  originalText: string;
  rewrittenText: string;
  biases?: BiasInstance[];
}

interface DiffItem {
  type: 'same' | 'added' | 'removed';
  value: string;
}

// Longest Common Subsequence word-level diff
function computeSentenceDiff(str1: string, str2: string): DiffItem[] {
  const tokens1 = str1.match(/[\w']+|[^\w\s]|\s+/g) || [];
  const tokens2 = str2.match(/[\w']+|[^\w\s]|\s+/g) || [];

  const n = tokens1.length;
  const m = tokens2.length;
  
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (tokens1[i - 1] === tokens2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  let i = n;
  let j = m;
  const result: DiffItem[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && tokens1[i - 1] === tokens2[j - 1]) {
      result.unshift({ type: 'same', value: tokens1[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'added', value: tokens2[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      result.unshift({ type: 'removed', value: tokens1[i - 1] });
      i--;
    }
  }

  return result;
}

export const RewritePanel: React.FC<RewritePanelProps> = ({ originalText, rewrittenText, biases = [] }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<'targeted' | 'in_context'>('targeted');
  const [copiedSentenceId, setCopiedSentenceId] = useState<string | null>(null);
  const [copiedFull, setCopiedFull] = useState(false);

  // Filter biases that have valid quotes and suggestions
  const validRevisions = useMemo(() => {
    return biases.filter(b => b.quote && b.suggestion && b.quote.trim() !== b.suggestion.trim());
  }, [biases]);

  // Construct surgical in-context text where ONLY the biased parts are replaced
  const { inContextSegments, fullCorrectedString } = useMemo(() => {
    if (!originalText || validRevisions.length === 0) {
      const fallback = rewrittenText || originalText;
      return { 
        inContextSegments: [{ type: 'neutral' as const, text: fallback }], 
        fullCorrectedString: fallback 
      };
    }

    // Sort by appearance in originalText
    const sorted = [...validRevisions].sort((a, b) => {
      const posA = a.startIndex !== undefined ? a.startIndex : originalText.indexOf(a.quote);
      const posB = b.startIndex !== undefined ? b.startIndex : originalText.indexOf(b.quote);
      return posA - posB;
    });

    const segments: { type: 'neutral' | 'corrected'; text: string; originalQuote?: string; bias?: BiasInstance }[] = [];
    let currentIndex = 0;
    let fullStr = '';

    for (const bias of sorted) {
      const idx = originalText.indexOf(bias.quote, currentIndex);
      if (idx !== -1) {
        if (idx > currentIndex) {
          const neutralChunk = originalText.substring(currentIndex, idx);
          segments.push({ type: 'neutral', text: neutralChunk });
          fullStr += neutralChunk;
        }
        segments.push({ 
          type: 'corrected', 
          text: bias.suggestion, 
          originalQuote: bias.quote,
          bias 
        });
        fullStr += bias.suggestion;
        currentIndex = idx + bias.quote.length;
      }
    }

    if (currentIndex < originalText.length) {
      const remaining = originalText.substring(currentIndex);
      segments.push({ type: 'neutral', text: remaining });
      fullStr += remaining;
    }

    return { inContextSegments: segments, fullCorrectedString: fullStr };
  }, [originalText, rewrittenText, validRevisions]);

  const handleCopySentence = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSentenceId(id);
    setTimeout(() => setCopiedSentenceId(null), 1500);
  };

  const handleCopyFull = () => {
    navigator.clipboard.writeText(fullCorrectedString);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 1500);
  };

  return (
    <div 
      className="rounded-xl border overflow-hidden transition-colors"
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      {/* Header Accordion Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3.5 hover:bg-slate-500/5 transition-colors select-none text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Wand2 size={12} strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-semibold text-xs tracking-tight block" style={{ color: 'var(--text-primary)' }}>
              Targeted Neutral Revisions
            </span>
            <span className="text-[10px] font-mono text-[var(--text-tertiary)] block">
              {validRevisions.length} biased {validRevisions.length === 1 ? 'sentence' : 'sentences'} rewritten neutrally
            </span>
          </div>
        </div>
        
        {isExpanded ? (
          <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />
        ) : (
          <ChevronRight size={14} style={{ color: 'var(--text-secondary)' }} />
        )}
      </button>

      {isExpanded && (
        <div 
          className="p-4 pt-0 flex flex-col gap-3.5 border-t text-xs animate-fade-in"
          style={{ borderColor: 'var(--border)' }}
        >
          {/* View Mode Switcher + Global Copy */}
          <div className="flex items-center justify-between pt-3">
            <div 
              className="flex p-0.5 rounded-lg border select-none"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}
            >
              <button
                onClick={() => setViewMode('targeted')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                  viewMode === 'targeted' 
                    ? 'bg-slate-200/80 dark:bg-slate-800 shadow-sm font-semibold text-[var(--text-primary)]' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Layers size={11} />
                <span>Sentence by Sentence</span>
              </button>
              <button
                onClick={() => setViewMode('in_context')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                  viewMode === 'in_context' 
                    ? 'bg-slate-200/80 dark:bg-slate-800 shadow-sm font-semibold text-[var(--text-primary)]' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <FileText size={11} />
                <span>In-Context Passage</span>
              </button>
            </div>

            {viewMode === 'in_context' && (
              <button
                onClick={handleCopyFull}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md border border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                {copiedFull ? <Check size={11} className="text-emerald-500" /> : <ClipboardCopy size={11} />}
                <span>{copiedFull ? 'Copied' : 'Copy Corrected Text'}</span>
              </button>
            )}
          </div>

          {/* Mode 1: Sentence-by-Sentence Targeted Revisions */}
          {viewMode === 'targeted' && (
            <div className="flex flex-col gap-3">
              {validRevisions.length === 0 ? (
                <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-center text-xs text-[var(--text-secondary)]">
                  No biased sentences required rewriting.
                </div>
              ) : (
                validRevisions.map((bias) => {
                  const typeColor = getBiasColor(bias.type);
                  const typeLabel = getBiasTypeLabel(bias.type);
                  const diff = computeSentenceDiff(bias.quote, bias.suggestion);

                  return (
                    <div 
                      key={bias.id}
                      className="p-3.5 rounded-lg border flex flex-col gap-2.5 bg-[var(--bg-primary)] transition-all"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      {/* Top Bar: Category badge & Copy Button */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span 
                            className="w-1.5 h-1.5 rounded-full" 
                            style={{ backgroundColor: typeColor }} 
                          />
                          <span 
                            className="text-[10px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border"
                            style={{ 
                              color: typeColor, 
                              backgroundColor: `${typeColor}15`,
                              borderColor: `${typeColor}30`
                            }}
                          >
                            {typeLabel}
                          </span>
                        </div>

                        <button
                          onClick={() => handleCopySentence(bias.id, bias.suggestion)}
                          className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono rounded border border-[var(--border)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                          title="Copy neutral replacement"
                        >
                          {copiedSentenceId === bias.id ? (
                            <>
                              <Check size={10} className="text-emerald-500" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <ClipboardCopy size={10} />
                              <span>Copy Rewrite</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Before / After Row Comparison */}
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        {/* Biased Original */}
                        <div className="p-2.5 rounded-md bg-rose-500/5 border border-rose-500/15 flex flex-col gap-1">
                          <span className="text-[9px] font-mono uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                            <span>Biased Original</span>
                          </span>
                          <p className="font-serif italic text-rose-950 dark:text-rose-100/90 leading-relaxed">
                            "{bias.quote}"
                          </p>
                        </div>

                        {/* Neutral Replacement */}
                        <div className="p-2.5 rounded-md bg-emerald-500/5 border border-emerald-500/15 flex flex-col gap-1">
                          <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <span>Neutral Rewrite</span>
                          </span>
                          <p className="font-serif text-emerald-950 dark:text-emerald-100 leading-relaxed font-medium">
                            "{bias.suggestion}"
                          </p>
                        </div>
                      </div>

                      {/* Word-Level Diff Visualization */}
                      <div className="pt-2 border-t border-[var(--border)]">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] block mb-1">
                          Editorial Word Diff
                        </span>
                        <div className="font-serif text-xs leading-relaxed text-[var(--text-primary)] bg-[var(--bg-secondary)]/50 p-2 rounded border border-[var(--border)]">
                          {diff.map((item, dIdx) => {
                            if (item.type === 'same') {
                              return <span key={dIdx} className="opacity-80">{item.value}</span>;
                            }
                            if (item.type === 'removed') {
                              return (
                                <del key={dIdx} className="bg-rose-500/20 text-rose-700 dark:text-rose-400 line-through px-0.5 rounded-sm mx-0.5">
                                  {item.value}
                                </del>
                              );
                            }
                            return (
                              <ins key={dIdx} className="bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-medium no-underline px-0.5 rounded-sm mx-0.5">
                                {item.value}
                              </ins>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Mode 2: In-Context Full Passage View */}
          {viewMode === 'in_context' && (
            <div className="flex flex-col gap-2">
              <div className="text-[10px] text-[var(--text-tertiary)] font-mono flex items-center gap-1.5 px-1">
                <span>Non-biased text preserved verbatim. Corrected sentences highlighted in</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">green</span>.
              </div>

              <div 
                className="p-3.5 rounded-lg text-xs leading-relaxed whitespace-pre-wrap border font-serif max-h-[40vh] overflow-y-auto"
                style={{ 
                  backgroundColor: 'var(--bg-primary)', 
                  borderColor: 'var(--border)', 
                  color: 'var(--text-primary)' 
                }}
              >
                {inContextSegments.map((seg, idx) => {
                  if (seg.type === 'neutral') {
                    return <span key={idx} className="opacity-90">{seg.text}</span>;
                  }
                  return (
                    <mark 
                      key={idx}
                      className="bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-900 dark:text-emerald-200 border-b-2 border-emerald-500/50 px-1 py-0.5 rounded mx-0.5 font-medium inline"
                      title={seg.originalQuote ? `Original: "${seg.originalQuote}"` : undefined}
                    >
                      {seg.text}
                    </mark>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
