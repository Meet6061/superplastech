import { useCallback, useEffect, useRef, useState } from "react";
import { SIZES } from "./data";
import { clamp, prefersReducedMotion, smooth } from "./hooks";

/**
 * Six tubs start nested inside each other. As the visitor scrolls, the smallest lifts out,
 * glides to its place and lands on the ground, then the next one, until all six sit in a row.
 * Everything is driven by scroll position, so scrolling back up packs them away again.
 */

const NAV = 64; // keep in sync with --nav-h
const SPAN = 5.6; // scroll length of the section, in viewport heights
const N = SIZES.length; // sizes are ordered smallest → largest
const ASPECT = [655, 621, 617, 652, 657, 624].map((h) => h / 1200); // image height ÷ width
/** The tub opening as fractions of its image: used to hide a tub behind the front lip of the one around it. */
const OPEN = { cy: 0.19, rx: 0.455, ry: 0.12 };
const START = 0.055; // when the first tub starts to leave
const STEP = 0.138; // delay between tubs
const LEN = 0.2; // scroll share of one tub's journey
const RISE = 0.34; // share of the journey spent lifting out
const DROP = 0.74; // share at which the drop to the ground begins

type Layout = ReturnType<typeof computeLayout>;

function computeLayout(W: number, H: number) {
  const mobile = W < 720;
  const WN = mobile ? Math.min(W * 0.84, 400) : clamp(W * 0.3, 320, 460); // width of the biggest tub while nested
  const sN = WN / 24;
  const wN = SIZES.map((s) => s.inch * sN);
  const hN = wN.map((w, i) => w * ASPECT[i]);
  const nestBottom = H * (mobile ? 0.54 : 0.55);

  // each smaller tub sits a little lower inside the next one
  const top: number[] = new Array(N).fill(0);
  top[N - 1] = nestBottom - hN[N - 1];
  for (let i = N - 2; i >= 0; i--) top[i] = top[i + 1] + 0.22 * (hN[i + 1] - hN[i]) + 0.04 * hN[i + 1];

  // where each tub finally stands
  const gap = mobile ? 10 : 12;
  const slots: { x: number; y: number }[] = [];
  let sF: number;
  if (!mobile) {
    sF = Math.min(11.6, (W - 96 - gap * 5) / 114);
    const total = 114 * sF + gap * 5;
    let x = (W - total) / 2;
    const yG = H - 112;
    SIZES.forEach((s) => {
      const w = s.inch * sF;
      slots.push({ x: x + w / 2, y: yG });
      x += w + gap;
    });
  } else {
    sF = Math.min(6, (W - 36 - gap * 2) / 66);
    // two rows: the tubs that land later go in the back row, so they never fly over tubs already landed
    const yBack = nestBottom + 74;
    const yFront = yBack + 24 * sF * 0.53 + 56;
    [[3, 4, 5], [0, 1, 2]].forEach((row, r) => {
      const total = row.reduce((a, i) => a + SIZES[i].inch * sF, 0) + gap * 2;
      let x = (W - total) / 2;
      row.forEach((i) => {
        const w = SIZES[i].inch * sF;
        slots[i] = { x: x + w / 2, y: r ? yFront : yBack };
        x += w + gap;
      });
    });
  }
  return { W, H, cx: W / 2, wN, hN, top, nestBottom, slots, sF, kF: sF / sN, hover: top[N - 1] - 24, mobile };
}

