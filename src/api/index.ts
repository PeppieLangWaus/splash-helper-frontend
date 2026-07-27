import type { ActiveSession, ArchivedSession, AdminUser, SplashEntry, Community, CommunitySplasher, SplasherWebhooks } from '../types';

/** Body shape for every webhook PUT endpoint: either field may be omitted to leave it
 *  unchanged, or set to '' to clear it. */
export interface WebhookUpdate {
  activeWebhookUrl?: string;
  historyWebhookUrl?: string;
}

const BASE = `${import.meta.env.VITE_API_BASE_URL}`;

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
): Promise<{ token: string; username: string; message: string; isAdmin: boolean; communityEligible: boolean }> {
  const res = await fetch(`${BASE}/auth/setup/${encodeURIComponent(setupToken)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = (await res.json()) as {
    token?: string;
    username?: string;
    message?: string;
    isAdmin?: boolean;
    communityEligible?: boolean;
    error?: string;
  };
  if (!res.ok) throw new Error(data.error ?? 'Setup failed');
  return {
    token: data.token!,
    username: data.username!,
    message: data.message!,
    isAdmin: data.isAdmin ?? false,
    communityEligible: data.communityEligible ?? false,
  };
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
): Promise<{ username: string; sessions: ArchivedSession[] } & SplasherWebhooks> {
  const res = await fetch(`${BASE}/splashers/${encodeURIComponent(username)}`, {
    headers: authHeaders(token),
  });
  const data = (await res.json()) as {
    username?: string;
    sessions?: ArchivedSession[];
    discordActiveWebhookUrl?: string;
    discordHistoryWebhookUrl?: string;
    error?: string;
  };
  if (!res.ok) throw new Error(data.error ?? `Failed to fetch sessions for "${username}"`);
  return data as { username: string; sessions: ArchivedSession[] } & SplasherWebhooks;
}

export async function setSplasherWebhook(
  username: string,
  update: WebhookUpdate,
  token: string,
): Promise<SplasherWebhooks> {
  const res = await fetch(`${BASE}/splashers/${encodeURIComponent(username)}/webhook`, {
    method: 'PUT',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
  const data = (await res.json()) as SplasherWebhooks & { error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Failed to update webhook');
  return data;
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

export async function adminSetCommunityEligibility(
  username: string,
  token: string,
): Promise<{ message: string; communityEligible: boolean }> {
  const res = await fetch(`${BASE}/admin/community-eligibility/${encodeURIComponent(username)}`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  const data = (await res.json()) as { message?: string; communityEligible?: boolean; error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Failed to update community eligibility');
  return data as { message: string; communityEligible: boolean };
}

// ─── Communities ──────────────────────────────────────────────────────────────

export async function getMyCommunities(token: string): Promise<Community[]> {
  const res = await fetch(`${BASE}/communities/mine`, { headers: authHeaders(token) });
  const data = (await res.json()) as { communities?: Community[]; error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Failed to fetch communities');
  return data.communities ?? [];
}

export async function createCommunity(name: string, token: string): Promise<Community> {
  const res = await fetch(`${BASE}/communities`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  const data = (await res.json()) as { community?: Community; error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Failed to create community');
  return data.community!;
}

export async function setCommunityWebhook(
  communityId: string,
  update: WebhookUpdate,
  token: string,
): Promise<Community> {
  const res = await fetch(`${BASE}/communities/${encodeURIComponent(communityId)}/webhook`, {
    method: 'PUT',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
  const data = (await res.json()) as { community?: Community; error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Failed to update webhook');
  return data.community!;
}

export async function getCommunitySplashers(communityId: string, token: string): Promise<CommunitySplasher[]> {
  const res = await fetch(`${BASE}/communities/${encodeURIComponent(communityId)}/splashers`, {
    headers: authHeaders(token),
  });
  const data = (await res.json()) as { splashers?: CommunitySplasher[]; error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Failed to fetch splashers');
  return data.splashers ?? [];
}

export async function setCommunityMemberWebhook(
  communityId: string,
  username: string,
  update: WebhookUpdate,
  token: string,
): Promise<SplasherWebhooks> {
  const res = await fetch(
    `${BASE}/communities/${encodeURIComponent(communityId)}/members/${encodeURIComponent(username)}/webhook`,
    {
      method: 'PUT',
      headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    },
  );
  const data = (await res.json()) as SplasherWebhooks & { error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Failed to update webhook');
  return data;
}

// ─── Admin: communities ───────────────────────────────────────────────────────

export async function adminGetCommunities(token: string): Promise<Community[]> {
  const res = await fetch(`${BASE}/admin/communities`, { headers: authHeaders(token) });
  const data = (await res.json()) as { communities?: Community[]; error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Failed to fetch communities');
  return data.communities ?? [];
}

export async function adminAssignUsersToCommunity(
  communityId: string,
  usernames: string[],
  token: string,
): Promise<{ message: string; community: Community; notFound: string[] }> {
  const res = await fetch(`${BASE}/admin/communities/${encodeURIComponent(communityId)}/members`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernames }),
  });
  const data = (await res.json()) as { message?: string; community?: Community; notFound?: string[]; error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Failed to assign splashers to community');
  return { message: data.message!, community: data.community!, notFound: data.notFound ?? [] };
}

export async function adminRemoveUserFromCommunity(
  communityId: string,
  username: string,
  token: string,
): Promise<void> {
  const res = await fetch(
    `${BASE}/admin/communities/${encodeURIComponent(communityId)}/members/${encodeURIComponent(username)}`,
    { method: 'DELETE', headers: authHeaders(token) },
  );
  if (!res.ok) {
    const data = (await res.json()) as { error?: string };
    throw new Error(data.error ?? 'Failed to remove splasher from community');
  }
}

export async function adminDeleteCommunity(communityId: string, token: string): Promise<void> {
  const res = await fetch(`${BASE}/admin/communities/${encodeURIComponent(communityId)}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const data = (await res.json()) as { error?: string };
    throw new Error(data.error ?? 'Failed to delete community');
  }
}

// ─── Dev-only fake sessions (backend rejects these outside NODE_ENV=production check) ─────────

export async function devGetAdminToken(): Promise<{ token: string; username: string; isAdmin: boolean; communityEligible: boolean }> {
  const res = await fetch(`${BASE}/dev/admin-token`, { method: 'POST' });
  const data = (await res.json()) as {
    token?: string;
    username?: string;
    isAdmin?: boolean;
    communityEligible?: boolean;
    error?: string;
  };
  if (!res.ok) throw new Error(data.error ?? 'Failed to get dev admin token');
  return {
    token: data.token!,
    username: data.username!,
    isAdmin: data.isAdmin ?? false,
    communityEligible: data.communityEligible ?? false,
  };
}

export async function devAddFakeSession(username: string): Promise<ActiveSession> {
  const res = await fetch(`${BASE}/dev/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });
  const data = (await res.json()) as ActiveSession & { error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Failed to add fake session');
  return data;
}

export async function devTickFakeSession(username: string): Promise<ActiveSession> {
  const res = await fetch(`${BASE}/dev/sessions/${encodeURIComponent(username)}/tick`, {
    method: 'POST',
  });
  const data = (await res.json()) as ActiveSession & { error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Failed to update fake session');
  return data;
}

export async function devRemoveFakeSession(username: string): Promise<void> {
  const res = await fetch(`${BASE}/dev/sessions/${encodeURIComponent(username)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const data = (await res.json()) as { error?: string };
    throw new Error(data.error ?? 'Failed to remove fake session');
  }
}
