import type {
  ClickUpTeam,
  ClickUpSpace,
  ClickUpFolder,
  ClickUpList,
  ClickUpTask,
} from "../types/clickup.js";

export class ClickUpClient {
  private apiToken: string;
  private baseUrl = "https://api.clickup.com/api/v2";

  constructor(apiToken?: string) {
    this.apiToken = apiToken || process.env.CLICKUP_API_TOKEN || "";
  }

  public isConfigured(): boolean {
    return Boolean(this.apiToken && this.apiToken.trim().length > 0);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    if (!this.isConfigured()) {
      throw new Error(
        "ClickUp API Token is not configured. Please set CLICKUP_API_TOKEN in .env",
      );
    }

    const url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const headers: Record<string, string> = {
      Authorization: this.apiToken.trim(),
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    let retries = 2;
    while (retries >= 0) {
      try {
        const response = await fetch(url, {
          ...options,
          headers,
        });

        if (response.status === 429) {
          // Rate limited
          const retryAfter = Number(response.headers.get("Retry-After")) || 2;
          console.warn(
            `[ClickUpClient] Rate limited on ${endpoint}. Retrying after ${retryAfter}s...`,
          );
          await new Promise((resolve) =>
            setTimeout(resolve, retryAfter * 1000),
          );
          retries--;
          continue;
        }

        if (!response.ok) {
          const errorBody = await response.text().catch(() => "");
          let message = `ClickUp API error (${response.status} ${response.statusText})`;
          try {
            const parsed = JSON.parse(errorBody);
            if (parsed.err || parsed.error) {
              message = `${message}: ${parsed.err || parsed.error}`;
            }
          } catch {
            if (errorBody) message = `${message}: ${errorBody.slice(0, 200)}`;
          }
          throw new Error(message);
        }

        const data = await response.json();
        return data as T;
      } catch (err: any) {
        if (
          retries <= 0 ||
          err.message.includes("401") ||
          err.message.includes("403")
        ) {
          console.error(
            `[ClickUpClient] Request failed for ${endpoint}:`,
            err.message,
          );
          throw err;
        }
        retries--;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    throw new Error(`Failed to complete ClickUp request to ${endpoint}`);
  }

  public async getTeams(): Promise<ClickUpTeam[]> {
    const res = await this.request<{ teams: ClickUpTeam[] }>("/team");
    return res.teams || [];
  }

  public async getSpaces(
    teamId: string,
    archived = false,
  ): Promise<ClickUpSpace[]> {
    const res = await this.request<{ spaces: ClickUpSpace[] }>(
      `/team/${teamId}/space?archived=${archived}`,
    );
    return res.spaces || [];
  }

  public async getFolders(
    spaceId: string,
    archived = false,
  ): Promise<ClickUpFolder[]> {
    const res = await this.request<{ folders: ClickUpFolder[] }>(
      `/space/${spaceId}/folder?archived=${archived}`,
    );
    return res.folders || [];
  }

  public async getListsInFolder(
    folderId: string,
    archived = false,
  ): Promise<ClickUpList[]> {
    const res = await this.request<{ lists: ClickUpList[] }>(
      `/folder/${folderId}/list?archived=${archived}`,
    );
    return res.lists || [];
  }

  public async getFolderlessLists(
    spaceId: string,
    archived = false,
  ): Promise<ClickUpList[]> {
    const res = await this.request<{ lists: ClickUpList[] }>(
      `/space/${spaceId}/list?archived=${archived}`,
    );
    return res.lists || [];
  }

  public async getTasksInList(
    listId: string,
    options: {
      includeSubtasks?: boolean;
      archived?: boolean;
    } = {},
  ): Promise<ClickUpTask[]> {
    const allTasks: ClickUpTask[] = [];
    const includeSubtasks = options.includeSubtasks ?? false;
    const archived = options.archived ?? false;

    let page = 0;
    let hasMore = true;

    while (hasMore) {
      const endpoint = `/list/${listId}/task?archived=${archived}&page=${page}&subtasks=${includeSubtasks}&include_closed=true`;
      const res = await this.request<{
        tasks: ClickUpTask[];
        last_page?: boolean;
      }>(endpoint);

      const tasks = res.tasks || [];
      if (tasks.length === 0) {
        hasMore = false;
        break;
      }

      allTasks.push(...tasks);

      if (res.last_page === true || tasks.length < 100) {
        hasMore = false;
      } else {
        page++;
        await new Promise((resolve) => setTimeout(resolve, 80));
      }
    }

    return allTasks;
  }
}