/** Polygon (in the tub's own pixels) that keeps only what is above the front lips of every larger tub. */
function clipFor(L: Layout, i: number, tx: number, ty: number) {
  const enc: { cx: number; cy: number; rx: number; ry: number }[] = [];
  for (let j = i + 1; j < N; j++)
    enc.push({ cx: L.cx, cy: L.top[j] + OPEN.cy * L.hN[j], rx: OPEN.rx * L.wN[j], ry: OPEN.ry * L.hN[j] });
  const outer = enc[enc.length - 1];
  const x0 = L.cx - outer.rx;
  const x1 = L.cx + outer.rx;
  const yAt = (X: number) => {
    let y = Infinity;
    for (const e of enc) {
      const dx = (X - e.cx) / e.rx;
      const v = Math.abs(dx) < 1 ? e.cy + e.ry * Math.sqrt(1 - dx * dx) : e.cy;
      if (v < y) y = v;
    }
    return y;
  };
  const P = (X: number, Y: number) => `${(X - tx).toFixed(1)}px ${(Y - ty).toFixed(1)}px`;
  const pts = [P(x0 - 700, -3000), P(x0 - 700, yAt(x0))];
  const S = 24;
  for (let s = 0; s <= S; s++) {
    const X = x0 + ((x1 - x0) * s) / S;
    pts.push(P(X, yAt(X)));
  }
  pts.push(P(x1 + 700, yAt(x1)), P(x1 + 700, -3000));
  return `polygon(${pts.join(",")})`;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export default function TubSizes() {
  const secRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const lay = useRef<Layout | null>(null);
  const imgs = useRef<(HTMLImageElement | null)[]>([]);
  const shadows = useRef<(HTMLDivElement | null)[]>([]);
  const labels = useRef<(HTMLDivElement | null)[]>([]);
  const nestShadow = useRef<HTMLDivElement>(null);
  const floor = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const beatRef = useRef(-1);
  const [beat, setBeat] = useState(-1);
  const reduced = prefersReducedMotion();

  const frame = useCallback(() => {
    const sec = secRef.current;
    const L = lay.current;
    if (!sec || !L) return;
    const r = sec.getBoundingClientRect();
    const pinH = window.innerHeight - NAV;
    const p = prefersReducedMotion() ? 1 : clamp((NAV - r.top) / Math.max(1, r.height - pinH));

    let current = -1;
    for (let i = 0; i < N; i++) {
      const u = clamp((p - (START + i * STEP)) / LEN);
      if (u > 0.001) current = i;
      const wN = L.wN[i];
      const hN = L.hN[i];
      const slot = L.slots[i];
      const bottom0 = L.top[i] + hN;
      const hv = i === N - 1 ? bottom0 - 40 : L.hover; // the biggest tub has nothing inside, so it only lifts a little
      let xc = L.cx;
      let yb = bottom0;
      let k = 1;
      let rot = 0;
      if (u > 0) {
        const a = clamp(u / RISE);
        const g = clamp((u - RISE) / (DROP - RISE));
        const d = clamp((u - DROP) / (1 - DROP));
        yb = lerp(bottom0, hv, easeOut(a));
        if (g > 0) {
          const eg = smooth(g);
          xc = lerp(L.cx, slot.x, eg);
          k = lerp(1, L.kF, eg);
          rot = Math.sin(g * Math.PI) * (i % 2 ? 6 : -6);
          // fly across first, then sweep down towards the ground (keeps clear of the nest and the caption)
          yb = lerp(hv, slot.y - 60, smooth(clamp((g - 0.2) / 0.8)));
        }
        if (d > 0) yb = lerp(slot.y - 60, slot.y, d * d);
      }
      const tx = xc - wN / 2;
      const ty = yb - hN;
      const img = imgs.current[i];
      if (img) {
        img.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${k.toFixed(4)})`;
        img.style.zIndex = String(u > 0 ? 40 + i : 10 + (N - i));
        img.style.clipPath = i < N - 1 && u < RISE ? clipFor(L, i, tx, ty) : "none";
      }
      const sh = shadows.current[i];
      if (sh) sh.style.opacity = String(0.9 * smooth(clamp((u - 0.7) / 0.3)));
      const lb = labels.current[i];
      if (lb) {
        const o = smooth(clamp((u - 0.88) / 0.12));
        lb.style.opacity = String(o);
        lb.style.transform = `translate3d(-50%, ${((1 - o) * 8).toFixed(1)}px, 0)`;
      }
      if (i === N - 1 && nestShadow.current) nestShadow.current.style.opacity = String(1 - clamp(u / 0.3));
    }
    if (hint.current) hint.current.style.opacity = p < 0.02 ? "1" : "0";

    const b = clamp((p - (START + (N - 1) * STEP) - LEN * 0.9) / 0.001) >= 1 ? N : current;
    if (b !== beatRef.current) {
      beatRef.current = b;
      setBeat(b);
    }
  }, []);

  const apply = useCallback(() => {
    const pin = pinRef.current;
    if (!pin) return;
    const L = computeLayout(pin.clientWidth, pin.clientHeight);
    lay.current = L;
    for (let i = 0; i < N; i++) {
      const img = imgs.current[i];
      if (img) {
        img.style.width = `${L.wN[i]}px`;
        img.style.height = `${L.hN[i]}px`;
      }
      const sh = shadows.current[i];
      if (sh) {
        const w = SIZES[i].inch * L.sF;
        sh.style.width = `${w * 0.96}px`;
        sh.style.left = `${L.slots[i].x}px`;
        sh.style.top = `${L.slots[i].y - 6}px`;
      }
      const lb = labels.current[i];
      if (lb) {
        lb.style.left = `${L.slots[i].x}px`;
        lb.style.top = `${L.slots[i].y + 12}px`;
      }
    }
    if (nestShadow.current) {
      nestShadow.current.style.width = `${L.wN[N - 1] * 1.02}px`;
      nestShadow.current.style.left = `${L.cx}px`;
      nestShadow.current.style.top = `${L.nestBottom - 8}px`;
    }
    if (floor.current) floor.current.style.top = `${L.nestBottom - 44}px`;
    frame();
  }, [frame]);

  useEffect(() => {
    apply();
    const pin = pinRef.current!;
    let w = pin.clientWidth;
    let h = pin.clientHeight;
    const ro = new ResizeObserver(() => {
      if (Math.abs(pin.clientWidth - w) < 1 && Math.abs(pin.clientHeight - h) < 1) return;
      w = pin.clientWidth;
      h = pin.clientHeight;
      apply();
    });
    ro.observe(pin);
    let raf = 0;
    const req = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          frame();
        });
    };
    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", req);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", req);
      window.removeEventListener("resize", req);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [apply, frame]);

  const head =
    beat < 0
      ? { h: "Six sizes, one stack.", p: "Each tub nests inside the next. Scroll to unpack them." }
      : beat >= N
        ? { h: "Six sizes. Six colours.", p: "From a compact 14″ for the home to a 24″ for heavy worksite use." }
        : { h: `${SIZES[beat].inch}″ ${SIZES[beat].label}`, p: `Size ${beat + 1} of ${N}` };

  return (
    <section
      id="tub-sizes"
      ref={secRef}
      className={`tsz${reduced ? " tsz-static" : ""}`}
      aria-label="Tub sizes"
      style={reduced ? undefined : { height: `${SPAN * 100}svh` }}
    >
      <div className="tsz-pin" ref={pinRef}>
        <div className="tsz-floor" ref={floor} />
        <div className="tsz-nest-shadow" ref={nestShadow} />

        {SIZES.map((s, i) => (
          <div key={`sh${s.inch}`} className="tsz-shadow" ref={(el) => { shadows.current[i] = el; }} />
        ))}
        {SIZES.map((s, i) => (
          <img
            key={s.inch}
            ref={(el) => { imgs.current[i] = el; }}
            className="tsz-tub"
            src={`/img/${s.img}.webp`}
            alt={`${s.inch} inch ${s.label} tub`}
            draggable={false}
            decoding="async"
          />
        ))}
        {SIZES.map((s, i) => (
          <div key={`lb${s.inch}`} className="tsz-label" ref={(el) => { labels.current[i] = el; }} aria-hidden="true">
            <b>{s.inch}″</b>
            <span>{s.label}</span>
          </div>
        ))}

        <div className="tsz-top">
          <div className="wrap">
            <span className="tsz-kicker">Tubs &amp; basins · Sizes</span>
            <div className="tsz-cap" key={beat}>
              <h2>{head.h}</h2>
              <p>{head.p}</p>
            </div>
          </div>
        </div>
        <div className="tsz-hint" ref={hint} aria-hidden="true">
          Scroll to unpack <i>↓</i>
        </div>
      </div>
    </section>
  );
}
