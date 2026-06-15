/** Cover/hero art per game. Stock gaming photography stands in until the
 *  admin uploads real key art to the screenshots bucket. */
const art: Record<string, { cover: string; alt: string }> = {
  "mobile-legends": {
    cover:
      "https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=1200&q=80",
    alt: "Glowing game controller on a dark desk",
  },
  "pubg-mobile": {
    cover:
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=1200&q=80",
    alt: "Console controller lit in red on black",
  },
};

const fallback = {
  cover:
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
  alt: "Neon-lit arcade machines",
};

export const heroArt = {
  cover:
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=2000&q=80",
  alt: "Esports arena lit in blue and red",
};

export function gameArt(slug: string) {
  switch (slug) {
    case "mobile-legends":
      return {
        alt: "Mobile Legends",
        image: "/hero/mlbb_hero.png",
      };

    case "pubg-mobile":
      return {
        alt: "PUBG Mobile",
        image: "/hero/pubg_page.jpeg",
      };

    default:
      return {
        alt: "Game",
        image: "/hero/default.png",
      };
  }
}

export function gameInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}
