import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "../_components/Logo";
import {
  InstagramIcon,
  PhoneIcon,
  MailIcon,
  MessageIcon,
  PawIcon,
} from "../_components/Icons";
import { SITE, TEL_HREF, MAILTO_HREF, SMS_HREF } from "../_lib/site";

export const metadata: Metadata = {
  title: "links",
  description: `All the links from @${SITE.instagramHandle.replace("@", "")} in one place — book with us, follow us, and shop our partners.`,
};

type LinkRow = {
  href: string;
  label: string;
  emoji: string;
  highlight?: boolean;
  external?: boolean;
};

const BOOK: LinkRow[] = [
  { href: SITE.intakeFormUrl, label: "Book a free meet & greet", emoji: "🐾", highlight: true, external: true },
  { href: "/", label: "Visit our website", emoji: "🏠" },
  { href: SITE.roverUrl, label: "Find us on Rover", emoji: "🐶", external: true },
];

const CONTACT: LinkRow[] = [
  { href: TEL_HREF, label: `Call ${SITE.phoneDisplay}`, emoji: "📞" },
  { href: SMS_HREF, label: "Text us", emoji: "💬" },
  { href: MAILTO_HREF, label: SITE.email, emoji: "✉️" },
  { href: SITE.instagramUrl, label: SITE.instagramHandle, emoji: "📸", external: true },
];

const SHOP = SITE.affiliates.map((a) => ({
  href: a.url,
  label: `${a.name} — ${a.blurb}`,
  emoji: "🛍",
  external: true,
}));

function LinkButton({ row }: { row: LinkRow }) {
  const base =
    "group flex w-full items-center gap-3 rounded-full px-5 py-4 font-rounded text-base font-semibold shadow-[0_4px_14px_-8px_rgba(43,42,40,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_22px_-10px_rgba(43,42,40,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-deepest focus-visible:ring-offset-2 focus-visible:ring-offset-cream active:translate-y-0";
  const styles = row.highlight
    ? "bg-pink-deepest text-cream"
    : "bg-cream text-ink border border-ink/10";
  const content = (
    <>
      <span aria-hidden="true" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-soft/60 text-base">
        {row.emoji}
      </span>
      <span className="flex-1 text-center pr-9">{row.label}</span>
    </>
  );
  if (row.external) {
    return (
      <a className={`${base} ${styles}`} href={row.href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }
  return (
    <Link className={`${base} ${styles}`} href={row.href}>
      {content}
    </Link>
  );
}

function Group({ heading, rows }: { heading: string; rows: LinkRow[] }) {
  return (
    <section className="space-y-3">
      <h2 className="text-center font-rounded text-xs font-semibold uppercase tracking-[0.18em] text-ink/65">
        {heading}
      </h2>
      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={`${r.label}-${r.href}`}>
            <LinkButton row={r} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function LinksPage() {
  return (
    <main className="min-h-screen bg-pink-soft/40 px-5 pt-10 pb-16 flex flex-col">
      <div className="mx-auto w-full max-w-[480px] space-y-7">
        <header className="flex flex-col items-center text-center space-y-3">
          <Logo size="sm" />
          <p className="font-rounded text-sm font-semibold text-ink">{SITE.instagramHandle}</p>
          <p className="font-body text-sm text-ink/75 inline-flex items-center justify-center gap-2 flex-wrap max-w-xs">
            <PawIcon size={14} className="text-pink-deepest" />
            insured · home-style · {SITE.city}, {SITE.state}
          </p>
          <a
            href={SITE.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-cream border border-ink/10 text-ink hover:text-pink-deepest hover:-translate-y-0.5 transition-all"
          >
            <InstagramIcon size={20} />
          </a>
        </header>

        <Group heading="Book with us" rows={BOOK} />
        <Group heading="Say hi" rows={CONTACT} />
        <Group heading="Shop our partners" rows={SHOP} />

        <p className="text-center font-body text-[11px] text-ink/55">
          Some links may earn baba a small commission at no cost to you.
        </p>

        <footer className="pt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-rounded text-sm font-semibold text-ink/70 hover:text-pink-deepest transition-colors"
          >
            ← visit babapetcare.com
          </Link>
        </footer>
      </div>

      {/* Decorative floaters */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <span className="absolute top-12 left-6 text-3xl motion-safe:animate-float" style={{ "--tilt": "-12deg" } as React.CSSProperties}>🐾</span>
        <span className="absolute bottom-24 right-8 text-3xl motion-safe:animate-float" style={{ "--tilt": "14deg", animationDelay: "1.3s" } as React.CSSProperties}>🦴</span>
      </div>
    </main>
  );
}
