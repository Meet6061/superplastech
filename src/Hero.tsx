import { useEffect, useRef } from "react";
import { createField, sampleTargets } from "./granuleField";
import type { Field } from "./granuleField";
import { prefersReducedMotion } from "./hooks";

/** Theme colours only: the brand green, with a little off-white for sparkle. */
const PALETTE = ["#34c58a", "#f1ecdc"];
const WEIGHTS = [0.88, 0.12];
const GLOW = [52, 197, 138];
const FONT = (px: number) => `800 ${px}px "Bricolage Grotesque Variable", "Inter Variable", sans-serif`;

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current!;
    const canvas = canvasRef.current!;
    const slot = slotRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = prefersReducedMotion();

    let disposed = false;
    let raf = 0;
    let running = false;
    let visible = true;
    let away = false;
    let W = 0, H = 0, dpr = 1;
    let base: HTMLCanvasElement | null = null;
    let field: Field | null = null;
    let last = 0;
    let builtWidth = 0;

    hero.style.setProperty("--hg", GLOW.join(","));

    function build() {
      const hr = hero.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.round(hr.width);
      H = Math.round(hr.height);
      builtWidth = hero.clientWidth;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";

      // fit "SUPER" to the slot width
      const sr = slot.getBoundingClientRect();
      const sx = sr.left - hr.left, sw = sr.width;
      const probe = document.createElement("canvas").getContext("2d")!;
      probe.font = FONT(200);
      let m = probe.measureText("SUPER");
      const fs = (200 * sw) / (m.actualBoundingBoxLeft + m.actualBoundingBoxRight);
      probe.font = FONT(fs);
      m = probe.measureText("SUPER");
      const asc = m.actualBoundingBoxAscent, desc = m.actualBoundingBoxDescent;
      const inkH = asc + desc;
      slot.style.height = Math.round(inkH) + "px";
      const srTop = slot.getBoundingClientRect().top - hr.top;
      const tx0 = sx + m.actualBoundingBoxLeft;
      const ty0 = srTop + asc;

      // embossed cavity, drawn once
      base = document.createElement("canvas");
      base.width = canvas.width;
      base.height = canvas.height;
      const b = base.getContext("2d")!;
      b.scale(dpr, dpr);
      b.font = FONT(fs);
      b.textBaseline = "alphabetic";
      b.fillStyle = "rgba(255,255,255,0.10)";
      b.fillText("SUPER", tx0, ty0 + 2.5);
      b.fillStyle = "rgba(0,0,0,0.75)";
      b.fillText("SUPER", tx0, ty0 - 2.5);
      const g = b.createLinearGradient(0, srTop, 0, srTop + inkH);
      g.addColorStop(0, "#080c0a");
      g.addColorStop(1, "#18221d");
      b.fillStyle = g;
      b.fillText("SUPER", tx0, ty0);

      // letter mask → granule rest positions
      const mw = Math.ceil(sw) + 4, mh = Math.ceil(inkH) + 4;
      const mk = document.createElement("canvas");
      mk.width = mw;
      mk.height = mh;
      const mc = mk.getContext("2d")!;
      mc.font = FONT(fs);
      mc.fillStyle = "#000";
      mc.fillText("SUPER", m.actualBoundingBoxLeft + 2, asc + 2);
      const data = mc.getImageData(0, 0, mw, mh).data;
      const inside = (x: number, y: number) => {
        const xi = Math.round(x), yi = Math.round(y);
        return xi >= 0 && yi >= 0 && xi < mw && yi < mh && data[(yi * mw + xi) * 4 + 3] > 200;
      };
      const pw = Math.max(6, Math.min(15, sw / 76));
      const ph = pw * 0.6;
      const originX = tx0 - (m.actualBoundingBoxLeft + 2);
      const originY = ty0 - (asc + 2);
      const targets = sampleTargets(inside, mw, mh, pw, ph).map((t) => ({ x: originX + t.x, y: originY + t.y }));

      field = createField({
        targets,
        palette: PALETTE,
        weights: WEIGHTS,
        pw,
        ph,
        dpr,
        fillSeconds: 3.2,
        spawnMin: -30,
        spawnMax: Math.max(40, srTop - 30),
        fadeIn: 60,
        spreadX: 26,
        steer: 7,
        pointerRadius: Math.max(70, W * 0.07),
      });
    }

    function draw() {
      if (!field) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (base) ctx.drawImage(base, 0, 0, W, H);
      field.draw(ctx);
    }

    function loop(t: number) {
      raf = 0;
      if (disposed || !running || !field) return;
      const dt = Math.min(0.033, (t - last) / 1000 || 0.016);
      last = t;
      field.step(dt);
      draw();
      raf = requestAnimationFrame(loop);
    }
    function play() {
      if (running || reduced || !visible || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
    function pause() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    const onMove = (e: PointerEvent) => {
      if (!field) return;
      const r = hero.getBoundingClientRect();
      field.pointer.x = e.clientX - r.left;
      field.pointer.y = e.clientY - r.top;
    };
    const onLeave = () => {
      if (field) field.pointer.x = field.pointer.y = -9999;
    };
    const onVis = () => (document.hidden ? pause() : play());

    let ro: ResizeObserver | null = null;
    let io: IntersectionObserver | null = null;
    let rt = 0;

    const init = async () => {
      try {
        await document.fonts.load('800 120px "Bricolage Grotesque Variable"');
      } catch {
        /* continue with the fallback font */
      }
      if (disposed) return;
      build();
      if (reduced) {
        field!.settleAll();
        draw();
      } else {
        field!.startFill(); // the hero always starts empty and fills
        play();
      }

      ro = new ResizeObserver(() => {
        clearTimeout(rt);
        rt = window.setTimeout(() => {
          // only a real change of width rebuilds (the first callback and height-only changes are ignored)
          if (disposed || Math.abs(hero.clientWidth - builtWidth) < 2) return;
          const wasFilled = field?.filled ?? false;
          build();
          if (wasFilled || reduced) field!.settleAll();
          else field!.startFill();
          if (reduced) draw();
        }, 200);
      });
      ro.observe(hero);

      io = new IntersectionObserver(
        ([e]) => {
          visible = e.isIntersecting;
          if (!visible) {
            away = true;
            pause();
            return;
          }
          if (away && !reduced && field) {
            away = false;
            field.startFill(); // replay the fill when the visitor scrolls back up
          }
          play();
        },
        { threshold: 0.35 }
      );
      io.observe(hero);
    };
    init();

    if (!reduced) {
      hero.addEventListener("pointermove", onMove);
      hero.addEventListener("pointerleave", onLeave);
      document.addEventListener("visibilitychange", onVis);
    }
    return () => {
      disposed = true;
      pause();
      clearTimeout(rt);
      ro?.disconnect();
      io?.disconnect();
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <header className="hero" id="top" ref={heroRef}>
      <div className="hero-glow" />
      <canvas className="hero-canvas" ref={canvasRef} aria-hidden="true" />
      <div className="wrap hero-in">
        <div className="hero-slot" ref={slotRef} aria-hidden="true" />

        <p className="hero-tag">
          <i />
          Recycled PA6 granules · Made in India
        </p>

        <div className="hero-copy">
          <span className="eyebrow on-dark">Made in India</span>
          <h1>Unbreakable plastics, made in India.</h1>
          <p className="lead on-dark">
            Two separate lines from one manufacturer: heavy-duty plastic tubs for everyday work, and recycled
            PA6 (Nylon 6) polyamide granules for industry.
          </p>
          <div className="hero-actions">
            <a href="#products" className="btn btn-light">
              Explore products
            </a>
            <a href="#contact" className="btn btn-line">
              Talk to sales
            </a>
          </div>
        </div>

        <a href="#about" className="scroll-cue" aria-label="Scroll to introduction">
          <span>Scroll</span>
          <i />
        </a>
      </div>
      <p className="sr-only">Super Plastech Industries. Recycled PA6 granules fill the word SUPER.</p>
    </header>
  );
}
