type Props = {
  /** rendered height in px */
  height?: number;
  /** "mark" = SΠ icon only, "lockup" = icon + SUPER PLASTECH INDUSTRIES wordmark */
  variant?: "mark" | "lockup";
};

/** The client's supplied logo files, used as-is (public/img/logo-*.png). */
export default function Logo({ height = 34, variant = "mark" }: Props) {
  const lockup = variant === "lockup";
  return (
    <img
      src={lockup ? "/img/logo-lockup.png" : "/img/logo-mark.png"}
      alt="Super Plastech Industries"
      height={height}
      width={Math.round(height * (lockup ? 1000 / 162 : 229 / 136))}
      style={{ height, width: "auto", display: "block" }}
      draggable={false}
    />
  );
}
