# Changelog

All notable changes to this project are documented in this file.

Everything below [0.23.1] was reconstructed retroactively from the git log on 2026-08-15 — no
version was ever actually tagged or released for those entries. The numbers simulate what each
past commit would have bumped to had this file existed from the start (patch for fix/chore-ish
changes, minor for feat-shaped changes, per the version-bump convention below). [0.23.1] and
every version after it are real.

## [Unreleased]

## [0.32.5] - 2026-08-29
### Changed
- Rename `views/guides/styling/` to `views/guides/style/`, fixing three component imports (`GuideShell.tsx`, `GuideButton.tsx`, `LinkPreview.tsx`) that were left pointing at the old path.
- Add `views/guides/components/GuideFigure.tsx`, the standard image-block component for guide pages (bordered frame, optional caption, optional click-to-enlarge) — not yet wired into any guide.

## [0.32.4] - 2026-08-29
### Changed
- Split `views/guides/` into `content/` (the routed guide pages, plus the guides hub), `components/` (`GuideShell`, `GuideButton`, `Faq`, `ExplvMap`, `LinkPreview`), `styling/` (`guideTheme.ts`, `GuideShell.css`, `LinkPreview.css`), `hooks/` (`useGuideMeta`, `useLinkPreview`), and `data/` (`guidesCatalog.ts`).

## [0.32.3] - 2026-08-28
### Changed
- Split `components/chatbox/` into `hooks/`, `utils/`, and `data/` subfolders (it had grown to ~30 flat files); the actual chatbox components stay at its root.
- Move `worldsData.ts` out of `src/` root into `views/AllSplashersView/`, its only consumer.

## [0.32.2] - 2026-08-28
### Changed
- Reorganize the frontend's file structure: colocate views (`AllSplashersView`, `UserView`, `AdminView`, `AccountSettingsView`) with the panels and hooks only they use, move guide-only helpers (`ExplvMap`, `LinkPreview`) into `views/guides/`, and move chat-only hooks/utils/data into `components/chatbox/`. No behavior change.

## [0.32.1] - 2026-08-28
### Fixed
- Scope the main nav's border/shadow/margin styling to a `.main-nav` class instead of the bare `nav` element selector — it was leaking onto every guide page's table-of-contents `<nav>`, shoving it 160px to the right and giving it an unwanted border and shadow.

## [0.32.0] - 2026-08-28
### Added
- Add a collapsible "What is this?" info corner, pinned under the nav bar, shown on every logged-in view with page-specific text (Active Splashers, Sessions, Admin, Communities, Account, Discord Bot) via a new reusable `InfoCorner` component.
### Changed
- Move the Active Splashers view's intro paragraph into the new shared info corner, animating both its width and height when expanded/collapsed instead of snapping.

## [0.31.3] - 2026-08-28
### Fixed
- Shrink link-preview thumbnails by 2px (300px → 298px max-height) so they no longer poke past the tooltip's rounded corner into its 1px border.

## [0.31.2] - 2026-08-28
### Fixed
- Fix link-preview tooltips landing in the wrong position on their first hover (subsequent hovers were fine) — the tooltip now renders its content through react-tooltip's `render` prop instead of children, so it repositions correctly once the preview finishes loading and grows past the "Loading preview…" placeholder's size.

## [0.31.1] - 2026-08-28
### Fixed
- Add hover styling to guide link-buttons and the "See live splash worlds" CTA, which previously had none because their inline background/border/color styles silently overrode the hover CSS.

## [0.31.0] - 2026-08-28
### Added
- Make the pickpocketing guide's FAQ entries collapsible (native, keyboard-accessible expand/collapse), via a new reusable `Faq` component.
### Changed
- Fill in the pickpocketing guide's "Tips & Tricks" placeholders (Mouse Keys, Pickpocket Helper plugin) with real content, add section divider rules, and link the Splashworlds/Thievinghost Discord friends chats inline.

