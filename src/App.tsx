import Logo from "./Logo";

const COLORS = ["#e8b923", "#c0271f", "#1a5fc0", "#e8701a", "#8a939b", "#3fb58f"];
const SIZES = ['14"', '16"', '18"', '20"', '22"', '24"'];

function Icon({ name }: { name: "phone" | "mail" | "pin" | "doc" }) {
  const p = {
    phone: "M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.24 11 11 0 003.4.55 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11 11 0 00.55 3.4 1 1 0 01-.24 1l-2.2 2.4z",
    mail: "M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zm0 2v.5l8 5 8-5V7l-8 5-8-5z",
    pin: "M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z",
    doc: "M6 2h8l4 4v14a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2zm7 1.5V7h3.5L13 3.5z",
  }[name];
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor">
      <path d={p} />
    </svg>
  );
}

export default function App() {
  return (
    <>
      <nav className="nav">
        <div className="wrap">
          <a href="#top" className="mark">
            <Logo size={38} />
            <span className="mark-name">
              <b>SUPER PLASTECH</b>
              <span>INDUSTRIES</span>
            </span>
          </a>
          <div className="nav-links">
            <a href="#products">Products</a>
            <a href="#plant">Our Plant</a>
            <a href="#contact">Contact</a>
            <a href="#contact" className="nav-cta">Get a Quote</a>
          </div>
        </div>
      </nav>

      <header className="hero" id="top">
        <div className="wrap">
          <div>
            <span className="eyebrow">Made in India · Kalol, Gujarat</span>
            <h1 className="display">
              <span className="g">Super</span> Plastech
              <span className="r">Industries</span>
            </h1>
            <p className="hero-tagline">Super Strength. Unbreakable plastics.</p>
            <p className="hero-lead">
              Precision injection-moulded ghamela and utility tubs, built from virgin
              plastic to take a beating and keep their shine. Household, agricultural
              and Nylon&nbsp;6 granules — manufactured to a heavy-duty standard.
            </p>
            <div className="hero-tags">
              <span className="chip filled">Unbreakable</span>
              <span className="chip">Heavy Duty</span>
              <span className="chip">Long Lasting</span>
              <span className="chip">Precision Moulded</span>
            </div>
            <div className="hero-actions">
              <a href="#products" className="btn btn-red">See the range</a>
              <a href="#contact" className="btn btn-ghost">Talk to sales</a>
            </div>
            <div className="rail" style={{ marginTop: 34, maxWidth: 420 }}>
              {COLORS.map((c) => (
                <span key={c} style={{ background: c }} />
              ))}
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-photo">
              <img src="/img/live.jpg" alt="Super Plastech tubs in the full colour range" />
            </div>
            <div className="hero-stat">
              <b>Quality Innovation Trust</b>
              <span></span>
            </div>
            <div className="hero-badge">
              <img src="/img/badge.jpg" alt="Super Strength emblem" />
            </div>
          </div>
        </div>
      </header>

      <section className="section" id="products">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">What we make</span>
            <h2 className="display">Our Products</h2>
            <p>
              One product family, engineered properly. Every tub is moulded from virgin
              plastic with a glossy premium finish and smooth, safe edges — sized for the
              worksite and the home alike.
            </p>
          </div>

          <div className="prod-grid">
            <article className="card feature-lg span-7">
              <div className="card-photo">
                <img src="/img/sizes.jpg" alt="Full 14 to 24 inch size range in six colours" />
              </div>
              <div className="card-body">
                <span className="card-tag">Core range · Ghamela / Tubs</span>
                <h3>Super Strength Tubs</h3>
                <p>
                  The everyday workhorse. Six sizes from 14&quot; to 24&quot;, in six
                  solid colours — impact-resistant, stackable and reliable batch after batch.
                </p>
                <div className="card-feats">
                  <span>Virgin plastic</span>
                  <span>Impact resistant</span>
                  <span>Glossy finish</span>
                  <span>Stackable</span>
                </div>
              </div>
            </article>

            <article className="card feature-sm span-5">
              <div className="card-photo">
                <img src="/img/creative.jpg" alt="Super Creative dual-tone aesthetic tubs" />
              </div>
              <div className="card-body">
                <span className="card-tag">Premium · Super Creative</span>
                <h3>Dual-Tone Tubs</h3>
                <p>
                  A premium dual-tone line for modern homes — baby bath, laundry, storage
                  and cleaning, with an elegant colour blend and glossy shine.
                </p>
                <div className="card-feats">
                  <span>White + Blue</span>
                  <span>Grey + Pink</span>
                  <span>White + Teal</span>
                  <span>Cream + Brown</span>
                </div>
              </div>
            </article>
          </div>

          <div className="sizes">
            <div>
              <h3>Available in six sizes</h3>
              <p>14 inch to 24 inch — a size for every job.</p>
            </div>
            <div className="size-pills">
              {SIZES.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section band-green" id="plant">
        <div className="wrap">
          <div className="plant-grid">
            <div className="plant-photo">
              <img src="/img/machine.jpg" alt="Milacron Hydron Servo 450 injection moulding machine" />
            </div>
            <div>
              <span className="eyebrow">Inside the plant</span>
              <h2 className="display" style={{ color: "#fff", fontSize: "clamp(32px,4.4vw,52px)" }}>
                Our Plant
              </h2>
              <p style={{ color: "#b7cfc2", fontSize: 17, marginTop: 14 }}>
                Our line runs on a Milacron Hydron Servo 450 — servo-driven for consistent
                shots, tight tolerances and clean finishes on every cycle. Quality is
                controlled from granule to finished tub, on our own floor.
              </p>
              <ul className="plant-list">
                <li>
                  <b>450T</b>
                  <div>
                    <span>Milacron Hydron Servo 450</span>
                    <small>Servo-hydraulic injection moulding for repeatable precision.</small>
                  </div>
                </li>
                <li>
                  <b>N6</b>
                  <div>
                    <span>Nylon 6 granules, in-house</span>
                    <small>We manufacture our own granules alongside finished products.</small>
                  </div>
                </li>
                <li>
                  <b>QC</b>
                  <div>
                    <span>Batch-consistent output</span>
                    <small>Precision moulding and reliable quality, order after order.</small>
                  </div>
                </li>
              </ul>
              <span className="machine-tag"><i /> Plant live at Plot 59, GIDC Kalol</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="contact">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Get in touch</span>
            <h2 className="display">Contact Us</h2>
            <p>
              Bulk enquiries, custom colours and trade pricing — reach the team directly.
              We ship household, agricultural and Nylon&nbsp;6 granule orders across India.
            </p>
          </div>

          <div className="contact-grid">
            <div className="contact-card">
              <div className="contact-people">
                <div className="person">
                  <small>Sales</small>
                  <b>Ankit Desai</b>
                  <a href="tel:+917043836001">+91 70438 36001</a>
                </div>
                <div className="person">
                  <small>Sales</small>
                  <b>Harsh Patel</b>
                  <a href="tel:+919586550300">+91 95865 50300</a>
                </div>
              </div>

              <a className="contact-row" href="mailto:superplastech6001@gmail.com">
                <div className="ico"><Icon name="mail" /></div>
                <div>
                  <small>Email</small>
                  <span>superplastech6001@gmail.com</span>
                </div>
              </a>
              <div className="contact-row">
                <div className="ico"><Icon name="pin" /></div>
                <div>
                  <small>Factory</small>
                  <span>Plot No. 59, GIDC Industrial Estate, Highway Road, Kalol &ndash; 382725, Dist. Gandhinagar, Gujarat, India</span>
                </div>
              </div>
              <div className="contact-row">
                <div className="ico"><Icon name="doc" /></div>
                <div>
                  <small>GSTIN</small>
                  <span>24AEYPC8763J1ZU</span>
                </div>
              </div>
            </div>

            <div className="map-card">
              <iframe
                title="Super Plastech Industries — Kalol GIDC"
                src="https://www.google.com/maps?q=GIDC+Industrial+Estate+Kalol+Gandhinagar+Gujarat&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="footer" id="footer">
        <div className="wrap">
          <div className="footer-top">
            <div>
              <a href="#top" className="mark" style={{ color: "#fff" }}>
                <Logo size={40} mono />
                <span className="mark-name">
                  <b style={{ color: "#fff" }}>SUPER PLASTECH</b>
                  <span style={{ color: "#8a939b" }}>INDUSTRIES</span>
                </span>
              </a>
              <p>
                Manufacturers of plastic household &amp; agricultural products and Nylon 6
                granules. Heavy-duty, long-lasting, made in India.
              </p>
            </div>
            <div className="footer-links">
              <div>
                <h5>Explore</h5>
                <a href="#products">Products</a>
                <a href="#plant">Our Plant</a>
                <a href="#contact">Contact</a>
              </div>
              <div>
                <h5>Reach us</h5>
                <a href="tel:+917043836001">+91 70438 36001</a>
                <a href="tel:+919586550300">+91 95865 50300</a>
                <a href="mailto:superplastech6001@gmail.com">Email</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>&copy; {new Date().getFullYear()} Super Plastech Industries. All rights reserved.</span>
            <span>Plot 59, GIDC Kalol · Gujarat · India</span>
          </div>
        </div>
        <div className="tagline-strip">Super Strength · Unbreakable Plastic Products</div>
      </footer>
    </>
  );
}
