import { useEffect, useRef, useState } from 'react';
import { fetchItemPrices } from '../../api';
import type { GearLoadoutSlots } from '../../types/gear';

export interface GearLoadoutPrice {

  total: number;

  loading: boolean;

  hasUnpriced: boolean;
}

export function useGearLoadoutPrice(slots: GearLoadoutSlots): GearLoadoutPrice {
  const [prices, setPrices] = useState<Record<number, number | null>>({});

  const requested = useRef(new Set<number>());

  const equippedIds = Object.values(slots).filter((id): id is number => id !== undefined);

  useEffect(() => {
    const missing = equippedIds.filter((id) => !requested.current.has(id));
    if (missing.length === 0) return;
    missing.forEach((id) => requested.current.add(id));

    fetchItemPrices(missing)
      .then((fetched) => setPrices((prev) => ({ ...prev, ...fetched })))
      .catch(() => {
        missing.forEach((id) => requested.current.delete(id));
      });
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
