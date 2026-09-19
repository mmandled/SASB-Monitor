// src\components\MemberTable.tsx
import React, { useState, useMemo } from "react";
import { ArrowUpDown, ChevronRight, User, ExternalLink } from "lucide-react";
import type { MemberStats } from "../types/index.js";
import { getAvatarBgColor } from "../lib/utils.js";

interface MemberTableProps {
  members: MemberStats[];
  onSelectMember: (member: MemberStats) => void;
  isLoading?: boolean;
}

type SortField =
  | "memberName"
  | "assigned"
  | "completed"
  | "active"
  | "completionRate";
type SortOrder = "asc" | "desc";

export const MemberTable: React.FC<MemberTableProps> = ({
  members,
  onSelectMember,
  isLoading = false,
}) => {
  const [sortField, setSortField] = useState<SortField>("memberName");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder(field === "memberName" ? "asc" : "desc");
    }
  };

  const sortedMembers = useMemo(() => {
    const list = [...members];
    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === "memberName") {
        comparison = a.memberName.localeCompare(b.memberName, undefined, {
          sensitivity: "base",
        });
      } else {
        comparison = a[sortField] - b[sortField];
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
    return list;
  }, [members, sortField, sortOrder]);

  if (isLoading) {
    return (
      <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 animate-pulse space-y-4">
        <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-800 rounded" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-12 bg-neutral-100 dark:bg-neutral-800/60 rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800">
        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          No members found matching the selected filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs overflow-hidden">
      <div className="p-4 sm:px-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100 uppercase">
            Member Statistics
          </h2>
        </div>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-100 dark:border-neutral-800 text-[11px] font-semibold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase bg-neutral-50/50 dark:bg-neutral-800/40">
              <th
                className="py-3 px-6 cursor-pointer hover:text-neutral-800 dark:hover:text-neutral-200"
                onClick={() => handleSort("memberName")}
              >
                <div className="flex items-center gap-1.5">
                  <span>MEMBER</span>
                  <ArrowUpDown
                    size={12}
                    className={
                      sortField === "memberName"
                        ? "text-emerald-600"
                        : "text-neutral-400"
                    }
                  />
                </div>
              </th>
              <th
                className="py-3 px-4 text-center cursor-pointer hover:text-neutral-800 dark:hover:text-neutral-200"
                onClick={() => handleSort("assigned")}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>ASSIGNED</span>
                  <ArrowUpDown
                    size={12}
                    className={
                      sortField === "assigned"
                        ? "text-emerald-600"
                        : "text-neutral-400"
                    }
                  />
                </div>
              </th>
              <th
                className="py-3 px-4 text-center cursor-pointer hover:text-neutral-800 dark:hover:text-neutral-200"
                onClick={() => handleSort("completed")}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>COMPLETED</span>
                  <ArrowUpDown
                    size={12}
                    className={
                      sortField === "completed"
                        ? "text-emerald-600"
                        : "text-neutral-400"
                    }
                  />
                </div>
              </th>
              <th
                className="py-3 px-4 text-center cursor-pointer hover:text-neutral-800 dark:hover:text-neutral-200"
                onClick={() => handleSort("active")}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>ACTIVE</span>
                  <ArrowUpDown
                    size={12}
                    className={
                      sortField === "active"
                        ? "text-emerald-600"
                        : "text-neutral-400"
                    }
                  />
                </div>
              </th>
              <th
                className="py-3 px-6 text-right cursor-pointer hover:text-neutral-800 dark:hover:text-neutral-200"
                onClick={() => handleSort("completionRate")}
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>COMPLETION RATE</span>
                  <ArrowUpDown
                    size={12}
                    className={
                      sortField === "completionRate"
                        ? "text-emerald-600"
                        : "text-neutral-400"
                    }
                  />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
            {sortedMembers.map((member) => {
              const hasTasks = member.assigned > 0;
              return (
                <tr
                  key={member.memberId}
                  id={`member-row-${member.memberId}`}
                  onClick={() => onSelectMember(member)}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800/60 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      {member.profilePicture ? (
                        <img
                          src={member.profilePicture}
                          alt={member.memberName}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div
                          className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarBgColor(
                            member.memberName,
                          )}`}
                        >
                          {member.initials ||
                            member.memberName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {member.memberName}
                        </p>
                        {member.email && (
                          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate">
                            {member.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center font-medium text-neutral-800 dark:text-neutral-200">
                    {member.assigned}
                  </td>

                  <td className="py-3.5 px-4 text-center font-semibold text-blue-600 dark:text-blue-400">
                    {member.completed}
                  </td>

                  <td className="py-3.5 px-4 text-center font-medium text-amber-700 dark:text-amber-400">
                    {member.active}
                  </td>

                  <td className="py-3.5 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {member.completionRateFormatted}
                      </span>
                      {hasTasks && (
                        <div className="w-12 bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-blue-600 dark:bg-blue-500 h-full rounded-full"
                            style={{
                              width: `${Math.min(100, Math.max(0, member.completionRate))}%`,
                            }}
                          />
                        </div>
                      )}
                      <ChevronRight
                        size={14}
                        className="text-neutral-400 group-hover:translate-x-0.5 transition-transform"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y divide-neutral-100 dark:divide-neutral-800">
        {sortedMembers.map((member) => (
          <div
            key={member.memberId}
            id={`member-card-${member.memberId}`}
            className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              {member.profilePicture ? (
                <img
                  src={member.profilePicture}
                  alt={member.memberName}
                  className="w-9 h-9 rounded-full object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className={`w-9 h-9 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarBgColor(
                    member.memberName,
                  )}`}
                >
                  {member.initials ||
                    member.memberName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 truncate">
                  {member.memberName}
                </h3>
                {member.email && (
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate">
                    {member.email}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 py-2 px-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg text-center mb-3">
              <div>
                <span className="block text-[10px] uppercase font-semibold text-neutral-400">
                  Assigned
                </span>
                <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                  {member.assigned}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-semibold text-neutral-400">
                  Done
                </span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {member.completed}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-semibold text-neutral-400">
                  Active
                </span>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                  {member.active}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-semibold text-neutral-400">
                  Rate
                </span>
                <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {member.completionRateFormatted}
                </span>
              </div>
            </div>

            <button
              onClick={() => onSelectMember(member)}
              className="w-full py-2 px-3 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span>View Tasks ({member.tasks.length})</span>
              <ChevronRight size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
