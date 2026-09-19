// src\lib\api.ts
import type {
  DashboardSummary,
  MemberStats,
  NormalizedTask,
  ClickUpConfigStatus
} from '../types/index.js';

export async function fetchDashboard(filters: {
  month?: string;
  memberId?: string;
  status?: string;
  search?: string;
} = {}): Promise<DashboardSummary> {
  const params = new URLSearchParams();
  if (filters.month && filters.month !== 'all') params.set('month', filters.month);
  if (filters.memberId && filters.memberId !== 'all') params.set('memberId', filters.memberId);
  if (filters.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters.search && filters.search.trim()) params.set('search', filters.search.trim());

  const res = await fetch(`/api/dashboard?${params.toString()}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Failed to fetch dashboard: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchMembers(search?: string): Promise<MemberStats[]> {
  const params = new URLSearchParams();
  if (search && search.trim()) params.set('search', search.trim());
  const res = await fetch(`/api/members?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch members');
  const data = await res.json();
  return data.members || [];
}

export async function fetchMember(id: string): Promise<MemberStats> {
  const res = await fetch(`/api/members/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('Failed to fetch member details');
  return res.json();
}

export async function fetchTasks(filters: {
  month?: string;
  memberId?: string;
  status?: string;
  search?: string;
} = {}): Promise<NormalizedTask[]> {
  const params = new URLSearchParams();
  if (filters.month && filters.month !== 'all') params.set('month', filters.month);
  if (filters.memberId && filters.memberId !== 'all') params.set('memberId', filters.memberId);
  if (filters.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters.search && filters.search.trim()) params.set('search', filters.search.trim());

  const res = await fetch(`/api/tasks?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  const data = await res.json();
  return data.tasks || [];
}

export async function fetchMonths(): Promise<string[]> {
  const res = await fetch('/api/months');
  if (!res.ok) throw new Error('Failed to fetch months');
  const data = await res.json();
  return data.months || [];
}

export async function fetchConfigStatus(): Promise<ClickUpConfigStatus> {
  const res = await fetch('/api/config/status');
  if (!res.ok) throw new Error('Failed to fetch config status');
  return res.json();
}

export async function triggerSync(): Promise<{ success: boolean; taskCount: number; message: string }> {
  const res = await fetch('/api/sync', { method: 'POST' });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Sync request failed');
  }
  return data;
}
