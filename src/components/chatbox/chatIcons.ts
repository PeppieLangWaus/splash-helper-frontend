import type { ChatRank, IronmanStatus, LiveChatChannelType, ModStatus } from '../../types/chatbox';

export const MOD_STATUS_ICONS: Record<ModStatus, string> = {
  pmod: '/assets/chatbox/icons/mod/pmod.png',
  jmod: '/assets/chatbox/icons/mod/jmod.png',
};

export const IRONMAN_STATUS_ICONS: Record<IronmanStatus, string> = {
  im: '/assets/chatbox/icons/ironman/im.png',
  hcim: '/assets/chatbox/icons/ironman/hcim.png',
  uim: '/assets/chatbox/icons/ironman/uim.png',
  gim: '/assets/chatbox/icons/ironman/gim.png',
  hcgim: '/assets/chatbox/icons/ironman/hcgim.png',
  ugim: '/assets/chatbox/icons/ironman/ugim.png',
};

export const RANK_ICONS: Record<ChatRank, string> = {
  owner: '/assets/chatbox/icons/rank/owner.png',
  general: '/assets/chatbox/icons/rank/general.png',
  captain: '/assets/chatbox/icons/rank/captain.png',
  lieutenant: '/assets/chatbox/icons/rank/lieutenant.png',
  sergeant: '/assets/chatbox/icons/rank/sergeant.png',
  corporal: '/assets/chatbox/icons/rank/corporal.png',
  recruit: '/assets/chatbox/icons/rank/recruit.png',
  smiley: '/assets/chatbox/icons/rank/smiley.png',
};

// ── Numeric rank attribute → icon ──────────────────────────────────────────────
//
// The relay's chat events carry a Friends/Clan Chat rank as the raw numeric value RuneLite
// assigns it (see FriendsChatRank / ClanRank in the RuneLite API), not a ChatRank string. These
// tables translate that number to an icon path for each channel type.

/** RuneLite's `FriendsChatRank` (runelite-api/.../FriendsChatRank.java), by numeric value:
 *  -1 UNRANKED, 0 FRIEND, 1 RECRUIT, 2 CORPORAL, 3 SERGEANT, 4 LIEUTENANT, 5 CAPTAIN,
 *  6 GENERAL, 7 OWNER, 127 JMOD. UNRANKED has no icon — same as an unset `rank`. JMOD has no
 *  dedicated Friends Chat rank icon, so it reuses the existing Jmod crown from MOD_STATUS_ICONS. */
export const FC_RANK_ICONS: Record<number, string> = {
  0: RANK_ICONS.smiley,
  1: RANK_ICONS.recruit,
  2: RANK_ICONS.corporal,
  3: RANK_ICONS.sergeant,
  4: RANK_ICONS.lieutenant,
  5: RANK_ICONS.captain,
  6: RANK_ICONS.general,
  7: RANK_ICONS.owner,
  127: MOD_STATUS_ICONS.jmod,
};

/** RuneLite's `ClanRank` (runelite-api/.../clan/ClanRank.java) only fixes 5 sentinel ranks by
 *  number: -1 GUEST, 100 ADMINISTRATOR, 125 DEPUTY_OWNER, 126 OWNER, 127 JMOD. The other ~94 clan
 *  ranks (1-99) are per-clan configurable titles with no fixed name, so only OWNER — the one
 *  value whose name matches an existing icon — is mapped; the rest render no icon. */
export const CC_RANK_ICONS: Record<number, string> = {
  126: RANK_ICONS.owner,
};

/** Resolves a channel's raw numeric rank attribute to an icon path, or undefined if that value
 *  has no mapped icon (see FC_RANK_ICONS / CC_RANK_ICONS for why). */
export function getRankIcon(channelType: LiveChatChannelType, rank: number): string | undefined {
  return channelType === 'fc' ? FC_RANK_ICONS[rank] : CC_RANK_ICONS[rank];
}
