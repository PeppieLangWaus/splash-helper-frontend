/** Player mod status shown as an icon before the username in chat. */
export type ModStatus = 'pmod' | 'jmod';

/** Ironman mode shown as an icon before the username in chat. */
export type IronmanStatus = 'im' | 'hcim' | 'uim' | 'gim' | 'hcgim' | 'ugim';

/** Clan/community rank shown as an icon before the username in chat. */
export type ChatRank =
  | 'owner'
  | 'general'
  | 'captain'
  | 'lieutenant'
  | 'sergeant'
  | 'corporal'
  | 'recruit'
  | 'smiley';

/** The chat channel tabs along the bottom of the chatbox. */
export type ChatChannel = 'all' | 'game' | 'public' | 'private' | 'channel' | 'clan' | 'trade';

/** A single line in the chat log. */
export interface ChatMessage {
  id: string;
  /** Epoch ms; rendered as `[HH:MM]`. */
  timestamp: number;
  username: string;
  message: string;
  modStatus?: ModStatus;
  ironmanStatus?: IronmanStatus;
  rank?: ChatRank;
}
