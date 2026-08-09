/** Shared color constants for the chatbox's synthetic message lines (Game/Public/Private/Trade)
 *  and the live-chat `[...]` channel prefix — see types/chatbox.ts's ChatMessage.prefix/segments.
 *  Chosen to read clearly against the chat log's tan background (see Chatbox.css). */
export const CHAT_BLUE = '#1a1aee';
export const CHAT_ORANGE = '#d97706';
export const CHAT_GREEN = '#1a7a1a';

/** Tab status-line colors (see ChatControls.tsx) — On/Filtered/Off. */
export const TAB_STATE_COLORS = {
  on: '#00ff00',
  filtered: '#ffff00',
  off: '#ff3333',
} as const;
