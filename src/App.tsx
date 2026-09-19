// src\App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar.js';
import { Header } from './components/Header.js';
import { MemberDetailModal } from './components/MemberDetailModal.js';
import { SetupScreen } from './components/SetupScreen.js';
import { Toast, type ToastMessage } from './components/Toast.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { MembersPage } from './pages/MembersPage.js';
import { TasksPage } from './pages/TasksPage.js';
import { ReportsPage } from './pages/ReportsPage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import {
  fetchDashboard,
  fetchMembers,
  fetchTasks,
  fetchMonths,
  fetchConfigStatus,
  triggerSync
} from './lib/api.js';
import type {
  DashboardSummary,
  MemberStats,
  NormalizedTask,
  ClickUpConfigStatus
} from './types/index.js';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [configStatus, setConfigStatus] = useState<ClickUpConfigStatus | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [tasks, setTasks] = useState<NormalizedTask[]>([]);
  const [members, setMembers] = useState<MemberStats[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [selectedMemberForModal, setSelectedMemberForModal] = useState<MemberStats | null>(null);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedMemberId, setSelectedMemberId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'completed' | 'active'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // UI state
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('sasb_theme') === 'dark';
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Dark mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sasb_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sasb_theme', 'light');
    }
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark((prev) => !prev);
  };

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({
      id: String(Date.now()),
      type,
      message
    });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Load config & data
  const loadData = useCallback(async (filtersChanged = false) => {
    if (!filtersChanged) setIsLoading(true);
    try {
      const config = await fetchConfigStatus();
      setConfigStatus(config);

      const dashData = await fetchDashboard({
        month: selectedMonth,
        memberId: selectedMemberId,
        status: selectedStatus,
        search: searchQuery
      });
      setSummary(dashData);

      const taskList = await fetchTasks({
        month: selectedMonth,
        memberId: selectedMemberId,
        status: selectedStatus,
        search: searchQuery
      });
      setTasks(taskList);

      const [memberList, monthList] = await Promise.all([
        fetchMembers(),
        fetchMonths()
      ]);
      setMembers(memberList);
      setMonths(monthList);
    } catch (err: any) {
      console.error('[App] Failed loading data:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedMemberId, selectedStatus, searchQuery]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const result = await triggerSync();
      showToast('success', result.message || 'Data synced successfully with ClickUp.');
      await loadData();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to sync with ClickUp.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedMonth('all');
    setSelectedMemberId('all');
    setSelectedStatus('all');
    setSearchQuery('');
  };

  const isClickUpConfigured = configStatus?.clickupConfigured;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex transition-colors duration-200">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        configStatus={configStatus}
        isDark={isDark}
        toggleDarkMode={toggleDarkMode}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onRefresh={handleRefresh}
          isSyncing={isSyncing}
          lastSynced={summary?.lastSynced || configStatus?.lastSyncedAt || null}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          syncError={configStatus?.error}
          isDark={isDark}
          toggleDarkMode={toggleDarkMode}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {!isClickUpConfigured && activeTab !== 'settings' ? (
            <SetupScreen
              configStatus={configStatus}
              onRetry={handleRefresh}
              isChecking={isSyncing}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardPage
                  summary={summary}
                  isLoading={isLoading}
                  selectedMonth={selectedMonth}
                  setSelectedMonth={setSelectedMonth}
                  selectedMemberId={selectedMemberId}
                  setSelectedMemberId={setSelectedMemberId}
                  selectedStatus={selectedStatus}
                  setSelectedStatus={setSelectedStatus}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onSelectMember={setSelectedMemberForModal}
                  onResetFilters={handleResetFilters}
                />
              )}

              {activeTab === 'members' && (
                <MembersPage
                  members={members}
                  onSelectMember={setSelectedMemberForModal}
                  isLoading={isLoading}
                />
              )}

              {activeTab === 'tasks' && (
                <TasksPage
                  tasks={tasks}
                  members={members}
                  months={months}
                  isLoading={isLoading}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsPage
                  monthlyStats={summary?.monthlyStats || []}
                  members={members}
                  tasks={tasks}
                  isLoading={isLoading}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsPage
                  configStatus={configStatus}
                  onRefresh={handleRefresh}
                  isSyncing={isSyncing}
                />
              )}
            </>
          )}
        </main>
      </div>

      <MemberDetailModal
        member={selectedMemberForModal}
        onClose={() => setSelectedMemberForModal(null)}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default App;
