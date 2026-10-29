import { useEffect, useRef, useState } from "react";
import { createField, sampleTargets } from "./granuleField";
import type { Field } from "./granuleField";
import { prefersReducedMotion } from "./hooks";

type Props = {
  color: string;
  /** "dark" = dark glass lines for light backgrounds */
  ink: "light" | "dark";
  /** play the fill while true (the jar is empty until then) */
  live?: boolean;
  /** ignore `live` and play whenever the jar is on screen */
  auto?: boolean;
  label?: string;
};

/**
 * A transparent glass jar that starts empty. When it goes live, PA6 granules rain in
 * and fill it in order, bottom first, then stay put. Nothing loops, so nothing hangs in mid-air.
 */
export default function PelletJar({ color, ink, live = false, auto = false, label = "RECYCLED PA6" }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<Field | null>(null);
  const redraw = useRef<() => void>(() => {});
  const loop = useRef<{ play: () => void; pause: () => void }>({ play: () => {}, pause: () => {} });
  const [seen, setSeen] = useState(false);
  const on = auto ? seen : live;
  const reduced = prefersReducedMotion();
  const onRef = useRef(on);
  onRef.current = on;

  // own visibility, used when `auto`
  useEffect(() => {
    if (!auto || !wrap.current) return;
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.55 });
    io.observe(wrap.current);
    return () => io.disconnect();
  }, [auto]);

  // build the jar + granules whenever size or colour changes
  useEffect(() => {
    const el = wrap.current!;
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    let raf = 0;
    let running = false;
    let last = 0;
    let disposed = false;
    let rt = 0;
    let W = 0, H = 0, dpr = 1;
    let back: HTMLCanvasElement | null = null;
    let front: HTMLCanvasElement | null = null;
    let builtW = 0, builtH = 0;

    const stroke = ink === "dark" ? "rgba(24,18,8,0.55)" : "rgba(255,255,255,0.7)";
    const faint = ink === "dark" ? "rgba(24,18,8,0.22)" : "rgba(255,255,255,0.28)";
    const text = ink === "dark" ? "rgba(24,18,8,0.55)" : "rgba(255,255,255,0.62)";

    function build() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = el.clientWidth;
      H = el.clientHeight;
      builtW = W;
      builtH = H;
      if (W < 40 || H < 40) return;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);

      // jar geometry
      const jarH = H * 0.74;
      const jarW = Math.min(W * 0.72, jarH * 1.15);
      const cx = W / 2, left = cx - jarW / 2, right = cx + jarW / 2;
      const top = H * 0.2, bottom = top + jarH;
      const t = Math.max(7, jarW * 0.026);
      const rB = jarW * 0.1;
      const fillTop = bottom - jarH * 0.72;
      const mound = jarH * 0.07;
      const ix0 = left + t, ix1 = right - t, iw = ix1 - ix0, ib = bottom - t * 1.5;

      const outline = (c: CanvasRenderingContext2D, inset = 0) => {
        c.beginPath();
        c.moveTo(left + inset, top);
        c.lineTo(left + inset, bottom - rB);
        c.arcTo(left + inset, bottom - inset, left + rB, bottom - inset, rB - inset * 0.5);
        c.lineTo(right - rB, bottom - inset);
        c.arcTo(right - inset, bottom - inset, right - inset, bottom - rB, rB - inset * 0.5);
        c.lineTo(right - inset, top);
      };

      // back layer: glass body + floor shadow
      back = document.createElement("canvas");
      back.width = cv.width;
      back.height = cv.height;
      const b = back.getContext("2d")!;
      b.scale(dpr, dpr);
      const sh = b.createRadialGradient(cx, bottom + 6, 4, cx, bottom + 6, jarW * 0.62);
      sh.addColorStop(0, "rgba(0,0,0,0.34)");
      sh.addColorStop(1, "rgba(0,0,0,0)");
      b.save();
      b.translate(0, bottom + 6);
      b.scale(1, 0.16);
      b.translate(0, -(bottom + 6));
      b.fillStyle = sh;
      b.beginPath();
      b.arc(cx, bottom + 6, jarW * 0.62, 0, Math.PI * 2);
      b.fill();
      b.restore();
      outline(b);
      b.lineTo(left, top);
      b.closePath();
      b.fillStyle = ink === "dark" ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.07)";
      b.fill();

      // front layer: glass edge, highlights, etched label (drawn above the granules)
      front = document.createElement("canvas");
      front.width = cv.width;
      front.height = cv.height;
      const f = front.getContext("2d")!;
      f.scale(dpr, dpr);
      f.lineCap = "round";
      f.lineJoin = "round";
      outline(f);
      f.strokeStyle = stroke;
      f.lineWidth = 2.4;
      f.stroke();
      outline(f, t);
      f.strokeStyle = faint;
      f.lineWidth = 1.2;
      f.stroke();
      // rim lips
      f.strokeStyle = stroke;
      f.lineWidth = 2.4;
      f.beginPath();
      f.moveTo(left - jarW * 0.035, top);
      f.lineTo(left + jarW * 0.05, top);
      f.moveTo(right + jarW * 0.035, top);
      f.lineTo(right - jarW * 0.05, top);
      f.stroke();
      // highlight streaks
      const hl = f.createLinearGradient(0, top + jarH * 0.08, 0, bottom - jarH * 0.12);
      hl.addColorStop(0, "rgba(255,255,255,0.0)");
      hl.addColorStop(0.25, "rgba(255,255,255,0.32)");
      hl.addColorStop(1, "rgba(255,255,255,0.0)");
      f.fillStyle = hl;
      f.fillRect(left + t * 2.3, top + jarH * 0.08, Math.max(5, jarW * 0.018), jarH * 0.72);
      f.fillRect(left + t * 2.3 + jarW * 0.04, top + jarH * 0.2, Math.max(2.5, jarW * 0.007), jarH * 0.45);
      f.fillRect(right - t * 3.2, top + jarH * 0.14, Math.max(3, jarW * 0.01), jarH * 0.5);
      // etched label
      f.fillStyle = text;
      f.font = `600 ${Math.max(11, jarW * 0.032)}px "Inter Variable", sans-serif`;
      f.textAlign = "center";
      f.fillText(label.split("").join(" "), cx, top + jarH * 0.15);

      // granule rest positions inside the jar, with a gentle mound on top
      const pw = Math.max(6, Math.min(14, iw / 36));
      const ph = pw * 0.6;
      const insideJar = (x: number, y: number) => {
        const lx = x + ix0, ly = y + fillTop - mound - 2; // local → canvas coords
        if (lx < ix0 + pw * 0.2 || lx > ix1 - pw * 0.2 || ly > ib) return false;
        const u = (lx - cx) / (iw / 2);
        if (ly < fillTop - mound * (1 - u * u)) return false;
        if (ly > bottom - rB - 1) {
          const ccx = lx < cx ? left + rB : right - rB;
          if ((lx < left + rB || lx > right - rB) && Math.hypot(lx - ccx, ly - (bottom - rB)) > rB - t - pw * 0.3) return false;
        }
        return true;
      };
      const lw = iw, lh = ib - (fillTop - mound);
      const targets = sampleTargets(insideJar, lw, lh, pw, ph).map((p) => ({ x: p.x + ix0, y: p.y + fillTop - mound - 2 }));
      if (targets.length < 10) return;
      fieldRef.current = createField({
        targets,
        palette: [color],
        pw,
        ph,
        dpr,
        fillSeconds: 2.6,
        spawnMin: 4,
        spawnMax: Math.max(10, top * 0.7),
        fadeIn: 42,
        spreadX: 18,
        steer: 5,
      });
    }

    function draw() {
      if (!fieldRef.current || !back || !front) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(back, 0, 0, W, H);
      fieldRef.current.draw(ctx);
      ctx.drawImage(front, 0, 0, W, H);
    }
    redraw.current = draw;

    function tick(tm: number) {
      raf = 0;
      const fld = fieldRef.current;
      if (disposed || !running || !fld) return;
      const dt = Math.min(0.033, (tm - last) / 1000 || 0.016);
      last = tm;
      fld.step(dt);
      draw();
      if (fld.filled) {
        running = false; // finished: stop the loop, the jar stays full
        return;
      }
      raf = requestAnimationFrame(tick);
    }
    loop.current = {
      play() {
        if (running || !fieldRef.current) return;
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(tick);
      },
      pause() {
        running = false;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      },
    };

    // empty jar by default
    const init = () => {
      build();
      if (fieldRef.current) {
        // start with nothing inside: settle then hide by starting an un-triggered fill
        fieldRef.current.startFill();
        // startFill leaves pellets in the waiting state, so only the glass is drawn
        draw();
      }
    };
    init();

    const ro = new ResizeObserver(() => {
      clearTimeout(rt);
      rt = window.setTimeout(() => {
        // the first observer callback and tiny changes must not restart a running fill
        if (disposed || (Math.abs(el.clientWidth - builtW) < 2 && Math.abs(el.clientHeight - builtH) < 2)) return;
        const wasFilled = fieldRef.current?.filled ?? false;
        loop.current.pause();
        build();
        if (fieldRef.current) {
          if (wasFilled) fieldRef.current.settleAll();
          else fieldRef.current.startFill();
          draw();
          if (!wasFilled && onRef.current && !prefersReducedMotion()) loop.current.play();
        }
      }, 200);
    });
    ro.observe(el);

    return () => {
      disposed = true;
      loop.current.pause();
      clearTimeout(rt);
      ro.disconnect();
      fieldRef.current = null;
    };
  }, [color, ink, label]);

  // play / reset in response to being live
  useEffect(() => {
    const fld = fieldRef.current;
    if (!fld) return;
    if (on) {
      if (reduced) {
        fld.settleAll();
        redraw.current();
      } else {
        fld.startFill();
        loop.current.play();
      }
    } else {
      loop.current.pause();
    }
  }, [on, reduced, color, ink]);

  return (
    <div className="jar" ref={wrap}>
      <canvas ref={canvas} role="img" aria-label="Glass jar being filled with recycled PA6 granules" />
    </div>
  );
}
