import type { CSSProperties, ReactNode } from "react";
import { cn } from "../_lib/cn";

type Props = {
  children: ReactNode;
  tilt?: number;
  className?: string;
  floating?: boolean;
};

export function Sticker({ children, tilt = 0, className, floating = true }: Props) {
  const style = { "--tilt": `${tilt}deg` } as CSSProperties;
  return (
    <span
      aria-hidden="true"
      style={style}
      className={cn(
        "inline-block [transform:rotate(var(--tilt))]",
        floating && "motion-safe:animate-float",
        className,
      )}
    >
      {children}
    </span>
  );
}
