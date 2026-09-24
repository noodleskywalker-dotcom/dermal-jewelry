// Local chroma keying for effect footage shot against a blue ground.
//
// A generated clip has no alpha channel, whatever its prompt says. The footage is therefore asked for
// on blue, the colour furthest from sand, and the blue is removed here, in the browser, per frame.
// The result has real per-pixel opacity: uncovered areas are fully transparent, so there is no
// rectangle on the page, and sand is fully opaque, so it truly hides what is under it. This is not a
// blend mode.
//
// The matte is built on blue dominance RELATIVE to the pixel's own brightness: (B - max(R, G)) / max(R, G, B).
// That matters because a generated "blue screen" is never flat. It has gradients, a floor and shadows,
// and sand has deep shadows of its own. Relative dominance is strongly negative for sand however dark
// it is, and positive for the ground however dark or bright it is, so both stay on the right side.

/**
 * How the ground is told apart from the sand. "blue" is the original footage, shot on a blue studio.
 * "luma" is for footage generated on black, where brightness alone separates the sand cleanly and a
 * colour key would eat the sand's own dark grains.
 */
export type KeyMode = "blue" | "luma";

export type KeySettings = {
  /** Omitted means "blue", so existing footage is unchanged. */
  mode?: KeyMode;
  /** The ground colour measured from the footage, 0 to 1 per channel. Used only to take blue back out of edges. */
  key: [number, number, number];
  /** Relative blue dominance at or below which a pixel is solid sand. Sand measures about -0.6 to -0.9. */
  solidAt: number;
  /** Relative blue dominance at or above which a pixel is clear. The ground measures about +0.15 to +0.4. */
  clearAt: number;
};

export const DEFAULT_KEY: KeySettings = { key: [0, 0, 1], solidAt: -0.3, clearAt: 0.1 };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (lo: number, hi: number, v: number) => {
  const t = clamp01((v - lo) / (hi - lo));
  return t * t * (3 - 2 * t);
};

/** The same maths as the shader, for one pixel. Returns straight (not premultiplied) colour and alpha. */
export function keyPixel(rgb: [number, number, number], settings: KeySettings = DEFAULT_KEY): { r: number; g: number; b: number; a: number } {
  const [r, g, b] = rgb;
  if (settings.mode === "luma") {
    // Dark is ground, bright is sand. The colour is kept as it is: there is no spill to take back out.
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    const a = smooth(settings.solidAt, settings.clearAt, luma);
    return a <= 0 ? { r: 0, g: 0, b: 0, a: 0 } : { r, g, b, a };
  }
  const warmest = Math.max(r, g);
  const relative = (b - warmest) / Math.max(warmest, b, 0.02);
  const a = 1 - smooth(settings.solidAt, settings.clearAt, relative);
  if (a <= 0) return { r: 0, g: 0, b: 0, a: 0 };
  // Take the ground's share back out of each channel, then never let blue lead: that is the spill.
  const share = 1 - a;
  const un = (c: number, k: number) => clamp01((c - share * k) / Math.max(a, 0.3));
  const R = un(r, settings.key[0]);
  const G = un(g, settings.key[1]);
  const B = Math.min(un(b, settings.key[2]), Math.max(R, G));
  return { r: R, g: G, b: B, a };
}

export const KEY_VERTEX = `
attribute vec2 p;
varying vec2 uv;
void main() {
  uv = vec2(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5);
  gl_Position = vec4(p, 0.0, 1.0);
}`;

export const KEY_FRAGMENT = `
precision mediump float;
varying vec2 uv;
uniform sampler2D frame;
uniform vec3 key;
uniform float solidAt;
uniform float clearAt;
uniform float edge;
uniform float floorAt;
// 0: blue ground, keyed on blue dominance. 1: dark ground, keyed on brightness.
uniform float lumaMode;
void main() {
  vec3 c = texture2D(frame, uv).rgb;
  float warmest = max(c.r, c.g);
  float relative = (c.b - warmest) / max(max(warmest, c.b), 0.02);
  float blueAlpha = 1.0 - smoothstep(solidAt, clearAt, relative);
  float lumaAlpha = smoothstep(solidAt, clearAt, dot(c, vec3(0.299, 0.587, 0.114)));
  float a = mix(blueAlpha, lumaAlpha, lumaMode);
  float share = 1.0 - a;
  vec3 spilled = clamp((c - share * key) / max(a, 0.3), 0.0, 1.0);
  spilled.b = min(spilled.b, max(spilled.r, spilled.g));
  vec3 s = mix(spilled, c, lumaMode);
  // Garbage matte. The sand enters through the left edge of the frame, so that edge is softened, and
  // the footage's floor, with its highlight, is hidden until the sand reaches it. (Reflecting the
  // footage past that edge was tried and rejected: it reads as an obvious butterfly shape.)
  a *= smoothstep(0.0, edge, uv.x) * (1.0 - smoothstep(floorAt, floorAt + 0.012, uv.y));
  gl_FragColor = vec4(s * a, a);
}`;

export type Placement = { width: number; height: number; left: number; top: number };

/**
 * Where effect footage sits on the page at one moment.
 *
 * At `progress` 0 the point the sand enters the footage from sits exactly on a target point of the
 * page (the opening of the gourd), at a size that keeps the rising ribbon inside the viewport.
 * At `progress` 1 the footage simply covers the viewport, so its final full-frame sand hides
 * everything. In between it moves and grows smoothly. It is only ever scaled uniformly, and never
 * beyond the size needed to cover, so it is not stretched or blown up more than it must be.
 */
export function effectPlacement(
  footage: { width: number; height: number },
  emission: { x: number; y: number },
  viewport: { width: number; height: number },
  target: { x: number; y: number },
  progress: number,
  /** Width of the picture the sand comes from, in pixels. The early ribbon is kept in scale with it. */
  pictureWidth = Infinity,
): Placement {
  const cover = Math.max(viewport.width / footage.width, viewport.height / footage.height);
  // The ribbon climbs nearly to the top of the footage before it bursts. Keep that inside the viewport.
  const rise = Math.max(0.1, emission.y - 0.08) * footage.height;
  // The ribbon spans about a third of the footage's width. It should not dwarf the figure it comes from.
  const reach = (pictureWidth * 0.62) / (0.33 * footage.width);
  const start = Math.min(cover, reach, Math.max(0.3 * cover, (target.y * 0.92) / rise));
  const t = Math.min(1, Math.max(0, progress));
  const ease = t * t * (3 - 2 * t);
  const scale = start + (cover - start) * ease;
  const width = footage.width * scale;
  const height = footage.height * scale;
  const left0 = target.x - emission.x * width;
  const top0 = target.y - emission.y * height;
  const left1 = (viewport.width - width) / 2;
  const top1 = (viewport.height - height) / 2;
  return { width, height, left: left0 + (left1 - left0) * ease, top: top0 + (top1 - top0) * ease };
}
