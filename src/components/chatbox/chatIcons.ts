import type { ChatRank, IronmanStatus, ModStatus } from '../../types/chatbox';

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
