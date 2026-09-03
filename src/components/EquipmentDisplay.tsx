import { itemIconUrl } from './chatbox/itemIcons';
import { colors } from '../theme';
import type { EquipmentItem, EquipmentSlot, GearLoadoutSlots } from '../types/gear';
import { EQUIPMENT_SLOT_LABELS, EQUIPMENT_SLOT_ORDER } from '../types/gear';

const s = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
    gap: '0.5rem',
  },
  slot: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.5rem',
    background: colors.inputBg,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
  },
  slotButton: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.5rem',
    background: colors.inputBg,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
  },
  slotDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  slotLabel: { fontSize: '0.68rem', color: colors.textFaint, textTransform: 'uppercase' as const, letterSpacing: '0.03em' },
  itemBox: { width: 36, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  itemImg: { maxWidth: '100%', maxHeight: '100%', imageRendering: 'pixelated' as const },
  emptyBox: { width: 36, height: 32, border: `1px dashed ${colors.border}`, borderRadius: 4 },
  itemName: { fontSize: '0.68rem', color: colors.textMuted, textAlign: 'center' as const, lineHeight: 1.1 },
} as const;

interface Props {
  slots: GearLoadoutSlots;
  itemsById: Map<number, EquipmentItem>;
  /** If provided, each slot becomes a clickable button (the interactive picker case); omit for
   *  a purely read-only display. */
  onSlotClick?: (slot: EquipmentSlot) => void;
  /** Slots that can't be interacted with right now (e.g. shield while a two-handed weapon is
   *  equipped) — still shown, just not clickable, and visually muted. */
  disabledSlots?: ReadonlySet<EquipmentSlot>;
}

/**
 * Renders the 11-slot equipment grid, read-only. This is the shared visual core used both for
 * the "just show the gear" display mode and (via EquipmentSlotGrid, which adds click handling
 * and the two-handed-weapon shield rule) the interactive picker.
 *
 * NOTE: layout/icon styling here is a functional placeholder — the user is providing OSRS-styled
 * assets and build instructions for this grid separately; this should be revisited once those
 * arrive rather than treated as the final look.
 */
export default function EquipmentDisplay({ slots, itemsById, onSlotClick, disabledSlots }: Props) {
  return (
    <div style={s.grid}>
      {EQUIPMENT_SLOT_ORDER.map((slot) => {
        const itemId = slots[slot];
        const item = itemId ? itemsById.get(itemId) : undefined;
        const disabled = disabledSlots?.has(slot) ?? false;
        const content = (
          <>
            <div style={s.itemBox}>
              {item ? (
                <img src={itemIconUrl(item.id)} alt={item.name} title={item.name} style={s.itemImg} />
              ) : (
                <div style={s.emptyBox} />
              )}
            </div>
            <span style={s.slotLabel}>{EQUIPMENT_SLOT_LABELS[slot]}</span>
            {item && <span style={s.itemName}>{item.name}</span>}
          </>
        );

        if (!onSlotClick) {
          return (
            <div key={slot} style={s.slot}>
              {content}
            </div>
          );
        }

        return (
          <button
            key={slot}
            type="button"
            style={{ ...s.slotButton, ...(disabled ? s.slotDisabled : {}) }}
            onClick={() => !disabled && onSlotClick(slot)}
            disabled={disabled}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
