import { cn } from "../_lib/cn";

type Tone = "cream" | "pink" | "pink-deep" | "sage" | "yellow" | "blue";

const TONE: Record<Tone, { bg: string; fg: string; border: string }> = {
  cream: { bg: "#fbf6ee", fg: "#7a766d", border: "#d6cfbf" },
  pink: { bg: "#f8c8d3", fg: "#a4566a", border: "#e29eb1" },
  "pink-deep": { bg: "#e89baa", fg: "#5d2433", border: "#c97689" },
  sage: { bg: "#bfd3b0", fg: "#3e5733", border: "#8aa478" },
  yellow: { bg: "#f6de89", fg: "#7a5b13", border: "#d9bd55" },
  blue: { bg: "#bfd7e8", fg: "#345670", border: "#7faac6" },
};

type Props = {
  label: string;
  tone?: Tone;
  aspect?: string;
  className?: string;
  rounded?: "xl" | "2xl" | "3xl" | "full";
};

export function Placeholder({
  label,
  tone = "pink",
  aspect = "4/3",
  className,
  rounded = "2xl",
}: Props) {
  const { bg, fg, border } = TONE[tone];
  const roundedClass = {
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    "3xl": "rounded-3xl",
    full: "rounded-full",
  }[rounded];
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "relative w-full overflow-hidden flex items-center justify-center text-center",
        roundedClass,
        className,
      )}
      style={{
        aspectRatio: aspect,
        background: bg,
        color: fg,
        boxShadow: `inset 0 0 0 2px ${border}`,
      }}
    >
      <svg
        className="absolute inset-0 h-full w-full opacity-40"
        aria-hidden="true"
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id={`p-${tone}`} width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="2" fill={border} />
            <circle cx="30" cy="30" r="2" fill={border} />
          </pattern>
        </defs>
        <rect width="200" height="200" fill={`url(#p-${tone})`} />
      </svg>
      <span className="relative font-rounded text-sm md:text-base font-semibold px-3 leading-snug">
        {label}
      </span>
    </div>
  );
}
