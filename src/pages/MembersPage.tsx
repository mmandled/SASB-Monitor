// src\pages\MembersPage.tsx
import React, { useState, useMemo } from "react";
import { Search, X, User, ArrowUpDown, ChevronRight } from "lucide-react";
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
  const [sortBy, setSortBy] = useState<
    "name" | "assigned" | "completed" | "active" | "rate"
  >("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filteredMembers = useMemo(() => {
    let list = [...members];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.memberName.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q),
      );
    }

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
  }, [members, search, sortBy, sortOrder]);

  const toggleSort = (
    field: "name" | "assigned" | "completed" | "active" | "rate",
  ) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder(field === "name" ? "asc" : "desc");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            SAS Bulletin Members
          </h2>
        </div>

        <div className="relative sm:w-72">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            placeholder="Search member name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-8 py-2 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

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
        <div className="p-12 text-center rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            No members found matching &quot;{search}&quot;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <div
              key={member.memberId}
              onClick={() => onSelectMember(member)}
              className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-blue-600/60 dark:hover:border-blue-500/60 transition-all duration-150 shadow-xs cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
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
                  </div>
                </div>

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
