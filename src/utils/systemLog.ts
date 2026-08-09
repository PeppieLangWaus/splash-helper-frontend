import type { ChatMessage } from '../types/chatbox';
import { CHAT_BLUE } from '../components/chatbox/chatColors';
import { PRIVATE_KEY, appendStoredMessage, publishStoredMessage } from './chatStorage';

let seq = 0;

/** Appends one line to the Private tab's local action log — "should only be shown to the player
 *  and run locally in the frontend" (point 7.5). Call this from any frontend action worth
 *  surfacing there (account settings changes, community creation, chat-config saves, ...).
 *  Callers are expected to only invoke this from code paths already behind a logged-in check —
 *  there's no separate auth gate here since the log is purely local either way. */
export function logSystemEvent(text: string): void {
  const message: ChatMessage = {
    id: `system-${Date.now()}-${seq++}`,
    timestamp: Date.now(),
    kind: 'private',
    message: text,
    icon: '/assets/chatbox/icons/info/info.png',
    prefix: { text: '[System]', color: CHAT_BLUE },
  };
  appendStoredMessage(PRIVATE_KEY, message);
  publishStoredMessage(PRIVATE_KEY, message);
}
