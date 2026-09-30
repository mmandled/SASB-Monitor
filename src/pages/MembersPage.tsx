// src/pages/MembersPage.tsx

import React, { useMemo, useState } from "react";
import { Building2, ChevronRight, Search, X } from "lucide-react";
import type { MemberStats } from "../types/index.js";
import { getAvatarBgColor } from "../lib/utils.js";

interface MembersPageProps {
  members: MemberStats[];
  onSelectMember: (member: MemberStats) => void;
  isLoading: boolean;
}

export const MembersPage: React.FC<MembersPageProps> = ({
  members,
  onSelectMember,
  isLoading,
}) => {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");

  const [sortBy, setSortBy] = useState<
    "name" | "assigned" | "completed" | "active" | "rate"
  >("name");

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Build the department filter options from the API data.
  const departments = useMemo(() => {
    return Array.from(
      new Set(
        members
          .map((member) => member.department)
          .filter((value): value is string => Boolean(value)),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [members]);

  const filteredMembers = useMemo(() => {
    let list = [...members];

    // Department filter
    if (department !== "all") {
      if (department === "unassigned") {
        list = list.filter((member) => !member.department);
      } else {
        list = list.filter(
          (member) => member.department === department,
        );
      }
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase().trim();

      list = list.filter(
        (member) =>
          member.memberName.toLowerCase().includes(q) ||
          member.email?.toLowerCase().includes(q) ||
          member.position?.toLowerCase().includes(q) ||
          member.department?.toLowerCase().includes(q),
      );
    }

    // Sorting
    list.sort((a, b) => {
      let diff = 0;

      if (sortBy === "name") {
        diff = a.memberName.localeCompare(b.memberName, undefined, {
          sensitivity: "base",
        });
      } else if (sortBy === "assigned") {
        diff = a.assigned - b.assigned;
      } else if (sortBy === "completed") {
        diff = a.completed - b.completed;
      } else if (sortBy === "active") {
        diff = a.active - b.active;
      } else if (sortBy === "rate") {
        diff = a.completionRate - b.completionRate;
      }

      return sortOrder === "asc" ? diff : -diff;
    });

    return list;
  }, [members, search, department, sortBy, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            SAS Bulletin Members
          </h2>

          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {filteredMembers.length} of {members.length} members
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Department */}
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
          >
            <option value="all">All Departments</option>

            {departments.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}

            <option value="unassigned">Position Not Assigned</option>
          </select>

          {/* Search */}
          <div className="relative sm:w-72">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />

            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-8 py-2 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 animate-pulse space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800" />

                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
                  <div className="h-2.5 w-20 bg-neutral-100 dark:bg-neutral-800/60 rounded" />
                </div>
              </div>

              <div className="h-10 bg-neutral-50 dark:bg-neutral-800/40 rounded-lg" />
            </div>
          ))}
        </div>
      ) : filteredMembers.length === 0 ? (
        /* Empty */
        <div className="p-12 text-center rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {search
              ? `No members found matching "${search}".`
              : department !== "all"
                ? "No members found in this department."
                : "No members found."}
          </p>
        </div>
      ) : (
        /* Members */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <div
              key={member.memberId}
              onClick={() => onSelectMember(member)}
              className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-blue-600/60 dark:hover:border-blue-500/60 transition-all duration-150 shadow-xs cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Member identity */}
                <div className="flex items-start gap-3 mb-3">
                  {member.profilePicture ? (
                    <img
                      src={member.profilePicture}
                      alt={member.memberName}
                      className="w-11 h-11 rounded-full object-cover shrink-0 ring-1 ring-neutral-200 dark:ring-neutral-700"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div
                      className={`w-11 h-11 rounded-full text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${getAvatarBgColor(
                        member.memberName,
                      )}`}
                    >
                      {member.initials ||
                        member.memberName.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {member.memberName}
                    </h3>

                    <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate">
                      {member.email || "SAS Bulletin"}
                    </p>

                    {/* Position */}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {member.position ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                          {member.position}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">
                          Position not assigned
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Department */}
                {member.department && (
                  <div className="flex items-center gap-1.5 mb-3 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                    <Building2 size={12} />
                    <span>{member.department}</span>
                  </div>
                )}

                {/* Workload */}
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg text-center mb-4 text-xs">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-neutral-400">
                      Assigned
                    </span>

                    <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {member.assigned}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] uppercase font-bold text-blue-600/80">
                      Done
                    </span>

                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {member.completed}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] uppercase font-bold text-amber-600/80">
                      Active
                    </span>

                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                      {member.active}
                    </span>
                  </div>
                </div>
              </div>

              {/* Completion */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                <span className="text-neutral-500 dark:text-neutral-400 font-medium">
                  Completion Rate:
                </span>

                <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-neutral-100">
                  <span>{member.completionRateFormatted}</span>

                  <ChevronRight
                    size={14}
                    className="text-neutral-400 group-hover:translate-x-0.5 transition-transform"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};