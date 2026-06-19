// T-Finance · Design tokens for React Native.
// Mirrors web/src/app/globals.css. RN doesn't speak CSS vars or oklch(),
// so we precompute equivalent sRGB hex values.

export const tokens = {
  light: {
    bg: "#f8f7f3",
    bgElev: "#ffffff",
    bgSunken: "#f1efea",
    ink: "#1c2230",
    ink2: "#535a6b",
    ink3: "#7b8294",
    ink4: "#b5b9c4",
    line: "#e3e4e8",
    line2: "#eceef0",
    brand: "#1d4d3a",
    brand2: "#286649",
    brandTint: "#dfece6",
    pos: "#1f8a5b",
    neg: "#c63b2c",
    warn: "#d39629",
    info: "#3068c8",
    c1: "#2a8657",
    c2: "#3a76d6",
    c3: "#c08b1a",
    c4: "#c64333",
    c5: "#8a4ba0",
    c6: "#3b87a5",
    c7: "#6e7686",
  },
  dark: {
    bg: "#1c2230",
    bgElev: "#262d3c",
    bgSunken: "#171c27",
    ink: "#f5f4ef",
    ink2: "#b5b9c4",
    ink3: "#7b8294",
    ink4: "#535a6b",
    line: "#39404e",
    line2: "#2f3645",
    brand: "#5fc196",
    brand2: "#4ba87f",
    brandTint: "#1e3a2d",
    pos: "#1f8a5b",
    neg: "#e0594a",
    warn: "#d39629",
    info: "#5d8bdc",
    c1: "#2a8657", c2: "#3a76d6", c3: "#c08b1a", c4: "#c64333",
    c5: "#8a4ba0", c6: "#3b87a5", c7: "#9099a9",
  },
};

export const radii = { xs: 6, sm: 10, md: 14, lg: 20, xl: 28 };
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };

// PlusJakarta + JetBrainsMono ship via expo-font in App.tsx; until loaded
// we fall back to system.
export const fonts = {
  sans: "PlusJakartaSans",
  mono: "JetBrainsMono",
  serif: "InstrumentSerif",
};

export type Theme = typeof tokens.light;
