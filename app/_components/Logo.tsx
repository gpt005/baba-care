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
      className={cn(
        "group inline-flex items-center gap-2 leading-none",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icon.svg"
        alt=""
        aria-hidden="true"
        className="h-9 w-9 rounded-xl shadow-[0_2px_8px_-2px_rgba(43,42,40,0.4)]"
      />
      <span
        className={cn(
          "font-display text-pink-deepest transition-transform group-hover:-rotate-1",
          text,
        )}
      >
        baba
      </span>
    </Link>
  );
}
