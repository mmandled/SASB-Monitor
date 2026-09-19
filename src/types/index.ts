// src\types\index.ts
export interface NormalizedMember {
  id: string;
  username: string;
  email?: string;
  profilePicture?: string | null;
  initials?: string;
  color?: string;
}

export interface NormalizedTask {
  id: string;
  name: string;
  status: string;
  statusType: string;
  isCompleted: boolean;
  assignees: NormalizedMember[];
  dueDate: string | null;
  priority: string | null;
  priorityColor?: string | null;
  url: string;
  listId: string;
  listName: string;
  folderName: string;
  month: string;
}

export interface MemberStats {
  memberId: string;
  memberName: string;
  email?: string;
  profilePicture?: string | null;
  initials?: string;
  color?: string;
  assigned: number;
  completed: number;
  active: number;
  completionRate: number;
  completionRateFormatted: string;
  tasks: NormalizedTask[];
}

export interface MonthStats {
  month: string;
  assigned: number;
  completed: number;
  active: number;
  completionRate: number;
  completionRateFormatted: string;
  uniqueTasksCount: number;
}

export interface DashboardSummary {
  totalMembers: number;
  totalAssigned: number;
  totalCompleted: number;
  totalActive: number;
  uniqueTasksCount: number;
  uniqueCompletedTasksCount: number;
  uniqueActiveTasksCount: number;
  overallCompletionRate: number;
  overallCompletionFormatted: string;
  lastSynced: string | null;
  isSyncing: boolean;
  months: string[];
  members: MemberStats[];
  monthlyStats: MonthStats[];
  statusBreakdown: { status: string; count: number; isCompleted: boolean }[];
}

export interface ClickUpConfigStatus {
  clickupConfigured: boolean;
  workspaceConfigured: boolean;
  spaceConfigured: boolean;
  projectConfigured: boolean;
  configuredTeamId?: string;
  configuredSpaceId?: string;
  configuredFolderId?: string;
  completedStatusList: string[];
  includeSubtasks: boolean;
  autoRefreshMinutes: number;
  discoveredInfo?: {
    teamName?: string;
    spaceName?: string;
    folderName?: string;
    listsFound?: { id: string; name: string; taskCount?: number }[];
  };
  lastSyncedAt?: string | null;
  error?: string | null;
}
