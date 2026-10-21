export type ModStatus = 'pmod' | 'jmod';

export type IronmanStatus = 'im' | 'hcim' | 'uim' | 'gim' | 'hcgim' | 'ugim';

export type ChatRank =
  | 'owner'
  | 'general'
  | 'captain'
  | 'lieutenant'
  | 'sergeant'
  | 'corporal'
  | 'recruit'
  | 'smiley';

export type ChatChannel = 'all' | 'game' | 'public' | 'private' | 'channel' | 'clan' | 'trade';

export type ChatMessageKind = 'fc' | 'cc' | 'info' | 'public' | 'private' | 'trade' | 'system';

export interface MessageSegment {
  text: string;

  color?: string;
}

export interface ChatItemRef {
  id: number;
  quantity: number;
}

export interface ChatMessage {
  id: string;

  timestamp: number;
  kind: ChatMessageKind;

  username?: string;

  message: string;

  segments?: MessageSegment[];

  icon?: string;

  prefix?: { text: string };
  modStatus?: ModStatus;
  ironmanStatus?: IronmanStatus;

  rankIcon?: string;

  communityId?: string;

  items?: ChatItemRef[];

  showQuantities?: boolean;

  edited?: boolean;
}

export type LiveChatChannelType = 'fc' | 'cc';

export interface ChatChannelListing {
  communityId: string;
  communityName: string;
  friendsChatName: string | null;

  friendsChatDisplayName: string | null;
  clanChatName: string | null;
}

export interface CommunityChatConfig {
  friendsChatOwner: string | null;
  friendsChatName: string | null;
  friendsChatDisplayName: string | null;
  clanChatName: string | null;
  discordFriendsChatWebhookUrl: string | null;
  discordClanChatWebhookUrl: string | null;
}

export type TabState = 'on' | 'filtered' | 'off';

export type ChatTabStates = Record<ChatChannel, TabState>;
