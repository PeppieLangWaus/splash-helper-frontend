// Mirrors splash-helper-backend's services/linkPreview.ts `LinkPreviewResult` — kept as a plain
// duplicate rather than a shared package since these are two independent repos/deployments (see
// the root CLAUDE.md's "workspace of independent git repositories" note). Update both sides
// together if this shape ever changes.

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
