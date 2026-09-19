// src\pages\TasksPage.tsx
import React, { useState, useMemo } from "react";
import {
  Search,
  X,
  ExternalLink,
  CheckCircle2,
  Clock,
  Calendar,
  Tag,
  Filter,
} from "lucide-react";
import type { NormalizedTask, MemberStats } from "../types/index.js";
import { formatDate, getAvatarBgColor } from "../lib/utils.js";

interface TasksPageProps {
  tasks: NormalizedTask[];
  members: MemberStats[];
  months: string[];
  isLoading: boolean;
}

export const TasksPage: React.FC<TasksPageProps> = ({
  tasks,
  members,
  months,
  isLoading,
}) => {
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedMemberId, setSelectedMemberId] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "completed" | "active"
  >("all");

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (
        selectedMonth !== "all" &&
        task.month.toLowerCase() !== selectedMonth.toLowerCase()
      ) {
        return false;
      }
      if (
        selectedMemberId !== "all" &&
        !task.assignees.some((a) => a.id === selectedMemberId)
      ) {
        return false;
      }
      if (selectedStatus === "completed" && !task.isCompleted) {
        return false;
      }
      if (selectedStatus === "active" && task.isCompleted) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesName = task.name.toLowerCase().includes(q);
        const matchesList = task.listName.toLowerCase().includes(q);
        const matchesAssignee = task.assignees.some((a) =>
          a.username.toLowerCase().includes(q),
        );
        if (!matchesName && !matchesList && !matchesAssignee) return false;
      }
      return true;
    });
  }, [tasks, selectedMonth, selectedMemberId, selectedStatus, search]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Monthly Tasks
        </h2>
      </div>

      <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <div>
            <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full text-xs font-medium bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg px-3 py-2"
            >
              <option value="all">All Months</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
              Assignee
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full text-xs font-medium bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg px-3 py-2"
            >
              <option value="all">All Assignees ({members.length})</option>
              {members.map((m) => (
                <option key={m.memberId} value={m.memberId}>
                  {m.memberName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(
                  e.target.value as "all" | "completed" | "active",
                )
              }
              className="w-full text-xs font-medium bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg px-3 py-2"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="active">Active / Pending</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
              Search
            </label>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-7 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Showing {filteredTasks.length}{" "}
            {filteredTasks.length === 1 ? "task" : "tasks"}
          </span>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-12 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">
            No tasks found matching current filters.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 shrink-0">
                    {task.isCompleted ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                        <CheckCircle2 size={14} />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                        <Clock size={13} />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100 truncate text-sm">
                      {task.name}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
                      <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 font-medium text-neutral-700 dark:text-neutral-300">
                        {task.listName || task.month}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-md font-semibold ${
                          task.isCompleted
                            ? "bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                            : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                        }`}
                      >
                        {task.status}
                      </span>

                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          <span>{formatDate(task.dueDate)}</span>
                        </span>
                      )}

                      {task.priority && (
                        <span className="flex items-center gap-1 font-mono uppercase text-[10px]">
                          <Tag size={10} />
                          <span>{task.priority}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center -space-x-1.5 overflow-hidden">
                    {task.assignees.length === 0 ? (
                      <span className="text-[11px] text-neutral-400 italic">
                        No assignee
                      </span>
                    ) : (
                      task.assignees.map((a) => (
                        <div
                          key={a.id}
                          className={`w-6 h-6 rounded-full text-white flex items-center justify-center font-bold text-[10px] ring-2 ring-white dark:ring-neutral-900 ${getAvatarBgColor(
                            a.username,
                          )}`}
                          title={a.username}
                        >
                          {a.initials || a.username.slice(0, 2).toUpperCase()}
                        </div>
                      ))
                    )}
                  </div>

                  <a
                    href={task.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-blue-50 hover:text-blue-800 dark:hover:bg-blue-950/50 dark:hover:text-blue-300 transition-colors"
                  >
                    <span>ClickUp</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
