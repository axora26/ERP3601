# Design Direction — AXORA Spatial Enterprise

## Brief

A premium enterprise operating system for construction/engineering firms
that reads as a command center, a project-controls tool, and a modern
productivity app — never as a generic admin template, and never a visual
copy of ERP3602's current dark command-center shell (see ADR-0005).

## What to avoid (mission Section 34)

Oversized decorative cards; dashboard chrome with no data behind it;
gradients/glassmorphism for their own sake; gratuitous animation; a nav
with dozens of same-level links; anything that reads as "admin template."

## The shell: four zones (Section 35)

1. **Navigation Rail** (Zone 1) — a compact vertical rail, icon-first,
   expandable. Top-level destinations: Home, Commercial, Projects,
   Operations, Engineering, Finance, People, Assets, Data, Administration.
   Implemented as `NavigationRail` in `packages/ui`.
2. **Workspace Navigator** (Zone 2) — a second column that appears only
   when the active section has sub-navigation (e.g. inside a project:
   Overview, Cost Control, Contracts, Procurement, Workforce, Documents,
   Quality, Commissioning). Implemented as `WorkspaceNavigator`.
3. **Main Canvas** (Zone 3) — the work surface itself.
4. **Intelligence Drawer** (Zone 4) — optional right-hand panel:
   notifications, activity, comments, AI assistant, selected-object
   properties, pending approvals. Implemented as `IntelligenceDrawer`,
   closed by default so it never steals width from Zone 3 uninvited.

## Tokens (Section 37)

Brand palette preserved: `#1E3A8A` (deep blue, primary), `#2563EB`
(action blue), `#111827` (ink), `#BFC3C9` (neutral/border), `#FFFFFF`.
Built out into a full light-first token scale in
`packages/design-system/src/tokens.ts` — surfaces, text, border, status
(success/warning/danger/info), elevation, radii, spacing (4px base),
motion durations, and breakpoints. Typography: Montserrat for
display/headings, Inter for UI/data/body, both loaded as variable fonts.

## Density

Enterprise data density, not marketing-site whitespace: an 8px vertical
rhythm inside data-dense components (tables, metric groups), 4px between
tightly related elements (a label and its value), and generous (24–32px)
separation only between distinct sections of the canvas. Text defaults to
14px in dense UI, 16px in reading contexts.

## States (Section 39)

Every screen-level component must express, and the app shell must be able
to render, all of: loading, empty, success, partial, permission-denied,
missing-organization-context, missing-company-context,
missing-prerequisite, validation-error, API-error, network-error, offline.
These are distinct states with distinct components
(`EmptyState`, `PermissionDeniedState`, `ContextRequiredState`,
`ErrorState`, `LoadingState` in `packages/ui`) — never collapsed into one
generic "Something went wrong" screen, per Section 39's explicit warning
against confusing absence-of-data with absence-of-permission with
absence-of-context.

## No fake controls (Section 40)

Anything rendered as a button/link either performs its action, is
`disabled` with a reason, or is not rendered. The Wave 1 UI intentionally
ships a small surface (login, command-center home, org/company switcher)
precisely so every control on it is real.

## Responsive baseline

Validated breakpoints per Section 36: 390×844, 430×932, 768×1024,
1440×900, 1920×1080. On narrow viewports the Navigation Rail collapses to
a bottom bar and the Workspace Navigator becomes a sheet, rather than
forcing the desktop three/four-column layout into a phone frame.
