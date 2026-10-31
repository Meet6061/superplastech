import { useRef, useState } from "react";
import Logo from "./Logo";
import ColourStage from "./ColourStage";
import Hero from "./Hero";
import PelletJar from "./PelletJar";
import TubSizes from "./TubSizes";
import { Pa6Uses, TubUses } from "./UseCases";
import { PA6_SLIDES, TUB_SLIDES } from "./data";
import { clamp, prefersReducedMotion, smooth, useCountUp, useRevealOnScroll, useViewportProgress } from "./hooks";

const PHONE = { names: "Ankit Desai & Harsh Patel", tel: "+918320466001", show: "+91 83204 66001" };
const MAP_LINK = "https://maps.app.goo.gl/JMbVsFW5GZBRWXWTA?g_st=iw";
const EMAIL = "superplastech6001@gmail.com";

/* ───────────────────────── Nav ───────────────────────── */

const LINKS = [
  { href: "#about", label: "About" },
  { href: "#products", label: "Products" },
  { href: "#facility", label: "Facility" },
  { href: "#contact", label: "Contact" },
];

function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <nav className={`nav${open ? " open" : ""}`}>
      <div className="wrap nav-in">
        <a href="#top" className="mark" onClick={() => setOpen(false)}>
          <Logo height={30} />
          <span className="mark-name">
            <b>Super Plastech</b>
            <span>Industries</span>
          </span>
        </a>
        <div className="nav-links">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </div>
        <div className="nav-right">
          <a href="#contact" className="btn btn-light btn-sm">
            Get a quote
          </a>
          <button className="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            <i />
            <i />
          </button>
        </div>
      </div>
      <div className="nav-sheet">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

/* ───────────────────────── Introduction ───────────────────────── */

const INTRO =
  "Super Plastech Industries makes heavy-duty injection-moulded tubs, and, as a separate line, recycled PA6 polyamide granules for industry. Both are made in India, built to take a beating and keep their shine.";

