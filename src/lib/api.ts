// src\lib\api.ts
import type {
  DashboardSummary,
  MemberStats,
  NormalizedTask,
  ClickUpConfigStatus,
  DepartmentStats,
} from "../types/index.js";

export async function fetchDashboard(
  filters: {
    month?: string;
    memberId?: string;
    status?: string;
    search?: string;
  } = {},
): Promise<DashboardSummary> {
  const params = new URLSearchParams();
  if (filters.month && filters.month !== "all")
    params.set("month", filters.month);
  if (filters.memberId && filters.memberId !== "all")
    params.set("memberId", filters.memberId);
  if (filters.status && filters.status !== "all")
    params.set("status", filters.status);
  if (filters.search && filters.search.trim())
    params.set("search", filters.search.trim());

  const res = await fetch(`/api/dashboard?${params.toString()}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body.error || `Failed to fetch dashboard: ${res.statusText}`,
    );
  }
  return res.json();
}

export async function fetchMembers(search?: string): Promise<MemberStats[]> {
  const params = new URLSearchParams();
  if (search && search.trim()) params.set("search", search.trim());
  const res = await fetch(`/api/members?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch members");
  const data = await res.json();
  return data.members || [];
}

export async function fetchMember(id: string): Promise<MemberStats> {
  const res = await fetch(`/api/members/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("Failed to fetch member details");
  return res.json();
}

export async function fetchTasks(
  filters: {
    month?: string;
    memberId?: string;
    status?: string;
    search?: string;
  } = {},
): Promise<NormalizedTask[]> {
  const params = new URLSearchParams();
  if (filters.month && filters.month !== "all")
    params.set("month", filters.month);
  if (filters.memberId && filters.memberId !== "all")
    params.set("memberId", filters.memberId);
  if (filters.status && filters.status !== "all")
    params.set("status", filters.status);
  if (filters.search && filters.search.trim())
    params.set("search", filters.search.trim());

  const res = await fetch(`/api/tasks?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  const data = await res.json();
  return data.tasks || [];
}

export async function fetchMonths(): Promise<string[]> {
  const res = await fetch("/api/months");
  if (!res.ok) throw new Error("Failed to fetch months");
  const data = await res.json();
  return data.months || [];
}

export async function fetchConfigStatus(): Promise<ClickUpConfigStatus> {
  const res = await fetch("/api/config/status");
  if (!res.ok) throw new Error("Failed to fetch config status");
  return res.json();
}

export async function triggerSync(): Promise<{
  success: boolean;
  taskCount: number;
  message: string;
}> {
  const res = await fetch("/api/sync", { method: "POST" });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Sync request failed");
  }
  return data;
}

export interface SasbRoleMember {
  id: string;
  name: string;
  email: string | null;
  position: string | null;
  positionUpdatedAt: string | null;
}

export interface SasbPositionGroup {
  label: string;
  positions: readonly string[];
}

export interface SasbPositionCatalog {
  groups: Record<string, SasbPositionGroup>;
  positions: string[];
}

export async function fetchRoleAuthStatus(): Promise<boolean> {
  const res = await fetch("/api/roles/auth/status", {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to check authentication status");
  }

  const data = await res.json();
  return data.authenticated === true;
}

export async function loginRoleAdmin(password: string): Promise<void> {
  const res = await fetch("/api/roles/auth/login", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Login failed");
  }
}

export async function logoutRoleAdmin(): Promise<void> {
  const res = await fetch("/api/roles/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Logout failed");
  }
}

export async function fetchRoleMembers(): Promise<SasbRoleMember[]> {
  const res = await fetch("/api/roles/members", {
    credentials: "include",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to fetch role members");
  }

  const data = await res.json();
  return data.members || [];
}

export async function fetchRolePositions(): Promise<SasbPositionCatalog> {
  const res = await fetch("/api/roles/positions", {
    credentials: "include",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to fetch SASB positions");
  }

  return res.json();
}

export async function saveMemberPosition(
  clickupUserId: string,
  position: string,
): Promise<SasbRoleMember> {
  const res = await fetch(
    `/api/roles/members/${encodeURIComponent(clickupUserId)}`,
    {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ position }),
    },
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to save member position");
  }

  return data.member;
}

export async function fetchDepartments(): Promise<DepartmentStats[]> {
  const response = await fetch("/api/departments");

  if (!response.ok) {
    throw new Error("Failed to fetch department analytics");
  }

  const data = await response.json();

  return data.departments;
}