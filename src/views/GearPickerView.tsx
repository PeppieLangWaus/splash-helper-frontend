import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import OSRSPanel from '../components/osrs/OSRSPanel';
import EquipmentDisplay from '../components/gearpicker/EquipmentDisplay';
import EquipmentSlotGrid from '../components/gearpicker/EquipmentSlotGrid';
import ItemPickerPanel from '../components/gearpicker/ItemPickerPanel';
import GearLoadoutCost from '../components/gearpicker/GearLoadoutCost';
import BonusSummaryPanel from '../components/gearpicker/BonusSummaryPanel';
import SplashSafetyIndicator from '../components/gearpicker/SplashSafetyIndicator';
import CopyableField from '../components/CopyableField';
import {
  deleteGearLoadout,
  fetchEquipmentData,
  fetchGearLoadout,
  saveGearLoadout,
  shareGearLoadout,
  updateGearLoadout,
} from '../api';
import { computeTotalBonuses } from '../components/gearpicker/gearBonuses';
import { CLEAR_EQUIPMENT_ICON, CONNECTOR_ASSETS, DELETE_ICON, PANEL_ASSETS_STEEL, PANEL_ASSETS_STONE } from '../components/gearpicker/gearpickerAssets';
import type { EquipmentItem, EquipmentSlot, GearLoadout, GearLoadoutSlots } from '../types/gear';
import { EQUIPMENT_SLOT_LABELS } from '../types/gear';
import '../components/gearpicker/gearpicker.css';
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

export default function GearPickerView({ initialSlug, readOnly = false }: Props) {
  const { token, user } = useAuth();

  const [equipmentData, setEquipmentData] = useState<EquipmentItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const [slots, setSlots] = useState<GearLoadoutSlots>({});
  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot | null>(null);
  const [loadoutName, setLoadoutName] = useState('');
  // The slug of a loadout the signed-in user owns and can update in place. Deliberately left
  // null when viewing someone else's (or an anonymous) shared loadout — Save should fork a new
  // copy in that case, not attempt to overwrite a record the requester doesn't own (which the
  // backend would 403 on anyway).
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
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

  const itemsBySlot = useMemo(() => {
    const map = new Map<EquipmentSlot, EquipmentItem[]>();
    for (const item of equipmentData) {
      const list = map.get(item.slot);
      if (list) list.push(item);
      else map.set(item.slot, [item]);
    }
    for (const list of map.values()) list.sort((a, b) => a.name.localeCompare(b.name));
    return map;
  }, [equipmentData]);

  const totals = useMemo(() => computeTotalBonuses(slots, itemsById), [slots, itemsById]);

  const effectiveReadOnly = readOnly && !forceEdit;

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
    setSelectedSlot(null);
    setShareUrl(null);
    setFeedback(null);
  }

  function handleSelectItem(item: EquipmentItem) {
    if (!selectedSlot) return;
    const next: GearLoadoutSlots = { ...slots, [selectedSlot]: item.id };
    // Equipping a two-handed weapon can't coexist with a shield — clear it rather than leaving
    // an impossible combination in state.
    if (selectedSlot === 'weapon' && item.isTwoHanded) delete next.shield;
    setSlots(next);
    setSelectedSlot(null);
  }

  function handleClearSelectedSlot() {
    if (!selectedSlot) return;
    const next = { ...slots };
    delete next[selectedSlot];
    setSlots(next);
    setSelectedSlot(null);
  }

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
            assets={PANEL_ASSETS_STEEL}
            className='itempicker'
            borderType="steel"
            type="bank"
            width={280}
            height={matchedPanelHeight}
            header={selectedSlot ? `Choose ${EQUIPMENT_SLOT_LABELS[selectedSlot]}` : 'Item Picker'}
            headerDivider={CONNECTOR_ASSETS.horizontal}
            content={
              <ItemPickerPanel
                key={selectedSlot ?? 'none'}
                selectedSlot={selectedSlot}
                items={selectedSlot ? itemsBySlot.get(selectedSlot) ?? [] : []}
                hasCurrentItem={selectedSlot ? slots[selectedSlot] !== undefined : false}
                onSelect={handleSelectItem}
                onClear={handleClearSelectedSlot}
              />
            }
          />
        )}

        <OSRSPanel
          ref={setEquipmentPanelEl}
          assets={PANEL_ASSETS_STONE}
          borderType="stone"
          type="side"
          width={250}
          content={
            <div className="gear-picker-equipment-col">
              {effectiveReadOnly ? (
                <EquipmentDisplay slots={slots} itemsById={itemsById} />
              ) : (
                <EquipmentSlotGrid slots={slots} itemsById={itemsById} onSlotClick={setSelectedSlot} />
              )}

              {effectiveReadOnly ? (
                <button
                  type="button"
                  className="gear-picker-btn gear-picker-btn--secondary"
                  onClick={() => setForceEdit(true)}
                >
                  Load into editor
                </button>
              ) : (
                <button type="button" className="gear-picker-icon-btn" onClick={handleClearAll} title="Clear all slots">
                  <img src={CLEAR_EQUIPMENT_ICON} alt="" className="gear-picker-icon-btn__img" />
                  <span>Clear all</span>
                </button>
              )}
            </div>
          }
        />

        <OSRSPanel
          assets={PANEL_ASSETS_STEEL}
          borderType="steel"
          type="bank"
          width={280}
          height={matchedPanelHeight}
          header="Bonuses"
          headerDivider={CONNECTOR_ASSETS.horizontal}
          content={
            <div className="gear-picker-side-col">
              <SplashSafetyIndicator totalMagicAttack={totals.magicAttack} />
              <BonusSummaryPanel totals={totals} />
              <GearLoadoutCost slots={slots} />
            </div>
          }
        />
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
    </div>
  );
}
