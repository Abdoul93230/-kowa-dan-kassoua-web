'use client';

import { Header } from './Header';
import { HeroSection } from './HeroSection';
import { FeaturedSection } from './FeaturedSection';
import { CategoriesSection } from './CategoriesSection';
import { ProductsCarousel } from './ProductsCarousel';
import { CTASection } from './CTASection';
import { Footer } from './Footer';

export function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSection />
      {/* <FeaturedSection /> */}
      <CategoriesSection />
      <ProductsCarousel />
      <CTASection />
      <Footer />
    </div>
  );
}
