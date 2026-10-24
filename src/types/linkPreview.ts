export interface WikiPreviewData {
  title: string;
  extract?: string;
  thumbnailUrl?: string;
  canonicalUrl: string;
}

export interface DiscordInvitePreviewData {
  guildName: string;
  guildIconUrl?: string;
  description?: string;
  memberCount?: number;
  onlineCount?: number;
  channelName?: string;
}

export interface PluginHubPreviewData {
  displayName: string;
  author: string;
  description?: string;
  iconUrl?: string;
  stars?: number;
  repoUrl: string;
}

export type LinkPreviewResult =
  | { type: 'wiki'; found: true; data: WikiPreviewData }
  | { type: 'discord-invite'; found: true; data: DiscordInvitePreviewData }
  | { type: 'plugin-hub'; found: true; data: PluginHubPreviewData }
  | { type: 'wiki' | 'discord-invite' | 'plugin-hub'; found: false }
  | { type: 'unsupported' };
