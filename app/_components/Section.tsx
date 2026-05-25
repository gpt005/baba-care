import type { ReactNode } from "react";
import { cn } from "../_lib/cn";

type Props = {
  id?: string;
  children: ReactNode;
  className?: string;
  tone?: "cream" | "pink";
  padding?: "default" | "tight";
  ariaLabel?: string;
};

export function Section({
  id,
  children,
  className,
  tone = "cream",
  padding = "default",
  ariaLabel,
}: Props) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={cn(
        "scroll-mt-20 md:scroll-mt-24",
        tone === "pink" && "bg-pink-soft/50",
        padding === "default" ? "py-16 md:py-24 lg:py-28" : "py-10 md:py-14",
        className,
      )}
    >
      {children}
    </section>
  );
}
