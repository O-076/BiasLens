import React, { useMemo } from 'react';
import { AnalysisResult, BiasType, BiasInstance } from '@/types/analysis';

// Local taxonomy color mapping fallback
const BIAS_COLORS: Record<string, string> = {
  framing: '#3b82f6',
  loaded_language: '#f59e0b',
  appeal_to_emotion: '#f43f5e',
  false_dichotomy: '#f97316',
  ad_hominem: '#a855f7',
  appeal_to_authority: '#14b8a6',
  bandwagon: '#06b6d4',
  straw_man: '#6366f1',
  slippery_slope: '#ef4444',
  hasty_generalization: '#22c55e',
  cherry_picking: '#eab308',
  false_causation: '#ec4899',
  whataboutism: '#8b5cf6'
};

interface AnalysisViewProps {
  result: AnalysisResult;
  activeFilter: BiasType | null;
  onBiasClick: (bias: BiasInstance) => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ result, activeFilter, onBiasClick }) => {
  const renderTextWithHighlights = () => {
    if (!result.originalText || result.biases.length === 0) {
      return <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{result.originalText}</p>;
    }

    const segments = [];
    let currentIndex = 0;
    
    // Sort and filter biases
    const validBiases = result.biases
      .filter(b => b.startIndex !== undefined && b.endIndex !== undefined)
      .sort((a, b) => a.startIndex! - b.startIndex!);
      
    validBiases.forEach((bias, idx) => {
      const start = bias.startIndex!;
      const end = bias.endIndex!;
      
      // Handle overlap (skip if completely eclipsed, or adjust)
      if (start < currentIndex) return;
      
      // Add plain text before highlight
      if (start > currentIndex) {
        segments.push({
          type: 'text',
          text: result.originalText.substring(currentIndex, start),
          key: `text-${idx}`
        });
      }
      
      // Add highlight
      const isActive = !activeFilter || activeFilter === bias.type;
      segments.push({
        type: 'highlight',
        text: result.originalText.substring(start, end),
        bias,
        isActive,
        key: `highlight-${bias.id}`
      });
      
      currentIndex = end;
    });
    
    // Add remaining text
    if (currentIndex < result.originalText.length) {
      segments.push({
        type: 'text',
        text: result.originalText.substring(currentIndex),
        key: 'text-end'
      });
    }
    
    return (
      <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
        {segments.map(seg => {
          if (seg.type === 'text') return <span key={seg.key}>{seg.text}</span>;
          
          const biasColor = BIAS_COLORS[seg.bias!.type] || '#3b82f6';
          return (
            <mark
              key={seg.key}
              onClick={() => onBiasClick(seg.bias!)}
              className={`cursor-pointer transition-all px-0.5 rounded-sm ${seg.isActive ? 'opacity-100' : 'opacity-40 bg-transparent'}`}
              style={{ 
                backgroundColor: seg.isActive ? `${biasColor}33` : 'transparent',
                borderBottom: `2px solid ${biasColor}`,
                color: 'inherit'
              }}
              title={seg.bias!.type.replace(/_/g, ' ')}
            >
              {seg.text}
            </mark>
          );
        })}
      </div>
    );
  };

  const uniqueTypes = new Set(result.biases.map(b => b.type)).size;

  return (
    <div 
      className="rounded-xl border overflow-hidden transition-colors"
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      <div 
        className="px-3.5 py-2 border-b text-[10px] font-mono uppercase tracking-wider flex items-center justify-between" 
        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
      >
        <span>Annotated Source Text</span>
        <span>{result.biases.length} Findings · {uniqueTypes} Categories</span>
      </div>
      <div className="p-3.5 overflow-y-auto max-h-[45vh] scrollbar-thin">
        {renderTextWithHighlights()}
      </div>
    </div>
  );
};
