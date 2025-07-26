import { Metadata } from 'next';
import { LandingHero } from '@/src/components/landing/hero';
import { LandingFeatures } from '@/src/components/landing/features';
import { LandingPricing } from '@/src/components/landing/pricing';
import { LandingFooter } from '@/src/components/landing/footer';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://memoraize.app',
  },
};

export default function Home() {
  return (
    <>
      <header role="banner" aria-label="メインヘッダー">
        <LandingHero />
      </header>
      <main id="main-content" role="main">
        <section aria-labelledby="features-heading">
          <LandingFeatures />
        </section>
        <section aria-labelledby="pricing-heading">
          <LandingPricing />
        </section>
      </main>
      <footer role="contentinfo">
        <LandingFooter />
      </footer>
    </>
  );
}
