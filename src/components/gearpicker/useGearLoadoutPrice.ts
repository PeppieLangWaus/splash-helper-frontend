import { useEffect, useRef, useState } from 'react';
import { fetchItemPrices } from '../../api';
import type { GearLoadoutSlots } from '../../types/gear';

export interface GearLoadoutPrice {
  /** Sum of every equipped item's known GE price. Items with no price yet (still loading, or the
   *  backend has none for them — untradeable/no trade data) are simply left out of the sum. */
  total: number;
  /** True while at least one currently-equipped item's price hasn't come back yet. */
  loading: boolean;
  /** True if any currently-equipped item has no GE price at all (so `total` is a partial sum,
   *  not the full loadout's cost). */
  hasUnpriced: boolean;
}

/**
 * Tracks the combined GE price of whatever's currently equipped in `slots`. Only ever requests a
 * given item id's price the first time it shows up equipped in a slot — never for the full
 * equipment dataset — and remembers it for the life of the component, so switching a slot back
 * and forth doesn't re-fetch.
 */
export function useGearLoadoutPrice(slots: GearLoadoutSlots): GearLoadoutPrice {
  const [prices, setPrices] = useState<Record<number, number | null>>({});
  // Ids already requested (or in flight) — separate from `prices`'s keys so a failed lookup
  // doesn't get retried on every render, only on the next time that id is (re-)equipped.
  const requested = useRef(new Set<number>());

  const equippedIds = Object.values(slots).filter((id): id is number => id !== undefined);

  useEffect(() => {
    const missing = equippedIds.filter((id) => !requested.current.has(id));
    if (missing.length === 0) return;
    missing.forEach((id) => requested.current.add(id));

    fetchItemPrices(missing)
      .then((fetched) => setPrices((prev) => ({ ...prev, ...fetched })))
      .catch(() => {
        // Best-effort — a price lookup failing shouldn't break the picker. Drop these from
        // `requested` so equipping/re-rendering gives them another chance later.
        missing.forEach((id) => requested.current.delete(id));
      });
    // Only the equipped item ids matter here, not slot identity or array reference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equippedIds.join(',')]);

  let total = 0;
  let loading = false;
  let hasUnpriced = false;
  for (const id of equippedIds) {
    const price = prices[id];
    if (price === undefined) {
      loading = true;
    } else if (price === null) {
      hasUnpriced = true;
    } else {
      total += price;
    }
  }

  return { total, loading, hasUnpriced };
}
