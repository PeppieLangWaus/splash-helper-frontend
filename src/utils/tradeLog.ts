import type { ChatMessage } from '../types/chatbox';
import { TRADE_KEY, appendStoredMessage, publishStoredMessage } from './chatStorage';

let seq = 0;

/** Appends one line to the Trade tab's local income/payout/balance log (point 7.7) — same local-
 *  only mechanism as logSystemEvent (utils/systemLog.ts). No automatic call sites yet: income
 *  gained on session archive and payout amounts currently happen server-side (plugin sync,
 *  Discord-bot `/bank` and `/income`) with no existing frontend-visible trigger to call this
 *  from — wiring that up would need a new backend broadcast to the logged-in user's browser,
 *  which is out of scope here. This is ready for whoever adds that broadcast, or a future
 *  frontend action that itself knows a gp amount (e.g. a payout screen). */
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
