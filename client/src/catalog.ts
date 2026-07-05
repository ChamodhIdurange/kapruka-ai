// Sidebar / chat-icon gradient tones.
export const TONES = [
  'linear-gradient(140deg,#9D7BFF,#6E4AE0)',
  'linear-gradient(140deg,#C084FC,#9333EA)',
  'linear-gradient(140deg,#7C5CFC,#4F2CC0)',
  'linear-gradient(140deg,#B794F6,#7C3AED)',
]

// Product-tile background gradients, used as image placeholders / fallbacks.
export const TILE_BGS = [
  'linear-gradient(140deg,#FCE3C2,#F4B07E)',
  'linear-gradient(140deg,#F7D6E6,#E29ECB)',
  'linear-gradient(140deg,#E9D6F2,#B98AD9)',
  'linear-gradient(140deg,#D8EFD0,#A6D596)',
  'linear-gradient(140deg,#F6C6C9,#E0727E)',
  'linear-gradient(140deg,#E7C7A0,#B5854F)',
]

/** Deterministic placeholder gradient for a product id. */
export function tileBg(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return TILE_BGS[h % TILE_BGS.length]
}

export const CONFIG = {
  assistantName: 'KAI',
  showLabels: true,
}
