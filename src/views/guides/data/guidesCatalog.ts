/** Single source of truth for every `/guides/*` page's title/description/meta line, so the
 *  guides hub (GuidesView) and any inline `<GuideButtons>` (see GuideButton.tsx) render the
 *  exact same guide info instead of hand-duplicating copy in two places. */

export type Guide = {
  href: string;
  title: string;
  desc: string;
  meta: string;
};

export type Guides = {
  pickpocket: Guide[];
  pickpocketSetup: Guide[];
  knightSetup: Guide[];
  other: Guide[];
}

export const pickpocket: Guide[] = [
  {
    href: '/guides/pickpocketing',
    title: 'How to pickpocket a splashed Knight of Ardougne',
    desc: 'Just want to train Thieving? Here is what you need, why it’s a good method, and how to find a live splash world right now.',
    meta: 'Player guide · no setup required',
  },
];

export const pickpocketSetup: Guide[] = [
  {
    href: '/guides/optimal-setup',
    title: 'Optimal pickpocketing setup',
    desc: 'The gear and unlock order for maximizing success chance and GP/hour — Rogues\' equipment, Ardougne Diary 2, Shadow Veil, and more.',
    meta: 'Setup guide · long-term grind',
  },
  {
    href: '/guides/mobile-setup',
    title: 'Mobile pickpocketing setup',
    desc: 'Pickpocketing a splashed knight from OSRS Mobile — finding a world, tap technique, and keeping your screen awake.',
    meta: 'Setup guide · OSRS Mobile',
  },
];

export const knightSetup: Guide[] = [
  {
    href: '/guides/normal-knight-setup',
    title: 'Normal knight setup',
    desc: 'How to find a Knight of Ardougne patrol point near the bank, aggro it against an obstacle',
    meta: 'Setup guide · Needs an alt account',
  },
  {
    href: '/guides/sticky-knight-setup',
    title: 'Sticky knight setup',
    desc: 'The advanced Entangle + dragon spear method for trapping a knight that moves much less.',
    meta: 'Setup guide · needs an alt account',
  },
  {
    href: '/guides/solo-setup',
    title: 'Solo pickpocketing setup',
    desc: 'The lowest-effort path: minimal gear, no group needed, just a stable world and a check-in reminder.',
    meta: 'Setup guide · no group required',
  },
];

export const other: Guide[] = [
  {
    href: '/guides/splash-helper-plugin',
    title: 'Installing and configuring the Splash Helper plugin',
    desc: 'Install the RuneLite plugin, set up the combat idle timer and notifications, and use its built-in interactive sticky-knight setup guide.',
    meta: 'Plugin guide',
  },
  {
    href: '/guides/chat-commands',
    title: 'Chat commands reference',
    desc: 'Every chatbox console command (::commands, ::open, ::clear, ::toggle…) plus the !log and !pets in-game commands the chatbox resolves for you.',
    meta: 'Reference',
  },
];

/** Every guide, grouped the same way the guides hub groups them. */
export const guides: Guides = {
  pickpocket: [...pickpocket],
  pickpocketSetup: [...pickpocketSetup],
  knightSetup: [...knightSetup],
  other: [...other],
};
