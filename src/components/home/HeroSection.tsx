'use client';

import { ArrowRight, TrendingUp, Users, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50 opacity-70"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Connectez vendeurs et acheteurs
            <span className="text-emerald-600"> dans tous les secteurs</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            MarketHub est la plateforme qui simplifie l'achat et la vente de produits et services.
            Des milliers d'offres vous attendent dans des secteurs variés : électronique, alimentation, services à domicile et bien plus.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-6 h-auto">
              Découvrir les offres
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-slate-300 hover:border-emerald-600 hover:text-emerald-600 text-lg px-8 py-6 h-auto">
              Publier gratuitement
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white rounded-xl p-6 shadow-md border border-slate-100 hover:shadow-lg transition-all">
              <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-lg mb-4 mx-auto">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Milliers d'offres</h3>
              <p className="text-slate-600 text-sm">Accédez à une large gamme de produits et services</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-slate-100 hover:shadow-lg transition-all">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 mx-auto">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Communauté active</h3>
              <p className="text-slate-600 text-sm">Rejoignez des milliers d'utilisateurs satisfaits</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-slate-100 hover:shadow-lg transition-all">
              <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-lg mb-4 mx-auto">
                <Shield className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Transactions sécurisées</h3>
              <p className="text-slate-600 text-sm">Achetez et vendez en toute confiance</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
