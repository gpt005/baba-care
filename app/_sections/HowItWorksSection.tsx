import { Container } from "../_components/Container";
import { Section } from "../_components/Section";
import { SectionHeading } from "../_components/SectionHeading";
import { HeartIcon, PawIcon, CameraIcon } from "../_components/Icons";

// ...existing code...
const STEPS = [
  {
    n: 1,
    title: "Book your dates",
    blurb:
      "Send dates by text, DM, or our intake form. We confirm in hours, not days.",
    icon: <PawIcon size={26} />,
    tone: "bg-yellow",
  },
  {
    n: 2,
    title: "Free meet & greet",
    blurb:
      'We come over (or you visit us) to meet your fur-baby, swap routines, and answer every "what if."',
    icon: <HeartIcon size={26} />,
    tone: "bg-pink-soft",
  },
  {
    n: 3,
    title: "Review your invoice",
    blurb:
      "We generate your invoice before the stay so you can confirm the pricing and details in advance.",
    icon: <PawIcon size={26} />,
    tone: "bg-blue-soft",
  },
  {
    n: 4,
    title: "Daily photo updates",
    blurb:
      "Photos, videos, and check-ins every visit so you can travel without the worry.",
    icon: <CameraIcon size={26} />,
    tone: "bg-blue-soft",
  },
];

export function HowItWorksSection() {
  return (
    <Section id="how-it-works" tone="cream">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title={
            <>
              Four steps to a happier{" "}
              <span className="text-pink-deepest">tail</span>
            </>
          }
          subtitle="We keep it simple so you can hand over the leash with confidence."
        />
        <ol
          className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          aria-label="How it works steps"
        >
          {STEPS.map((s) => (
            <li key={s.n} className="relative">
              <div className="h-full rounded-3xl bg-cream border border-ink/10 p-6 md:p-7 shadow-[0_8px_22px_-14px_rgba(43,42,40,0.18)]">
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${s.tone} text-ink`}
                  >
                    {s.icon}
                  </span>
                  <span className="font-display text-5xl text-ink/15 leading-none select-none">
                    {s.n}
                  </span>
                </div>
                <h3 className="mt-4 font-rounded text-xl font-semibold">
                  {s.title}
                </h3>
                <p className="mt-2 font-body text-sm md:text-base text-ink/75 leading-relaxed">
                  {s.blurb}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
