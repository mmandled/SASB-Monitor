import type { ClickUpTask, ClickUpUser } from '../types/clickup.js';
import type {
  NormalizedMember,
  NormalizedTask,
  MemberStats,
  MonthStats,
  DashboardSummary
} from '../types/analytics.js';

export interface AnalyticsConfig {
  completedStatusNames?: string[];
  includeSubtasks?: boolean;
}

export class TaskAnalytics {
  private completedStatusNames: Set<string>;

  constructor(config?: AnalyticsConfig) {
    const defaultStatuses = ['complete', 'completed', 'done', 'published'];
    const envStatuses = process.env.COMPLETED_STATUS_NAMES
      ? process.env.COMPLETED_STATUS_NAMES.split(',').map((s) => s.trim().toLowerCase())
      : defaultStatuses;

    const finalStatuses = (config?.completedStatusNames || envStatuses).map((s) => s.trim().toLowerCase());
    this.completedStatusNames = new Set(finalStatuses);
  }

  public isTaskCompleted(task: { status?: { status?: string; type?: string } }): boolean {
    if (!task || !task.status) return false;

    const rawStatus = (task.status.status || '').trim().toLowerCase();
    const rawType = (task.status.type || '').trim().toLowerCase();

    if (this.completedStatusNames.has(rawStatus)) {
      return true;
    }

    if (rawType === 'closed') {
      return true;
    }

    return false;
  }

  public normalizeTask(task: ClickUpTask, derivedMonth?: string): NormalizedTask {
    const isCompleted = this.isTaskCompleted(task);
    const assignees: NormalizedMember[] = (task.assignees || []).map((u) => ({
      id: String(u.id),
      username: u.username || 'Unnamed Member',
      email: u.email,
      profilePicture: u.profilePicture || null,
      initials: u.initials || u.username?.slice(0, 2).toUpperCase() || 'SB',
      color: u.color
    }));

    let dueDateFormatted: string | null = null;
    if (task.due_date) {
      try {
        const ms = Number(task.due_date);
        if (!isNaN(ms) && ms > 0) {
          dueDateFormatted = new Date(ms).toISOString();
        } else {
          dueDateFormatted = new Date(task.due_date).toISOString();
        }
      } catch {
        dueDateFormatted = null;
      }
    }

    const month = derivedMonth || task.list?.name || 'Unspecified';

    return {
      id: String(task.id),
      name: task.name || 'Untitled Task',
      status: task.status?.status || 'Open',
      statusType: task.status?.type || 'open',
      isCompleted,
      assignees,
      dueDate: dueDateFormatted,
      priority: task.priority?.priority || null,
      priorityColor: task.priority?.color || null,
      url: task.url || `https://app.clickup.com/t/${task.id}`,
      listId: task.list ? String(task.list.id) : '',
      listName: task.list?.name || '',
      folderName: task.folder?.name || '',
      month
    };
  }

  public deduplicateTasks(tasks: NormalizedTask[]): NormalizedTask[] {
    const seen = new Set<string>();
    const deduplicated: NormalizedTask[] = [];

    for (const task of tasks) {
      if (!seen.has(task.id)) {
        seen.add(task.id);
        deduplicated.push(task);
      }
    }

    return deduplicated;
  }

  public calculateMemberStats(tasks: NormalizedTask[], allKnownMembers: NormalizedMember[] = []): MemberStats[] {
    const memberMap = new Map<string, {
      member: NormalizedMember;
      assigned: number;
      completed: number;
      active: number;
      tasks: NormalizedTask[];
    }>();

    for (const member of allKnownMembers) {
      if (!memberMap.has(member.id)) {
        memberMap.set(member.id, {
          member,
          assigned: 0,
          completed: 0,
          active: 0,
          tasks: []
        });
      }
    }

    for (const task of tasks) {
      if (!task.assignees || task.assignees.length === 0) {
        continue;
      }

      for (const assignee of task.assignees) {
        if (!memberMap.has(assignee.id)) {
          memberMap.set(assignee.id, {
            member: assignee,
            assigned: 0,
            completed: 0,
            active: 0,
            tasks: []
          });
        }

        const stats = memberMap.get(assignee.id)!;
        stats.assigned += 1;
        if (task.isCompleted) {
          stats.completed += 1;
        } else {
          stats.active += 1;
        }
        stats.tasks.push(task);
      }
    }

    const result: MemberStats[] = Array.from(memberMap.values()).map(({ member, assigned, completed, active, tasks: memberTasks }) => {
      let completionRate = 0;
      let completionRateFormatted = 'N/A';

      if (assigned > 0) {
        completionRate = Math.round((completed / assigned) * 1000) / 10; // 1 decimal place
        completionRateFormatted = `${completionRate.toFixed(completionRate % 1 === 0 ? 0 : 1)}%`;
      }

      return {
        memberId: member.id,
        memberName: member.username,
        email: member.email,
        profilePicture: member.profilePicture,
        initials: member.initials,
        color: member.color,
        assigned,
        completed,
        active,
        completionRate,
        completionRateFormatted,
        tasks: memberTasks
      };
    });

    result.sort((a, b) => a.memberName.localeCompare(b.memberName, undefined, { sensitivity: 'base' }));

    return result;
  }

