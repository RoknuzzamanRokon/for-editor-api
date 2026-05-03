export type FontFamily =
  | "dm_sans"
  | "inter"
  | "roboto"
  | "open_sans"
  | "lato"
  | "montserrat"
  | "oswald"
  | "raleway"
  | "source_sans";

export interface FontConfig {
  key: FontFamily;
  label: string;
  displayName: string;
  googleFontName: string;
  weights: string[];
  variable: string;
  cssClass: string;
  description: string;
  category: "sans-serif" | "display" | "modern" | "serif";
}

export const FONT_CONFIGS: Record<FontFamily, FontConfig> = {
  dm_sans: {
    key: "dm_sans",
    label: "DM Sans",
    displayName: "DM Sans",
    googleFontName: "DM_Sans",
    weights: ["400", "500", "600", "700"],
    variable: "--font-dm-sans",
    cssClass: "font-dm-sans",
    description: "Clean and modern sans-serif (Default)",
    category: "sans-serif",
  },
  inter: {
    key: "inter",
    label: "Inter",
    displayName: "Inter",
    googleFontName: "Inter",
    weights: ["400", "500", "600", "700"],
    variable: "--font-inter",
    cssClass: "font-inter",
    description: "Highly readable interface font",
    category: "sans-serif",
  },
  roboto: {
    key: "roboto",
    label: "Roboto",
    displayName: "Roboto",
    googleFontName: "Roboto",
    weights: ["400", "500", "700"],
    variable: "--font-roboto",
    cssClass: "font-roboto",
    description: "Google's signature font",
    category: "sans-serif",
  },
  open_sans: {
    key: "open_sans",
    label: "Open Sans",
    displayName: "Open Sans",
    googleFontName: "Open_Sans",
    weights: ["400", "600", "700"],
    variable: "--font-open-sans",
    cssClass: "font-open-sans",
    description: "Friendly and neutral",
    category: "sans-serif",
  },
  lato: {
    key: "lato",
    label: "Lato",
    displayName: "Lato",
    googleFontName: "Lato",
    weights: ["400", "700"],
    variable: "--font-lato",
    cssClass: "font-lato",
    description: "Warm and stable",
    category: "sans-serif",
  },
  montserrat: {
    key: "montserrat",
    label: "Montserrat",
    displayName: "Montserrat",
    googleFontName: "Montserrat",
    weights: ["400", "500", "600", "700"],
    variable: "--font-montserrat",
    cssClass: "font-montserrat",
    description: "Urban and geometric",
    category: "sans-serif",
  },
  oswald: {
    key: "oswald",
    label: "Oswald",
    displayName: "Oswald",
    googleFontName: "Oswald",
    weights: ["400", "500", "600", "700"],
    variable: "--font-oswald",
    cssClass: "font-oswald",
    description: "Bold and condensed display font",
    category: "display",
  },
  raleway: {
    key: "raleway",
    label: "Raleway",
    displayName: "Raleway",
    googleFontName: "Raleway",
    weights: ["400", "500", "600", "700"],
    variable: "--font-raleway",
    cssClass: "font-raleway",
    description: "Elegant and sophisticated",
    category: "modern",
  },
  source_sans: {
    key: "source_sans",
    label: "Source Sans",
    displayName: "Source Sans 3",
    googleFontName: "Source_Sans_3",
    weights: ["400", "600", "700"],
    variable: "--font-source-sans",
    cssClass: "font-source-sans",
    description: "Adobe's professional font",
    category: "sans-serif",
  },
};

export const FONT_LIST = Object.values(FONT_CONFIGS);

export function getFontConfig(key: FontFamily): FontConfig {
  return FONT_CONFIGS[key];
}

export function isValidFont(value: string): value is FontFamily {
  return value in FONT_CONFIGS;
}
