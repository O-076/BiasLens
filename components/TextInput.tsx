import React from 'react';
import * as Icons from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface Example {
  title: string;
  icon: string;
  text: string;
}

interface TextInputProps {
  value: string;
  onChange: (text: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  examples: Example[];
}

export const TextInput: React.FC<TextInputProps> = ({ value, onChange, onAnalyze, isLoading, examples }) => {
  const maxLength = 15000;
  const isNearLimit = value.length > maxLength * 0.9;
  const isOverLimit = value.length > maxLength;

  const renderIcon = (iconName: string) => {
    // Basic mapping for safety, normally we'd dynamic import or map
    const IconComponent = (Icons as any)[iconName] || Icons.FileText;
    return <IconComponent size={14} className="mr-1" />;
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste any text to analyze for bias..."
          className="w-full h-40 p-3 text-sm rounded-xl border focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none transition-all"
          style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            borderColor: isOverLimit ? 'rgb(239 68 68)' : 'var(--border)',
            color: 'var(--text-primary)'
          }}
        />
        <div className={`absolute bottom-2 right-2 text-[10px] ${isOverLimit ? 'text-red-500 font-bold' : isNearLimit ? 'text-amber-500' : 'opacity-50'}`} style={{ color: !isOverLimit && !isNearLimit ? 'var(--text-secondary)' : undefined }}>
          {value.length} / {maxLength}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {examples.map((ex, idx) => (
          <button
            key={idx}
            onClick={() => onChange(ex.text)}
            className="flex items-center whitespace-nowrap px-2.5 py-1.5 text-xs rounded-lg border hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            {renderIcon(ex.icon)}
            {ex.title}
          </button>
        ))}
      </div>

      <button
        onClick={onAnalyze}
        disabled={isLoading || value.trim().length === 0 || isOverLimit}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-white shadow-md bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
        {isLoading ? 'Analyzing...' : 'Analyze Text'}
      </button>
    </div>
  );
};
