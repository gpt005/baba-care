import { Container } from "../_components/Container";
import { Section } from "../_components/Section";
import { SectionHeading } from "../_components/SectionHeading";
import { PawIcon, StarIcon } from "../_components/Icons";
import { SITE } from "../_lib/site";

type Review = {
  name: string;
  service: string;
  date: string;
  body: string;
};

const REVIEWS: Review[] = [
  {
    name: "Caroline P.",
    service: "Drop-in visits",
    date: "Dec 28, 2025",
    body: "Wutt was friendly, took lots of pictures of the kitties while I was away for me, and did a great job taking care of them. I would definitely recommend her!",
  },
  {
    name: "Abigail M.",
    service: "Boarding",
    date: "Dec 30, 2025",
    body: "Wutt was incredible with our shy and anxious kitty! She was able to add a few days to the stay when I made an error requesting, and even came for an extra visit when our flight was delayed!",
  },
  {
    name: "Jack J.",
    service: "Boarding",
    date: "Jan 30, 2026",
    body: "My dog came back from Wutt's home tired and happy. Maple received lots of exercise and, by the looks of the many photos and videos she sent, has a new best friend in Wutt's dog, Milo!",
  },
  {
    name: "Alex O.",
    service: "Drop-in visits",
    date: "Jan 04, 2026",
    body: "Amazing job. Wutt was professional, punctual, receptive to changes in our cats' needs while we're gone. Wutt went above and beyond, cannot recommend her services enough.",
  },
  {
    name: "Hannah K.",
    service: "Drop-in visits",
    date: "Feb 02, 2026",
    body: "Excellent communication, took great care of my old cat. She even vacuumed up litter that he tracked out of the box. 10/10 would use again.",
  },
  {
    name: "Yume P.",
    service: "House sitting",
    date: "Dec 24, 2025",
    body: "She was fantastic with two anxious dogs, communicated with us well with pictures throughout the day, and kept the house very clean. Thank you so much Wutt!",
  },
  {
    name: "Komal D.",
    service: "Doggy day care",
    date: "Feb 26, 2026",
    body: "Dasher had a great time playing by with Milo. Wutt kept us posted on how his day went and was very accommodating with our needs.",
  },
  {
    name: "Willem W.",
    service: "Drop-in visits",
    date: "Dec 31, 2025",
    body: "Wutt did an amazing job looking after my cat. She's very attentive to details and was very proactive with communication. Highly recommend!",
  },
];

export function TestimonialsSection() {
  return (
    <Section id="testimonials" tone="cream">
      <Container>
        <SectionHeading
          eyebrow="Don't take our word for it"
          title={
            <>
              Hear it from other{" "}
              <span className="text-pink-deepest">fur parents</span>
            </>
          }
          subtitle="A handful of verified reviews from our Rover profile."
        />

        <div className="mt-12 grid gap-6 md:gap-8 md:grid-cols-2">
          {REVIEWS.map((r) => (
            <ReviewCard key={`${r.name}-${r.date}`} review={r} />
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 text-center">
          <a
            href={SITE.roverUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-cream px-5 py-2.5 font-rounded text-sm font-semibold text-ink hover:-translate-y-0.5 hover:shadow-[0_8px_18px_-8px_rgba(43,42,40,0.25)] transition-all"
          >
            <PawIcon size={16} className="text-[#1A9D75]" />
            See all reviews on Rover
          </a>
          <p className="font-body text-xs text-ink/55">Verified Rover reviews</p>
        </div>
      </Container>
    </Section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const initials = review.name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <article className="rounded-3xl bg-cream border border-ink/10 p-5 md:p-6 shadow-[0_8px_22px_-16px_rgba(43,42,40,0.2)]">
      <header className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-soft font-rounded text-sm font-bold text-ink"
        >
          {initials}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-rounded text-sm font-semibold text-ink truncate">
            {review.name}
          </p>
          <p className="font-body text-xs text-ink/60 flex items-center gap-1.5 flex-wrap">
            <PawIcon size={12} className="text-pink-deepest" />
            <span>{review.service}</span>
            <span aria-hidden="true">·</span>
            <span>{review.date}</span>
          </p>
        </div>
        <span aria-hidden="true" className="inline-flex gap-0.5 text-yellow-600">
          <StarIcon size={14} />
          <StarIcon size={14} />
          <StarIcon size={14} />
          <StarIcon size={14} />
          <StarIcon size={14} />
        </span>
      </header>
      <p className="mt-3 font-body text-sm md:text-base text-ink/85 leading-relaxed">
        {review.body}
      </p>
    </article>
  );
}
