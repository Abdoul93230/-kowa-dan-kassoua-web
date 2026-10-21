'use client';

// Liste d'annonces : /categories/tous (avec ?type=product|service) ou /categories/<slug>
import { Suspense, use } from 'react';
import { Header } from '@/components/home/Header';
import { Footer } from '@/components/home/Footer';
import { ListingBrowser } from '@/components/listing/ListingBrowser';

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <Suspense fallback={<div className="h-16 border-b border-gray-200 bg-white" />}>
        <Header />
      </Suspense>
      <Suspense fallback={<div className="h-64 bg-[#070b16]" />}>
        <ListingBrowser slug={slug} />
      </Suspense>
      <Footer />
    </div>
  );
}
