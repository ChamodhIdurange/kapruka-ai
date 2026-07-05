// Sidebar / chat-icon gradient tones (emerald & gold family).
export const TONES = [
  'linear-gradient(140deg,#22C58C,#0B8A5F)',
  'linear-gradient(140deg,#F3D07A,#E0A62E)',
  'linear-gradient(140deg,#34D399,#0E9F6E)',
  'linear-gradient(140deg,#5FD3B4,#0B7A6A)',
]

// Product-tile background gradients, used as image placeholders / fallbacks.
export const TILE_BGS = [
  'linear-gradient(140deg,#FCE7B8,#F0BF6A)',
  'linear-gradient(140deg,#CFF0DE,#7CCBA8)',
  'linear-gradient(140deg,#D8EFD0,#9FD59A)',
  'linear-gradient(140deg,#F7E2C0,#E2B06F)',
  'linear-gradient(140deg,#BFEBD8,#5FB893)',
  'linear-gradient(140deg,#EADFC0,#C7A25E)',
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
