import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../_lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-rounded font-semibold " +
  "transition-all duration-200 ease-out " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-deepest focus-visible:ring-offset-2 focus-visible:ring-offset-cream " +
  "disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-pink-deepest text-cream shadow-[0_6px_16px_-6px_rgba(217,126,145,0.65)] " +
    "hover:-translate-y-0.5 hover:shadow-[0_10px_22px_-8px_rgba(217,126,145,0.8)] " +
    "active:translate-y-0 active:shadow-none",
  secondary:
    "bg-cream text-ink border border-ink/15 shadow-[0_4px_12px_-6px_rgba(43,42,40,0.18)] " +
    "hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_8px_18px_-8px_rgba(43,42,40,0.25)] " +
    "active:translate-y-0 active:shadow-none",
  ghost:
    "bg-transparent text-ink hover:bg-ink/5 active:bg-ink/10",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm md:text-base min-h-11",
  lg: "px-7 py-3.5 text-base md:text-lg min-h-12",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps & ComponentProps<"button"> & { href?: undefined };
type ButtonAsAnchor = CommonProps & ComponentProps<"a"> & { href: string };

export function Button(props: ButtonAsButton | ButtonAsAnchor) {
  const { variant = "primary", size = "md", className, children, ...rest } = props as CommonProps & {
    href?: string;
  } & Record<string, unknown>;
  const classes = cn(base, variants[variant], sizes[size], className);

  if ("href" in props && props.href) {
    const isExternal = /^https?:\/\//.test(props.href) || props.href.startsWith("mailto:") || props.href.startsWith("tel:") || props.href.startsWith("sms:");
    if (isExternal) {
      return (
        <a
          className={classes}
          {...(rest as ComponentProps<"a">)}
          href={props.href}
          rel={props.href.startsWith("http") ? "noopener noreferrer" : undefined}
        >
          {children}
        </a>
      );
    }
    return (
      <Link className={classes} href={props.href} {...(rest as Omit<ComponentProps<"a">, "href">)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ComponentProps<"button">)}>
      {children}
    </button>
  );
}
