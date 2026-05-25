import { Container } from "../_components/Container";
import { Section } from "../_components/Section";
import { SectionHeading } from "../_components/SectionHeading";
import { MapPinIcon } from "../_components/Icons";
import { SITE } from "../_lib/site";

export function ServiceAreaSection() {
  return (
    <Section id="service-area" tone="cream">
      <Container>
        <div className="grid items-center gap-10 md:gap-14 lg:grid-cols-2">
          <div className="space-y-5">
            <SectionHeading
              align="left"
              eyebrow="Where we go"
              title={
                <>
                  Caring for pets across{" "}
                  <span className="text-pink-deepest">Washtenaw County</span>
                </>
              }
              subtitle="Based in Ann Arbor, we serve homes within roughly a 15-mile radius. Outside the list? Send us a note — we&apos;ll do our best."
            />
            <ul className="grid grid-cols-2 gap-2 md:gap-3 max-w-md">
              {SITE.serviceArea.map((area) => (
                <li
                  key={area}
                  className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-cream/80 px-3 py-1.5 font-rounded text-sm font-semibold text-ink"
                >
                  <MapPinIcon size={14} className="text-pink-deepest" />
                  {area}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div
              className="relative aspect-square w-full max-w-md mx-auto rounded-[40px] overflow-hidden border border-ink/10 shadow-[0_18px_50px_-24px_rgba(43,42,40,0.3)]"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-sage/45 via-cream to-pink-soft/45" />
              <svg
                viewBox="0 0 200 200"
                className="absolute inset-0 h-full w-full opacity-40"
                preserveAspectRatio="xMidYMid slice"
              >
                <defs>
                  <pattern id="mapgrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#2b2a2820" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="200" height="200" fill="url(#mapgrid)" />
                <path d="M20 60 Q 60 50 100 80 T 180 100" stroke="#8aa478" strokeWidth="2" fill="none" opacity="0.6" />
                <path d="M30 130 Q 80 110 130 150 T 200 160" stroke="#d97e91" strokeWidth="2" fill="none" opacity="0.6" />
              </svg>
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2 font-rounded text-sm font-semibold text-ink shadow-[0_6px_18px_-6px_rgba(43,42,40,0.3)]">
                <MapPinIcon size={16} className="text-pink-deepest" />
                Ann Arbor, MI
              </span>

              <span className="absolute left-[18%] top-[28%] h-3 w-3 rounded-full bg-pink-deepest shadow-[0_0_0_4px_rgba(217,126,145,0.25)]" />
              <span className="absolute left-[72%] top-[42%] h-3 w-3 rounded-full bg-sage-deep shadow-[0_0_0_4px_rgba(138,164,120,0.25)]" />
              <span className="absolute left-[34%] top-[72%] h-3 w-3 rounded-full bg-pink-deepest shadow-[0_0_0_4px_rgba(217,126,145,0.25)]" />
              <span className="absolute left-[78%] top-[78%] h-3 w-3 rounded-full bg-sage-deep shadow-[0_0_0_4px_rgba(138,164,120,0.25)]" />
            </div>
            <p className="mt-3 text-center font-body text-xs text-ink/55">
              Illustrative service map — get in touch if you&apos;re unsure.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
