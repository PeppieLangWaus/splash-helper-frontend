/** Persists the gear picker's in-progress loadout (the `/gear` editor, not a shared/read-only
 *  view) so it survives a page refresh. */

import type { GearLoadoutSlots } from '../types/gear';

const DRAFT_KEY = 'gear:draft';

export interface GearPickerDraft {
  slots: GearLoadoutSlots;
  loadoutName: string;
  /** The slug of a saved loadout this draft matches, if any — kept so "Update saved loadout"
   *  still shows after a refresh instead of reverting to "Save loadout". */
  savedSlug: string | null;
}

const EMPTY_DRAFT: GearPickerDraft = { slots: {}, loadoutName: '', savedSlug: null };

export function loadGearPickerDraft(): GearPickerDraft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return { ...EMPTY_DRAFT };
    const parsed = JSON.parse(raw) as Partial<GearPickerDraft>;
    return {
      slots: parsed.slots ?? {},
      loadoutName: parsed.loadoutName ?? '',
      savedSlug: parsed.savedSlug ?? null,
    };
  } catch {
    return { ...EMPTY_DRAFT };
  }
}

export function saveGearPickerDraft(draft: GearPickerDraft): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Storage unavailable — the draft just won't survive a reload.
  }
}
