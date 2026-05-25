import Image from "next/image";
import { Container } from "../_components/Container";
import { Section } from "../_components/Section";
import { Button } from "../_components/Button";
import {
  InstagramIcon,
  PhoneIcon,
  MailIcon,
  MessageIcon,
  PawIcon,
} from "../_components/Icons";
import { SITE, TEL_HREF, SMS_HREF, MAILTO_HREF } from "../_lib/site";

export function ContactSection() {
  return (
    <Section id="contact" tone="cream">
      <Container>
        <div className="grid gap-10 md:gap-14 lg:grid-cols-2 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <p className="font-rounded text-xs md:text-sm font-semibold uppercase tracking-[0.18em] text-pink-deepest inline-flex items-center gap-2">
              <PawIcon size={14} /> Get in touch
            </p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-tight">
              Ready to meet your{" "}
              <span className="text-pink-deepest">
                pet&apos;s next favorite person?
              </span>
            </h2>
            <p className="font-body text-base md:text-lg leading-relaxed text-ink/80 max-w-xl mx-auto lg:mx-0">
              Most replies in under an hour. Meet &amp; greets are always free.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button href={SITE.intakeFormUrl} size="lg">
                Book a Free Meet &amp; Greet
              </Button>
              <Button href={TEL_HREF} variant="secondary" size="lg">
                <PhoneIcon size={18} /> {SITE.phoneDisplay}
              </Button>
            </div>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2 max-w-lg mx-auto lg:mx-0">
              <li>
                <a
                  href={SMS_HREF}
                  className="flex items-center gap-3 rounded-2xl bg-cream border border-ink/10 px-4 py-3 font-rounded text-sm font-semibold text-ink hover:-translate-y-0.5 hover:shadow-[0_8px_18px_-10px_rgba(43,42,40,0.25)] transition-all"
                >
                  <MessageIcon size={18} /> Text us
                </a>
              </li>
              <li>
                <a
                  href={MAILTO_HREF}
                  className="flex items-center gap-3 rounded-2xl bg-cream border border-ink/10 px-4 py-3 font-rounded text-sm font-semibold text-ink hover:-translate-y-0.5 hover:shadow-[0_8px_18px_-10px_rgba(43,42,40,0.25)] transition-all"
                >
                  <MailIcon size={18} /> {SITE.email}
                </a>
              </li>
              <li className="sm:col-span-2">
                <a
                  href={SITE.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-2xl bg-cream border border-ink/10 px-4 py-3 font-rounded text-sm font-semibold text-ink hover:-translate-y-0.5 hover:shadow-[0_8px_18px_-10px_rgba(43,42,40,0.25)] transition-all"
                >
                  <InstagramIcon size={18} /> {SITE.instagramHandle}
                </a>
              </li>
            </ul>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[40px] bg-pink-soft/45 -z-10 [transform:rotate(-2deg)]" />
            <div className="relative aspect-4/5 overflow-hidden rounded-3xl border-2 border-ink/10">
              <Image
                src="/photos/Christmas.png"
                alt="Wutt with the pups at Christmas"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 36rem, (min-width: 768px) 32rem, 100vw"
              />
            </div>
            <div
              aria-hidden="true"
              className="absolute -top-6 right-2 inline-flex items-center gap-2 rounded-full bg-cream border-2 border-ink/85 px-4 py-2 font-display text-xl text-ink shadow-[3px_4px_0_rgba(43,42,40,0.85)] [transform:rotate(-4deg)] motion-safe:animate-float"
            >
              thank you 💕
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
