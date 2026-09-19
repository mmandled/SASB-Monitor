// src\pages\ReportsPage.tsx
import React, { useState } from "react";
import {
  Download,
  BarChart3,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
} from "lucide-react";
import type {
  MonthStats,
  MemberStats,
  NormalizedTask,
} from "../types/index.js";
import { exportToCSV } from "../lib/utils.js";

interface ReportsPageProps {
  monthlyStats: MonthStats[];
  members: MemberStats[];
  tasks: NormalizedTask[];
  isLoading: boolean;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  monthlyStats,
  members,
  tasks,
  isLoading,
}) => {
  const [selectedMonth, setSelectedMonth] = useState("all");

  const filteredMonthly =
    selectedMonth === "all"
      ? monthlyStats
      : monthlyStats.filter(
          (m) => m.month.toLowerCase() === selectedMonth.toLowerCase(),
        );

  const handleExportMembers = () => {
    const data = members.map((m) => ({
      "Member ID": m.memberId,
      "Member Name": m.memberName,
      Email: m.email || "",
      "Total Assigned": m.assigned,
      "Completed Tasks": m.completed,
      "Active Tasks": m.active,
      "Completion Rate": m.completionRateFormatted,
    }));
    exportToCSV(
      `SAS_Bulletin_Members_${new Date().toISOString().slice(0, 10)}`,
      data,
    );
  };

  const handleExportTasks = () => {
    const data = tasks.map((t) => ({
      "Task ID": t.id,
      "Task Name": t.name,
      "Month / List": t.listName || t.month,
      Status: t.status,
      "Is Completed": t.isCompleted ? "Yes" : "No",
      Assignees: t.assignees.map((a) => a.username).join("; "),
      "Due Date": t.dueDate || "",
      Priority: t.priority || "",
      "ClickUp URL": t.url,
    }));
    exportToCSV(
      `SAS_Bulletin_Tasks_${new Date().toISOString().slice(0, 10)}`,
      data,
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Analytics & Reports
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportMembers}
            disabled={members.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 shadow-xs transition-colors"
          >
            <FileSpreadsheet
              size={14}
              className="text-blue-600 dark:text-blue-400"
            />
            <span>Export Members (CSV)</span>
          </button>

          <button
            onClick={handleExportTasks}
            disabled={tasks.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 shadow-xs transition-colors"
          >
            <Download size={14} />
            <span>Export Tasks (CSV)</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold text-neutral-500 uppercase">
          View Report For:
        </label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="text-xs font-medium bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg px-3 py-1.5 focus:outline-hidden"
        >
          <option value="all">All Recorded Months</option>
          {monthlyStats.map((m) => (
            <option key={m.month} value={m.month}>
              {m.month}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMonthly.map((item) => (
          <div
            key={item.month}
            className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {item.month}
                </h3>
                <span className="text-[11px] text-neutral-400">
                  {item.uniqueTasksCount} unique tasks recorded
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                {item.completionRateFormatted} Rate
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40">
                <span className="block text-[10px] uppercase font-bold text-neutral-400">
                  Assignments
                </span>
                <span className="text-xl font-black text-neutral-900 dark:text-neutral-100">
                  {item.assigned}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30">
                <span className="block text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
                  Completed
                </span>
                <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                  {item.completed}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30">
                <span className="block text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">
                  Active
                </span>
                <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                  {item.active}
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                <span>Task Resolution</span>
                <span>{item.completionRateFormatted}</span>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(0, item.completionRate))}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
