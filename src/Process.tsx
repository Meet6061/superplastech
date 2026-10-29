/** "How it's made": four looping line-drawings, granule → finished tub. */

const STEPS = [
  {
    t: "Recycled PA6 granules",
    d: "Reclaimed polyamide 6 is reprocessed into uniform granules at our plant.",
  },
  {
    t: "Melt and inject",
    d: "Granules feed from the hopper into a heated barrel and are injected under pressure.",
  },
  {
    t: "Mould",
    d: "Our Milacron Hydron Servo 450 clamps the mould and holds every shot to tight tolerances.",
  },
  {
    t: "Finish and check",
    d: "Glossy, smooth-edged and stackable, with quality checked from granule to finished tub.",
  },
];

function Art({ n }: { n: number }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (n === 0)
    return (
      <svg viewBox="0 0 240 160" {...{ role: "img", "aria-label": "Granules falling into a hopper" }}>
        <g {...common}>
          <path d="M66 24H174L148 86H92Z" />
          <path d="M104 86V112H136V86" />
          <path d="M40 140H200" strokeOpacity=".4" />
        </g>
        <g fill="#6fe3a8">
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} className="pg" x={104 + i * 8} y="12" width="6" height="4" rx="2" style={{ animationDelay: `${i * 0.38}s` }} />
          ))}
        </g>
        <g fill="currentColor" opacity=".55">
          {[[96, 74], [108, 78], [121, 73], [133, 77], [114, 66], [127, 66], [102, 66], [140, 70]].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="6" height="4" rx="2" />
          ))}
        </g>
      </svg>
    );
  if (n === 1)
    return (
      <svg viewBox="0 0 240 160" {...{ role: "img", "aria-label": "Heated barrel and screw" }}>
        <g {...common}>
          <rect x="26" y="66" width="152" height="36" rx="7" />
          <path d="M178 74H206V94H178" />
          <path d="M44 30H80L70 66H54Z" />
          <path d="M40 124H200" strokeOpacity=".4" />
        </g>
        <path className="screw" d="M36 84q7-13 14 0t14 0t14 0t14 0t14 0t14 0t14 0t14 0t14 0" fill="none" stroke="#6fe3a8" strokeWidth="1.8" strokeLinecap="round" />
        {[78, 112, 146].map((x, i) => (
          <rect key={x} className="band" x={x} y="62" width="8" height="44" rx="2" fill="#6fe3a8" style={{ animationDelay: `${i * 0.5}s` }} />
        ))}
      </svg>
    );
  if (n === 2)
    return (
      <svg viewBox="0 0 240 160" {...{ role: "img", "aria-label": "Mould closing around the part" }}>
        <circle className="cavity" cx="120" cy="80" r="18" fill="#6fe3a8" />
        <g className="mh-l" {...common}>
          <path d="M30 28H84V62a18 18 0 0 0 0 36V132H30Z" />
        </g>
        <g className="mh-r" {...common}>
          <path d="M210 28H156V62a18 18 0 0 1 0 36V132H210Z" />
        </g>
        <path d="M40 146H200" {...common} strokeOpacity=".4" />
      </svg>
    );
  return (
    <svg viewBox="0 0 240 160" {...{ role: "img", "aria-label": "Finished tub with a quality tick" }}>
      <g {...common}>
        <path className="tub" d="M58 62C62 116 88 134 120 134C152 134 178 116 182 62" />
        <ellipse className="tub" cx="120" cy="62" rx="62" ry="14" />
      </g>
      <path className="tub-fill" d="M58 62C62 116 88 134 120 134C152 134 178 116 182 62Z" fill="#6fe3a8" />
      <text className="tub-text" x="120" y="108" textAnchor="middle" fontSize="15" fontWeight="800" letterSpacing="2" fill="currentColor">
        SUPER
      </text>
      <g className="tick">
        <circle cx="200" cy="34" r="12" fill="#6fe3a8" />
        <path d="M194 34l4.5 4.5L207 29" fill="none" stroke="#0c110e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export default function Process() {
  return (
    <div className="process">
      <div className="process-head" data-reveal>
        <span className="eyebrow on-dark">How it's made</span>
        <h3>From granule to tub, on one floor.</h3>
      </div>
      <div className="steps">
        {STEPS.map((s, i) => (
          <div key={s.t} className="step" data-reveal style={{ transitionDelay: `${i * 0.08}s` }}>
            <div className="step-art">
              <Art n={i} />
            </div>
            <span className="step-n">0{i + 1}</span>
            <h4>{s.t}</h4>
            <p>{s.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