## [0.30.2] - 2026-08-28
### Changed
- Move the Discord guild icon to render after the description in link-preview cards instead of before.

## [0.30.1] - 2026-08-27
### Added
- Add an intro paragraph to the Active Splashers view explaining what splash worlds are and linking to the pickpocketing guide and the new guides hub.

## [0.30.0] - 2026-08-27
### Added
- Add SEO metadata: page title/description, canonical URL, Open Graph and Twitter card tags, and a WebApplication JSON-LD block in `index.html`, plus `robots.txt` and a `sitemap.xml` covering the home page, guides, bot page, and legal pages.

## [0.29.0] - 2026-08-27
### Added
- Add a guides hub (`/guides`) and four guide pages — pickpocketing, normal-knight setup, sticky-knight setup, and the RuneLite plugin — reachable from a new "Guides" nav link, using the new `LinkPreview` and `ExplvMap` components. The old `/guide` URL now redirects to `/guides/pickpocketing`.

## [0.28.0] - 2026-08-27
### Added
- Add an `ExplvMap` component embedding Explv's Map (a separately-hosted static site) via `postMessage`, plus a `findDaxPath` API client for an itsdax-compatible pathfinder, so guides can show live, annotated in-game maps and walk paths instead of static screenshots.

## [0.27.0] - 2026-08-27
### Added
- Add a Discord-style hover link preview component (`LinkPreview`) that fetches OSRS Wiki and Discord invite previews from the backend's `/link-preview` endpoint, replacing hand-written tooltip boilerplate.

## [0.26.4] - 2026-08-28
### Fixed
- Stop reading the setup/reset-password/verify-email URL tokens via `setState` inside a `useEffect` (triggered an ESLint `react-hooks/set-state-in-effect` warning about cascading renders) — seed that state lazily via `useState`'s initializer instead, same pattern already used for the current view.

## [0.26.3] - 2026-08-19
### Fixed
- Normalize spell names before looking up their icon, so real session data's "Fire Strike" (space-separated, as sent by the RuneLite plugin) resolves the same icon as dev/fake data's "FIRE_STRIKE" — previously only the latter shape matched, which is why the icon only ever appeared to be missing in production.

## [0.26.2] - 2026-08-19
### Fixed
- Surface the "Missing icon" console warning in production builds too, not just dev — a name/spell that fails to resolve renders nothing with no failed network request to spot, so the warning was the only trace and it was being stripped exactly where nobody has devtools open.

## [0.26.1] - 2026-08-19
### Fixed
- Register the skulled knight icon paths in `icons.ts` so `knight.skull.normal`/`knight.skull.sticky` actually resolve instead of silently rendering nothing.

## [0.26.0] - 2026-08-19
### Added
- Extract the splasher card into its own SessionPanel component, and redesign its stat tiles with pixel-font labels/values, per-tile icon placement (start/end/label), and wrapped two-line labels (e.g. "Session / Start time").

## [0.25.0] - 2026-08-19
### Added
- Redraw the knight-type, session-start, and last-update icons at a larger, sharper 18x18, and add skulled knight icon variants (normal + sticky).

## [0.24.1] - 2026-08-19
### Fixed
- Drop the stray space before the AM/PM suffix in relative time labels (e.g. "2:30PM" instead of "2:30 PM").

## [0.24.0] - 2026-08-19
### Added
- Support multi-line labels in PixelText (split on `\n`), with every line sharing a consistent row height based on the font's full ink bounds rather than each line's own glyphs.

## [0.23.2] - 2026-08-19
### Changed
- Wrap Tile's decorative corner/edge/background layers in their own container, so content can layer above them predictably.

## [0.23.1] - 2026-08-15
### Added
- Add this retroactive CHANGELOG.md documenting the full project history.

## [0.23.0] - 2026-08-15
### Added
- Add an option in the dev view to pin fake sessions so the inactivity sweep won't auto-clear them.

