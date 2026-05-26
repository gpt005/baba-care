import { Container } from "../_components/Container";
import { Section } from "../_components/Section";
import { SectionHeading } from "../_components/SectionHeading";
import { ChevronDownIcon } from "../_components/Icons";
import { SITE } from "../_lib/site";

export const FAQS = [
  {
    q: "Are you insured?",
    a: `Yes — we're covered by ${SITE.insuranceCarrier}, fully bonded, and Pet First Aid / CPR certified. You'll see proof of insurance at our meet & greet, and we're happy to share it ahead of time on request.`,
  },
  {
    q: "What happens during the free meet & greet?",
    a: 'We come to your home (or you visit us) for about 30 minutes to meet your fur-baby, learn their routine, and answer every "what if." There\'s zero commitment after — book if it feels right.',
  },
  {
    q: "Which neighborhoods do you serve?",
    a: `We're based in Ann Arbor and travel across ${SITE.serviceArea.join(", ")}. Outside that list? Send a quick text — we'll let you know.`,
  },
  {
    q: "Can you give medications?",
    a: "Yes. We administer oral pills, liquid medications, and topical medications at no extra charge. Tell us during the meet & greet and bring written instructions.",
  },
  {
    q: "What's your emergency vet protocol?",
    a: "We keep your vet's contact info on file and have a 24/7 emergency vet on speed dial. We'll always text you first if it isn't a life-threatening emergency, and we cover transport ourselves.",
  },
  {
    q: "Do you require vaccinations for boarding?",
    a: "Yes — boarding is for dogs only, and dogs must be current on core vaccines and rabies. We do not offer overnight cat boarding; cats are cared for through drop-in visits.",
  },
  {
    q: "Is my dog a fit for boarding in your home?",
    a: "Boarding dogs should be comfortable in a home environment and do well around both cats and other dogs, since we have one of each at home. If you're unsure, we can discuss your dog's temperament during the meet & greet.",
  },
  {
    q: "What's your cancellation policy?",
    a: "Cancellations are free — no cancellation fees, no penalties.",
  },
  {
    q: "What's included in a stay?",
    a: "Feeding, fresh water, walks or play sessions, litter scooping, plant watering, mail in, and daily photo or video updates. Treats, chews, and toys at our home are on us.",
  },
];

export function FaqSection() {
  return (
    <Section id="faq" tone="pink">
      <Container size="narrow">
        <SectionHeading
          eyebrow="Frequently asked"
          title={
            <>
              Good questions,{" "}
              <span className="text-pink-deepest">honest answers</span>
            </>
          }
        />

        <div className="mt-10 rounded-3xl bg-cream border border-ink/10 shadow-[0_12px_36px_-22px_rgba(43,42,40,0.25)] divide-y divide-ink/10 overflow-hidden">
          {FAQS.map((item) => (
            <details key={item.q} className="group">
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 md:px-7 py-5 focus-visible:outline-none focus-visible:bg-pink-soft/30">
                <span className="font-rounded text-base md:text-lg font-semibold text-ink">
                  {item.q}
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-full bg-pink-soft/60 text-ink transition-transform group-open:rotate-180"
                >
                  <ChevronDownIcon size={18} />
                </span>
              </summary>
              <div className="px-5 md:px-7 pb-6 font-body text-sm md:text-base text-ink/80 leading-relaxed">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}
