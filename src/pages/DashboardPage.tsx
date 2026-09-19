// src\pages\DashboardPage.tsx
import React from "react";
import { SummaryCards } from "../components/SummaryCards.js";
import { CompletionBar } from "../components/CompletionBar.js";
import { FilterBar } from "../components/FilterBar.js";
import { MemberTable } from "../components/MemberTable.js";
import { MonthlyChart } from "../components/MonthlyChart.js";
import type { DashboardSummary, MemberStats } from "../types/index.js";

interface DashboardPageProps {
  summary: DashboardSummary | null;
  isLoading: boolean;
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
  selectedMemberId: string;
  setSelectedMemberId: (m: string) => void;
  selectedStatus: "all" | "completed" | "active";
  setSelectedStatus: (s: "all" | "completed" | "active") => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSelectMember: (member: MemberStats) => void;
  onResetFilters: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  summary,
  isLoading,
  selectedMonth,
  setSelectedMonth,
  selectedMemberId,
  setSelectedMemberId,
  selectedStatus,
  setSelectedStatus,
  searchQuery,
  setSearchQuery,
  onSelectMember,
  onResetFilters,
}) => {
  const activeMembers = (summary?.members || []).filter(
    (member) => member.assigned > 0,
  );

  return (
    <div className="space-y-6">
      <SummaryCards
        totalMembers={summary?.totalMembers || 0}
        totalAssigned={summary?.totalAssigned || 0}
        totalCompleted={summary?.totalCompleted || 0}
        totalActive={summary?.totalActive || 0}
        isLoading={isLoading}
      />

      <CompletionBar
        totalAssigned={summary?.totalAssigned || 0}
        totalCompleted={summary?.totalCompleted || 0}
        overallRate={summary?.overallCompletionRate || 0}
        rateFormatted={summary?.overallCompletionFormatted || "N/A"}
      />

      <FilterBar
        months={summary?.months || []}
        members={activeMembers}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedMemberId={selectedMemberId}
        setSelectedMemberId={setSelectedMemberId}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onReset={onResetFilters}
      />

      {summary && summary.monthlyStats.length > 0 && (
        <MonthlyChart
          monthlyStats={summary.monthlyStats}
          selectedMonth={selectedMonth}
          onSelectMonth={setSelectedMonth}
        />
      )}

      <MemberTable
        members={activeMembers}
        onSelectMember={onSelectMember}
        isLoading={isLoading}
      />
    </div>
  );
};
