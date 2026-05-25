import Link from "next/link";
import { cn } from "../_lib/cn";

type Props = {
  className?: string;
  size?: "sm" | "md";
  href?: string;
};

export function Logo({ className, size = "md", href = "/" }: Props) {
  const text = size === "sm" ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl";
  return (
    <Link
      href={href}
      aria-label="baba pet care, home"
      className={cn("group inline-flex items-center gap-2 leading-none", className)}
    >
      <span aria-hidden="true" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink text-cream shadow-[0_2px_8px_-2px_rgba(43,42,40,0.4)]">
        <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="14" r="4" />
          <circle cx="21" cy="14" r="4" />
          <path d="M9 12c0-1 .5-2 1-2.5M23 12c0-1-.5-2-1-2.5" />
          <circle cx="11" cy="14" r="0.8" fill="currentColor" />
          <circle cx="21" cy="14" r="0.8" fill="currentColor" />
        </svg>
      </span>
      <span className={cn("font-display text-pink-deepest transition-transform group-hover:-rotate-1", text)}>
        baba
      </span>
    </Link>
  );
}
