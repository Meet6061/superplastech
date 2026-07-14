type Props = { size?: number; mono?: boolean };

/** SΠ mark — dark-green S + black π with a green triangle accent above,
 *  reconstructed from the Super Plastech signage. */
export default function Logo({ size = 40, mono = false }: Props) {
  const green = mono ? "currentColor" : "#0f5a3c";
  const black = mono ? "currentColor" : "#14181a";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-label="Super Plastech Industries">
      {/* S */}
      <path
        d="M44 26c-5-6-14-8-22-5-8 3-12 11-9 18 2 5 8 7 15 8 6 1 9 2 10 5 1 3-1 6-6 7-6 2-13 0-17-5l-8 8c6 7 18 10 28 6 9-3 14-11 11-19-2-6-8-8-16-9-6-1-9-2-9-5 0-3 3-5 8-6 5-1 10 1 13 4l2-10z"
        fill={green}
      />
      {/* triangle accent */}
      <path d="M65 14l7 11H58l7-11z" fill={green} />
      {/* π */}
      <path
        d="M50 34h38v10H82v34H71V44h-8v34H52V44h-6V34h4z"
        fill={black}
      />
    </svg>
  );
}
