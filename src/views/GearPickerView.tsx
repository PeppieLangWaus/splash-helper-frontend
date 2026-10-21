import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import OSRSPanel from '../components/osrs/OSRSPanel';
import EquipmentDisplay from '../components/gearpicker/EquipmentDisplay';
import EquipmentSlotGrid from '../components/gearpicker/EquipmentSlotGrid';
import InventoryGrid from '../components/gearpicker/InventoryGrid';
import { EQUIPMENT_COL_GAP, INVENTORY_EXTRA_HEIGHT, TOOLBAR_BUTTON_SIZE } from '../components/gearpicker/gearGridLayout';
import ContextMenu from '../components/gearpicker/ContextMenu';
import type { ContextMenuOption } from '../components/gearpicker/ContextMenu';
import ItemPickerPanel from '../components/gearpicker/ItemPickerPanel';
import GearLoadoutCost from '../components/gearpicker/GearLoadoutCost';
import BonusSummaryPanel from '../components/gearpicker/BonusSummaryPanel';
import SplashSafetyIndicator from '../components/gearpicker/SplashSafetyIndicator';
import CopyableField from '../components/CopyableField';
import PixelText from '../components/PixelText';
import { colors } from '../theme';
import {
  deleteGearLoadout,
  fetchEquipmentData,
  fetchGearLoadout,
  fetchItemList,
  saveGearLoadout,
  shareGearLoadout,
  updateGearLoadout,
} from '../api';
import OSRSSquareButton from '../components/osrs/OSRSSquareButton';
import { computeTotalBonuses } from '../components/gearpicker/gearBonuses';
import type { TotalBonuses } from '../components/gearpicker/gearBonuses';
import {
  CLEAR_EQUIPMENT_ICON,
  CONNECTOR_ASSETS,
  DELETE_ICON,
  EQUIPMENT_ICON,
  INVENTORY_ICON,
  PANEL_ASSETS_STEEL,
  PANEL_ASSETS_STONE,
  SEARCH_ICON,
  STATS_ICON,
  VALUE_ICON,
} from '../components/gearpicker/gearpickerAssets';
import { loadGearPickerDraft, saveGearPickerDraft } from '../utils/gearPickerStorage';
import type { EquipmentItem, EquipmentSlot, GearInventory, GearLoadout, GearLoadoutSlots, ListedItem } from '../types/gear';
import { EQUIPMENT_SLOT_LABELS, emptyInventory } from '../types/gear';
import '../components/gearpicker/Gearpicker.css';
import './GearPickerView.css';

interface Props {
  /** Set when reached via /gear/:slug — the slug of a saved or anonymously-shared loadout to
   *  load on mount. */
  initialSlug?: string;
  /** Renders the equipment grid read-only with a "Load into editor" button, instead of the
   *  interactive picker. Used for viewing a loadout via its share link without accidentally
   *  changing it. */
  readOnly?: boolean;
}

/** Every toolbar icon is drawn at this multiple of its native pixel size, so they all read as the
 *  same scale despite their different canvases. */
const TOOLBAR_ICON_SCALE = 1.25;

interface ToolbarIconProps {
  src: string;
  nativeWidth: number;
  /** Surrounds the icon with an accent-coloured glow. */
  glowing?: boolean;
}

function ToolbarIcon({ src, nativeWidth, glowing = false }: ToolbarIconProps) {
  return (
    <img
      src={src}
      alt=""
      className={'gear-picker-toolbar-btn__img' + (glowing ? ' gear-picker-toolbar-btn__img--glowing' : '')}
      style={{ width: nativeWidth * TOOLBAR_ICON_SCALE }}
    />
  );
}

function slotsWithItem(slots: GearLoadoutSlots, slot: EquipmentSlot, item: EquipmentItem): GearLoadoutSlots {
  const next: GearLoadoutSlots = { ...slots, [slot]: item.id };
  // Equipping a two-handed weapon can't coexist with a shield — clear it rather than leaving
  // an impossible combination in state.
  if (slot === 'weapon' && item.isTwoHanded) delete next.shield;
  return next;
}

