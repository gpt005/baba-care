import Image from "next/image";
import { Container } from "../_components/Container";
import { Button } from "../_components/Button";
import { SpeechBubble } from "../_components/SpeechBubble";
import { MessageIcon, PawIcon } from "../_components/Icons";
import { SITE, SMS_HREF } from "../_lib/site";

export function HeroSection() {
  return (
    <section
      id="top"
      aria-label="Welcome"
      className="relative overflow-hidden pt-28 md:pt-32 lg:pt-36 pb-16 md:pb-24"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-pink-soft/45 via-cream to-cream"
      />
      <div
        aria-hidden="true"
        className="absolute -top-10 -right-16 -z-10 h-72 w-72 rounded-full bg-pink-soft/60 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-10 -left-20 -z-10 h-64 w-64 rounded-full bg-sage/50 blur-3xl"
      />

      <Container>
        <div className="grid items-center gap-10 md:gap-14 lg:grid-cols-2">
          <div className="order-2 lg:order-1 text-center lg:text-left space-y-6 md:space-y-8">
            <p className="font-rounded text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-pink-deepest inline-flex items-center gap-2 justify-center lg:justify-start">
              <PawIcon size={14} /> Insured · Ann Arbor, MI
            </p>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl leading-[1.05] text-ink">
              We provide a{" "}
              <span className="text-pink-deepest">home away from home</span> for
              your <span className="text-sage-deep">fur-babies</span>.
            </h1>
            <p className="font-body text-base md:text-lg leading-relaxed text-ink/75 max-w-xl mx-auto lg:mx-0">
              One-on-one, home-style pet care from a CPR-certified
              husband-and-wife team. Drop-ins, dog walks, boarding, and house
              sitting — with daily photo updates so you never miss a wag.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center lg:items-start justify-center lg:justify-start">
              <Button href={SITE.intakeFormUrl} size="lg">
                Book a Free Meet &amp; Greet
              </Button>
              <Button href={SMS_HREF} variant="secondary" size="lg">
                <MessageIcon size={18} /> Text Only
              </Button>
            </div>
          </div>

          <div className="order-1 lg:order-2 relative">
            <div className="relative mx-auto max-w-sm md:max-w-md lg:max-w-none [transform:rotate(-1.5deg)]">
              <div className="absolute -inset-4 rounded-[40px] bg-cream shadow-[0_24px_60px_-30px_rgba(43,42,40,0.35)] -z-10" />
              <div className="relative w-full aspect-4/5 overflow-hidden rounded-3xl border-2 border-ink/10 bg-pink-soft/30">
                <Image
                  src="/photos/gary_and_wutt.jpg"
                  alt="Gary and Wutt smiling together outdoors"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 36rem, (min-width: 768px) 32rem, 100vw"
                  priority
                />
              </div>

              <div className="absolute -top-6 -left-6 md:-top-8 md:-left-10">
                <SpeechBubble tilt={-6} tailSide="left">
                  I&apos;m Wutt!
                </SpeechBubble>
              </div>

              <div className="absolute -bottom-6 -right-4 md:-bottom-8 md:-right-8">
                <SpeechBubble tilt={5} tailSide="right">
                  I&apos;m Gary!
                </SpeechBubble>
              </div>

              <div
                aria-hidden="true"
                className="absolute -top-10 right-4 md:-top-14 md:right-8 text-5xl md:text-6xl motion-safe:animate-float"
                style={{ "--tilt": "12deg" } as React.CSSProperties}
              >
                🐾
              </div>
              <div
                aria-hidden="true"
                className="absolute bottom-2 -left-8 md:-left-12 text-4xl md:text-5xl motion-safe:animate-float"
                style={
                  {
                    "--tilt": "-18deg",
                    animationDelay: "1.2s",
                  } as React.CSSProperties
                }
              >
                🦴
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
