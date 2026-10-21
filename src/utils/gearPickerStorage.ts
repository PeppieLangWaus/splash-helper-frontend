/** Persists the gear picker's in-progress loadout (the `/gear` editor, not a shared/read-only
 *  view) so it survives a page refresh. */

import { INVENTORY_SLOT_COUNT, emptyInventory } from '../types/gear';
import type { GearInventory, GearLoadoutSlots } from '../types/gear';

const DRAFT_KEY = 'gear:draft';

export interface GearPickerDraft {
  slots: GearLoadoutSlots;
  /** Local to this draft — not part of what Save/Share sends to the backend. */
  inventory: GearInventory;
  loadoutName: string;
  /** The slug of a saved loadout this draft matches, if any — kept so "Update saved loadout"
   *  still shows after a refresh instead of reverting to "Save loadout". */
  savedSlug: string | null;
}

const EMPTY_DRAFT: GearPickerDraft = { slots: {}, inventory: emptyInventory(), loadoutName: '', savedSlug: null };

function parseInventory(raw: unknown): GearInventory {
  if (!Array.isArray(raw) || raw.length !== INVENTORY_SLOT_COUNT) return emptyInventory();
  return raw.map((itemId) => (Number.isInteger(itemId) && itemId > 0 ? (itemId as number) : null));
}

export function loadGearPickerDraft(): GearPickerDraft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return { ...EMPTY_DRAFT, inventory: emptyInventory() };
    const parsed = JSON.parse(raw) as Partial<GearPickerDraft>;
    return {
      slots: parsed.slots ?? {},
      inventory: parseInventory(parsed.inventory),
      loadoutName: parsed.loadoutName ?? '',
      savedSlug: parsed.savedSlug ?? null,
    };
  } catch {
    return { ...EMPTY_DRAFT, inventory: emptyInventory() };
  }
}

export function saveGearPickerDraft(draft: GearPickerDraft): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Storage unavailable — the draft just won't survive a reload.
  }
}
