import React from 'react';

export const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 p-4 w-full h-full animate-pulse">
      <div className="flex flex-col items-center justify-center py-6">
        <div className="w-24 h-24 rounded-full border-4 border-dashed border-blue-500/30 animate-[spin_3s_linear_infinite]" />
        <p className="mt-6 text-sm font-medium animate-pulse" style={{ color: 'var(--text-secondary)' }}>
          Analyzing for cognitive biases...
        </p>
      </div>

      <div className="flex gap-4 mb-2">
        <div className="h-8 w-20 rounded-full bg-black/10 dark:bg-white/10" />
        <div className="h-8 w-24 rounded-full bg-black/10 dark:bg-white/10" />
        <div className="h-8 w-20 rounded-full bg-black/10 dark:bg-white/10" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="h-16 w-full rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10" />
        <div className="h-16 w-full rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10" />
        <div className="h-16 w-full rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10" />
      </div>
      
      <div className="mt-auto h-24 w-full rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10" />
    </div>
  );
};
