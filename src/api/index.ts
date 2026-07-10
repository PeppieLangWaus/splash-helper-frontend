import type { ActiveSession, ArchivedSession, AdminUser, SplashEntry } from '../types';

const BASE = '/api';

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

// ─── Testing upload ───────────────────────────────────────────────────────────

export async function uploadJson(entries: SplashEntry[]): Promise<{ message: string; added: number; skipped: number }> {
  const res = await fetch(`${BASE}/sessions/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entries),
  });
  const data = (await res.json()) as { message?: string; added?: number; skipped?: number; error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Upload failed');
  return data as { message: string; added: number; skipped: number };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function setupAccount(
  setupToken: string,
  password: string,
): Promise<{ token: string; username: string; message: string }> {
  const res = await fetch(`${BASE}/auth/setup/${encodeURIComponent(setupToken)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = (await res.json()) as { token?: string; username?: string; message?: string; error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Setup failed');
  return data as { token: string; username: string; message: string };
}

// ─── Public splashers ─────────────────────────────────────────────────────────

export async function getActiveSessions(): Promise<ActiveSession[]> {
  const res = await fetch(`${BASE}/splashers`);
  if (!res.ok) throw new Error('Failed to fetch active sessions');
  const data = (await res.json()) as { sessions: ActiveSession[] };
  return data.sessions;
}

// ─── Authenticated splasher data ─────────────────────────────────────────────

export async function getArchivedSessions(
  username: string,
  token: string,
): Promise<{ username: string; sessions: ArchivedSession[] }> {
  const res = await fetch(`${BASE}/splashers/${encodeURIComponent(username)}`, {
    headers: authHeaders(token),
  });
  const data = (await res.json()) as { username?: string; sessions?: ArchivedSession[]; error?: string };
  if (!res.ok) throw new Error(data.error ?? `Failed to fetch sessions for "${username}"`);
  return data as { username: string; sessions: ArchivedSession[] };
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function adminGetUsers(token: string): Promise<AdminUser[]> {
  const res = await fetch(`${BASE}/admin/users`, { headers: authHeaders(token) });
  const data = (await res.json()) as { users?: AdminUser[]; error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Failed to fetch users');
  return data.users!;
}

export async function adminPromoteUser(
  username: string,
  adminSecret: string,
  token: string,
): Promise<{ message: string; isAdmin: boolean }> {
  const res = await fetch(`${BASE}/admin/promote/${encodeURIComponent(username)}`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'x-admin-secret': adminSecret },
  });
  const data = (await res.json()) as { message?: string; isAdmin?: boolean; error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Promote failed');
  return data as { message: string; isAdmin: boolean };
}

export async function adminDeleteUser(username: string, token: string): Promise<void> {
  const res = await fetch(`${BASE}/admin/users/${encodeURIComponent(username)}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const data = (await res.json()) as { error?: string };
    throw new Error(data.error ?? 'Delete failed');
  }
}

export async function adminGetSessions(token: string): Promise<ArchivedSession[]> {
  const res = await fetch(`${BASE}/admin/sessions`, { headers: authHeaders(token) });
  const data = (await res.json()) as { sessions?: ArchivedSession[]; error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Failed to fetch sessions');
  return data.sessions!;
}

export async function adminDeleteSession(sessionId: string, token: string): Promise<void> {
  const res = await fetch(`${BASE}/admin/sessions/${encodeURIComponent(sessionId)}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const data = (await res.json()) as { error?: string };
    throw new Error(data.error ?? 'Delete failed');
  }
}