function Intro() {
  const words = INTRO.split(" ");
  const spans = useRef<(HTMLSpanElement | null)[]>([]);
  const ref = useViewportProgress<HTMLDivElement>((p) => {
    const lit = clamp((p - 0.22) / 0.3) * words.length;
    for (let i = 0; i < words.length; i++) {
      const s = spans.current[i];
      if (s) s.style.opacity = String(prefersReducedMotion() ? 1 : 0.16 + 0.84 * smooth(clamp(lit - i + 1)));
    }
  });
  const [r1, v1] = useCountUp(6);
  const [r2, v2] = useCountUp(10);
  const [r3, v3] = useCountUp(450);

  return (
    <section className="section intro" id="about">
      <div className="wrap">
        <div className="intro-grid">
          <span className="eyebrow">About us</span>
          <div ref={ref}>
            <p className="intro-text">
              {words.map((w, i) => (
                <span
                  key={i}
                  ref={(el) => {
                    spans.current[i] = el;
                  }}
                >
                  {w}{" "}
                </span>
              ))}
            </p>
          </div>
        </div>

        <div className="facts-head" data-reveal>
          <span className="eyebrow">At a glance</span>
          <p>What we make and how we make it, in three numbers.</p>
        </div>
        <div className="facts">
          <div className="fact" data-reveal>
            <div className="fact-num">
              <span ref={r1}>{v1}</span>
              <small>sizes</small>
            </div>
            <b>Tub sizes, 14″ to 24″</b>
            <p>From a compact tub for the home to a large one for heavy worksite use.</p>
          </div>
          <div className="fact" data-reveal style={{ transitionDelay: ".08s" }}>
            <div className="fact-num">
              <span ref={r2}>{v2}</span>
              <small>colourways</small>
            </div>
            <b>Colours to choose from</b>
            <p>Six solid colours and four dual-tone blends, all in the same glossy finish.</p>
          </div>
          <div className="fact" data-reveal style={{ transitionDelay: ".16s" }}>
            <div className="fact-num">
              <span ref={r3}>{v3}</span>
              <small>tonnes</small>
            </div>
            <b>Moulding machine capacity</b>
            <p>Our Milacron Hydron Servo 450 injection-moulding machine gives every tub the same precision.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Products ───────────────────────── */

function ProductsIntro() {
  return (
    <section className="section products-head" id="products">
      <div className="wrap">
        <div className="head-split">
          <div>
            <span className="eyebrow">Products</span>
            <h2>Two separate product lines.</h2>
          </div>
          <p className="lead">
            Pick a line to see every colour we make. Scroll or swipe through them one at a time.
          </p>
        </div>

        <div className="line-grid">
          <a href="#tub-sizes" className="line-card" data-reveal>
            <div className="line-top">
              <span className="tag">Tubs &amp; basins</span>
            </div>
            <div className="line-art">
              <img src="/img/yellow.webp" alt="" loading="lazy" />
            </div>
            <div className="line-bottom">
              <div>
                <h3>Super Strength tubs</h3>
                <p>Impact-resistant, glossy and stackable. Six sizes, ten colourways.</p>
              </div>
              <span className="go" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M6 13l6 6 6-6" />
                </svg>
              </span>
            </div>
          </a>

          <a href="#pa6" className="line-card" data-reveal style={{ transitionDelay: ".1s" }}>
            <div className="line-top">
              <span className="tag">Granules</span>
            </div>
            <div className="line-art art-pellets">
              <PelletJar color="#2457dd" ink="dark" auto />
            </div>
            <div className="line-bottom">
              <div>
                <h3>Recycled PA6 polyamide</h3>
                <p>Reprocessed Nylon 6 granules, available in a range of colours.</p>
              </div>
              <span className="go" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M6 13l6 6 6-6" />
                </svg>
              </span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

function Pa6Notes() {
  const items = [
    { t: "Recycled content", d: "Reclaimed polyamide 6 (Nylon 6), reprocessed into uniform granules." },
    { t: "Made in India", d: "A line of its own, separate from our tubs, produced at our own plant." },
    { t: "Colours to order", d: "The standard colours shown here, with custom colours on request." },
  ];
  return (
    <section className="section pa6-notes">
      <div className="wrap">
        <div className="notes-grid">
          {items.map((n, i) => (
            <div key={n.t} className="note" data-reveal style={{ transitionDelay: `${i * 0.08}s` }}>
              <h3>{n.t}</h3>
              <p>{n.d}</p>
            </div>
          ))}
        </div>
        <div className="notes-cta" data-reveal>
          <p>Need samples, specifications or bulk pricing for PA6 granules?</p>
          <a href="#contact" className="btn btn-dark">
            Enquire about PA6
          </a>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Facility ───────────────────────── */

const CALLOUTS = [
  { label: "Hopper", x: 81, y: 12, side: "l" },
  { label: "Clamping unit", x: 33, y: 50, side: "r" },
  { label: "Control panel", x: 54, y: 40, side: "b" },
  { label: "Injection unit", x: 74, y: 44, side: "r" },
];

function Facility() {
  const ref = useViewportProgress<HTMLDivElement>((p, el) => {
    const t = prefersReducedMotion() ? 1 : smooth(clamp((p - 0.18) / 0.3));
    el.style.opacity = String(0.15 + 0.85 * t);
    el.style.transform = `translate3d(${((1 - t) * 90).toFixed(1)}px, 0, 0)`;
  });
  return (
    <section className="section facility" id="facility">
      <div className="wrap">
        <div className="head-split">
          <div>
            <span className="eyebrow on-dark">Facility</span>
            <h2>Our tubs are made on our own floor.</h2>
          </div>
          <p className="lead on-dark">
            Our line runs on a Milacron Hydron Servo 450. Servo-driven for consistent shots, tight
            tolerances and clean finishes on every cycle.
          </p>
        </div>

        <div className="machine" ref={ref}>
          <div className="machine-stage">
            <img src="/img/machine.webp" alt="Milacron Hydron Servo 450 injection moulding machine" loading="lazy" />
            {CALLOUTS.map((c, i) => (
              <span
                key={c.label}
                className={`pin pin-${c.side}`}
                style={{ left: `${c.x}%`, top: `${c.y}%`, animationDelay: `${i * 0.4}s` }}
              >
                <i />
                <em>{c.label}</em>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Contact ───────────────────────── */

function Icon({ name }: { name: "mail" | "pin" | "doc" | "phone" }) {
  const p = {
    phone: "M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.24 11 11 0 003.4.55 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11 11 0 00.55 3.4 1 1 0 01-.24 1l-2.2 2.4z",
    mail: "M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zm0 2v.5l8 5 8-5V7l-8 5-8-5z",
    pin: "M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z",
    doc: "M6 2h8l4 4v14a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2zm7 1.5V7h3.5L13 3.5z",
  }[name];
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={p} />
    </svg>
  );
}

function Contact() {
  return (
    <section className="section contact" id="contact">
      <div className="wrap">
        <div className="head-split">
          <div>
            <span className="eyebrow">Contact</span>
            <h2>Talk to our team.</h2>
          </div>
          <p className="lead">
            Bulk enquiries, custom colours and trade pricing. We ship tubs and PA6 granules across India.
          </p>
        </div>

        <div className="contact-grid">
          <div className="contact-card" data-reveal>
            <div className="people">
              <a href={`tel:${PHONE.tel}`} className="person">
                <span className="ico">
                  <Icon name="phone" />
                </span>
                <span>
                  <small>Sales</small>
                  <b>{PHONE.names}</b>
                  <em>{PHONE.show}</em>
                </span>
              </a>
            </div>
            <a className="crow" href={`mailto:${EMAIL}`}>
              <span className="ico">
                <Icon name="mail" />
              </span>
              <span>
                <small>Email</small>
                <b>{EMAIL}</b>
              </span>
            </a>
            <div className="crow">
              <span className="ico">
                <Icon name="pin" />
              </span>
              <span>
                <small>Factory</small>
                <b>Super Plastech Industries, Plot No. 59, G.I.D.C. Industrial Estate, Highway Road, GIDC Kalol – 382725, Dist. Gandhinagar, Gujarat, India</b>
              </span>
            </div>
            <div className="crow">
              <span className="ico">
                <Icon name="doc" />
              </span>
              <span>
                <small>GSTIN</small>
                <b>24AFSFS8141K1ZD</b>
              </span>
            </div>
          </div>

          <div className="map-card" data-reveal style={{ transitionDelay: ".1s" }}>
            <iframe
              title="Super Plastech Industries, Kalol GIDC"
              src="https://www.google.com/maps?q=GIDC+Industrial+Estate+Kalol+Gandhinagar+Gujarat&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a className="btn btn-dark btn-sm map-open" href={MAP_LINK} target="_blank" rel="noopener noreferrer">
              Open in Google Maps
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Footer ───────────────────────── */

function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <a href="#top" className="mark" aria-label="Super Plastech Industries">
              <Logo variant="lockup" height={52} />
            </a>
            <p>Heavy-duty tubs and recycled PA6 polyamide granules. Made in India.</p>
          </div>
          <div className="footer-cols">
            <div>
              <h4>Explore</h4>
              {LINKS.map((l) => (
                <a key={l.href} href={l.href}>
                  {l.label}
                </a>
              ))}
            </div>
            <div>
              <h4>Reach us</h4>
              <a href={`tel:${PHONE.tel}`}>{PHONE.show}</a>
              <a href={`mailto:${EMAIL}`}>Email us</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Super Plastech Industries. All rights reserved.</span>
          <span>Plot No. 59, G.I.D.C. Kalol · Gujarat · India</span>
        </div>
      </div>
    </footer>
  );
}

/* ───────────────────────── App ───────────────────────── */

export default function App() {
  useRevealOnScroll();
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Intro />
        <ProductsIntro />
        <TubSizes />
        <ColourStage
          id="tubs"
          kicker="Tubs & basins"
          slides={TUB_SLIDES}
          alt={(s) => `Super Plastech ${s.name} tub`}
        />
        <TubUses />
        <ColourStage
          id="pa6"
          kicker="Recycled PA6"
          slides={PA6_SLIDES}
          alt={(s) => `${s.name} recycled PA6 granules`}
        />
        <Pa6Uses />
        <Pa6Notes />
        <Facility />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
