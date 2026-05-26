import { SkipToContent } from "./_components/SkipToContent";
import { TopBar } from "./_components/TopBar";
import { Footer } from "./_components/Footer";
import { StickyMobileBar } from "./_components/StickyMobileBar";
import { HeroSection } from "./_sections/HeroSection";
import { TrustStripSection } from "./_sections/TrustStripSection";
import { AboutSection } from "./_sections/AboutSection";
import { ServicesSection } from "./_sections/ServicesSection";
import { HowItWorksSection } from "./_sections/HowItWorksSection";
import { TestimonialsSection } from "./_sections/TestimonialsSection";
import { PricingSection } from "./_sections/PricingSection";
import { WhyChooseSection } from "./_sections/WhyChooseSection";
import { ServiceAreaSection } from "./_sections/ServiceAreaSection";
import { FaqSection, FAQS } from "./_sections/FaqSection";
import { ContactSection } from "./_sections/ContactSection";
import { SITE } from "./_lib/site";

const SERVICE_TYPES = [
  "Pet Sitting",
  "Dog Walking",
  "Pet Boarding",
  "House Sitting for Pets",
];

export default function Home() {
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE.name,
    image: "https://babapetcare.com/og.png",
    url: "https://babapetcare.com",
    email: SITE.email,
    description: SITE.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.city,
      addressRegion: SITE.state,
      addressCountry: "US",
    },
    areaServed: SITE.serviceArea.map((a) => ({ "@type": "City", name: a })),
    priceRange: "$$",
    sameAs: [SITE.instagramUrl, SITE.roverUrl],
    makesOffer: SERVICE_TYPES.map((s) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: s, areaServed: SITE.city },
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <SkipToContent />
      <TopBar />
      <main id="main" className="flex-1 pb-24 md:pb-0">
        <HeroSection />
        <TrustStripSection />
        <AboutSection />
        <ServicesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />
        <WhyChooseSection />
        <ServiceAreaSection />
        <FaqSection />
        <ContactSection />
      </main>
      <Footer />
      <StickyMobileBar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
