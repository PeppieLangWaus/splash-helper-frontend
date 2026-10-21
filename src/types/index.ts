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

  currentPlayerCount?: number;
  pickpocketerCount: number;
  playerDeaths?: number;

  level99Players?: string[];
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

export interface ActiveSessionCommunity {
  communityId: string;
  communityName: string;
  discordInviteUrl: string;
}

export interface ActiveSession {
  username: string;
  sessionData: SessionData | null;
  lastUpdate: number;
  communities?: ActiveSessionCommunity[];

  pinned?: boolean;
}

export interface SplasherVotes {
  likes: number;
  dislikes: number;
  myVote: 1 | -1 | null;
}

export interface ArchivedSession {
  _id: string;
  sessionId: string;
  username: string;
  userId: string;
  createdTimestamp: number;
  finalizedTimestamp: number;
  syncedToServer: boolean;
  session: SessionData;

  earningsSnapshot?: Record<string, { rankId: string; rankName: string; hourlyRate: number }>;
}

export interface PayoutTicket {
  id: string;
  amountGp: number;
  status: 'pending' | 'completed' | 'rejected';
  createdAt: number;
  resolvedAt: number | null;
}

export interface AuthUser {
  username: string;
  isAdmin: boolean;
  communityEligible: boolean;
}

export interface AdminUser {
  _id: string;
  username: string;
  token: string;
  isAdmin: boolean;
  setupLinkUsed: boolean;
  communityEligible: boolean;
  createdAt: string;
  email?: string;
  emailVerifiedAt?: string;
}

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

export interface CommunitySummary {
  _id: string;
  name: string;
}

export interface Rank {
  _id: string;
  communityId: string;
  name: string;
  hourlyRate: number;
  isDefault: boolean;
}

export interface CommunitySplasher {
  _id: string;
  username: string;
  discordActiveWebhookUrl?: string;
  discordHistoryWebhookUrl?: string;
  rank: { id: string; name: string; hourlyRate: number } | null;
}

export interface SplasherWebhooks {
  discordActiveWebhookUrl?: string;
  discordHistoryWebhookUrl?: string;
}

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
