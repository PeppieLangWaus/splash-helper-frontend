export interface RuneUsageMap {
  [runeId: string]: number;
}

export interface SessionData {
  playerName: string;
  spell: string;
  runeCostPerCast: number;
  startTime: string;
  logoutTime: string;
  world: number;
  stickyKnight: boolean;
  spellsCast: number;
  startMagicXp: number;
  currentMagicXp: number;
  knightMovements: number;
  endTime?: string;
  highestPlayerCount: number;
  averagePlayerCount: number;
  /** Live nearby-player count at the moment of this update (as opposed to highest/average). */
  currentPlayerCount?: number;
  pickpocketerCount: number;
  startingRuneCount: number;
  currentRuneCount: number;
  runeUsageMap: RuneUsageMap;
  runeCostGp: number;
}

export interface SplashEntry {
  sessionId: string;
  createdTimestamp: number;
  finalizedTimestamp: number;
  syncedToServer: boolean;
  session: SessionData;
}

export interface Splasher {
  username: string;
  sessions: SplashEntry[];
}

/** A community a splasher belongs to that has a public Discord invite configured. */
export interface ActiveSessionCommunity {
  communityId: string;
  communityName: string;
  discordInviteUrl: string;
}

/** Active session currently in-memory on the server */
export interface ActiveSession {
  username: string;
  sessionData: SessionData | null;
  lastUpdate: number;
  communities?: ActiveSessionCommunity[];
}

/** Archived session stored in MongoDB */
export interface ArchivedSession {
  _id: string;
  sessionId: string;
  username: string;
  userId: string;
  createdTimestamp: number;
  finalizedTimestamp: number;
  syncedToServer: boolean;
  session: SessionData;
}

/** Authenticated user info decoded from JWT */
export interface AuthUser {
  username: string;
  isAdmin: boolean;
  communityEligible: boolean;
}

/** User record returned from admin endpoints. Unlike GET /splashers/:username (which only
 *  ever includes `token` for the splasher viewing their own data), admin endpoints trust the
 *  requester's isAdmin flag and always include it — admins can look up any user's token. */
export interface AdminUser {
  _id: string;
  username: string;
  token: string;
  isAdmin: boolean;
  setupLinkUsed: boolean;
  communityEligible: boolean;
  createdAt: string;
}

/** Community record returned from the communities endpoints */
export interface Community {
  _id: string;
  name: string;
  ownerIds: string[];
  memberUserIds: string[];
  discordActiveWebhookUrl?: string;
  discordHistoryWebhookUrl?: string;
  discordInviteUrl?: string;
  apiToken: string;
  createdAt: string;
}

/** Lightweight community entry from GET /communities (id + name only). */
export interface CommunitySummary {
  _id: string;
  name: string;
}

/** A community's hourly-rate tier. Every community always has exactly one isDefault rank. */
export interface Rank {
  _id: string;
  communityId: string;
  name: string;
  hourlyRate: number;
  isDefault: boolean;
}

/** Splasher (User) record returned from GET /communities/:id/splashers */
export interface CommunitySplasher {
  _id: string;
  username: string;
  discordActiveWebhookUrl?: string;
  discordHistoryWebhookUrl?: string;
  rank: { id: string; name: string; hourlyRate: number } | null;
}

/** A splasher's own personal webhook overrides, additive with any community webhook. */
export interface SplasherWebhooks {
  discordActiveWebhookUrl?: string;
  discordHistoryWebhookUrl?: string;
}

/** A community's `/setup` configuration — the same document the Discord bot's setup wizard
 *  writes. null (via GET /communities/:id/discord-config) until /setup has been run once. */
export interface DiscordServerConfig {
  _id: string;
  communityId: string;
  guildId: string;
  supportRoleIds: string[];
  supportTicketChannelId?: string;
  splasherLinkChannelId?: string;
  historyChannelId?: string;
  activeWorldsChannelId?: string;
  autoAddSplashers: boolean;
  bankChannelId?: string;
  bankManagerRoleIds: string[];
  minPayoutGp: number;
  createdAt: string;
}
