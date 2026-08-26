/**
 * AXORA Spatial Enterprise design tokens.
 * Brand anchors (mission Section 37): #1E3A8A, #2563EB, #111827, #BFC3C9, #FFFFFF.
 * Built out into a full light-first scale; dark-mode values are the same
 * tokens re-pointed, not a separate hand-tuned palette.
 */
export const color = {
  brand: {
    deep: "#1E3A8A",
    action: "#2563EB",
    ink: "#111827",
    neutral: "#BFC3C9",
    white: "#FFFFFF",
  },
  surface: {
    canvas: "#F5F6F8",
    raised: "#FFFFFF",
    sunken: "#ECEEF1",
    overlay: "rgba(17, 24, 39, 0.48)",
  },
  text: {
    primary: "#111827",
    secondary: "#4B5566",
    muted: "#7C8494",
    inverse: "#FFFFFF",
    link: "#2563EB",
  },
  border: {
    subtle: "#E2E4E9",
    default: "#BFC3C9",
    strong: "#9AA0AC",
    focus: "#2563EB",
  },
  status: {
    success: "#0F7A4A",
    successSurface: "#E7F5EE",
    warning: "#B45309",
    warningSurface: "#FDF1E1",
    danger: "#B42318",
    dangerSurface: "#FBEAE9",
    info: "#1E3A8A",
    infoSurface: "#E9EEFB",
  },
} as const;

export const typography = {
  fontDisplay: '"Montserrat", "Segoe UI", system-ui, sans-serif',
  fontBody: '"Inter", "Segoe UI", system-ui, sans-serif',
  scale: {
    xs: "12px",
    sm: "13px",
    body: "14px",
    md: "16px",
    lg: "18px",
    xl: "22px",
    xxl: "28px",
    display: "34px",
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export const spacing = {
  0: "0px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
} as const;

export const radius = {
  sm: "4px",
  md: "8px",
  lg: "12px",
  pill: "999px",
} as const;

export const shadow = {
  none: "none",
  sm: "0 1px 2px rgba(17, 24, 39, 0.06)",
  md: "0 4px 12px rgba(17, 24, 39, 0.10)",
  lg: "0 12px 32px rgba(17, 24, 39, 0.16)",
} as const;

export const motion = {
  durationFast: "120ms",
  durationBase: "180ms",
  durationSlow: "280ms",
  easing: "cubic-bezier(0.2, 0, 0, 1)",
} as const;

export const breakpoint = {
  mobile: "390px",
  mobileLg: "430px",
  tablet: "768px",
  desktop: "1440px",
  desktopLg: "1920px",
} as const;

export const layout = {
  navigationRailWidth: "64px",
  navigationRailExpandedWidth: "220px",
  workspaceNavigatorWidth: "240px",
  intelligenceDrawerWidth: "360px",
} as const;
