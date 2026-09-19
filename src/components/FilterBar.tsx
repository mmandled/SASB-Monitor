import React from 'react';
import { Search, X, Filter, RotateCcw } from 'lucide-react';
import type { MemberStats } from '../types/index.js';

interface FilterBarProps {
  months: string[];
  members: MemberStats[];
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
  selectedMemberId: string;
  setSelectedMemberId: (m: string) => void;
  selectedStatus: 'all' | 'completed' | 'active';
  setSelectedStatus: (s: 'all' | 'completed' | 'active') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onReset?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  months,
  members,
  selectedMonth,
  setSelectedMonth,
  selectedMemberId,
  setSelectedMemberId,
  selectedStatus,
  setSelectedStatus,
  searchQuery,
  setSearchQuery,
  onReset
}) => {
  const hasActiveFilters =
    selectedMonth !== 'all' ||
    selectedMemberId !== 'all' ||
    selectedStatus !== 'all' ||
    searchQuery.trim().length > 0;

  return (
    <div
      id="section-filters"
      className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs"
    >
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1">
          <div>
            <label htmlFor="filter-month" className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
              MONTH
            </label>
            <select
              id="filter-month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full text-xs font-medium bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
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
            <label htmlFor="filter-member" className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
              MEMBER
            </label>
            <select
              id="filter-member"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full text-xs font-medium bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="all">All Members ({members.length})</option>
              {members.map((mem) => (
                <option key={mem.memberId} value={mem.memberId}>
                  {mem.memberName} ({mem.assigned})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-status" className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
              STATUS
            </label>
            <select
              id="filter-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'completed' | 'active')}
              className="w-full text-xs font-medium bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed Only</option>
              <option value="active">Active / Pending</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1 lg:pt-4">
          <div className="relative flex-1 lg:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              id="input-search"
              type="text"
              placeholder="Search member or task..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-8 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-hidden placeholder:text-neutral-400"
            />
            {searchQuery && (
              <button
                id="btn-clear-search"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <button
              id="btn-reset-filters"
              onClick={onReset}
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 rounded-lg transition-colors shrink-0"
              title="Reset all filters"
            >
              <RotateCcw size={12} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
