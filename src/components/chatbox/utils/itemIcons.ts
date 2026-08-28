/** Resolves an OSRS item id to the backend's rendered icon PNG — see splash-helper-backend's
 *  routes/items.ts (`GET /items/:id/icon`). Icons are immutably cache-headered there, so this URL
 *  is safe to hand straight to an `<img>` and let the browser cache forever. */
export function itemIconUrl(itemId: number): string {
  return `${import.meta.env.VITE_API_BASE_URL}/items/${itemId}/icon`;
}

// Some chat lines (e.g. `!log`/`!pets` output from RuneProfile or RuneLite's own built-in chat
// commands) can end up containing that plugin's own `<img=N>` tag — the same syntax the game uses
// for the leading mod/ironman status tags on a sender's name (see parsePlayerName in
// chatIcons.ts), but here N is a per-viewer-session index into that *specific* client's own
// sprite array, assigned incrementally as it loads icons — not a real OSRS item id, and not
// recoverable from the text at all (confirmed by reading both RuneProfile's and RuneLite's own
// plugin source). Rendering an `<img>` from it, as this file used to, occasionally produced a
// completely unrelated real item's icon purely by numeric coincidence.
//
// The real items (when splash-helper-backend has resolved them server-side — see
// services/itemLogResolver.ts) arrive separately as ChatMessage.items, keyed by real id. These
// tags are only ever stripped from the displayed text, never parsed for an id.
const MESSAGE_ICON_TAG = /<img=\d+>/g;

/** Strips any inline `<img=N>` tags from a message body for display — see the note above for why
 *  these are never treated as item ids. */
export function stripMessageIconTags(text: string): string {
  return text.replace(MESSAGE_ICON_TAG, '');
}
