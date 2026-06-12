/** Placeholder art for games until real cover images are uploaded. */
const palettes: Record<string, { tile: string; glow: string }> = {
  "mobile-legends": {
    tile: "from-sky-400/35 via-blue-600/25 to-transparent",
    glow: "bg-sky-400/15",
  },
  "pubg-mobile": {
    tile: "from-amber-400/35 via-orange-600/25 to-transparent",
    glow: "bg-amber-400/15",
  },
};

const fallback = {
  tile: "from-emerald-400/35 via-teal-600/25 to-transparent",
  glow: "bg-emerald-400/15",
};

export function gameArt(slug: string) {
  return palettes[slug] ?? fallback;
}

export function gameInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}
