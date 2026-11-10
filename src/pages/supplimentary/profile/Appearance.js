// palette (color family) and mode (brightness) are independent.
export const PALETTES = [
  { id: 'original', name: 'Original Musicon', description: 'Neon violet · cyber blue', colors: ['#6A0DAD', '#9B34F0', '#D200FF', '#00E5FF', '#1A2BFF', '#0A0F23', '#120A2E', '#25164A'] },
  { id: 'nocturne', name: 'Nocturne Bloom', description: 'Plum · mauve', colors: ["#1A1026", "#4B2A46", "#7E496B", "#B79AB4", "#EDE6EE"] },
  { id: 'lagoon', name: 'Astral Lagoon', description: 'Oceanic teal', colors: ["#0D2B36", "#1F5F63", "#4CA7A1", "#A6D6C9", "#E6D6EA"] },
  { id: 'jade', name: 'Jade Whisper', description: 'Forest · sage', colors: ["#1B2E28", "#336B5C", "#71A897", "#B6D8C7", "#ECF3E9"] },
  { id: 'amber', name: 'Amber Mirage', description: 'Amber · sand', colors: ["#4A2C1A", "#A35C1E", "#D99A4E", "#EBCB9C", "#FFF3E0"] },
  { id: 'crimson', name: 'Crimson Haze', description: 'Garnet · rose', colors: ["#2B0A12", "#6E1D2F", "#9E3F57", "#C77D88", "#E7D7D9"] },
  { id: 'winter', name: 'Winter', description: 'Ice · steel blue', colors: ["#1D3445", "#416785", "#6E9EC1", "#A9CBDE", "#E7F3FA"] },
  { id: 'peach', name: 'Peach', description: 'Coral · apricot', colors: ["#743F3C", "#A85C52", "#E58F79", "#F4B9A4", "#FFE3D3"] },
  { id: 'slate', name: 'Slate', description: 'Charcoal · gray', colors: ["#22232A", "#43454F", "#727580", "#B5B6BF", "#F0F0F2"] },
];

const PALETTE_KEY = 'musicon.palette';
const MODE_KEY = 'musicon.defaultAppearance';
export const DEFAULT_PALETTE = 'original';
export const DEFAULT_MODE = 'dark';

function safeRead(key, allowed, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return allowed.includes(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key, value) {
  try { window.localStorage.setItem(key, value); }
  catch { /* Private browsing or blocked storage; session change still works. */ }
}

export function readPalette() {
  return safeRead(PALETTE_KEY, PALETTES.map(({ id }) => id), DEFAULT_PALETTE);
}

export function readDefaultMode() {
  return safeRead(MODE_KEY, ['light', 'dark'], DEFAULT_MODE);
}

export function savePalette(next) {
  if (PALETTES.some(({ id }) => id === next)) safeWrite(PALETTE_KEY, next);
}

export function saveDefaultMode(next) {
  if (next === 'light' || next === 'dark') safeWrite(MODE_KEY, next);
}
