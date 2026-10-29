/** Shared granule simulation used by the hero lettering and the PA6 glass jars.
 *  Pellets rain down in order (bottom of the shape first) and settle into
 *  pre-computed rest positions, so a fill always finishes cleanly. */

const ANGLES = 8;
const TONES = [-0.14, 0, 0.14];
const G = 2600; // px/s²

export function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.round(v + amt * (amt > 0 ? 255 - v : v));
  return `rgb(${c((n >> 16) & 255)},${c((n >> 8) & 255)},${c(n & 255)})`;
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** One pre-rendered pellet per colour × tone × angle, so drawing thousands is cheap. */
function makeSprites(palette: string[], pw: number, ph: number, dpr: number) {
  const S = Math.ceil(pw * 1.45 + 4);
  const sprites = palette.map((base) =>
    TONES.map((tone) =>
      Array.from({ length: ANGLES }, (_, a) => {
        const cv = document.createElement("canvas");
        cv.width = cv.height = Math.ceil(S * dpr);
        const x = cv.getContext("2d")!;
        x.scale(dpr, dpr);
        x.translate(S / 2, S / 2);
        x.rotate((a / ANGLES) * Math.PI);
        const g = x.createLinearGradient(0, -ph / 2, 0, ph / 2);
        g.addColorStop(0, shade(base, tone + 0.22));
        g.addColorStop(0.5, shade(base, tone));
        g.addColorStop(1, shade(base, tone - 0.28));
        rr(x, -pw / 2, -ph / 2, pw, ph, ph / 2.4);
        x.fillStyle = g;
        x.fill();
        x.lineWidth = 0.6;
        x.strokeStyle = "rgba(0,0,0,0.45)";
        x.stroke();
        rr(x, -pw / 2 + pw * 0.14, -ph / 2 + ph * 0.14, pw * 0.42, ph * 0.22, ph * 0.1);
        x.fillStyle = "rgba(255,255,255,0.5)";
        x.fill();
        return cv;
      })
    )
  );
  return { sprites, S };
}

/** Packs pellet rest positions into any shape given by `inside(x, y)` (local coords). */
export function sampleTargets(
  inside: (x: number, y: number) => boolean,
  w: number,
  h: number,
  pw: number,
  ph: number
) {
  const stepX = pw * 0.84, stepY = ph * 0.84;
  const out: { x: number; y: number }[] = [];
  let row = 0;
  for (let y = ph / 2 + 1; y < h; y += stepY, row++) {
    for (let x = pw / 2 + (row % 2 ? stepX / 2 : 0); x < w; x += stepX) {
      const jx = x + (Math.random() - 0.5) * 2, jy = y + (Math.random() - 0.5) * 1.6;
      if (
        inside(jx, jy) && inside(jx - pw * 0.34, jy) && inside(jx + pw * 0.34, jy) &&
        inside(jx, jy - ph * 0.42) && inside(jx, jy + ph * 0.42)
      )
        out.push({ x: jx, y: jy });
    }
  }
  return out;
}

type P = {
  tx: number; ty: number; ny: number;
  x: number; y: number; vy: number; spawnY: number;
  ox: number; oy: number; ovx: number; ovy: number;
  delay: number; state: 0 | 1 | 2; bounced: boolean;
  ci: number; tone: number; ang: number;
};

export type FieldConfig = {
  targets: { x: number; y: number }[];
  palette: string[];
  /** share of pellets per palette colour (defaults to equal) */
  weights?: number[];
  pw: number;
  ph: number;
  dpr: number;
  fillSeconds: number;
  /** pellets spawn at a random y in [spawnMin, spawnMax] (local coords, above the shape) */
  spawnMin: number;
  spawnMax: number;
  /** px over which a falling pellet fades in after spawning */
  fadeIn: number;
  spreadX: number;
  steer: number;
  pointerRadius?: number;
};

