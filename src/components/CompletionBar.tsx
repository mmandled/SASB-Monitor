// src\components\CompletionBar.tsx
import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface CompletionBarProps {
  totalAssigned: number;
  totalCompleted: number;
  overallRate: number;
  rateFormatted: string;
}

export const CompletionBar: React.FC<CompletionBarProps> = ({
  totalAssigned,
  totalCompleted,
  overallRate,
  rateFormatted
}) => {
  const isAvailable = totalAssigned > 0;
  const clampedPercentage = Math.min(100, Math.max(0, overallRate));

  return (
    <div
      id="card-overall-completion"
      className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
            OVERALL COMPLETION
          </span>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {isAvailable
              ? `${totalCompleted.toLocaleString()} of ${totalAssigned.toLocaleString()} total task assignments completed`
              : 'No tasks currently assigned'}
          </p>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
            {rateFormatted}
          </span>
        </div>
      </div>

      <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-3 overflow-hidden p-0.5">
        <div
          className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${isAvailable ? clampedPercentage : 0}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-500 mt-2 font-mono">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
};
