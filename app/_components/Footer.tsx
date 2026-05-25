import Link from "next/link";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { InstagramIcon, MailIcon, PhoneIcon, MapPinIcon } from "./Icons";
import { SITE, TEL_HREF, MAILTO_HREF } from "../_lib/site";

const VISIT = [
  { href: "#services", label: "Services" },
  { href: "#pricing", label: "Pricing" },
  { href: "#testimonials", label: "Reviews" },
  { href: "#faq", label: "FAQ" },
  { href: "#about", label: "About" },
];

export function Footer() {
  return (
    <footer className="bg-cream border-t border-ink/10">
      <Container className="py-14 md:py-20">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-4">
            <Logo size="md" />
            <p className="font-body text-sm text-ink/75 max-w-xs leading-relaxed">
              {SITE.tagline.charAt(0).toUpperCase() + SITE.tagline.slice(1)}. One-on-one, insured pet care in {SITE.city}, {SITE.state}.
            </p>
            <p className="font-body text-xs text-ink/55">
              2% of every booking goes to the Humane Society of Huron Valley (HSHV).
            </p>
          </div>

          <div>
            <h3 className="font-rounded text-xs font-semibold uppercase tracking-[0.18em] text-pink-deepest mb-4">
              Visit
            </h3>
            <ul className="space-y-2">
              {VISIT.map((l) => (
                <li key={l.href}>
                  <a className="font-body text-sm text-ink/80 hover:text-pink-deepest transition-colors" href={l.href}>
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <Link className="font-body text-sm text-ink/80 hover:text-pink-deepest transition-colors" href="/links">
                  All links
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-rounded text-xs font-semibold uppercase tracking-[0.18em] text-pink-deepest mb-4">
              Get in touch
            </h3>
            <ul className="space-y-2">
              <li>
                <a className="inline-flex items-center gap-2 font-body text-sm text-ink/80 hover:text-pink-deepest transition-colors" href={TEL_HREF}>
                  <PhoneIcon size={16} /> {SITE.phoneDisplay}
                </a>
              </li>
              <li>
                <a className="inline-flex items-center gap-2 font-body text-sm text-ink/80 hover:text-pink-deepest transition-colors" href={MAILTO_HREF}>
                  <MailIcon size={16} /> {SITE.email}
                </a>
              </li>
              <li>
                <a className="inline-flex items-center gap-2 font-body text-sm text-ink/80 hover:text-pink-deepest transition-colors" href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer">
                  <InstagramIcon size={16} /> {SITE.instagramHandle}
                </a>
              </li>
              <li>
                <span className="inline-flex items-start gap-2 font-body text-sm text-ink/80">
                  <MapPinIcon size={16} /> Serving {SITE.city} & nearby
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-ink/10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="font-body text-xs text-ink/55">
            © {new Date().getFullYear()} {SITE.name}. Made with 🐾 in {SITE.city}, {SITE.state}.
          </p>
          <div className="flex gap-4 text-xs text-ink/55">
            <a href="#" className="hover:text-pink-deepest transition-colors">Privacy</a>
            <a href="#" className="hover:text-pink-deepest transition-colors">Terms</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
