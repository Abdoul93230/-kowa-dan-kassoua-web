'use client';

import { Suspense } from 'react';
import { Header } from '../../components/home/Header';
import { Footer } from '../../components/home/Footer';
import { PublishForm } from '../../components/publish/PublishForm';

export default function PublishPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ffe9de]/30 via-white to-orange-50/30">
      <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200"></div>}>
        <Header />
      </Suspense>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Publier une annonce
            </h1>
            <p className="text-lg text-gray-600">
              Remplissez les informations ci-dessous pour publier votre produit ou service
            </p>
          </div>

          <PublishForm />
        </div>
      </div>

      <Footer />
    </div>
  );
}
