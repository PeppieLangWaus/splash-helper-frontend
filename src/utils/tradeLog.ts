import type { ChatMessage } from '../types/chatbox';
import { TRADE_KEY, appendStoredMessage, publishStoredMessage } from './chatStorage';

let seq = 0;

export function logTradeEvent(text: string): void {
  const message: ChatMessage = {
    id: `trade-${Date.now()}-${seq++}`,
    timestamp: Date.now(),
    kind: 'trade',
    message: text,
    icon: '/assets/chatbox/icons/info/bond.png',
  };
  appendStoredMessage(TRADE_KEY, message);
  publishStoredMessage(TRADE_KEY, message);
}
