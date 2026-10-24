import type { ChatMessage } from '../types/chatbox';
import { PRIVATE_KEY, appendStoredMessage, publishStoredMessage } from './chatStorage';

let seq = 0;

export function logSystemEvent(text: string): ChatMessage {
  const message: ChatMessage = {
    id: `system-${Date.now()}-${seq++}`,
    timestamp: Date.now(),
    kind: 'private',
    message: text,
    icon: '/assets/chatbox/icons/info/info.png',
    prefix: { text: 'System' },
  };
  appendStoredMessage(PRIVATE_KEY, message);
  publishStoredMessage(PRIVATE_KEY, message);
  return message;
}
