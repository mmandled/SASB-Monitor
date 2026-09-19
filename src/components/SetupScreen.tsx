// src\components\SetupScreen.tsx
import React, { useState } from "react";
import {
  Key,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  HelpCircle,
  Terminal,
} from "lucide-react";
import type { ClickUpConfigStatus } from "../types/index.js";

interface SetupScreenProps {
  configStatus: ClickUpConfigStatus | null;
  onRetry: () => void;
  isChecking: boolean;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  configStatus,
  onRetry,
  isChecking,
}) => {
  const [copied, setCopied] = useState(false);

  const envSnippet = `#
CLICKUP_API_TOKEN=

# CLICKUP_TEAM_ID=
# CLICKUP_SPACE_ID=

INCLUDE_SUBTASKS=false
AUTO_REFRESH_MINUTES=10
COMPLETED_STATUS_NAMES=complete,completed,done`;

  const copyEnvSnippet = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 bg-neutral-50 dark:bg-neutral-800/40 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100">
                ClickUp Connection Not Configured
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                The SAS Bulletin Task Monitor is ready, but requires a
                server-side ClickUp Personal API Token.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
              Configuration Status
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60">
                <span className="font-mono text-neutral-700 dark:text-neutral-300">
                  CLICKUP_API_TOKEN
                </span>
                {configStatus?.clickupConfigured ? (
                  <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">
                    <CheckCircle2 size={14} /> Configured
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                    <AlertTriangle size={14} /> Missing in .env
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60">
                <span className="font-mono text-neutral-700 dark:text-neutral-300">
                  CLICKUP_TEAM_ID (Workspace)
                </span>
                <span className="text-neutral-500">
                  {configStatus?.configuredTeamId
                    ? "Set (Override)"
                    : 'Auto-discovery ("SAS Bulletin")'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60">
                <span className="font-mono text-neutral-700 dark:text-neutral-300">
                  CLICKUP_SPACE_ID
                </span>
                <span className="text-neutral-500">
                  {configStatus?.configuredSpaceId
                    ? "Set (Override)"
                    : 'Auto-discovery ("SASB 26–27")'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60">
                <span className="font-mono text-neutral-700 dark:text-neutral-300">
                  CLICKUP_PROJECT_FOLDER_ID
                </span>
                <span className="text-neutral-500">
                  {configStatus?.configuredFolderId
                    ? "Set (Override)"
                    : 'Auto-discovery ("Project")'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
              Where to place your ClickUp Token
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 leading-relaxed">
              To keep your credentials 100% secure, your token is never exposed
              to the browser. Place it in the root{" "}
              <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-blue-600 dark:text-blue-400">
                .env
              </code>{" "}
              file on the server:
            </p>

            <div className="relative">
              <pre className="p-4 rounded-xl bg-neutral-900 text-neutral-200 text-xs font-mono overflow-x-auto border border-neutral-800 leading-relaxed">
                {envSnippet}
              </pre>
              <button
                onClick={copyEnvSnippet}
                className="absolute top-3 right-3 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-medium transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
              How to obtain your ClickUp Personal Token
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
              <li>Log in to ClickUp on your desktop or browser.</li>
              <li>
                Click your avatar at the bottom-left / top-right and open{" "}
                <strong>Settings</strong>.
              </li>
              <li>
                Under the <strong>Apps</strong> section in the sidebar, click{" "}
                <strong>ClickUp API</strong>.
              </li>
              <li>
                Click <strong>Generate</strong> under{" "}
                <em>Personal API Token</em>.
              </li>
              <li>
                Paste the token into{" "}
                <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono">
                  CLICKUP_API_TOKEN
                </code>{" "}
                in your server{" "}
                <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono">
                  .env
                </code>{" "}
                file.
              </li>
            </ol>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <a
              href="https://app.clickup.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>Open ClickUp</span>
              <ExternalLink size={12} />
            </a>

            <button
              onClick={onRetry}
              disabled={isChecking}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors shadow-xs"
            >
              <RefreshCw
                size={13}
                className={isChecking ? "animate-spin" : ""}
              />
              <span>
                {isChecking
                  ? "Checking Connection..."
                  : "Check Connection & Sync"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
