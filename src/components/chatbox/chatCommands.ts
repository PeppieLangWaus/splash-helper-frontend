import type { ChatChannel, ChatMessage, ChatTabStates } from '../../types/chatbox';
import { TAB_STATE_LABEL, nextTabState } from './chatFilter';
import { navigateToPath } from '../../utils/appNavigation';
import { loadChatSettings, setTimestampsEnabled } from '../../utils/chatSettings';
import {
  CC_KEY_PREFIX,
  FC_KEY_PREFIX,
  INFO_KEY,
  PRIVATE_KEY,
  PUBLIC_KEY,
  SYSTEM_KEY,
  TRADE_KEY,
  appendStoredMessage,
  clearStoredMessages,
  clearStoredMessagesByPrefix,
  publishStoredMessage,
} from '../../utils/chatStorage';

/** The chatbox's input row (see Chatbox.tsx) is a command console, not a real chat — nothing
 *  typed there is ever broadcast anywhere. Every line is parsed as a `::command` and answered
 *  with a "System"-prefixed reply on the Game tab (kind 'system' — see types/chatbox.ts); text
 *  that isn't a recognized command just gets told so. */

let seq = 0;

function emitSystemMessage(text: string): void {
  const message: ChatMessage = {
    id: `system-${Date.now()}-${seq++}`,
    timestamp: Date.now(),
    kind: 'system',
    message: text,
    icon: '/assets/chatbox/icons/info/info.png',
    prefix: { text: 'System' },
  };
  appendStoredMessage(SYSTEM_KEY, message);
  publishStoredMessage(SYSTEM_KEY, message);
}

const NOT_RECOGNIZED = (label: string) =>
  `"${label}" is not a recognized command. Type ::commands for a list of commands.`;

// ── ::open — pages reachable via the chat console. Paths must match App.tsx's own
// viewToPath/pathToView routing table. ─────────────────────────────────────────────────────────
const MENU_PATHS: Record<string, string> = {
  active: '/',
  home: '/',
  account: '/account',
  settings: '/account',
  communities: '/communities',
  community: '/communities',
  admin: '/admin',
  bot: '/bot',
  discord: '/bot',
  dev: '/dev',
};

function handleOpen(args: string[]): void {
  if (args.length === 0) {
    emitSystemMessage('Usage: ::open <menu item>. Try ::commands for the list.');
    return;
  }
  const item = args[0].toLowerCase();
  const path = MENU_PATHS[item];
  if (!path) {
    emitSystemMessage(`Unknown page "${args[0]}". Try one of: account, communities, admin, bot, dev, active.`);
    return;
  }
  navigateToPath(path);
  emitSystemMessage(`Opening ${args[0]}...`);
}

// ── ::settings — currently just the one viewer preference (chat line timestamps). Designed to
// grow: add another branch to `describeSetting`/`applySetting` for a new setting name. ─────────
const SETTING_ALIASES = ['timestamp', 'timestamps'];

function describeSetting(name: string): string | null {
  if (!SETTING_ALIASES.includes(name)) return null;
  return `timestamp is currently ${loadChatSettings().timestamps ? 'on' : 'off'}.`;
}

function applySetting(name: string, value: string): string | null {
  if (!SETTING_ALIASES.includes(name)) return null;
  const normalized = value.toLowerCase();
  if (normalized !== 'on' && normalized !== 'off') {
    return `Invalid value "${value}" for timestamp. Use "on" or "off".`;
  }
  setTimestampsEnabled(normalized === 'on');
  return `timestamp set to ${normalized}.`;
}

function handleSettings(args: string[]): void {
  if (args.length === 0) {
    navigateToPath('/account');
    emitSystemMessage('Opening Account Settings...');
    return;
  }

  const name = args[0].toLowerCase();
  if (!SETTING_ALIASES.includes(name)) {
    emitSystemMessage(`Unknown setting "${args[0]}". Available settings: timestamp.`);
    return;
  }

  if (args.length === 1) {
    emitSystemMessage(describeSetting(name)!);
    return;
  }

  emitSystemMessage(applySetting(name, args[1])!);
}

