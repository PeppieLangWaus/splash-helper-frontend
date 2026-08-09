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

/** What kind of source a message came from — drives which tab it belongs to (see
 *  chatbox/chatFilter.ts) and how it's rendered (chatbox/ChatLog.tsx). `fc`/`cc` are real live
 *  chat lines (Channel/Clan tabs); the rest are locally-synthesized lines (Game/Public/Private/
 *  Trade tabs) — see the individual `use*` hooks in `hooks/`. */
export type ChatMessageKind = 'fc' | 'cc' | 'info' | 'public' | 'private' | 'trade';

/** One colored run of text within a message body — see ChatMessage.segments. */
export interface MessageSegment {
  text: string;
  /** CSS color; omitted means "use the line's default message color". */
  color?: string;
}

/** A single line in the chat log. */
export interface ChatMessage {
  id: string;
  /** Epoch ms; rendered as `[HH:MM]`. */
  timestamp: number;
  kind: ChatMessageKind;
  /** Real chat lines (fc/cc) only. */
  username?: string;
  /** Plain-text body. Used as-is for fc/cc chat lines; for synthetic kinds (info/public/private/
   *  trade) it's the plain-text fallback when `segments` isn't set. */
  message: string;
  /** Rich, multi-color body — when set, overrides `message` for rendering. Used by the info/
   *  public/private/trade kinds; fc/cc chat lines never set this. */
  segments?: MessageSegment[];
  /** Prefix image shown before everything else on the line (e.g. the info/System/world icons —
   *  see chatbox/chatColors.ts and the `use*` hooks). fc/cc chat lines don't use this — they use
   *  modStatus/ironmanStatus/rankIcon below instead. */
  icon?: string;
  /** The colored `[info]` / `[System]` / `[Worlds]` / `[<fc display name>]` / `[<cc name>]`
   *  bracket tag shown right after the timestamp. */
  prefix?: { text: string; color: string };
  modStatus?: ModStatus;
  ironmanStatus?: IronmanStatus;
  /** Resolved icon path for the sender's Friends/Clan Chat rank — already translated from the
   *  relay's raw numeric rank attribute via `getRankIcon` (see chatbox/chatIcons.ts), since that
   *  translation depends on which channel type the message came from. Undefined if the raw value
   *  has no mapped icon (e.g. UNRANKED, or an unmapped Clan Chat rank). */
  rankIcon?: string;
}

// ── Live relay feed (splash-helper-backend's chat.splasher.help relay) ─────────────────

/** In-game Friends Chat vs Clan Chat — the two feeds a community can register a name for. */
export type LiveChatChannelType = 'fc' | 'cc';

/** One community's registered live chat(s), as returned by GET /chat-channels — the public,
 *  unauthenticated endpoint the chatbox's community picker reads from. A community only appears
 *  once it's registered at least one of these names in its settings. */
export interface ChatChannelListing {
  communityId: string;
  communityName: string;
  friendsChatName: string | null;
  /** Owner-chosen display name for the Friends Chat, shown in the chatbox's `[...]` prefix
   *  instead of `friendsChatName` when set — see point 4/5 of the chatbox feature notes (the FC
   *  name itself is inherently tied to the owner's RSN). Null when unset; fall back to
   *  `friendsChatName`. */
  friendsChatDisplayName: string | null;
  clanChatName: string | null;
}

/** A community owner's chat-relay settings — GET/PUT /communities/:id/chat-config. */
export interface CommunityChatConfig {
  friendsChatName: string | null;
  friendsChatDisplayName: string | null;
  clanChatName: string | null;
  discordFriendsChatWebhookUrl: string | null;
  discordClanChatWebhookUrl: string | null;
}

// ── Bottom-bar tab filter state ─────────────────────────────────────────────────────────

/** A tab's own On/Filtered/Off status (the little colored line under its label — see
 *  ChatControls.tsx). Game/Public/Private/Trade only ever use 'on'/'off'; Channel/Clan cycle
 *  through all three. See chatbox/chatFilter.ts for what each state actually does. */
export type TabState = 'on' | 'filtered' | 'off';

export type ChatTabStates = Record<ChatChannel, TabState>;
