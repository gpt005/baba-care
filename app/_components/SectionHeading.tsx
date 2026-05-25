import type { ReactNode } from "react";
import { cn } from "../_lib/cn";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: Props) {
  return (
    <div
      className={cn(
        "space-y-3 md:space-y-4",
        align === "center" ? "text-center mx-auto max-w-2xl" : "text-left max-w-2xl",
        className,
      )}
    >
      {eyebrow && (
        <p className="font-rounded text-xs md:text-sm font-semibold uppercase tracking-[0.18em] text-pink-deepest">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-tight text-ink">
        {title}
      </h2>
      {subtitle && (
        <p className="font-body text-base md:text-lg leading-relaxed text-ink/75">
          {subtitle}
        </p>
      )}
    </div>
  );
}
