import { ClickUpClient } from "../clickup/clickupClient.js";
import {
  DiscoveryService,
  type DiscoveredTarget,
} from "../clickup/discoveryService.js";
import { TaskAnalytics } from "../analytics/taskAnalytics.js";
import type {
  NormalizedMember,
  NormalizedTask,
  MemberStats,
  DashboardSummary,
  ClickUpConfigStatus,
} from "../types/analytics.js";

export class CacheService {
  private client: ClickUpClient;
  private discovery: DiscoveryService;
  private analytics: TaskAnalytics;

  private rawTasks: NormalizedTask[] = [];
  private knownMembers: NormalizedMember[] = [];
  private discoveredHierarchy: DiscoveredTarget | null = null;
  private lastSynced: string | null = null;
  private isSyncing = false;
  private lastError: string | null = null;
  private autoRefreshTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.client = new ClickUpClient();
    this.discovery = new DiscoveryService(this.client);
    this.analytics = new TaskAnalytics();

    this.setupAutoRefresh();
  }

  private setupAutoRefresh(): void {
    const minutes = Number(process.env.AUTO_REFRESH_MINUTES) || 10;
    if (minutes > 0) {
      const ms = minutes * 60 * 1000;
      this.autoRefreshTimer = setInterval(() => {
        if (this.client.isConfigured() && !this.isSyncing) {
          console.log(
            `[CacheService] Auto-refreshing ClickUp data (${minutes}m interval)...`,
          );
          this.sync().catch((err) => {
            console.error(
              "[CacheService] Auto-refresh sync failed:",
              err.message,
            );
          });
        }
      }, ms);
    }
  }

  public isClientConfigured(): boolean {
    return this.client.isConfigured();
  }

  public getConfigStatus(): ClickUpConfigStatus {
    const configuredTeamId = process.env.CLICKUP_TEAM_ID?.trim();
    const configuredSpaceId = process.env.CLICKUP_SPACE_ID?.trim();
    const configuredFolderId = process.env.CLICKUP_PROJECT_FOLDER_ID?.trim();
    const completedStatuses = (
      process.env.COMPLETED_STATUS_NAMES || "complete,completed,done"
    )
      .split(",")
      .map((s) => s.trim().toLowerCase());
    const includeSubtasks = process.env.INCLUDE_SUBTASKS === "true";
    const autoRefreshMinutes = Number(process.env.AUTO_REFRESH_MINUTES) || 10;

    return {
      clickupConfigured: this.client.isConfigured(),
      workspaceConfigured: Boolean(
        configuredTeamId || this.discoveredHierarchy?.team,
      ),
      spaceConfigured: Boolean(
        configuredSpaceId || this.discoveredHierarchy?.space,
      ),
      projectConfigured: Boolean(
        configuredFolderId || this.discoveredHierarchy?.folder,
      ),
      configuredTeamId: configuredTeamId
        ? `${configuredTeamId.slice(0, 4)}***`
        : undefined,
      configuredSpaceId: configuredSpaceId
        ? `${configuredSpaceId.slice(0, 4)}***`
        : undefined,
      configuredFolderId: configuredFolderId
        ? `${configuredFolderId.slice(0, 4)}***`
        : undefined,
      completedStatusList: completedStatuses,
      includeSubtasks,
      autoRefreshMinutes,
      discoveredInfo: this.discoveredHierarchy
        ? {
            teamName: this.discoveredHierarchy.team.name,
            spaceName: this.discoveredHierarchy.space.name,
            folderName: this.discoveredHierarchy.folder.name,
            listsFound: this.discoveredHierarchy.lists.map((l) => ({
              id: l.id,
              name: l.name,
              taskCount: l.taskCount,
            })),
          }
        : undefined,
      lastSyncedAt: this.lastSynced,
      error: this.lastError,
    };
  }

  public async sync(): Promise<{
    success: boolean;
    taskCount: number;
    message: string;
  }> {
    if (!this.client.isConfigured()) {
      const msg =
        "ClickUp connection not configured. Please set CLICKUP_API_TOKEN in .env";
      this.lastError = msg;
      throw new Error(msg);
    }

    if (this.isSyncing) {
      return {
        success: true,
        taskCount: this.rawTasks.length,
        message: "Sync already in progress",
      };
    }

    this.isSyncing = true;
    this.lastError = null;

    try {
      console.log("[CacheService] Starting ClickUp hierarchy discovery...");
      const target = await this.discovery.discoverHierarchy();
      this.discoveredHierarchy = target;

      console.log(
        `[CacheService] Discovered Target -> Team: "${target.team.name}", Space: "${target.space.name}", Folder: "${target.folder.name}", Lists count: ${target.lists.length}`,
      );

      const includeSubtasks = process.env.INCLUDE_SUBTASKS === "true";
      const allFetchedTasks: NormalizedTask[] = [];
      const memberMap = new Map<string, NormalizedMember>();

      for (const list of target.lists) {
        console.log(
          `[CacheService] Fetching tasks from list "${list.name}" (ID: ${list.id})...`,
        );
        try {
          const rawClickUpTasks = await this.client.getTasksInList(list.id, {
            includeSubtasks,
            archived: false,
          });

          console.log(
            `[CacheService] Retrieved ${rawClickUpTasks.length} tasks from list "${list.name}".`,
          );

          for (const rawTask of rawClickUpTasks) {
            const normalized = this.analytics.normalizeTask(
              rawTask,
              list.month,
            );
            allFetchedTasks.push(normalized);

            for (const assignee of normalized.assignees) {
              if (!memberMap.has(assignee.id)) {
                memberMap.set(assignee.id, assignee);
              }
            }
          }
        } catch (err: any) {
          console.error(
            `[CacheService] Failed fetching list ${list.name} (${list.id}):`,
            err.message,
          );
        }
      }

      const deduplicated = this.analytics.deduplicateTasks(allFetchedTasks);
      this.rawTasks = deduplicated;
      this.knownMembers = Array.from(memberMap.values());
      this.lastSynced = new Date().toISOString();
      this.lastError = null;

      console.log(
        `[CacheService] Sync complete. Processed ${deduplicated.length} unique tasks and ${this.knownMembers.length} members.`,
      );

      return {
        success: true,
        taskCount: deduplicated.length,
        message: `Synced successfully — ${deduplicated.length} tasks updated.`,
      };
    } catch (err: any) {
      console.error("[CacheService] Sync encountered an error:", err.message);
      this.lastError = err.message || "Unable to sync ClickUp data";
      throw err;
    } finally {
      this.isSyncing = false;
    }
  }

  public getDashboard(
    filters: {
      month?: string;
      memberId?: string;
      status?: "all" | "completed" | "active";
      search?: string;
    } = {},
  ): DashboardSummary {
    return this.analytics.generateDashboardSummary(this.rawTasks, {
      lastSynced: this.lastSynced,
      isSyncing: this.isSyncing,
      allKnownMembers: this.knownMembers,
      filterMonth: filters.month,
      filterMemberId: filters.memberId,
      filterStatus: filters.status,
      search: filters.search,
    });
  }

  public getMembers(search?: string): MemberStats[] {
    const stats = this.analytics.calculateMemberStats(
      this.rawTasks,
      this.knownMembers,
    );
    if (!search || !search.trim()) return stats;

    const q = search.toLowerCase().trim();
    return stats.filter(
      (m) =>
        m.memberName.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q),
    );
  }

  public getMemberById(memberId: string): MemberStats | null {
    const stats = this.analytics.calculateMemberStats(
      this.rawTasks,
      this.knownMembers,
    );
    const found = stats.find((m) => m.memberId === memberId);
    return found || null;
  }

  public getTasks(
    filters: {
      month?: string;
      memberId?: string;
      status?: "all" | "completed" | "active";
      search?: string;
    } = {},
  ): NormalizedTask[] {
    let filtered = [...this.rawTasks];

    if (filters.month && filters.month !== "all") {
      filtered = filtered.filter(
        (t) => t.month.toLowerCase() === filters.month!.toLowerCase(),
      );
    }

    if (filters.memberId && filters.memberId !== "all") {
      filtered = filtered.filter((t) =>
        t.assignees.some((a) => a.id === filters.memberId),
      );
    }

    if (filters.status && filters.status !== "all") {
      if (filters.status === "completed") {
        filtered = filtered.filter((t) => t.isCompleted);
      } else if (filters.status === "active") {
        filtered = filtered.filter((t) => !t.isCompleted);
      }
    }

    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.listName.toLowerCase().includes(q) ||
          t.assignees.some((a) => a.username.toLowerCase().includes(q)),
      );
    }

    return filtered;
  }

  public getMonths(): string[] {
    return Array.from(
      new Set(this.rawTasks.map((t) => t.month).filter(Boolean)),
    );
  }

  public getLastSynced(): string | null {
    return this.lastSynced;
  }

  public getIsSyncing(): boolean {
    return this.isSyncing;
  }
}

export const cacheService = new CacheService();
