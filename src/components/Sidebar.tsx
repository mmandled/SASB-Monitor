// src\components\Sidebar.tsx
import React from "react";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  BarChart3,
  Moon,
  Sun,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import type { ClickUpConfigStatus } from "../types/index.js";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  configStatus: ClickUpConfigStatus | null;
  isDark: boolean;
  toggleDarkMode: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  configStatus,
  isDark,
  toggleDarkMode,
  isMobileOpen,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed,
}) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "members", label: "Members", icon: Users },
    { id: "tasks", label: "Monthly Tasks", icon: CheckSquare },
    { id: "reports", label: "Reports", icon: BarChart3 },
  ];

  const isConnected = configStatus?.clickupConfigured;

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transition-colors duration-200">
      <div>
        <div className="p-5 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-base tracking-tight shrink-0 shadow-sm">
              SB
            </div>
            {!isCollapsed && (
              <div className="flex flex-col leading-tight min-w-0">
                <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100 tracking-tight truncate">
                  SAS Bulletin
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate">
                  Task Monitor
                </span>
              </div>
            )}
          </div>

          <button
            id="btn-collapse-sidebar"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label="Toggle sidebar collapse"
          >
            {isCollapsed ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronLeft size={16} />
            )}
          </button>

          <button
            id="btn-close-mobile-menu"
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded-md text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Close mobile menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 font-semibold shadow-xs"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60"
                }`}
                title={item.label}
              >
                <Icon
                  size={18}
                  className={
                    isActive
                      ? "text-blue-600 dark:text-blue-400 shrink-0"
                      : "shrink-0"
                  }
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden md:block shrink-0 transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div
          className={`fixed top-0 bottom-0 left-0 z-30 transition-all duration-300 ${
            isCollapsed ? "w-20" : "w-64"
          }`}
        >
          {sidebarContent}
        </div>
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
