import { LandingHero } from '@/components/landing/hero';
import { LandingFeatures } from '@/components/landing/features';
import { LandingPricing } from '@/components/landing/pricing';
import { LandingFooter } from '@/components/landing/footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full items-center justify-center px-4 sm:px-8">
      <div className="w-full max-w-7xl mx-auto">
        <LandingHero />
        <LandingFeatures />
        <LandingPricing />
        <LandingFooter />
      </div>
    </div>
  );
}