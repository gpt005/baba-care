import type { CSSProperties, ReactNode } from "react";
import { cn } from "../_lib/cn";

type Props = {
  children: ReactNode;
  tilt?: number;
  tailSide?: "left" | "right";
  className?: string;
  floating?: boolean;
};

export function SpeechBubble({
  children,
  tilt = -3,
  tailSide = "left",
  className,
  floating = true,
}: Props) {
  const style = { "--tilt": `${tilt}deg` } as CSSProperties;
  return (
    <span
      style={style}
      className={cn(
        "relative inline-block rounded-[28px] bg-cream border-2 border-ink/85 px-5 py-2",
        "font-display text-xl md:text-2xl text-ink",
        "shadow-[3px_4px_0_rgba(43,42,40,0.85)]",
        "[transform:rotate(var(--tilt))]",
        floating && "motion-safe:animate-float",
        "before:absolute before:content-[''] before:w-4 before:h-4 before:bg-cream",
        "before:border-2 before:border-ink/85 before:rotate-45",
        "before:bottom-[-10px] before:border-t-0 before:border-l-0",
        tailSide === "left" ? "before:left-6" : "before:right-6",
        className,
      )}
    >
      {children}
    </span>
  );
}
