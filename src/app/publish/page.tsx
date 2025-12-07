'use client';

import { useState } from 'react';
import { Header } from '../../components/home/Header';
import { Footer } from '../../components/home/Footer';
import { PublishForm } from '../../components/publish/PublishForm';

export default function PublishPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-slate-50">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Publier une annonce
            </h1>
            <p className="text-lg text-slate-600">
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
