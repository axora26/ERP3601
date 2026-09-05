# Design System

See `docs/DESIGN_DIRECTION.md` for the visual brief this implements.

## Tokens

`packages/design-system/src/tokens.ts` (TypeScript, for anything that
needs typed access to a token value) and
`packages/design-system/css/tokens.css` (CSS custom properties, imported
by `apps/web/app/globals.css`) define the same scale twice deliberately —
TS for type-safe programmatic use (future charting/canvas work), CSS
custom properties for everything styled with plain CSS. They must be kept
in sync by hand until a token build step is justified (Wave 2+, if a
second consumer needs it).

Categories: `color` (brand, surface, text, border, status),
`typography` (Montserrat display / Inter body, a fixed type scale),
`spacing` (4px base), `radius`, `shadow`, `motion`, `breakpoint`, `layout`
(nav-rail/workspace-nav/drawer widths).

Dark mode is a `prefers-color-scheme: dark` media query re-pointing the
same token names (`packages/design-system/css/tokens.css`), not a second
hand-tuned palette.

## App shell components

`apps/web/components/app-shell/`:

- `AppShell` — composes the four zones and owns the primary navigation
  item list (`PRIMARY_NAVIGATION`), marking items `available: false` when
  no route exists yet for them (Section 40: never a clickable control with
  no destination).
- `NavigationRail` — Zone 1.
- `WorkspaceNavigator` — Zone 2, rendered only when a page passes
  `workspaceTitle`/`workspaceItems`.
- `IntelligenceDrawer` — Zone 4, client component, closed by default.
- `ContextSwitcher` — organization/company switcher in the top bar, calls
  `POST /api/v1/auth/switch-context`.
- `LogoutButton`.

## State components

`apps/web/components/states/States.tsx`: `EmptyState`, `LoadingState`,
`ErrorState`, `PermissionDeniedState`, `ContextRequiredState`,
`PrerequisiteState` — see Section 39. Pages choose the specific state
component that matches what actually happened (e.g. the audit log page
renders `PermissionDeniedState` on a `403` from the API, not a generic
error).

## Responsive behavior

Below 768px (`apps/web/app/globals.css`, the `@media (max-width: 768px)`
block): the navigation rail becomes a bottom bar, the workspace navigator
stacks above the canvas instead of beside it, and the intelligence drawer
becomes a full-screen overlay instead of a fixed-width side panel.
