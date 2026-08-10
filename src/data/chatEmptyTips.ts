/** Shown (a few at random) in place of the chat log whenever the currently-filtered view has no
 *  messages yet — see ChatLog.tsx. Purely decorative: never persisted, never counted toward any
 *  feed's message limit. Kept under 200 characters each to match OSRS's own chat message cap. */
const chatEmptyTips: string[] = [
  'Nothing here yet. Try All to see every feed at once, or pick another tab.',
  'Right-click Channel or Clan to watch a community\'s live Friends Chat or Clan Chat.',
  'The Game tab posts an info tip like this one every so often - toggle its status to filter it out of All.',
  'The Public tab announces splash sessions starting across the whole site.',
  'Log in to use the Private and Trade tabs - they keep a local log just for you.',
  'Your chat history lives on this device only - nothing here is sent to our servers.',
  'Toggle a tab\'s status line between On, Filtered, and Off to control what shows up in All.',
];

export default chatEmptyTips;