export function createField(cfg: FieldConfig) {
  const { sprites, S } = makeSprites(cfg.palette, cfg.pw, cfg.ph, cfg.dpr);
  const weights = cfg.weights ?? cfg.palette.map(() => 1);
  const wsum = weights.reduce((a, b) => a + b, 0);
  const pick = () => {
    let r = Math.random() * wsum;
    for (let i = 0; i < weights.length; i++) if ((r -= weights[i]) <= 0) return i;
    return 0;
  };
  const top = Math.min(...cfg.targets.map((t) => t.y));
  const bottom = Math.max(...cfg.targets.map((t) => t.y));
  const pellets: P[] = cfg.targets.map((t) => ({
    tx: t.x, ty: t.y, ny: (t.y - top) / Math.max(1, bottom - top),
    x: t.x, y: t.y, vy: 0, spawnY: 0,
    ox: 0, oy: 0, ovx: 0, ovy: 0,
    delay: 0, state: 2, bounced: true,
    ci: pick(), tone: Math.floor(Math.random() * TONES.length), ang: Math.floor(Math.random() * ANGLES),
  }));

  let t = 0;
  let settled = pellets.length;
  let filling = false;
  const pointer = { x: -9999, y: -9999 };

  function startFill() {
    t = 0;
    settled = 0;
    filling = true;
    for (const p of pellets) {
      p.state = 0;
      p.bounced = false;
      p.delay = (1 - p.ny) * cfg.fillSeconds + Math.random() * 0.4;
      p.x = p.tx + (Math.random() - 0.5) * cfg.spreadX;
      p.spawnY = cfg.spawnMin + Math.random() * (cfg.spawnMax - cfg.spawnMin);
      p.y = p.spawnY;
      p.vy = 220 + Math.random() * 240;
      p.ox = p.oy = p.ovx = p.ovy = 0;
    }
  }

  /** Everything at rest, instantly. */
  function settleAll() {
    settled = pellets.length;
    filling = false;
    for (const p of pellets) {
      p.state = 2;
      p.x = p.tx;
      p.y = p.ty;
      p.ox = p.oy = p.ovx = p.ovy = 0;
    }
  }

  function step(dt: number) {
    const R = cfg.pointerRadius ?? 0;
    if (filling) t += dt;
    for (const p of pellets) {
      if (p.state === 0) {
        if (t >= p.delay) p.state = 1;
      } else if (p.state === 1) {
        p.vy += G * dt;
        p.y += p.vy * dt;
        p.x += (p.tx - p.x) * Math.min(1, dt * cfg.steer);
        if (p.y >= p.ty) {
          if (!p.bounced && p.vy > 320) {
            p.bounced = true;
            p.y = p.ty - 1;
            p.vy = -p.vy * 0.2;
          } else {
            p.y = p.ty;
            p.x = p.tx;
            p.state = 2;
            settled++;
          }
        }
      } else if (R > 0) {
        const dx = p.tx - pointer.x, dy = p.ty - pointer.y;
        const d = Math.hypot(dx, dy);
        let tox = 0, toy = 0;
        if (d < R && d > 0.01) {
          const f = 1 - d / R;
          tox = (dx / d) * f * R * 0.55;
          toy = (dy / d) * f * R * 0.55 - f * 6;
        }
        if (tox !== 0 || toy !== 0 || Math.abs(p.ox) > 0.05 || Math.abs(p.oy) > 0.05 || Math.abs(p.ovx) > 0.05) {
          p.ovx += ((tox - p.ox) * 170 - p.ovx * 13) * dt;
          p.ovy += ((toy - p.oy) * 170 - p.ovy * 13) * dt;
          p.ox += p.ovx * dt;
          p.oy += p.ovy * dt;
        }
      }
    }
    if (filling && settled >= pellets.length) filling = false;
  }

  function draw(ctx: CanvasRenderingContext2D) {
    const half = S / 2;
    for (const p of pellets) {
      if (p.state === 0) continue;
      const a = p.state === 1 ? Math.min(1, (p.y - p.spawnY) / cfg.fadeIn) : 1;
      if (a <= 0.01) continue;
      if (a < 1) ctx.globalAlpha = a;
      ctx.drawImage(sprites[p.ci][p.tone][p.ang], p.x + p.ox - half, p.y + p.oy - half, S, S);
      if (a < 1) ctx.globalAlpha = 1;
    }
  }

  return {
    startFill,
    settleAll,
    step,
    draw,
    pointer,
    get filled() {
      return !filling && settled >= pellets.length;
    },
    get count() {
      return pellets.length;
    },
  };
}

export type Field = ReturnType<typeof createField>;
