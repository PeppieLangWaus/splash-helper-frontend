import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import OSRSPanel from '../osrs/OSRSPanel';
import EquipmentDisplay from './EquipmentDisplay';
import GearLoadoutCost from './GearLoadoutCost';
import PixelText from '../PixelText';
import { fetchEquipmentData, fetchGearLoadout } from '../../api';
import { PANEL_ASSETS_STONE } from './gearpickerAssets';
import { colors } from '../../theme';
import type { EquipmentItem, GearLoadoutSlots } from '../../types/gear';
import './gearpicker.css';

interface Props {
  /** Share slug of a saved or anonymously-shared loadout — the same slug GearPickerView's
   *  /gear/:slug route reads (see api/index.ts's fetchGearLoadout). Create one for a guide's
   *  setup the same way a user would: build it in the gear picker and hit Share (or Save, if it
   *  should stay editable afterward). */
  slug: string;
}

/**
 * A read-only "here's the gear" card for embedding a specific loadout in written guide content —
 * the same equipment side panel as the interactive gear picker, except the loadout's name links
 * to its /gear/:slug page instead of a Clear button, and the GE cost shown is a one-time snapshot
 * from when the card mounted, not kept live afterward.
 * Fully self-contained: given a slug, it fetches the loadout and equipment dataset itself, so it
 * drops into any page without assuming GearPickerView is mounted nearby.
 */
export default function GearLoadoutGuideCard({ slug }: Props) {
  const [name, setName] = useState<string | undefined>(undefined);
  const [slots, setSlots] = useState<GearLoadoutSlots | null>(null);
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchGearLoadout(slug), fetchEquipmentData()])
      .then(([loadout, equipment]) => {
        if (cancelled) return;
        setName(loadout.name);
        setSlots(loadout.slots);
        setItems(equipment.items);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load setup');
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const itemsById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);

  let body: ReactNode;
  if (error) {
    body = (
      <p className="gear-loadout-card__status">
        <PixelText text={error} fontSize={13.6} color={colors.dangerText} />
      </p>
    );
  } else if (!slots) {
    body = (
      <p className="gear-loadout-card__status">
        <PixelText text="Loading…" fontSize={13.6} color={colors.textMuted} />
      </p>
    );
  } else {
    body = (
      <div className="gear-picker-equipment-col">
        <a className="gear-loadout-card__name" href={`/gear/${encodeURIComponent(slug)}`}>
          <PixelText text={name || 'View this setup'} fontSize={20} color={colors.accentText} bold />
        </a>
        <EquipmentDisplay slots={slots} itemsById={itemsById} />
        <GearLoadoutCost slots={slots} />
      </div>
    );
  }

  return <OSRSPanel assets={PANEL_ASSETS_STONE} borderType="stone" type="side" width={200} content={body} />;
}
