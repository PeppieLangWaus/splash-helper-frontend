/** Pool the Game tab's periodic info messages are drawn from (see hooks/useInfoMessages.ts) —
 *  one is shown roughly every 10 minutes, never repeating the one shown right before it. Kept
 *  under 200 characters each to match OSRS's own chat message length cap. */
const chatInfoMessages: string[] = [
  'Click a tab along the bottom to filter the chat log down to just that source.',
  "The All tab shows everything whose status line is set to On - toggle a tab's status to leave it out.",
  'Right-click Channel or Clan to pick a community\'s live Friends Chat or Clan Chat to watch.',
  'Picking a chat from the right-click menu sets that tab to Filtered automatically.',
  'Community owners can set a Friends Chat display name in their community settings.',
  'Log in and visit Account Settings to change how many messages each feed keeps.',
  'The Public tab announces splash sessions as they start, site-wide.',
  'The Private tab keeps a local log of account actions - only you can see it, and only while logged in.',
  'The Trade tab is for your balance, income, and payouts - log in to use it.',
  'Use the Report button if you spot someone breaking the rules in a live chat feed.',
  'The Game tab is where these info messages themselves show up.',
  'A community can register both a Friends Chat and a Clan Chat for the same relay.',
  'Paste the relay URL into the Discord Chat Logger plugin to feed a community\'s live chat.',
  'Each community can post its Friends Chat and Clan Chat to two separate Discord webhooks.',
  'Keep an eye on your rune supply - running out mid-session ends your splash early.',
  'Export your archived sessions from Account Settings any time as a JSON backup.',
];

export default chatInfoMessages;
