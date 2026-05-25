import { Container } from "../_components/Container";
import { Section } from "../_components/Section";
import { SectionHeading } from "../_components/SectionHeading";
import { Placeholder } from "../_components/Placeholder";
import { cn } from "../_lib/cn";

type Tone = "yellow" | "blue" | "pink" | "sage";

type Service = {
  title: string;
  blurb: string;
  tone: Tone;
  placeholderTone: "yellow" | "blue" | "pink" | "sage";
  emoji: string;
  imageLabel: string;
};

const SERVICES: Service[] = [
  {
    title: "Drop-ins",
    blurb: "We'll gladly feed, scoop, and play with your fur-baby in the comfort of their own home.",
    tone: "yellow",
    placeholderTone: "yellow",
    emoji: "🐶",
    imageLabel: "Doodle puppy mid-pat",
  },
  {
    title: "Dog walking",
    blurb: "Rain or shine, we make sure your fur-baby gets their steps in.",
    tone: "blue",
    placeholderTone: "blue",
    emoji: "🐕",
    imageLabel: "Basset hound on a winter walk",
  },
  {
    title: "Boarding",
    blurb: "We guarantee pets, pampering, and a fully enclosed yard every day.",
    tone: "pink",
    placeholderTone: "pink",
    emoji: "🐾",
    imageLabel: "Two dogs cozy on a quilt",
  },
  {
    title: "House sitting",
    blurb: "We'll ensure your fur baby never misses a beat in their daily routine.",
    tone: "sage",
    placeholderTone: "sage",
    emoji: "🏠",
    imageLabel: "Wutt at home with a poodle",
  },
];

const TONE_BG: Record<Tone, string> = {
  yellow: "bg-yellow",
  blue: "bg-blue-soft",
  pink: "bg-pink-soft",
  sage: "bg-sage",
};

export function ServicesSection() {
  return (
    <Section id="services" tone="pink">
      <Container>
        <SectionHeading
          eyebrow="What we offer"
          title={<>Our Services</>}
          subtitle="Pick one or mix-and-match — every booking starts with a free meet and greet."
        />
        <div className="mt-12 grid gap-5 md:gap-7 sm:grid-cols-2">
          {SERVICES.map((s) => (
            <article
              key={s.title}
              className={cn(
                "group overflow-hidden rounded-3xl shadow-[0_12px_30px_-18px_rgba(43,42,40,0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_46px_-22px_rgba(43,42,40,0.32)]",
                TONE_BG[s.tone],
              )}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <Placeholder
                  label={s.imageLabel}
                  tone={s.placeholderTone}
                  aspect="4/3"
                  rounded="3xl"
                  className="!rounded-none border-0 transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </div>
              <div className="p-6 md:p-7 text-center space-y-2">
                <p className="text-3xl" aria-hidden="true">{s.emoji}</p>
                <h3 className="font-rounded text-xl md:text-2xl font-semibold uppercase tracking-wide">
                  {s.title}
                </h3>
                <p className="font-body text-sm md:text-base text-ink/80">{s.blurb}</p>
                <a
                  href="#pricing"
                  className="inline-flex items-center gap-1 font-rounded text-sm font-semibold text-ink/80 hover:text-pink-deepest transition-colors mt-2"
                >
                  See pricing →
                </a>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
