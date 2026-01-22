import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { HowItWorksSection } from '@/components/landing/how-it-works-section';
import { FAQSection } from '@/components/landing/faq-section';
import { CTASection } from '@/components/landing/cta-section';
import { Footer } from '@/components/landing/footer';
import {
  WebApplicationJsonLd,
  FAQJsonLd,
  OrganizationJsonLd,
} from '@/components/seo/json-ld';

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <main className="min-h-screen flex flex-col">
      <WebApplicationJsonLd locale={locale} />
      <FAQJsonLd locale={locale} />
      <OrganizationJsonLd />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
