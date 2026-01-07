'use client';

import { Suspense } from 'react';
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
      <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200"></div>}>
        <Header />
      </Suspense>
      <HeroSection />
      {/* <FeaturedSection /> */}
      <CategoriesSection />
      {/* <ProductsCarousel /> */}
      <CTASection />
      <Footer />
    </div>
  );
}