## [0.22.2] - 2026-08-12
### Changed
- Make the vote ratio bar resizable via 3 CSS variables.

## [0.22.1] - 2026-08-12
### Fixed
- Correct vote ratio bar colors against the exact SVG reference.

## [0.22.0] - 2026-08-12
### Added
- Pixel-match the vote ratio bar to the reference asset.

## [0.21.0] - 2026-08-12
### Added
- Add a like/dislike ratio bar to the vote section.

## [0.20.0] - 2026-08-12
### Added
- Add anonymous like/dislike voting to splasher cards.

## [0.19.0] - 2026-08-12
### Added
- Add like/dislike button icon assets.

## [0.18.2] - 2026-08-12
### Fixed
- Show the live nearby player count instead of the cumulative unique pickpocketer count.

## [0.18.1] - 2026-08-12
### Fixed
- Fix duplicate archive messages.

## [0.18.0] - 2026-08-12
### Added
- Parse mod/ironman status icons from the chatbox sender name.

## [0.17.0] - 2026-08-12
### Added
- Add OSRS clan rank title icons to the chatbox.

## [0.16.1] - 2026-08-11
### Fixed
- Remove an incorrect info message.

## [0.16.0] - 2026-08-10
### Added
- Add multi-community Friends/Clan Chat linking, filtered tabs, and chat commands to the chatbox.

## [0.15.0] - 2026-08-09
### Added
- Add real tab filtering, live Friends/Clan Chat feeds, and local persistence to the chatbox.

## [0.14.0] - 2026-08-07
### Added
- Add an OSRS-style chatbox component to the active worlds view.

## [0.13.3] - 2026-08-07
### Changed
- Update the contact email address.

## [0.13.2] - 2026-08-07
### Changed
- Update the Discord bot invite URL.

## [0.13.1] - 2026-08-07
### Changed
- Update the site title and favicon.

## [0.13.0] - 2026-08-06
### Added
- Add a Discord bot invite page with Terms of Service and Privacy Policy.

## [0.12.1] - 2026-08-06
### Fixed
- Fix an inaccurate player count.

## [0.12.0] - 2026-08-05
### Changed
- Rework the overall UI.

## [0.11.0] - 2026-08-05
### Changed
- Redesign the live-sessions tiles and icons.

## [0.10.1] - 2026-08-02
### Fixed
- Restore icons and fonts lost from an earlier WIP commit.

## [0.10.0] - 2026-08-01
### Added
- Add community config options.

## [0.9.0] - 2026-07-31
### Added
- Show splasher API tokens in the admin users table.

## [0.8.0] - 2026-07-31
### Added
- Add the Account Settings view, community ranks/invite UI, and a rank-linked splasher feed.

## [0.7.0] - 2026-07-29
### Added
- Add a password reset feature.

## [0.6.1] - 2026-07-27
### Fixed
- Restore admin community-eligibility controls that were lost in a rebase.

## [0.6.0] - 2026-07-27
### Added
- Add per-community and per-splasher Discord webhook settings UI.

## [0.5.0] - 2026-07-11
### Added
- Auto-login as the dev admin locally, and link usernames to their session history.

## [0.4.0] - 2026-07-11
### Changed
- Redesign My Sessions as a commit-log-style list with an activity heatmap.

## [0.3.0] - 2026-07-11
### Added
- Add a dev-only panel for managing fake active sessions locally.

## [0.2.4] - 2026-07-11
### Fixed
- Fix a hardcoded URL.

## [0.2.3] - 2026-07-10
### Changed
- Add an environment variable for the API base URL and update the proxy configuration.

## [0.2.2] - 2026-07-10
### Changed
- Update the base URL.

## [0.2.1] - 2026-07-10
### Changed
- Adjust the Dockerfile for the deployment platform.

## [0.2.0] - 2026-07-10
### Added
- Add the basic site shell and initial pages.

## [0.1.0] - 2026-04-03
### Added
- Initial project scaffold (Vite + React + TypeScript).
