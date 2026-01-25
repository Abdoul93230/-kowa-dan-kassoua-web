'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '../../components/home/Header';
import { Footer } from '../../components/home/Footer';
import { PublishForm } from '../../components/publish/PublishForm';

function PublishContent() {
  const searchParams = useSearchParams();
  const editId = searchParams?.get('edit') || null;
  const isEditMode = !!editId;

  return (
    <>
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-3">
              {isEditMode ? 'Modifier votre annonce' : 'Publier une annonce'}
            </h1>
            <p className="text-base md:text-lg text-gray-600">
              {isEditMode 
                ? 'Modifiez les informations de votre annonce ci-dessous'
                : 'Remplissez les informations ci-dessous pour publier votre produit ou service'}
            </p>
          </div>

          <PublishForm />
        </div>
      </div>
    </>
  );
}

export default function PublishPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ffe9de]/30 via-white to-orange-50/30">
      <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200"></div>}>
        <Header />
      </Suspense>

      <Suspense fallback={
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      }>
        <PublishContent />
      </Suspense>

      <Footer />
    </div>
  );
}
