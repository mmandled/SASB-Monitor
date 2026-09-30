// src\components\DepartmentOverview.tsx
import React from "react";
import { Building2, CheckCircle2, ClipboardList, Clock3 } from "lucide-react";
import type { DepartmentStats } from "../types/index.js";

interface DepartmentOverviewProps {
  departments: DepartmentStats[];
  isLoading: boolean;
}

export const DepartmentOverview: React.FC<DepartmentOverviewProps> = ({
  departments,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-5 w-40 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-44 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (departments.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
          Department Overview
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {departments.map((department) => (
          <div
            key={department.department}
            className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs"
          >
            <div className="flex items-start justify-between gap-3 mb-5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Building2 size={17} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                    {department.department}
                  </h3>

                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {department.memberCount}{" "}
                    {department.memberCount === 1 ? "member" : "members"}
                  </p>
                </div>
              </div>

              <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                {department.completionRateFormatted}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                <div className="flex items-center gap-1 text-neutral-400 mb-1">
                  <ClipboardList size={11} />
                  <span className="text-[9px] uppercase font-bold">
                    Assigned
                  </span>
                </div>

                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {department.assigned}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 mb-1">
                  <CheckCircle2 size={11} />
                  <span className="text-[9px] uppercase font-bold">
                    Done
                  </span>
                </div>

                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {department.completed}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 mb-1">
                  <Clock3 size={11} />
                  <span className="text-[9px] uppercase font-bold">
                    Active
                  </span>
                </div>

                <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                  {department.active}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-[10px] mb-1.5">
                <span className="font-medium text-neutral-500 dark:text-neutral-400">
                  Completion
                </span>

                <span className="font-bold text-neutral-700 dark:text-neutral-300">
                  {department.completionRateFormatted}
                </span>
              </div>

              <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      Math.max(department.completionRate, 0),
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};