# Changelog

All notable changes to this project are documented in this file.

Everything below [0.23.1] was reconstructed retroactively from the git log on 2026-08-15 — no
version was ever actually tagged or released for those entries. The numbers simulate what each
past commit would have bumped to had this file existed from the start (patch for fix/chore-ish
changes, minor for feat-shaped changes, per the version-bump convention below). [0.23.1] and
every version after it are real.

## [Unreleased]

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
