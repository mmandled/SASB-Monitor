// src\components\Header.tsx
import React from "react";
import {
  RefreshCw,
  Menu,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
} from "lucide-react";
import { formatSyncTimestamp } from "../lib/utils.js";

interface HeaderProps {
  onRefresh: () => void;
  isSyncing: boolean;
  lastSynced: string | null;
  onOpenMobileMenu: () => void;
  syncError?: string | null;
  isDark?: boolean;
  toggleDarkMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  isSyncing,
  lastSynced,
  onOpenMobileMenu,
  syncError,
  isDark,
  toggleDarkMode,
}) => {
  return (
    <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-20 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            id="btn-open-mobile-menu"
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                SAS Bulletin{" "}
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  Task Monitor
                </span>
              </h1>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              ClickUp Task Analytics • AY 2026–2027
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            {isSyncing ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/40">
                <RefreshCw
                  size={12}
                  className="animate-spin text-blue-600 dark:text-blue-400"
                />
                <span className="font-medium">Syncing with ClickUp...</span>
              </span>
            ) : lastSynced ? (
              <div className="text-right hidden sm:block">
                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold justify-end">
                  <CheckCircle2 size={13} />
                  <span>Synced</span>
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Last synced: {formatSyncTimestamp(lastSynced)}
                </div>
              </div>
            ) : syncError ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 text-xs">
                <AlertCircle size={12} />
                <span>Sync issue</span>
              </span>
            ) : (
              <span className="text-neutral-400 text-xs">Awaiting sync</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {toggleDarkMode && (
              <button
                id="header-btn-toggle-theme"
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 transition-colors"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun size={15} className="text-amber-400" />
                ) : (
                  <Moon size={15} className="text-neutral-600" />
                )}
              </button>
            )}

            <button
              id="btn-refresh-data"
              onClick={onRefresh}
              disabled={isSyncing}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all duration-150 ${
                isSyncing
                  ? "bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 active:scale-[0.98]"
              }`}
              title="Retrieve fresh tasks from ClickUp"
            >
              <RefreshCw
                size={14}
                className={isSyncing ? "animate-spin" : ""}
              />
              <span>{isSyncing ? "Syncing..." : "Refresh Data"}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
