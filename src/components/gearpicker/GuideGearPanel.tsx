import GearLoadoutGuideCard from './GearLoadoutGuideCard';
import GearInventoryGuideCard from './GearInventoryGuideCard';
import type { GuideInventoryItem } from './GearInventoryGuideCard';

type Props =
  | {
      mode: 'equipment';
      /** Share slug of the loadout to show — see GearLoadoutGuideCard. */
      slug: string;
    }
  | {
      mode: 'inventory';
      /** Inventory contents in slot order — see GearInventoryGuideCard. */
      items: ReadonlyArray<GuideInventoryItem | null>;
      title?: string;
    };

/**
 * The one component guide content needs for gear: a read-only equipment panel (`mode="equipment"`,
 * loaded from a shared loadout) or a read-only inventory panel (`mode="inventory"`, with its
 * contents configured inline).
 */
export default function GuideGearPanel(props: Props) {
  if (props.mode === 'equipment') return <GearLoadoutGuideCard slug={props.slug} />;
  return <GearInventoryGuideCard items={props.items} title={props.title} />;
}
