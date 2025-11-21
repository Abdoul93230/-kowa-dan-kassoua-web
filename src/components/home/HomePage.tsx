'use client';

import { useState } from 'react';
import { Header } from './Header';
import { HeroSection } from './HeroSection';
import { CategoriesSection } from './CategoriesSection';
import { FeaturedSection } from './FeaturedSection';
import { TestimonialsSection } from './TestimonialsSection';
import { CTASection } from './CTASection';
import { Footer } from './Footer';

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <HeroSection />
      <CategoriesSection />
      <FeaturedSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
