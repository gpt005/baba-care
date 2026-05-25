import Image from "next/image";
import { Container } from "../_components/Container";
import { Section } from "../_components/Section";
import { PawIcon } from "../_components/Icons";

export function AboutSection() {
  return (
    <Section id="about" tone="cream">
      <Container>
        <div className="grid items-center gap-10 md:gap-14 lg:grid-cols-2">
          <div className="relative mx-auto max-w-md lg:max-w-none">
            <div className="absolute -inset-4 rounded-[40px] bg-pink-soft/40 -z-10 [transform:rotate(2deg)]" />
            <Image
              src="/photos/lucky.jpg"
              alt="Lucky the tuxedo cat in a lace collar"
              width={400}
              height={300}
              className="rounded-3xl"
            />
            <Image
              src="/photos/milo.jpg"
              alt="Milo the dog"
              width={220}
              height={220}
              className="absolute -bottom-4 -left-4 lg:left-auto lg:-right-8 lg:-bottom-40 w-40 lg:w-52 h-auto rounded-2xl border-4 border-cream shadow-[0_12px_30px_-12px_rgba(43,42,40,0.45)] transform-[rotate(4deg)]"
            />
            <div
              aria-hidden="true"
              className="absolute -top-4 -right-4 lg:right-auto lg:-left-4 text-4xl motion-safe:animate-float"
              style={{ "--tilt": "-8deg" } as React.CSSProperties}
            >
              🐈‍⬛
            </div>
            <div
              aria-hidden="true"
              className="absolute -bottom-8 -left-8 lg:left-auto lg:-right-12 lg:-bottom-44 text-4xl motion-safe:animate-float"
              style={
                {
                  "--tilt": "10deg",
                  animationDelay: "0.8s",
                } as React.CSSProperties
              }
            >
              🐕
            </div>
          </div>

          <div className="space-y-5 md:space-y-6 text-center lg:text-left">
            <p className="font-rounded text-xs md:text-sm font-semibold uppercase tracking-[0.18em] text-pink-deepest inline-flex items-center gap-2 justify-center lg:justify-start">
              <PawIcon size={14} /> About baba
            </p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-tight">
              where pets feel <span className="text-pink-deepest">at home</span>
            </h2>
            <p className="font-body text-base md:text-lg leading-relaxed text-ink/80">
              We&apos;re your trusted, insured, one-on-one pet care service in
              Ann Arbor, Michigan, offering loving, home-style care while
              you&apos;re away. No kennels, no chaos — just calm rooms, slow
              walks, and our undivided attention.
            </p>

            <figure className="relative rounded-3xl bg-pink-soft/50 p-6 md:p-7 text-left">
              <blockquote className="font-body text-base md:text-lg leading-relaxed text-ink/85">
                Our fur babies don&apos;t measure time in years — they measure
                it in moments with us. With only so many holidays in their
                lifetime, we make sure every Christmas or New Year they spend
                with us feels just like home.
              </blockquote>
              <figcaption className="mt-4 font-rounded text-sm text-ink/70">
                <span className="font-semibold text-ink">Wutt Hmone Kyi</span> ·
                owner of baba · mom of <span aria-hidden="true">🐈‍⬛</span> Lucky
                &amp; <span aria-hidden="true">🐕</span> Milo
              </figcaption>
            </figure>
          </div>
        </div>
      </Container>
    </Section>
  );
}
