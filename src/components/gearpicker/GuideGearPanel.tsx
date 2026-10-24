import GearLoadoutGuideCard from './GearLoadoutGuideCard';
import GearInventoryGuideCard from './GearInventoryGuideCard';
import type { GuideInventoryItem } from './GearInventoryGuideCard';

type Props =
  | {
      mode: 'equipment';

      slug: string;
    }
  | {
      mode: 'inventory';

      items: ReadonlyArray<GuideInventoryItem | null>;
    };

export default function GuideGearPanel(props: Props) {
  if (props.mode === 'equipment') return <GearLoadoutGuideCard slug={props.slug} />;
  return <GearInventoryGuideCard items={props.items} />;
}
