import type { ReactNode } from "react";
import { Container } from "../_components/Container";
import { Section } from "../_components/Section";
import { SectionHeading } from "../_components/SectionHeading";
import {
  HouseIcon,
  HeartIcon,
  CameraIcon,
  ShieldIcon,
  PawIcon,
  SunIcon,
} from "../_components/Icons";

type Feature = {
  title: string;
  icon: ReactNode;
  tone: string;
};

const FEATURES: Feature[] = [
  { title: "Home-style, not kennel-based", icon: <HouseIcon size={24} />, tone: "bg-pink-soft" },
  { title: "Personalized one-on-one care", icon: <HeartIcon size={24} />, tone: "bg-yellow" },
  { title: "Free meet & greet", icon: <PawIcon size={24} />, tone: "bg-blue-soft" },
  { title: "Insured & CPR-certified", icon: <ShieldIcon size={24} />, tone: "bg-sage" },
  { title: "Daily photo & video updates", icon: <CameraIcon size={24} />, tone: "bg-pink-soft" },
  { title: "Enclosed yard & soft flooring", icon: <SunIcon size={24} />, tone: "bg-yellow" },
];

export function WhyChooseSection() {
  return (
    <Section id="why" tone="cream">
      <Container>
        <SectionHeading
          eyebrow="Why choose baba"
          title={
            <>
              The differences you can{" "}
              <span className="text-pink-deepest">feel</span>
            </>
          }
          subtitle="A short list, on purpose — every promise below is something we won't compromise on."
        />
        <ul className="mt-12 grid gap-4 md:gap-5 grid-cols-2 md:grid-cols-3">
          {FEATURES.map((f) => (
            <li
              key={f.title}
              className="flex items-center gap-3 md:gap-4 rounded-2xl border border-ink/10 bg-cream/70 p-4 md:p-5 shadow-[0_6px_18px_-12px_rgba(43,42,40,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_22px_-14px_rgba(43,42,40,0.25)]"
            >
              <span
                aria-hidden="true"
                className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${f.tone} text-ink`}
              >
                {f.icon}
              </span>
              <span className="font-rounded text-sm md:text-base font-semibold leading-tight text-ink">
                {f.title}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
