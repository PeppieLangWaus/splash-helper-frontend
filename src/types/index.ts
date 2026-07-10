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

/** Active session currently in-memory on the server */
export interface ActiveSession {
  username: string;
  sessionData: SessionData | null;
  lastUpdate: number;
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
}

/** User record returned from admin endpoints */
export interface AdminUser {
  _id: string;
  username: string;
  isAdmin: boolean;
  setupLinkUsed: boolean;
  createdAt: string;
}
