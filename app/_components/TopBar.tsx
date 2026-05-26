"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import { InstagramIcon, MenuIcon, CloseIcon, MailIcon, MessageIcon } from "./Icons";
import { Logo } from "./Logo";
import { SITE, MAILTO_HREF, SMS_HREF } from "../_lib/site";
import { cn } from "../_lib/cn";

const NAV_LINKS = [
  { href: "#services", label: "Services" },
  { href: "#pricing", label: "Pricing" },
  { href: "#testimonials", label: "Reviews" },
  { href: "#faq", label: "FAQ" },
];

const MOBILE_LINKS = [
  ...NAV_LINKS,
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export function TopBar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstLinkRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-all duration-300",
          scrolled
            ? "bg-cream/85 backdrop-blur-md shadow-[0_4px_16px_-8px_rgba(43,42,40,0.18)]"
            : "bg-cream/40 backdrop-blur-sm",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 sm:px-6 lg:px-8 h-16 md:h-20">
          <Logo />

          <nav aria-label="Primary" className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-rounded text-sm font-semibold text-ink/85 hover:text-pink-deepest px-3 py-2 rounded-full transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <a
              href={SMS_HREF}
              className="hidden lg:inline-flex items-center gap-2 font-rounded text-sm font-semibold text-ink/80 hover:text-pink-deepest transition-colors"
            >
              <MessageIcon size={16} />
              {SITE.phoneDisplay}
            </a>
            <Button href={SITE.intakeFormUrl} size="md">
              Book a Meet &amp; Greet
            </Button>
            <a
              href={SITE.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`baba on Instagram (${SITE.instagramHandle})`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 bg-cream/70 text-ink hover:text-pink-deepest hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-deepest"
            >
              <InstagramIcon size={18} />
            </a>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <Button href={SITE.intakeFormUrl} size="md" className="!px-4 !py-2 text-sm">
              Book
            </Button>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-cream/70 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-deepest"
            >
              {open ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        hidden={!open}
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          "bg-cream",
          "flex flex-col",
          open ? "animate-[fadein_0.18s_ease-out]" : "",
        )}
      >
        <div className="flex items-center justify-between px-5 h-16">
          <Logo />
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-cream/70 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-deepest"
          >
            <CloseIcon size={22} />
          </button>
        </div>
        <nav aria-label="Mobile primary" className="flex-1 overflow-y-auto px-5 pt-6 pb-10">
          <ul className="space-y-2">
            {MOBILE_LINKS.map((link, i) => (
              <li key={link.href}>
                <a
                  ref={i === 0 ? firstLinkRef : undefined}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl px-5 py-4 font-rounded text-2xl font-semibold text-ink hover:bg-pink-soft/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-deepest"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-8 space-y-3">
            <Button href={SITE.intakeFormUrl} size="lg" className="w-full">
              Book a Free Meet &amp; Greet
            </Button>
            <Button href={SMS_HREF} variant="secondary" size="lg" className="w-full">
              <MessageIcon size={18} /> Text {SITE.phoneDisplay}
            </Button>
            <Button href={MAILTO_HREF} variant="secondary" size="lg" className="w-full">
              <MailIcon size={18} /> Email
            </Button>
            <Button href={SITE.instagramUrl} variant="secondary" size="lg" className="w-full">
              <InstagramIcon size={18} /> Instagram
            </Button>
          </div>
        </nav>
      </div>
    </>
  );
}