type PanelMode = 'equipment' | 'inventory';

/** An open right-click menu: where it is, and which slot (if any) was under the cursor. */
interface ContextMenuState {
  x: number;
  y: number;
  equipmentSlot: EquipmentSlot | null;
  inventoryIndex: number | null;
}

function withToggled<T>(selection: ReadonlySet<T>, value: T): ReadonlySet<T> {
  const next = new Set(selection);
  if (!next.delete(value)) next.add(value);
  return next;
}

function withAdded<T>(selection: ReadonlySet<T>, value: T): ReadonlySet<T> {
  return new Set(selection).add(value);
}

/** A plain click selects just `value`; an additive (ctrl/cmd) click toggles it within `selection`. */
function selectionAfterClick<T>(selection: ReadonlySet<T>, value: T, additive: boolean): ReadonlySet<T> {
  return additive ? withToggled(selection, value) : new Set([value]);
}

/** Stable no-op for the picker's hover preview, which only means something for equipment. */
const ignoreHover = () => {};

const MAX_STAT_CHANGE_LEVEL = 3;

/** Strength-like stats have a different scale from the attack, defence and prayer bonuses, so
 *  each is only compared against itself. Every other stat shares one scale. */
const SELF_SCALED_STATS: (keyof TotalBonuses)[] = ['strength', 'rangedStrength', 'magicDamage'];

function scaleKeyOf(stat: keyof TotalBonuses): string {
  return SELF_SCALED_STATS.includes(stat) ? stat : 'general';
}

/** Rates each item from -MAX_STAT_CHANGE_LEVEL to +MAX_STAT_CHANGE_LEVEL by its single biggest
 *  stat change when equipped, relative to the largest change any of `items` makes to stats on
 *  the same scale. Items that change nothing are left out. */
function statChangeLevels(
  items: EquipmentItem[],
  slots: GearLoadoutSlots,
  itemsById: Map<number, EquipmentItem>,
): Map<number, number> {
  const currentTotals = computeTotalBonuses(slots, itemsById);
  const stats = Object.keys(currentTotals) as (keyof TotalBonuses)[];

  const changesById = new Map<number, Record<keyof TotalBonuses, number>>();
  const largestChangeByScale = new Map<string, number>();
  for (const item of items) {
    const newTotals = computeTotalBonuses(slotsWithItem(slots, item.slot, item), itemsById);
    const changes = {} as Record<keyof TotalBonuses, number>;
    for (const stat of stats) {
      changes[stat] = newTotals[stat] - currentTotals[stat];
      const scale = scaleKeyOf(stat);
      largestChangeByScale.set(scale, Math.max(largestChangeByScale.get(scale) ?? 0, Math.abs(changes[stat])));
    }
    changesById.set(item.id, changes);
  }

  const levelById = new Map<number, number>();
  for (const [id, changes] of changesById) {
    let strongestShare = 0;
    let strongestChange = 0;
    for (const stat of stats) {
      const share = Math.abs(changes[stat]) / (largestChangeByScale.get(scaleKeyOf(stat)) || 1);
      if (share > strongestShare) {
        strongestShare = share;
        strongestChange = changes[stat];
      }
    }
    if (strongestChange !== 0) {
      levelById.set(id, Math.sign(strongestChange) * Math.ceil(strongestShare * MAX_STAT_CHANGE_LEVEL));
    }
  }
  return levelById;
}

const NUMERIC_SUFFIX_PATTERN = /^(.*?)\s*\((\d+)\)\s*$/;

/** Of items differing only by a trailing "(<number>)", e.g. charge counts, keeps the highest. */
function withoutLowerNumberedVariants<T extends { name: string }>(items: T[]): T[] {
  const highestNumberByBaseName = new Map<string, number>();
  for (const item of items) {
    const match = NUMERIC_SUFFIX_PATTERN.exec(item.name);
    if (!match) continue;
    const [, baseName, number] = match;
    highestNumberByBaseName.set(baseName, Math.max(highestNumberByBaseName.get(baseName) ?? 0, Number(number)));
  }
  return items.filter((item) => {
    const match = NUMERIC_SUFFIX_PATTERN.exec(item.name);
    return !match || Number(match[2]) === highestNumberByBaseName.get(match[1]);
  });
}

