import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { clamp, prefersReducedMotion, smooth } from "./hooks";

const NAV = 64; // keep in sync with --nav-h in index.css
const PER = 62; // vertical scroll (in svh) spent on each card

export type StackItem = {
  title: string;
  text: string;
  /** photo file name inside public/img/uses/ */
  photo: string;
};

type Props = {
  id: string;
  tone: "light" | "dark";
  eyebrow: string;
  title: string;
  lead: string;
  items: StackItem[];
  note?: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * A pinned, scroll-driven card stack. One card is in front; the rest peek out behind it.
 * Scrolling deals the front card off to the side and brings the next one forward.
 * Scroll, swipe, arrows, dots and ← → keys all drive the same scroll position.
 */
export default function UseStack({ id, tone, eyebrow, title, lead, items, note }: Props) {
  const N = items.length;
  const dark = tone === "dark";
  const secRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const shades = useRef<(HTMLDivElement | null)[]>([]);
  const caps = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);
  const activeRef = useRef(0);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  const frame = useCallback(() => {
    const sec = secRef.current;
    if (!sec) return;
    const reduced = prefersReducedMotion();
    const r = sec.getBoundingClientRect();
    const pinH = window.innerHeight - NAV;
    const p = clamp((NAV - r.top) / Math.max(1, r.height - pinH));
    const pos = p * (N - 1);
    const idx = Math.round(pos);
    if (idx !== activeRef.current) {
      activeRef.current = idx;
      setActive(idx);
    }
    const cw = stageRef.current?.offsetWidth ?? 600;
    for (let i = 0; i < N; i++) {
      const d = i - pos;
      const el = cards.current[i];
      if (el) {
        let x = 0, y = 0, s = 1, rot = 0, op = 1;
        if (d >= 0) {
          // waiting behind the front card: each one a little higher, smaller and darker
          const k = Math.min(d, 3);
          if (!reduced) {
            x = 26 * k;
            y = -20 * k;
            s = 1 - 0.065 * k;
            rot = (i % 2 ? 1 : -1) * 1.4 * k;
          }
          op = reduced ? clamp(1 - d * 2) : clamp(3.3 - d);
        } else {
          // dealt off the stack to the right, away from the text
          const e = smooth(clamp(-d / 0.62));
          x = reduced ? 0 : e * cw * 0.6;
          y = reduced ? 0 : e * 34;
          s = reduced ? 1 : 1 - e * 0.05;
          rot = reduced ? 0 : e * 9;
          op = 1 - e;
        }
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${s.toFixed(3)})`;
        el.style.opacity = String(op);
        el.style.visibility = op < 0.01 ? "hidden" : "visible";
        el.style.zIndex = String(N - i);
      }
      const sh = shades.current[i];
      if (sh) sh.style.opacity = String(shade_(d, reduced));
      const c = caps.current[i];
      if (c) {
        const cv = clamp(1 - Math.abs(d) * 2.4);
        c.style.opacity = String(cv);
        c.style.transform = `translate3d(0, ${reduced ? 0 : (d * 26).toFixed(1)}px, 0)`;
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
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      go(activeRef.current + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      go(activeRef.current - 1);
    }
  };

  return (
    <section
      id={id}
      ref={secRef}
      className={`ukc ukc-${tone}`}
      aria-label={title}
      style={{ height: `calc(${(N - 1) * PER}svh + 100svh - var(--nav-h))` }}
    >
      <div
        className="ukc-pin"
        tabIndex={0}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={() => (swipe.current = null)}
        onKeyDown={onKey}
      >
        <div className="wrap ukc-in">
          <div className="ukc-text">
            <span className={`eyebrow${dark ? " on-dark" : ""}`}>{eyebrow}</span>
            <h2>{title}</h2>
            <p className={`lead${dark ? " on-dark" : ""}`}>{lead}</p>

            <div className="ukc-caps">
              {items.map((it, i) => (
                <div
                  key={it.title}
                  className="ukc-cap"
                  ref={(el) => {
                    caps.current[i] = el;
                  }}
                >
                  <span className="ukc-num">{pad(i + 1)}</span>
                  <h3>{it.title}</h3>
                  <p>{it.text}</p>
                </div>
              ))}
            </div>

            <div className="ukc-ctrl">
              <div className="ctrl-row">
                <button className="arrow" aria-label="Previous" disabled={active === 0} onClick={() => go(active - 1)}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 5l-7 7 7 7" />
                  </svg>
                </button>
                <div className="ukc-dots" role="tablist" aria-label={`${eyebrow} ${title}`}>
                  {items.map((it, i) => (
                    <button
                      key={it.title}
                      role="tab"
                      aria-selected={active === i}
                      aria-label={it.title}
                      title={it.title}
                      className={`ukc-dot${active === i ? " on" : ""}`}
                      onClick={() => go(i)}
                    />
                  ))}
                </div>
                <button className="arrow" aria-label="Next" disabled={active === N - 1} onClick={() => go(active + 1)}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <span className="ukc-count" aria-live="polite">
                  <b>{pad(active + 1)}</b> / {pad(N)}
                </span>
              </div>
              {note ? <p className="ukc-note">{note}</p> : null}
              <span className={`ukc-hint${!touched && active === 0 ? " on" : ""}`} aria-hidden="true">
                Scroll or swipe to see the next <i>↓</i>
              </span>
            </div>
          </div>

          <div className="ukc-stagewrap">
            <div className="ukc-stage" ref={stageRef}>
              {items.map((it, i) => (
                <div
                  key={it.title}
                  className="ukc-card"
                  ref={(el) => {
                    cards.current[i] = el;
                  }}
                  aria-hidden={active !== i}
                >
                  <img src={`/img/uses/${it.photo}`} alt={it.title} draggable={false} decoding="async" loading="lazy" />
                  <div
                    className="ukc-shade"
                    ref={(el) => {
                      shades.current[i] = el;
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function shade_(d: number, reduced: boolean) {
  return reduced || d < 0 ? 0 : clamp(d * 0.2);
}
