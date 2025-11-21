'use client';

import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtOC44MzctNy4xNjMtMTYtMTYtMTZTNCAxNS4xNjMgNCAxNnM3LjE2MyAxNiAxNiAxNiAxNi03LjE2MyAxNi0xNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Prêt à commencer votre aventure ?
          </h2>
          <p className="text-lg md:text-xl text-emerald-50 mb-10 max-w-2xl mx-auto">
            Rejoignez des milliers de vendeurs et acheteurs qui ont déjà trouvé leur bonheur sur MarketHub
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              size="lg"
              className="bg-white text-emerald-700 hover:bg-slate-100 text-lg px-8 py-6 h-auto font-semibold shadow-xl"
            >
              Créer un compte gratuitement
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 h-auto"
            >
              En savoir plus
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-200 flex-shrink-0" />
              <p className="text-white font-medium text-left">Inscription 100% gratuite</p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-200 flex-shrink-0" />
              <p className="text-white font-medium text-left">Support client réactif</p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-200 flex-shrink-0" />
              <p className="text-white font-medium text-left">Paiements sécurisés</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
