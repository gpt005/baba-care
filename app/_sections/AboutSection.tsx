import { Container } from "../_components/Container";
import { Section } from "../_components/Section";
import { Placeholder } from "../_components/Placeholder";
import { PawIcon } from "../_components/Icons";

export function AboutSection() {
  return (
    <Section id="about" tone="cream">
      <Container>
        <div className="grid items-center gap-10 md:gap-14 lg:grid-cols-2">
          <div className="relative mx-auto max-w-md lg:max-w-none">
            <div className="absolute -inset-4 rounded-[40px] bg-pink-soft/40 -z-10 [transform:rotate(2deg)]" />
            <Placeholder label="Tux the tuxedo cat in a lace collar" tone="cream" aspect="4/3" rounded="3xl" />
            <div
              aria-hidden="true"
              className="absolute -bottom-4 -right-4 text-4xl motion-safe:animate-float"
              style={{ "--tilt": "8deg" } as React.CSSProperties}
            >
              🐈‍⬛
            </div>
          </div>

          <div className="space-y-5 md:space-y-6 text-center lg:text-left">
            <p className="font-rounded text-xs md:text-sm font-semibold uppercase tracking-[0.18em] text-pink-deepest inline-flex items-center gap-2 justify-center lg:justify-start">
              <PawIcon size={14} /> About baba
            </p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-tight">
              where pets feel{" "}
              <span className="text-pink-deepest">at home</span>
            </h2>
            <p className="font-body text-base md:text-lg leading-relaxed text-ink/80">
              We&apos;re your trusted, insured, one-on-one pet care service in Ann Arbor,
              Michigan, offering loving, home-style care while you&apos;re away. No
              kennels, no chaos — just calm rooms, slow walks, and our undivided
              attention.
            </p>

            <figure className="relative rounded-3xl bg-pink-soft/50 p-6 md:p-7 text-left">
              <blockquote className="font-body text-base md:text-lg leading-relaxed text-ink/85">
                Our fur babies don&apos;t measure time in years — they measure it in
                moments with us. With only so many holidays in their lifetime, we
                make sure every Christmas or New Year they spend with us feels just
                like home.
              </blockquote>
              <figcaption className="mt-4 font-rounded text-sm text-ink/70">
                <span className="font-semibold text-ink">Wutt Hmone Kyi</span> · founder of baba ·
                mom of <span aria-hidden="true">🐈‍⬛</span> Tux &amp; <span aria-hidden="true">🐕</span> Dood
              </figcaption>
            </figure>
          </div>
        </div>
      </Container>
    </Section>
  );
}
