import React from 'react';

export const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 animate-pulse select-none">
      {/* Calibration Skeleton */}
      <div 
        className="p-4 rounded-xl border flex flex-col gap-3"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-5 w-28 rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="h-8 w-16 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Stats Skeleton */}
      <div 
        className="grid grid-cols-3 divide-x rounded-xl border text-center"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', divideColor: 'var(--border)' }}
      >
        <div className="p-3 flex flex-col items-center gap-1.5">
          <div className="h-2 w-10 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-5 w-6 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="p-3 flex flex-col items-center gap-1.5">
          <div className="h-2 w-10 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-5 w-14 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="p-3 flex flex-col items-center gap-1.5">
          <div className="h-2 w-10 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-5 w-12 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>

      {/* Row Skeletons */}
      <div className="flex flex-col gap-2">
        <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-800 mb-1" />
        <div className="h-12 w-full rounded-xl border bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
        <div className="h-12 w-full rounded-xl border bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
        <div className="h-12 w-full rounded-xl border bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
      </div>

      <div className="flex items-center justify-center gap-2 py-3 text-xs font-mono opacity-60 text-slate-500">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
        <span>Synthesizing cognitive & rhetorical markers...</span>
      </div>
    </div>
  );
};
