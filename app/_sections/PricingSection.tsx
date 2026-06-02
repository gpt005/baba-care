import { Container } from "../_components/Container";
import { Section } from "../_components/Section";
import { SectionHeading } from "../_components/SectionHeading";
import { HeartIcon } from "../_components/Icons";

type PricingTier = {
  title: string;
  tone: "yellow" | "blue" | "sage" | "pink";
  rows: { label: string; price: string }[];
  notes?: string[];
};

const TIERS: PricingTier[] = [
  {
    title: "Drop-ins",
    tone: "yellow",
    rows: [
      { label: "Feed + play (30 mins)", price: "$25" },
      { label: "Feed + walk + play (60 mins)", price: "$40" },
    ],
  },
  {
    title: "Dog walking",
    tone: "blue",
    rows: [
      { label: "Walk (30 mins)", price: "$25" },
      { label: "Each extra 30 mins", price: "+$15" },
    ],
  },
  {
    title: "House sitting (your home)",
    tone: "sage",
    rows: [
      { label: "Cat / night", price: "$65" },
      { label: "Dog / night", price: "$75" },
    ],
  },
  {
    title: "Day care & boarding (our home)",
    tone: "pink",
    rows: [
      { label: "Half day", price: "$35" },
      { label: "Full day", price: "$60" },
      { label: "Overnight", price: "$70" },
    ],
    notes: [
      "Doggies get an enclosed yard + walks",
      "We include treats, chews, and toys",
    ],
  },
];

const TONE_BG: Record<PricingTier["tone"], string> = {
  yellow: "bg-yellow",
  blue: "bg-blue-soft",
  sage: "bg-sage",
  pink: "bg-pink-soft",
};

export function PricingSection() {
  return (
    <Section id="pricing" tone="pink">
      <Container>
        <SectionHeading
          eyebrow="One-on-one · insured · transparent"
          title={
            <>
              Price <span className="text-pink-deepest">list</span>
            </>
          }
          subtitle="No upsells, no hidden fees. Custom routines? Just ask."
        />

        <div className="mt-12 grid gap-5 md:gap-7 md:grid-cols-2">
          {TIERS.map((t) => (
            <article
              key={t.title}
              className={`rounded-3xl ${TONE_BG[t.tone]} p-6 md:p-8 shadow-[0_10px_28px_-18px_rgba(43,42,40,0.25)]`}
            >
              <h3 className="font-rounded text-lg md:text-xl font-semibold uppercase tracking-wide text-ink">
                {t.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {t.rows.map((row) => (
                  <li key={row.label} className="flex items-baseline gap-3">
                    <span className="font-body text-sm md:text-base text-ink/85">
                      {row.label}
                    </span>
                    <span
                      aria-hidden="true"
                      className="flex-1 border-b border-dotted border-ink/30 translate-y-[-3px]"
                    />
                    <span className="font-rounded text-base md:text-lg font-semibold text-ink whitespace-nowrap">
                      {row.price}
                    </span>
                  </li>
                ))}
              </ul>
              {t.notes && (
                <ul className="mt-5 space-y-1 font-body text-xs md:text-sm text-ink/65">
                  {t.notes.map((n) => (
                    <li key={n}>* {n}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>

        <div className="mt-10 grid gap-3 text-center font-body text-sm text-ink/70 md:text-base">
          <p>Holiday rate: +$5 to $10 per service</p>
          <p>
            Additional pet: +$5 to $25 per pet · Junior or Senior rate: +$5 per service
          </p>
        </div>

        <p className="mt-8 mx-auto max-w-2xl rounded-3xl bg-sage/40 border border-sage-deep/20 px-6 py-5 text-center font-rounded text-sm md:text-base text-ink/85 flex items-center justify-center gap-2 flex-wrap">
          <HeartIcon size={18} className="text-pink-deepest" />
          <span>
            <strong className="font-semibold">2% of proceeds</strong> goes to
            the Humane Society of Huron Valley (
            <a
              className="underline decoration-dotted underline-offset-2 hover:text-pink-deepest transition-colors"
              href="https://www.hshv.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              HSHV
            </a>
            ).
          </span>
        </p>
      </Container>
    </Section>
  );
}
