// src\pages\SettingsPage.tsx
import React from "react";
import {
  Settings as SettingsIcon,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FolderTree,
  RefreshCw,
  Info,
  List,
  ExternalLink,
} from "lucide-react";
import type { ClickUpConfigStatus } from "../types/index.js";
import { formatSyncTimestamp } from "../lib/utils.js";

interface SettingsPageProps {
  configStatus: ClickUpConfigStatus | null;
  onRefresh: () => void;
  isSyncing: boolean;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  configStatus,
  onRefresh,
  isSyncing,
}) => {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Settings
        </h2>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                configStatus?.clickupConfigured
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400"
                  : "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
              }`}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                ClickUp Connection
              </h3>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 transition-colors"
          >
            <RefreshCw size={13} className={isSyncing ? "animate-spin" : ""} />
            <span>{isSyncing ? "Syncing..." : "Sync"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/40">
            <span className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
              Target Workspace
            </span>
            <span className="font-bold text-neutral-900 dark:text-neutral-100 truncate block">
              {configStatus?.discoveredInfo?.teamName ||
                "SAS Bulletin (Auto-discover)"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/40">
            <span className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
              Target Space
            </span>
            <span className="font-bold text-neutral-900 dark:text-neutral-100 truncate block">
              {configStatus?.discoveredInfo?.spaceName ||
                "SASB 26–27 (Auto-discover)"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/40">
            <span className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
              Project Folder
            </span>
            <span className="font-bold text-neutral-900 dark:text-neutral-100 truncate block">
              {configStatus?.discoveredInfo?.folderName ||
                "Project (Auto-discover)"}
            </span>
          </div>
        </div>

        {configStatus?.discoveredInfo?.listsFound &&
          configStatus.discoveredInfo.listsFound.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2 flex items-center gap-1.5">
                <FolderTree size={14} />
                <span>
                  Discovered Monthly Lists (
                  {configStatus.discoveredInfo.listsFound.length})
                </span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {configStatus.discoveredInfo.listsFound.map((l) => (
                  <span
                    key={l.id}
                    className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5"
                  >
                    <List size={12} className="text-blue-600" />
                    <span>{l.name}</span>
                    {l.taskCount !== undefined && (
                      <span className="text-[10px] bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.2 rounded-full font-mono">
                        {l.taskCount}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
          Task Logic Rules
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40">
            <div>
              <p className="font-bold text-neutral-900 dark:text-neutral-100">
                Multiple Assignee Distribution
              </p>
              <p className="text-neutral-500 text-[11px]">
                Every assigned member receives one task count (+1 assigned, +1
                done/active)
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 font-bold">
              Enforced
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40">
            <div>
              <p className="font-bold text-neutral-900 dark:text-neutral-100">
                Configured Completed Status Names
              </p>
              <p className="text-neutral-500 text-[11px]">
                Tasks matching these names or ClickUp closed status type are
                counted as completed
              </p>
            </div>
            <div className="flex items-center gap-1">
              {(
                configStatus?.completedStatusList || [
                  "complete",
                  "completed",
                  "done",
                ]
              ).map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 font-mono text-[11px]"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