// ── ::clear — chat tab -> which stored feed(s) it maps to. "info"/"system" split the Game tab's
// two separate feeds (periodic tips vs. this console's own replies — see chatFilter.ts's
// KIND_TO_TAB); "friends"/"fc" and "clan"/"cc" are the in-game names for the Channel/Clan tabs. */
const CLEAR_TARGETS: Record<string, () => void> = {
  game: () => { clearStoredMessages(INFO_KEY); clearStoredMessages(SYSTEM_KEY); },
  info: () => clearStoredMessages(INFO_KEY),
  system: () => clearStoredMessages(SYSTEM_KEY),
  public: () => clearStoredMessages(PUBLIC_KEY),
  private: () => clearStoredMessages(PRIVATE_KEY),
  trade: () => clearStoredMessages(TRADE_KEY),
  channel: () => clearStoredMessagesByPrefix(FC_KEY_PREFIX),
  friends: () => clearStoredMessagesByPrefix(FC_KEY_PREFIX),
  fc: () => clearStoredMessagesByPrefix(FC_KEY_PREFIX),
  clan: () => clearStoredMessagesByPrefix(CC_KEY_PREFIX),
  cc: () => clearStoredMessagesByPrefix(CC_KEY_PREFIX),
};

function handleClear(args: string[]): void {
  if (args.length === 0) {
    clearStoredMessages(INFO_KEY);
    clearStoredMessages(PUBLIC_KEY);
    clearStoredMessages(PRIVATE_KEY);
    clearStoredMessages(TRADE_KEY);
    clearStoredMessagesByPrefix(FC_KEY_PREFIX);
    clearStoredMessagesByPrefix(CC_KEY_PREFIX);
    clearStoredMessages(SYSTEM_KEY); // last: this reply itself lands back in the feed just wiped
    emitSystemMessage('Cleared all chat history.');
    return;
  }

  const target = args[0].toLowerCase();
  const clear = CLEAR_TARGETS[target];
  if (!clear) {
    emitSystemMessage(`Unknown chat tab "${args[0]}". Try one of: game, info, system, public, private, channel, clan, trade.`);
    return;
  }
  clear();
  emitSystemMessage(`Cleared ${args[0]} chat history.`);
}

// ── ::toggle — cycles a tab's own On/Filtered/Off status line, same as clicking it directly
// (see ChatControls.tsx / chatFilter.ts's nextTabState). "friends"/"fc"/"cc" alias the tabs'
// in-game names, same as ::clear above. "all" is excluded — it has no status line of its own. */
const TAB_ALIASES: Record<string, ChatChannel> = {
  game: 'game',
  public: 'public',
  private: 'private',
  channel: 'channel',
  friends: 'channel',
  fc: 'channel',
  clan: 'clan',
  cc: 'clan',
  trade: 'trade',
};

function handleToggle(args: string[], tabStates: ChatTabStates, toggleTabState: (tab: ChatChannel) => void): void {
  if (args.length === 0) {
    emitSystemMessage('Usage: ::toggle <chat tab>.');
    return;
  }
  const arg = args[0].toLowerCase();
  const tab = TAB_ALIASES[arg];
  if (!tab) {
    emitSystemMessage(`Unknown chat tab "${args[0]}". Try one of: game, public, private, channel, clan, trade.`);
    return;
  }
  toggleTabState(tab);
  const next = nextTabState(tab, tabStates[tab]);
  emitSystemMessage(`${args[0]} set to ${TAB_STATE_LABEL[next]}.`);
}

// ── ::commands ───────────────────────────────────────────────────────────────────────────────
const COMMAND_HELP = [
  'Available commands:',
  '::settings [setting] [value] - view/change a setting, or open Account Settings with no args (e.g. ::settings timestamp off)',
  '::open <menu item> - open a page (e.g. ::open account)',
  '::clear [chat tab] - clear all chat history, or just one tab (e.g. ::clear trade)',
  '::toggle <chat tab> - cycle a tab\'s On/Filtered/Off status (e.g. ::toggle game)',
];

export interface ChatCommandContext {
  tabStates: ChatTabStates;
  toggleTabState: (tab: ChatChannel) => void;
}

/** Parses and executes one line typed into the chatbox's input row — see Chatbox.tsx. Every
 *  outcome (success, usage error, or "not a command" fallback) is answered with its own System
 *  reply; this never throws and never returns anything for the caller to handle. */
export function runChatCommand(rawInput: string, ctx: ChatCommandContext): void {
  const trimmed = rawInput.trim();
  if (!trimmed) return;

  if (!trimmed.startsWith('::')) {
    emitSystemMessage(NOT_RECOGNIZED(trimmed));
    return;
  }

  const tokens = trimmed.slice(2).trim().split(/\s+/).filter(Boolean);
  const name = (tokens[0] ?? '').toLowerCase();
  const args = tokens.slice(1);

  switch (name) {
    case 'commands':
      COMMAND_HELP.forEach(emitSystemMessage);
      return;
    case 'settings':
      handleSettings(args);
      return;
    case 'open':
      handleOpen(args);
      return;
    case 'clear':
      handleClear(args);
      return;
    case 'toggle':
      handleToggle(args, ctx.tabStates, ctx.toggleTabState);
      return;
    default:
      emitSystemMessage(NOT_RECOGNIZED(`::${name}`));
  }
}
