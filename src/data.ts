/** All editable content for the colour stages lives here. */

export type Slide = {
  key: string;
  name: string;
  group: string;
  note: string;
  /** one colour = solid swatch, two = dual-tone swatch */
  swatch: [string] | [string, string];
  /** [glow, base] — the stage background washes to this gradient */
  bg: [string, string];
  /** text colour on that background */
  fg: "light" | "dark";
  /** bowl photo (public/img/<img>.webp) */
  img?: string;
  /** granule colour for PA6 slides */
  pellet?: string;
};

const SOLID = "Super Strength · Solid colours";
const DUAL = "Super Creative · Dual-tone";

export const TUB_SLIDES: Slide[] = [
  { key: "yellow", name: "Yellow", group: SOLID, note: "Bright, sun-yellow gloss", swatch: ["#ffd21a"], bg: ["#ffb81f", "#a86a00"], fg: "dark", img: "yellow" },
  { key: "red", name: "Red", group: SOLID, note: "Deep, high-gloss red", swatch: ["#e5231b"], bg: ["#ee3a30", "#7d0e0a"], fg: "light", img: "red" },
  { key: "blue", name: "Blue", group: SOLID, note: "Rich cobalt blue", swatch: ["#1f4fd6"], bg: ["#3563e6", "#0c2a86"], fg: "light", img: "blue" },
  { key: "orange", name: "Orange", group: SOLID, note: "Vivid, warm orange", swatch: ["#ff6a14"], bg: ["#ff7d2e", "#9a3204"], fg: "light", img: "orange" },
  { key: "grey", name: "Grey", group: SOLID, note: "Neutral graphite grey", swatch: ["#8a9096"], bg: ["#5d646b", "#22272c"], fg: "light", img: "grey" },
  { key: "mint", name: "Mint", group: SOLID, note: "Fresh sea-mint green", swatch: ["#5fd7a8"], bg: ["#34b98c", "#0a5a47"], fg: "light", img: "mint" },
  { key: "white-blue", name: "White + Blue", group: DUAL, note: "Clean white blending into blue", swatch: ["#f2f4f8", "#1f4fd6"], bg: ["#3563e6", "#0c2a86"], fg: "light", img: "white-blue" },
  { key: "grey-pink", name: "Grey + Pink", group: DUAL, note: "Soft grey with a blush-pink base", swatch: ["#8a9096", "#f592a8"], bg: ["#d9688a", "#6e1f3d"], fg: "light", img: "grey-pink" },
  { key: "white-teal", name: "White + Teal", group: DUAL, note: "Crisp white fading to deep teal", swatch: ["#f2f4f8", "#12a7a4"], bg: ["#1c9c9a", "#053d46"], fg: "light", img: "white-teal" },
  { key: "cream-brown", name: "Cream + Brown", group: DUAL, note: "Warm cream over chocolate brown", swatch: ["#f1dfc2", "#5a3520"], bg: ["#b98558", "#3f2514"], fg: "light", img: "cream-brown" },
];

const PA6 = "Recycled PA6 polyamide · Granules";

// NOTE: placeholder colour list — confirm the real standard colours with the client.
export const PA6_SLIDES: Slide[] = [
  { key: "natural", name: "Natural", group: PA6, note: "Off-white, uncoloured base", swatch: ["#e9e0c9"], bg: ["#cdbf9c", "#6b5d3d"], fg: "dark", pellet: "#ece3cc" },
  { key: "black", name: "Black", group: PA6, note: "Solid, consistent black", swatch: ["#1b1d1f"], bg: ["#d8dcde", "#9aa1a6"], fg: "dark", pellet: "#1d1f21" },
  { key: "grey", name: "Grey", group: PA6, note: "Mid industrial grey", swatch: ["#8a9096"], bg: ["#5d646b", "#22272c"], fg: "light", pellet: "#8f959b" },
  { key: "blue", name: "Blue", group: PA6, note: "Strong cobalt blue", swatch: ["#1f4fd6"], bg: ["#3563e6", "#0c2a86"], fg: "light", pellet: "#2457dd" },
  { key: "green", name: "Green", group: PA6, note: "Deep working green", swatch: ["#1f9d6b"], bg: ["#2fb383", "#07503a"], fg: "light", pellet: "#22a771" },
  { key: "red", name: "Red", group: PA6, note: "Bold signal red", swatch: ["#e5231b"], bg: ["#ee3a30", "#7d0e0a"], fg: "light", pellet: "#e5281f" },
];

export const SIZES: { inch: number; img: string; label: string }[] = [
  { inch: 14, img: "yellow", label: "Yellow" },
  { inch: 16, img: "red", label: "Red" },
  { inch: 18, img: "blue", label: "Blue" },
  { inch: 20, img: "orange", label: "Orange" },
  { inch: 22, img: "grey", label: "Grey" },
  { inch: 24, img: "mint", label: "Mint" },
];
