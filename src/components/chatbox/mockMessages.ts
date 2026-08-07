import type { ChatMessage } from '../../types/chatbox';

/** Placeholder chat history for visual development — will be replaced by live OSRS chat data. */
const now = Date.now();
const mockMessages: ChatMessage[] = [
  { id: '1', timestamp: now - 9 * 60000, username: 'Zezima', message: 'anyone selling nats?', rank: 'recruit' },
  { id: '2', timestamp: now - 8 * 60000, username: 'Woox', message: 'gz on the pet!', ironmanStatus: 'hcim' },
  { id: '3', timestamp: now - 7 * 60000, username: 'Mod Ash', message: 'reminder: be nice to each other', modStatus: 'jmod' },
  { id: '4', timestamp: now - 6 * 60000, username: 'B0aty', message: 'splashing at ardougne w340', rank: 'sergeant' },
  { id: '5', timestamp: now - 5 * 60000, username: 'Framed', message: 'uim gang where you at', ironmanStatus: 'uim' },
  { id: '6', timestamp: now - 4 * 60000, username: 'SoloMission', message: 'anyone know a good world for splashing?', rank: 'corporal' },
  { id: '7', timestamp: now - 3 * 60000, username: 'Torvesta', message: 'gim group looking for a mage', ironmanStatus: 'gim', rank: 'lieutenant' },
  { id: '8', timestamp: now - 2 * 60000, username: 'Odablock', message: 'nice xp rates today', rank: 'captain' },
  { id: '9', timestamp: now - 1 * 60000, username: 'Mod Mat K', message: "we're aware of the issue, working on a fix", modStatus: 'pmod' },
  { id: '10', timestamp: now, username: 'PkQueen', message: 'gl to everyone splashing tonight', rank: 'owner' },
];

export default mockMessages;
