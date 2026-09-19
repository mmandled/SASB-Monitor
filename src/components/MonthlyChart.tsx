// src\components\MonthlyChart.tsx
import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import type { MonthStats } from "../types/index.js";

interface MonthlyChartProps {
  monthlyStats: MonthStats[];
  onSelectMonth?: (month: string) => void;
  selectedMonth?: string;
}

export const MonthlyChart: React.FC<MonthlyChartProps> = ({
  monthlyStats,
  onSelectMonth,
  selectedMonth,
}) => {
  if (!monthlyStats || monthlyStats.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-center text-xs text-neutral-500">
        No monthly statistics available.
      </div>
    );
  }

  const chartData = monthlyStats.map((item) => ({
    name: item.month,
    Assigned: item.assigned,
    Completed: item.completed,
    Active: item.active,
    rate: item.completionRateFormatted,
  }));

  return (
    <div
      id="section-monthly-overview"
      className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
        <div>
          <h2 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100 uppercase">
            Monthly Overview
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-neutral-400 dark:bg-neutral-500 inline-block" />
            <span className="text-neutral-600 dark:text-neutral-400 font-medium">
              Assigned
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 dark:bg-blue-500 inline-block" />
            <span className="text-neutral-600 dark:text-neutral-400 font-medium">
              Completed
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-6">
        {monthlyStats.map((m) => {
          const isSelected = selectedMonth === m.month;
          return (
            <div
              key={m.month}
              onClick={() =>
                onSelectMonth && onSelectMonth(isSelected ? "all" : m.month)
              }
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500"
                  : "border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-800/30 hover:border-neutral-300 dark:hover:border-neutral-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                  {m.month}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1 text-center text-xs">
                <div className="p-1.5 bg-white dark:bg-neutral-800/70 rounded-md">
                  <span className="block text-[9px] uppercase font-bold text-neutral-400">
                    Assigned
                  </span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">
                    {m.assigned}
                  </span>
                </div>
                <div className="p-1.5 bg-white dark:bg-neutral-800/70 rounded-md">
                  <span className="block text-[9px] uppercase font-bold text-blue-600/80">
                    Done
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {m.completed}
                  </span>
                </div>
                <div className="p-1.5 bg-white dark:bg-neutral-800/70 rounded-md">
                  <span className="block text-[9px] uppercase font-bold text-amber-600/80">
                    Active
                  </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {m.active}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#88888820"
            />
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg text-xs space-y-1">
                      <p className="font-bold text-neutral-900 dark:text-neutral-100">
                        {label}
                      </p>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        Assigned: {data.Assigned}
                      </p>
                      <p className="text-blue-600 dark:text-blue-400">
                        Completed: {data.Completed}
                      </p>
                      <p className="text-amber-600 dark:text-amber-400">
                        Active: {data.Active}
                      </p>
                      <p className="text-neutral-500 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                        Completion: {data.rate}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="Assigned"
              fill="#94a3b8"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="Completed"
              fill="#2563eb"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
