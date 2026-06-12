# Design Style: Academia / Classical

## Design Philosophy

**Core Principles**: Scholarly gravitas meets timeless elegance. This style channels the atmosphere of centuries-old university libraries, Victorian study halls, and Renaissance manuscripts. Every element must feel like it belongs in a prestigious institution - combining **rich material references** (aged parchment, dark mahogany wood, polished brass hardware, crimson leather bindings) with **traditional typographic excellence** and **measured ornamentation**.

**Vibe**: Scholarly, Prestigious, Warm, Timeless, Dignified, Intellectual, Distinguished.

**The Academia Promise**: This isn't a modern dark theme with serif fonts. It's a complete transformation into a physical library environment where every interaction feels like turning pages in a leather-bound tome, where brass fixtures catch the light, and where centuries of knowledge create an atmosphere of gravitas and trust.

## Design Tokens

```javascript
export const academiaTokens = {
  colors: {
    background: "#1C1714",      // Deep Mahogany
    backgroundAlt: "#251E19",   // Aged Oak
    foreground: "#E8DFD4",      // Antique Parchment
    muted: "#3D332B",           // Worn Leather
    mutedForeground: "#9C8B7A", // Faded Ink
    accent: "#C9A962",          // Polished Brass
    accentSecondary: "#8B2635", // Library Crimson
    border: "#4A3F35",          // Wood Grain
  },
  fonts: {
    heading: "'Cormorant Garamond', serif",
    body: "'Crimson Pro', serif",
    display: "'Cinzel', serif",
  },
  radius: {
    default: "4px",
    arch: "40% 40% 0 0 / 20% 20% 0 0",
  },
  transitions: { fast: "150ms", base: "300ms", slow: "500ms", dramatic: "700ms" },
  effects: {
    sepia: "sepia(0.6) contrast(0.95) brightness(0.9)",
    brassGradient: "linear-gradient(180deg, #D4B872 0%, #C9A962 50%, #B8953F 100%)",
    engraved: "1px 1px 1px rgba(0,0,0,0.4), -1px -1px 1px rgba(255,255,255,0.1)",
  },
};
```

## Color Usage Rules

1. Contrast: 8.5:1 for parchment on mahogany, minimum 4.5:1 for muted text
2. Layering: backgroundAlt on background for depth (cards, panels)
3. Brass for ALL interactive elements (buttons, links, focus rings, icons)
4. Crimson sparingly: special emphasis, wax seals, secondary button hover transforms
5. Borders visible but never harsh

## Typography Rules

- Display/Section headings: Cormorant Garamond, regular weights (400-500), tight leading
- Body: Crimson Pro, text-base to text-lg, leading-relaxed; italics for emphasis, not bold
- Labels/Overlines: Cinzel, uppercase, tracking-[0.2em] to [0.3em], text-xs
- Drop caps on intro paragraphs: Cinzel, text-7xl, brass, float-left, engraved shadow
- Roman numeral volume system: "Volume I", "Volume II" above major sections (Cinzel, brass)
- Engraved text on buttons: text-shadow 1px 1px 1px rgba(0,0,0,0.4), -1px -1px 1px rgba(255,255,255,0.1)

## Signature Elements (The Bold Factor — mandatory)

1. Arch-topped images: border-radius 40% 40% 0 0 / 20% 20% 0 0 on featured imagery
2. Sepia-to-color transitions: images start sepia(0.6), reveal full color on hover over 700ms
3. Roman numeral volume system on all major sections
4. Drop cap introductions on opening paragraphs
5. Corner flourishes: 40px brass brackets on hero frames, 24px on cards (opacity 0.6 → 1 on hover)
6. Ornate dividers: gradient line (transparent → wood → brass → wood → transparent) with centered glyph (✶ ❧ ✤ ❦)
7. Wax seal badges: circular crimson radial-gradient badges on featured items
8. Brass interactive language everywhere (#C9A962)
9. Engraved text effects on buttons and special headings
10. Texture overlays: paper noise (3% opacity, blend overlay) + vignette (radial darkening), fixed

## Buttons

- Font: Cinzel, uppercase, tracking-[0.15em], text-xs, generous padding (default h-12 px-8)
- Primary: brass gradient, dark mahogany text, inset highlight/shadow, hover brightness-110 + brass glow
- Secondary: transparent, 2px brass border, brass text; hover transforms to crimson bg/border with parchment text
- Ghost: brass text, hover underline (offset 4px), brighten to #D4B872

## Cards

- Background #251E19, 1px #4A3F35 border, 4px radius, p-8 to p-12
- Hover: border to brass/50, shadow 0 8px 24px rgba(0,0,0,0.3), 300ms
- Corner flourishes on major cards; arch-top + sepia images on media cards
- Wax seal badge for featured items (absolute -top-3 right-6)

## Motion

Dignified, deliberate, smooth: ease-out only, no bounce/spring/elastic. 150ms (press) / 300ms (hover) / 500ms (lift) / 700ms (sepia reveal, dramatic). Hover scale max 105%. Respect prefers-reduced-motion.

## Anti-Patterns

No sans-serif fonts; no bright saturated colors; no sharp geometric shapes; no modern gradients (brass metallic only); no flat-top featured images; no pure black or white; no cold tones; no playful animations; restraint over excess; crimson only for emphasis; generous spacing always.

## Accessibility

8.5:1 primary text contrast; brass focus ring (ring-2 ring-[#C9A962] ring-offset-2 ring-offset-[#1C1714]) always visible; semantic HTML; aria-hidden on decorative flourishes; prefers-reduced-motion respected.
