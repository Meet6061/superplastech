import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import PelletJar from "./PelletJar";
import type { Slide } from "./data";
import { clamp, prefersReducedMotion, smooth } from "./hooks";

const NAV = 64; // keep in sync with --nav-h in index.css
const PER = 62; // vertical scroll (in svh) spent on each colour

type Props = {
  id: string;
  kicker: string;
  slides: Slide[];
  alt: (s: Slide) => string;
};

const swatchBg = (s: Slide) =>
  s.swatch.length === 2
    ? `linear-gradient(180deg, ${s.swatch[0]} 0 50%, ${s.swatch[1]} 50% 100%)`
    : s.swatch[0];

/**
 * A pinned, scroll-driven "one colour at a time" stage.
 * Vertical scroll, horizontal swipe, arrows, swatches and ← → keys all
 * drive the same scroll position, so everything stays in sync.
 */
export default function ColourStage({ id, kicker, slides, alt }: Props) {
  const N = slides.length;
  const secRef = useRef<HTMLElement>(null);
  const bgs = useRef<(HTMLDivElement | null)[]>([]);
  const ghosts = useRef<(HTMLDivElement | null)[]>([]);
  const visuals = useRef<(HTMLDivElement | null)[]>([]);
  const caps = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);
  const [focus, setFocus] = useState(0);
  const [inView, setInView] = useState(false);
  const focusRef = useRef(0);
  const activeRef = useRef(0);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  const frame = useCallback(() => {
    const sec = secRef.current;
    if (!sec) return;
    const reduced = prefersReducedMotion();
    const r = sec.getBoundingClientRect();
    const pinH = window.innerHeight - NAV;
    const total = Math.max(1, r.height - pinH);
    const p = clamp((NAV - r.top) / total);
    const pos = p * (N - 1);
    const idx = Math.round(pos);
    if (idx !== activeRef.current) {
      activeRef.current = idx;
      setActive(idx);
    }
    // a jar starts filling only once its slide is nearly centred
    if (Math.abs(pos - idx) < 0.28 && idx !== focusRef.current) {
      focusRef.current = idx;
      setFocus(idx);
    }
    const vw = window.innerWidth;
    for (let i = 0; i < N; i++) {
      const d = i - pos;
      const ad = Math.abs(d);
      const vis = smooth(clamp(1 - (ad - 0.1) / 0.4));
      const bg = bgs.current[i];
      if (bg) bg.style.opacity = i === 0 ? "1" : String(clamp(pos - i + 1));
      const v = visuals.current[i];
      if (v) {
        const ty = reduced ? 0 : d * pinH * 0.3;
        const rot = reduced ? 0 : d * -8;
        const sc = reduced ? 1 : 1 - ad * 0.16;
        v.style.opacity = String(vis);
        v.style.transform = `translate3d(0, ${ty.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
        v.style.visibility = vis < 0.01 ? "hidden" : "visible";
      }
      const g = ghosts.current[i];
      if (g) {
        const tx = reduced ? 0 : d * -vw * 0.24;
        g.style.opacity = String(vis * 0.1);
        g.style.transform = `translate3d(calc(-50% + ${tx.toFixed(1)}px), -50%, 0)`;
        g.style.visibility = vis < 0.01 ? "hidden" : "visible";
      }
      const c = caps.current[i];
      if (c) {
        const cv = clamp(1 - ad * 2.4);
        c.style.opacity = String(cv);
        c.style.transform = `translate3d(0, ${reduced ? 0 : (d * 28).toFixed(1)}px, 0)`;
        c.style.pointerEvents = cv > 0.5 ? "auto" : "none";
      }
    }
  }, [N]);

  useEffect(() => {
    let raf = 0;
    const req = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          frame();
        });
    };
    frame();
    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", req);
    return () => {
      window.removeEventListener("scroll", req);
      window.removeEventListener("resize", req);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [frame]);

  useEffect(() => {
    const sec = secRef.current;
    if (!sec) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "-30% 0px -30% 0px" });
    io.observe(sec);
    return () => io.disconnect();
  }, []);

  const go = useCallback(
    (i: number) => {
      const sec = secRef.current;
      if (!sec) return;
      const t = clamp(i, 0, N - 1);
      const r = sec.getBoundingClientRect();
      const total = Math.max(1, r.height - (window.innerHeight - NAV));
      const top = window.scrollY + r.top - NAV + (t / (N - 1)) * total + 1;
      window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
      setTouched(true);
    },
    [N]
  );

  const onDown = (e: PointerEvent) => {
    swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onUp = (e: PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) go(activeRef.current + (dx < 0 ? 1 : -1));
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(activeRef.current + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(activeRef.current - 1);
    }
  };

  const cur = slides[active];
  const showHint = !touched && active === 0;

  return (
    <section
      id={id}
      ref={secRef}
      className="stage"
      aria-label={kicker}
      style={{ height: `calc(${(N - 1) * PER}svh + 100svh - var(--nav-h))` }}
    >
      <div
        className="stage-pin"
        data-tone={cur.fg}
        tabIndex={0}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={() => (swipe.current = null)}
        onKeyDown={onKey}
      >
        {slides.map((s, i) => (
          <div
            key={s.key}
            ref={(el) => {
              bgs.current[i] = el;
            }}
            className="sbg"
            style={{ background: `radial-gradient(120% 95% at 50% 40%, ${s.bg[0]} 0%, ${s.bg[1]} 78%)` }}
          />
        ))}
        <div className="stage-vig" />

        {slides.map((s, i) => (
          <div
            key={s.key}
            ref={(el) => {
              ghosts.current[i] = el;
            }}
            className="ghost"
            aria-hidden="true"
            style={{ fontSize: `clamp(78px, ${(100 / Math.max(5.2, s.name.length * 0.66)).toFixed(1)}vw, 330px)` }}
          >
            {s.name}
          </div>
        ))}

        <div className="stage-visuals">
          {slides.map((s, i) => (
            <div
              key={s.key}
              ref={(el) => {
                visuals.current[i] = el;
              }}
              className="sv"
              data-active={active === i}
            >
              {s.img ? (
                <img src={`/img/${s.img}.webp`} alt={alt(s)} draggable={false} decoding="async" />
              ) : (
                <PelletJar color={s.pellet ?? "#888888"} ink={s.fg === "dark" ? "dark" : "light"} live={inView && focus === i} />
              )}
            </div>
          ))}
        </div>

        <div className="stage-top">
          <div className="wrap stage-top-in">
            <div>
              <span className="stage-kicker">{kicker}</span>
              <span className="stage-group" key={cur.group}>
                {cur.group}
              </span>
            </div>
          </div>
        </div>

        <div className="stage-bottom">
          <div className="wrap stage-bottom-in">
            <div className="stage-caps">
              {slides.map((s, i) => (
                <div
                  key={s.key}
                  ref={(el) => {
                    caps.current[i] = el;
                  }}
                  className="cap"
                >
                  <h3>{s.name}</h3>
                  <p>{s.note}</p>
                </div>
              ))}
            </div>

            <div className="stage-ctrl">
              <span className={`stage-hint${showHint ? " on" : ""}`} aria-hidden="true">
                Scroll or swipe <i>→</i>
              </span>
              <div className="ctrl-row">
                <button className="arrow" aria-label="Previous colour" disabled={active === 0} onClick={() => go(active - 1)}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 5l-7 7 7 7" />
                  </svg>
                </button>
                <div className="swatches" role="tablist" aria-label={`${kicker} colours`}>
                  {slides.map((s, i) => (
                    <button
                      key={s.key}
                      role="tab"
                      aria-selected={active === i}
                      aria-label={s.name}
                      title={s.name}
                      className={`sw${active === i ? " on" : ""}`}
                      style={{ background: swatchBg(s) }}
                      onClick={() => go(i)}
                    />
                  ))}
                </div>
                <button className="arrow" aria-label="Next colour" disabled={active === N - 1} onClick={() => go(active + 1)}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
