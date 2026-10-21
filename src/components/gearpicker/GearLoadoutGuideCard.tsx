import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import OSRSPanel from '../osrs/OSRSPanel';
import EquipmentDisplay from './EquipmentDisplay';
import PixelText from '../PixelText';
import { fetchEquipmentData, fetchGearLoadout } from '../../api';
import { PANEL_ASSETS_STONE } from './gearpickerAssets';
import { colors } from '../../theme';
import type { EquipmentItem, GearLoadoutSlots } from '../../types/gear';
import './Gearpicker.css';

interface Props {

  slug: string;
}

export default function GearLoadoutGuideCard({ slug }: Props) {
  const [slots, setSlots] = useState<GearLoadoutSlots | null>(null);
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchGearLoadout(slug), fetchEquipmentData()])
      .then(([loadout, equipment]) => {
        if (cancelled) return;
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
        <EquipmentDisplay slots={slots} itemsById={itemsById} />
      </div>
    );
  }

  return <OSRSPanel assets={PANEL_ASSETS_STONE} borderType="stone" type="side" width={240} content={body} />;
}
