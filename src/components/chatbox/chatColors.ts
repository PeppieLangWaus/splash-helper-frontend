/** Shared color constants for the chatbox's synthetic message lines' rich `segments` (see
 *  types/chatbox.ts's ChatMessage.segments). Structural colors that are always the same
 *  regardless of message content — usernames, prefixes, and each kind's own message-body color
 *  (fc/cc/info/private) — live directly in Chatbox.css instead (.chat-line-username,
 *  .chat-line-prefix-bracket/-text, .chat-line-message--fc/--cc/--private). Chosen to read
 *  clearly against the chat log's tan background. */
export const CHAT_INFO = '#4A8123';
export const CHAT_ORANGE = '#d97706';
export const CHAT_GREEN = '#008026';

/** Tab status-line colors (see ChatControls.tsx) — On/Filtered/Off. */
export const TAB_STATE_COLORS = {
  on: '#00ff00',
  filtered: '#ffff00',
  off: '#ff3333',
} as const;