  public calculateMonthlyStats(tasks: NormalizedTask[]): MonthStats[] {
    const monthMap = new Map<string, {
      assigned: number;
      completed: number;
      active: number;
      uniqueTaskIds: Set<string>;
    }>();

    for (const task of tasks) {
      const month = task.month || 'Other';
      if (!monthMap.has(month)) {
        monthMap.set(month, {
          assigned: 0,
          completed: 0,
          active: 0,
          uniqueTaskIds: new Set()
        });
      }

      const m = monthMap.get(month)!;
      m.uniqueTaskIds.add(task.id);

      const assigneeCount = Math.max(task.assignees.length, 1);
      m.assigned += assigneeCount;
      if (task.isCompleted) {
        m.completed += assigneeCount;
      } else {
        m.active += assigneeCount;
      }
    }

    const result: MonthStats[] = Array.from(monthMap.entries()).map(([month, data]) => {
      let completionRate = 0;
      let completionRateFormatted = 'N/A';
      if (data.assigned > 0) {
        completionRate = Math.round((data.completed / data.assigned) * 1000) / 10;
        completionRateFormatted = `${completionRate.toFixed(completionRate % 1 === 0 ? 0 : 1)}%`;
      }

      return {
        month,
        assigned: data.assigned,
        completed: data.completed,
        active: data.active,
        completionRate,
        completionRateFormatted,
        uniqueTasksCount: data.uniqueTaskIds.size
      };
    });

    const monthOrder: Record<string, number> = {
      'august': 1, 'september': 2, 'october': 3, 'november': 4, 'december': 5,
      'january': 6, 'february': 7, 'march': 8, 'april': 9, 'may': 10, 'june': 11, 'july': 12
    };

    result.sort((a, b) => {
      const aLower = a.month.toLowerCase().split(' ')[0];
      const bLower = b.month.toLowerCase().split(' ')[0];
      const aOrder = monthOrder[aLower] || 99;
      const bOrder = monthOrder[bLower] || 99;
      return aOrder - bOrder;
    });

    return result;
  }

  public generateDashboardSummary(
    tasks: NormalizedTask[],
    options: {
      lastSynced?: string | null;
      isSyncing?: boolean;
      allKnownMembers?: NormalizedMember[];
      filterMonth?: string;
      filterMemberId?: string;
      filterStatus?: 'all' | 'completed' | 'active';
      search?: string;
    } = {}
  ): DashboardSummary {
    const deduplicated = this.deduplicateTasks(tasks);

    let filtered = deduplicated;

    if (options.filterMonth && options.filterMonth !== 'all') {
      filtered = filtered.filter((t) => t.month.toLowerCase() === options.filterMonth!.toLowerCase());
    }

    if (options.filterMemberId && options.filterMemberId !== 'all') {
      filtered = filtered.filter((t) => t.assignees.some((a) => a.id === options.filterMemberId));
    }

    if (options.filterStatus && options.filterStatus !== 'all') {
      if (options.filterStatus === 'completed') {
        filtered = filtered.filter((t) => t.isCompleted);
      } else if (options.filterStatus === 'active') {
        filtered = filtered.filter((t) => !t.isCompleted);
      }
    }

    if (options.search && options.search.trim().length > 0) {
      const q = options.search.toLowerCase().trim();
      filtered = filtered.filter((t) =>
        t.name.toLowerCase().includes(q) ||
        t.listName.toLowerCase().includes(q) ||
        t.assignees.some((a) => a.username.toLowerCase().includes(q))
      );
    }

    const members = this.calculateMemberStats(filtered, options.allKnownMembers || []);
    const monthlyStats = this.calculateMonthlyStats(filtered);

    let totalAssigned = 0;
    let totalCompleted = 0;
    let totalActive = 0;

    for (const m of members) {
      totalAssigned += m.assigned;
      totalCompleted += m.completed;
      totalActive += m.active;
    }

    let overallCompletionRate = 0;
    let overallCompletionFormatted = 'N/A';
    if (totalAssigned > 0) {
      overallCompletionRate = Math.round((totalCompleted / totalAssigned) * 1000) / 10;
      overallCompletionFormatted = `${overallCompletionRate.toFixed(overallCompletionRate % 1 === 0 ? 0 : 1)}%`;
    }

    const statusCountMap = new Map<string, { count: number; isCompleted: boolean }>();
    for (const t of filtered) {
      const s = t.status;
      if (!statusCountMap.has(s)) {
        statusCountMap.set(s, { count: 0, isCompleted: t.isCompleted });
      }
      statusCountMap.get(s)!.count += 1;
    }

    const statusBreakdown = Array.from(statusCountMap.entries()).map(([status, item]) => ({
      status,
      count: item.count,
      isCompleted: item.isCompleted
    }));

    const availableMonths = Array.from(new Set(deduplicated.map((t) => t.month).filter(Boolean)));

    const uniqueCompletedTasksCount = deduplicated.filter((t) => t.isCompleted).length;
    const uniqueActiveTasksCount = deduplicated.filter((t) => !t.isCompleted).length;

    return {
      totalMembers: members.length,
      totalAssigned,
      totalCompleted,
      totalActive,
      uniqueTasksCount: deduplicated.length,
      uniqueCompletedTasksCount,
      uniqueActiveTasksCount,
      overallCompletionRate,
      overallCompletionFormatted,
      lastSynced: options.lastSynced || null,
      isSyncing: options.isSyncing || false,
      months: availableMonths,
      members,
      monthlyStats,
      statusBreakdown
    };
  }
}
