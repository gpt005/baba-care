import { Container } from "../_components/Container";
import { TrustBadge } from "../_components/TrustBadge";
import { ShieldIcon, HeartIcon, CheckIcon, StarIcon } from "../_components/Icons";
import { SITE } from "../_lib/site";

const BADGES = [
  { icon: <ShieldIcon size={16} />, label: `Insured by ${SITE.insuranceCarrier}` },
  { icon: <CheckIcon size={16} />, label: "Background checked" },
  { icon: <HeartIcon size={16} />, label: "Pet First Aid & CPR certified" },
  { icon: <StarIcon size={16} />, label: "5-star on Rover" },
];

export function TrustStripSection() {
  return (
    <section aria-label="Trust signals" className="py-6 md:py-8 border-y border-ink/10 bg-cream">
      <Container>
        <ul className="flex gap-3 overflow-x-auto md:flex-wrap md:justify-center md:overflow-visible -mx-2 px-2 scrollbar-none">
          {BADGES.map((b) => (
            <li key={typeof b.label === "string" ? b.label : Math.random()} className="shrink-0">
              <TrustBadge icon={b.icon} label={b.label} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