export default function GearPickerView({ initialSlug, readOnly = false }: Props) {
  const { token, user } = useAuth();

  const [equipmentData, setEquipmentData] = useState<EquipmentItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchAllSlots, setSearchAllSlots] = useState(false);
  const [costAbbreviated, setCostAbbreviated] = useState(false);
  const [showStatChanges, setShowStatChanges] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Seeded from the persisted draft on the plain /gear editor; a /gear/:slug view loads its own
  // loadout below instead, so it starts blank here.
  const [slots, setSlots] = useState<GearLoadoutSlots>(() => (initialSlug ? {} : loadGearPickerDraft().slots));
  const [selectedSlots, setSelectedSlots] = useState<ReadonlySet<EquipmentSlot>>(() => new Set());
  const [panelMode, setPanelMode] = useState<PanelMode>('equipment');
  // Inventory mode slides the bonuses panel behind the middle one, shrinking it so it ends up fully
  // inside the middle panel's footprint; measured when entering it, from the panels' sizes and
  // positions at that moment.
  const middleColRef = useRef<HTMLDivElement>(null);
  const bonusesWrapRef = useRef<HTMLDivElement>(null);
  const [bonusesTuck, setBonusesTuck] = useState({ offsetX: 0, scale: 1 });
  const [inventory, setInventory] = useState<GearInventory>(() => (initialSlug ? emptyInventory() : loadGearPickerDraft().inventory));
  const [selectedInventorySlots, setSelectedInventorySlots] = useState<ReadonlySet<number>>(() => new Set());
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const closeContextMenu = useCallback(() => setContextMenu(null), []);
  // Loaded the first time inventory mode opens, since it's far bigger than the equipment dataset.
  const [itemList, setItemList] = useState<ListedItem[] | null>(null);
  const [itemListError, setItemListError] = useState<string | null>(null);
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [hoveredItem, setHoveredItem] = useState<EquipmentItem | null>(null);
  const [loadoutName, setLoadoutName] = useState(() => (initialSlug ? '' : loadGearPickerDraft().loadoutName));
  // The slug of a loadout the signed-in user owns and can update in place. Deliberately left
  // null when viewing someone else's (or an anonymous) shared loadout — Save should fork a new
  // copy in that case, not attempt to overwrite a record the requester doesn't own (which the
  // backend would 403 on anyway).
  const [savedSlug, setSavedSlug] = useState<string | null>(() => (initialSlug ? null : loadGearPickerDraft().savedSlug));
  const [forceEdit, setForceEdit] = useState(false);

  const [loadingLoadout, setLoadingLoadout] = useState(!!initialSlug);
  const [loadoutError, setLoadoutError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  // The item picker and bonuses panels are pegged to the equipment panel's own height, so neither
  // the item list's length nor the bonuses text can feed back into resizing it. A ref-via-state
  // (not useRef) is needed since this panel only mounts once equipment data finishes loading.
  const [equipmentPanelEl, setEquipmentPanelEl] = useState<HTMLDivElement | null>(null);
  const [matchedPanelHeight, setMatchedPanelHeight] = useState<number>();
  const [itemPickerPanelEl, setItemPickerPanelEl] = useState<HTMLDivElement | null>(null);

  // useLayoutEffect for an immediate first measurement (synchronous with the commit, so there's
  // no flash of mismatched heights); ResizeObserver then keeps it in sync as content changes.
  useLayoutEffect(() => {
    if (equipmentPanelEl) setMatchedPanelHeight(equipmentPanelEl.getBoundingClientRect().height);
  }, [equipmentPanelEl]);

  useEffect(() => {
    if (!equipmentPanelEl) return;
    const observer = new ResizeObserver(([entry]) => setMatchedPanelHeight(entry.contentRect.height));
    observer.observe(equipmentPanelEl);
    return () => observer.disconnect();
  }, [equipmentPanelEl]);

  useEffect(() => {
    fetchEquipmentData()
      .then((data) => setEquipmentData(data.items))
      .catch((err) => setDataError(err instanceof Error ? err.message : 'Failed to load equipment data'))
      .finally(() => setLoadingData(false));
  }, []);

  useEffect(() => {
    if (panelMode !== 'inventory' || itemList !== null) return;
    setItemListError(null);
    fetchItemList()
      .then((data) => setItemList(data.items))
      .catch((err) => setItemListError(err instanceof Error ? err.message : 'Failed to load item list'));
  }, [panelMode, itemList]);

  useEffect(() => {
    if (!initialSlug) return;
    setLoadingLoadout(true);
    fetchGearLoadout(initialSlug)
      .then((loadout: GearLoadout) => {
        setSlots(loadout.slots);
        setLoadoutName(loadout.name ?? '');
        setSavedSlug(loadout.username && loadout.username === user?.username ? loadout.slug : null);
      })
      .catch((err) => setLoadoutError(err instanceof Error ? err.message : 'Loadout not found'))
      .finally(() => setLoadingLoadout(false));
    // Intentionally only re-runs when the slug itself changes, not on every `user` identity
    // change (e.g. logging in/out shouldn't re-fetch a loadout already on screen).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSlug]);

  const itemsById = useMemo(() => new Map(equipmentData.map((item) => [item.id, item])), [equipmentData]);

  const pickableItems = useMemo(() => withoutLowerNumberedVariants(equipmentData), [equipmentData]);

  const allItemsSorted = useMemo(() => [...pickableItems].sort((a, b) => a.name.localeCompare(b.name)), [pickableItems]);

  const inventoryPickerItems = useMemo(
    () => (itemList ? withoutLowerNumberedVariants(itemList).sort((a, b) => a.name.localeCompare(b.name)) : []),
    [itemList],
  );

  const itemNamesById = useMemo(() => {
    const names = new Map<number, string>();
    for (const item of equipmentData) names.set(item.id, item.name);
    for (const item of itemList ?? []) names.set(item.id, item.name);
    return names;
  }, [equipmentData, itemList]);

  const totals = useMemo(() => computeTotalBonuses(slots, itemsById), [slots, itemsById]);

  const previewTotals = useMemo(() => {
    if (!hoveredItem) return null;
    return computeTotalBonuses(slotsWithItem(slots, hoveredItem.slot, hoveredItem), itemsById);
  }, [hoveredItem, slots, itemsById]);

  const effectiveReadOnly = readOnly && !forceEdit;
  const inventoryMode = panelMode === 'inventory' && !effectiveReadOnly;

  // A press anywhere but the slot grid, the item picker (which needs the selection to act on) or
  // the context menu clears the inventory selection.
  useEffect(() => {
    if (!inventoryMode || selectedInventorySlots.size === 0) return;
    function deselectOnOutsidePress(event: globalThis.MouseEvent) {
      const target = event.target as Element;
      if (equipmentPanelEl?.contains(target) || itemPickerPanelEl?.contains(target) || target.closest('.context-menu')) return;
      setSelectedInventorySlots(new Set());
    }
    document.addEventListener('mousedown', deselectOnOutsidePress);
    return () => document.removeEventListener('mousedown', deselectOnOutsidePress);
  }, [inventoryMode, selectedInventorySlots, equipmentPanelEl, itemPickerPanelEl]);

  // Only persist while the loadout is actually editable — a plain read-only shared view (no
  // forceEdit yet) shouldn't overwrite the user's own in-progress draft.
  useEffect(() => {
    if (effectiveReadOnly) return;
    saveGearPickerDraft({ slots, inventory, loadoutName, savedSlug });
  }, [slots, inventory, loadoutName, savedSlug, effectiveReadOnly]);

  async function handleSave() {
    if (!token) return;
    setSaving(true);
    setFeedback(null);
    try {
      const loadout = savedSlug
        ? await updateGearLoadout(savedSlug, slots, loadoutName || undefined, token)
        : await saveGearLoadout(slots, loadoutName || undefined, token);
      setSavedSlug(loadout.slug);
      setFeedback({ type: 'success', message: 'Loadout saved.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save loadout' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!token || !savedSlug) return;
    setDeleting(true);
    setFeedback(null);
    try {
      await deleteGearLoadout(savedSlug, token);
      setSavedSlug(null);
      setFeedback({ type: 'success', message: 'Saved loadout deleted.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to delete loadout' });
    } finally {
      setDeleting(false);
    }
  }

  async function handleShare() {
    setSharing(true);
    setFeedback(null);
    try {
      const slug = await shareGearLoadout(slots, loadoutName || undefined);
      setShareUrl(`${window.location.origin}/gear/${slug}`);
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to share loadout' });
    } finally {
      setSharing(false);
    }
  }

  function handleClearAll() {
    setSlots({});
    setSelectedSlots(new Set());
    setShareUrl(null);
    setFeedback(null);
  }

  function setInventorySlots(indices: ReadonlySet<number>, itemId: number | null) {
    setInventory((current) => current.map((existing, index) => (indices.has(index) ? itemId : existing)));
  }

  function togglePanelMode() {
    if (!inventoryMode) {
      const middle = middleColRef.current?.getBoundingClientRect();
      const bonuses = bonusesWrapRef.current?.getBoundingClientRect();
      if (middle && bonuses) {
        setBonusesTuck({
          offsetX: middle.left + middle.width / 2 - (bonuses.left + bonuses.width / 2),
          scale: Math.min(1, middle.width / bonuses.width, middle.height / bonuses.height),
        });
      }
    }
    setContextMenu(null);
    setPanelMode(inventoryMode ? 'equipment' : 'inventory');
  }

  function handleSelectInventoryItem(item: ListedItem) {
    setInventorySlots(selectedInventorySlots, item.id);
  }

  function handleClearSelectedInventorySlots() {
    setInventorySlots(selectedInventorySlots, null);
  }

  function handleClearInventory() {
    setInventory(emptyInventory());
  }

  function handleEquipmentSlotClick(slot: EquipmentSlot, additive: boolean) {
    setSelectedSlots((current) => selectionAfterClick(current, slot, additive));
  }

  function handleInventorySlotClick(index: number, additive: boolean) {
    setSelectedInventorySlots((current) => selectionAfterClick(current, index, additive));
  }

  // Every item the picker offers fits only its own slot, so this equips into `item.slot` however
  // many slots are selected.
  function handleSelectItem(item: EquipmentItem) {
    if (item.slot === 'shield' && itemsById.get(slots.weapon ?? -1)?.isTwoHanded) return;
    setSlots(slotsWithItem(slots, item.slot, item));
    if (searchAllSlots) setSelectedSlots(new Set([item.slot]));
  }

  function handleClearSelectedSlots() {
    const next = { ...slots };
    for (const slot of selectedSlots) delete next[slot];
    setSlots(next);
  }

  function handleMiddlePanelContextMenu(event: MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (effectiveReadOnly || !equipmentPanelEl?.contains(target)) return;
    event.preventDefault();
    const equipmentButton = target.closest<HTMLButtonElement>('[data-equipment-slot]');
    const inventoryButton = target.closest<HTMLElement>('[data-inventory-index]');
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      equipmentSlot: equipmentButton && !equipmentButton.disabled ? (equipmentButton.dataset.equipmentSlot as EquipmentSlot) : null,
      inventoryIndex: inventoryButton ? Number(inventoryButton.dataset.inventoryIndex) : null,
    });
  }

  function equipmentContextMenuOptions(menu: ContextMenuState): ContextMenuOption[] {
    const { equipmentSlot } = menu;
    return [
      {
        label: 'Select',
        disabled: equipmentSlot === null,
        onSelect: () => {
          if (equipmentSlot !== null) setSelectedSlots((current) => withAdded(current, equipmentSlot));
        },
      },
      { label: 'Clear', disabled: selectedSlots.size === 0, onSelect: handleClearSelectedSlots },
      { label: 'Clear all', onSelect: handleClearAll },
      { label: 'Cancel', onSelect: closeContextMenu },
    ];
  }

  function inventoryContextMenuOptions(menu: ContextMenuState): ContextMenuOption[] {
    const { inventoryIndex } = menu;
    return [
      {
        label: inventoryIndex !== null && selectedInventorySlots.has(inventoryIndex) ? 'Unselect' : 'Select',
        disabled: inventoryIndex === null,
        onSelect: () => {
          if (inventoryIndex !== null) setSelectedInventorySlots((current) => withToggled(current, inventoryIndex));
        },
      },
      { label: 'Select all', onSelect: () => setSelectedInventorySlots(new Set(inventory.map((_, index) => index))) },
      { label: 'Remove', disabled: selectedInventorySlots.size === 0, onSelect: handleClearSelectedInventorySlots },
      { label: 'Remove all', onSelect: handleClearInventory },
      { label: 'Cancel', onSelect: closeContextMenu },
    ];
  }

  const pickerItems = useMemo(
    () => (searchAllSlots ? allItemsSorted : allItemsSorted.filter((item) => selectedSlots.has(item.slot))),
    [searchAllSlots, allItemsSorted, selectedSlots],
  );
  const statChangeLevelById = useMemo(
    () => (showStatChanges ? statChangeLevels(pickerItems, slots, itemsById) : undefined),
    [showStatChanges, pickerItems, slots, itemsById],
  );
  const inventoryHintText = itemListError
    ? 'Could not load the item list.'
    : itemList === null
      ? 'Loading items…'
      : 'Click an inventory slot to choose an item for it.';
  const headerText = (() => {
    if (inventoryMode) {
      if (selectedInventorySlots.size === 0) return 'Inventory';
      if (selectedInventorySlots.size > 1) return `${selectedInventorySlots.size} Inventory Slots`;
      return `Inventory Slot ${[...selectedInventorySlots][0] + 1}`;
    }
    if (searchAllSlots) return 'All Slots';
    if (selectedSlots.size === 0) return 'Item Picker';
    if (selectedSlots.size > 1) return `${selectedSlots.size} Slots`;
    return `${EQUIPMENT_SLOT_LABELS[[...selectedSlots][0]]} Slot`;
  })();

  if (loadingData || loadingLoadout) {
    return (
      <div className="gear-picker-view">
        <p className="gear-picker-status">Loading…</p>
      </div>
    );
  }

  if (dataError || loadoutError) {
    return (
      <div className="gear-picker-view">
        <p className="gear-picker-status gear-picker-status--error">{dataError ?? loadoutError}</p>
      </div>
    );
  }

  return (
    <div className="gear-picker-view">
      <h1 className="gear-picker-title">Gear Picker</h1>
      <p className="gear-picker-intro">
        Build an OSRS equipment loadout, see its combat bonuses, and check whether it&rsquo;s
        safe for splashing Ardougne Knights.
      </p>

      <div className="gear-picker-layout">
        {!effectiveReadOnly && (
          <OSRSPanel
            ref={setItemPickerPanelEl}
            assets={PANEL_ASSETS_STEEL}
            className='itempicker'
            borderType="steel"
            type="bank"
            width={280}
            height={matchedPanelHeight}
            header={
              <PixelText
                text={headerText}
                fontSize={24}
                color={colors.accentText}
                bold
              />
            }
            headerDivider={CONNECTOR_ASSETS.horizontal}
            content={
              inventoryMode ? (
                <ItemPickerPanel
                  key={`inventory-${[...selectedInventorySlots].join(',')}-${itemList ? 'loaded' : 'loading'}`}
                  hasTarget={selectedInventorySlots.size > 0 && itemList !== null}
                  hintText={inventoryHintText}
                  removeLabel="Remove item from slot"
                  items={inventoryPickerItems}
                  hasCurrentItem={[...selectedInventorySlots].some((index) => inventory[index] !== null)}
                  onSelect={handleSelectInventoryItem}
                  onHoverItem={ignoreHover}
                  query={itemSearchQuery}
                  onQueryChange={setItemSearchQuery}
                  onClear={handleClearSelectedInventorySlots}
                />
              ) : (
                <ItemPickerPanel
                  key={searchAllSlots ? 'all-slots' : [...selectedSlots].join(',')}
                  hasTarget={selectedSlots.size > 0 || searchAllSlots}
                  hintText="Click an equipment slot to choose an item for it."
                  removeLabel="Remove equipped item"
                  items={pickerItems}
                  statChangeLevelById={statChangeLevelById}
                  hasCurrentItem={[...selectedSlots].some((slot) => slots[slot] !== undefined)}
                  onSelect={handleSelectItem}
                  onHoverItem={setHoveredItem}
                  query={itemSearchQuery}
                  onQueryChange={setItemSearchQuery}
                  onClear={handleClearSelectedSlots}
                />
              )
            }
          />
        )}

        <div className="gear-picker-middle-col" ref={middleColRef} onContextMenu={handleMiddlePanelContextMenu}>
          <OSRSPanel
            ref={setEquipmentPanelEl}
            assets={PANEL_ASSETS_STONE}
            borderType="stone"
            type="side"
            width={250}
            content={
              <div className="gear-picker-equipment-col" style={{ gap: EQUIPMENT_COL_GAP }}>
                {effectiveReadOnly ? (
                  <EquipmentDisplay slots={slots} itemsById={itemsById} />
                ) : inventoryMode ? (
                  <InventoryGrid
                    inventory={inventory}
                    itemNamesById={itemNamesById}
                    selectedIndices={selectedInventorySlots}
                  extraHeight={INVENTORY_EXTRA_HEIGHT}
                    onSlotClick={handleInventorySlotClick}
                  />
                ) : (
                  <EquipmentSlotGrid slots={slots} itemsById={itemsById} onSlotClick={handleEquipmentSlotClick} />
                )}

                {effectiveReadOnly ? (
                  <button
                    type="button"
                    className="gear-picker-btn gear-picker-btn--secondary"
                    onClick={() => setForceEdit(true)}
                  >
                    Load into editor
                  </button>
                ) : inventoryMode ? null : (
                  <div className="gear-picker-toolbar">
                    <OSRSSquareButton
                      width={TOOLBAR_BUTTON_SIZE}
                      height={TOOLBAR_BUTTON_SIZE}
                      scaleWithSize={false}
                      aria-pressed={showStatChanges}
                      onClick={() => setShowStatChanges((shown) => !shown)}
                      title="Show stat changes"
                      aria-label="Highlight stat changes"
                    >
                      <ToolbarIcon src={STATS_ICON} nativeWidth={27} glowing={showStatChanges} />
                    </OSRSSquareButton>
                    <OSRSSquareButton
                      width={TOOLBAR_BUTTON_SIZE}
                      height={TOOLBAR_BUTTON_SIZE}
                      scaleWithSize={false}
                      aria-pressed={costAbbreviated}
                      onClick={() => setCostAbbreviated((abbreviated) => !abbreviated)}
                      title="Abbreviate total cost"
                      aria-label="Format cost"
                    >
                      <ToolbarIcon src={VALUE_ICON} nativeWidth={25} glowing={costAbbreviated} />
                    </OSRSSquareButton>
                    <OSRSSquareButton
                      width={TOOLBAR_BUTTON_SIZE}
                      height={TOOLBAR_BUTTON_SIZE}
                      scaleWithSize={false}
                      aria-pressed={searchAllSlots}
                      onClick={() => setSearchAllSlots((allSlots) => !allSlots)}
                      title="Search all slots"
                      aria-label="Search all slots"
                    >
                      <ToolbarIcon src={SEARCH_ICON} nativeWidth={20} glowing={searchAllSlots} />
                    </OSRSSquareButton>
                    <OSRSSquareButton
                      width={TOOLBAR_BUTTON_SIZE}
                      height={TOOLBAR_BUTTON_SIZE}
                      scaleWithSize={false}
                      onClick={handleClearAll}
                      title="Clear all slots"
                      aria-label="Clear all slots"
                    >
                      <ToolbarIcon src={CLEAR_EQUIPMENT_ICON} nativeWidth={28} />
                    </OSRSSquareButton>
                  </div>
                )}
              </div>
            }
          />
          {!effectiveReadOnly && (
            <OSRSSquareButton
              width={TOOLBAR_BUTTON_SIZE}
              height={TOOLBAR_BUTTON_SIZE}
              scaleWithSize={false}
              onClick={togglePanelMode}
              title={inventoryMode ? 'Equipment mode' : 'Inventory mode'}
              aria-label={inventoryMode ? 'Equipment mode' : 'Inventory mode'}
            >
              <ToolbarIcon src={inventoryMode ? EQUIPMENT_ICON : INVENTORY_ICON} nativeWidth={inventoryMode ? 27 : 26} />
            </OSRSSquareButton>
          )}
        </div>

        <div
          ref={bonusesWrapRef}
          className={'gear-picker-bonuses' + (inventoryMode ? ' gear-picker-bonuses--tucked' : '')}
          style={{ '--tuck-offset-x': `${bonusesTuck.offsetX}px`, '--tuck-scale': bonusesTuck.scale } as CSSProperties}
        >
          <OSRSPanel
            assets={PANEL_ASSETS_STEEL}
            borderType="steel"
            type="bank"
            width={280}
            height={matchedPanelHeight}
            header={<PixelText text="Bonuses" fontSize={24} color={colors.accentText} bold />}
            headerDivider={CONNECTOR_ASSETS.horizontal}
            content={
              <div className="gear-picker-side-col">
                <SplashSafetyIndicator totalMagicAttack={totals.magicAttack} />
                <BonusSummaryPanel totals={totals} previewTotals={previewTotals} />
                <GearLoadoutCost slots={slots} abbreviated={costAbbreviated} />
              </div>
            }
          />
        </div>
      </div>

      {!effectiveReadOnly && (
        <div className="gear-picker-actions">
          <label className="gear-picker-field-label" htmlFor="gear-loadout-name">
            Loadout name
          </label>
          <input
            id="gear-loadout-name"
            className="gear-picker-input"
            type="text"
            placeholder="e.g. Ice Barrage splash gear"
            value={loadoutName}
            onChange={(e) => setLoadoutName(e.target.value)}
            maxLength={100}
          />

          <div className="gear-picker-btn-row">
            {token ? (
              <button
                type="button"
                className="gear-picker-btn"
                onClick={() => void handleSave()}
                disabled={saving}
              >
                {saving ? 'Saving…' : savedSlug ? 'Update saved loadout' : 'Save loadout'}
              </button>
            ) : (
              <span className="gear-picker-hint">Sign in to save this loadout.</span>
            )}
            <button
              type="button"
              className="gear-picker-btn gear-picker-btn--secondary"
              onClick={() => void handleShare()}
              disabled={sharing}
            >
              {sharing ? 'Sharing…' : 'Share'}
            </button>
            {savedSlug && (
              <button
                type="button"
                className="gear-picker-icon-btn gear-picker-icon-btn--danger"
                onClick={() => void handleDelete()}
                disabled={deleting}
                title="Delete this saved loadout"
              >
                <img src={DELETE_ICON} alt="" className="gear-picker-icon-btn__img" />
                <span>{deleting ? 'Deleting…' : 'Delete'}</span>
              </button>
            )}
          </div>

          {shareUrl && (
            <CopyableField
              label="Share link"
              value={shareUrl}
              hint="Anyone with this link can view this loadout — no account needed."
            />
          )}
          {feedback && (
            <p className={`gear-picker-feedback gear-picker-feedback--${feedback.type}`}>{feedback.message}</p>
          )}
        </div>
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          options={inventoryMode ? inventoryContextMenuOptions(contextMenu) : equipmentContextMenuOptions(contextMenu)}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
}
