/** Navigates the SPA to `path` from outside App.tsx's own component tree — used by the `::open`
 *  chat command (see utils/chatCommands.ts), which has no access to App's local `navigate`
 *  callback. App.tsx has no router: it derives its current view from `window.location.pathname`
 *  on mount and re-derives it on every `popstate` event (see its `handlePopState`), so pushing a
 *  new URL and firing a synthetic `popstate` reproduces what its own `navigate` does, without a
 *  full page reload. `path` must be one of the paths App.tsx's `pathToView` recognizes. */
export function navigateToPath(path: string): void {
  if (window.location.pathname === path) return;
  window.history.pushState(null, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
