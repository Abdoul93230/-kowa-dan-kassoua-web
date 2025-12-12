'use client';

import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#ffe9de] via-orange-100 to-orange-200 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNlYzVhMTMiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMTZjMC04LjgzNy03LjE2My0xNi0xNi0xNlM0IDE1LjE2MyA0IDE2czcuMTYzIDE2IDE2IDE2IDE2LTcuMTYzIDE2LTE2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Prêt à commencer votre aventure ?
          </h2>
          <p className="text-lg md:text-xl text-gray-700 mb-10 max-w-2xl mx-auto">
            Rejoignez des milliers de vendeurs et acheteurs qui ont déjà trouvé leur bonheur sur MarketHub
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              size="lg"
              className="bg-[#ec5a13] text-white hover:bg-[#d94f0f] text-lg px-8 py-6 h-auto font-semibold shadow-xl"
            >
              Publier une annonce
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-[#ec5a13] bg-white text-[#ec5a13] hover:bg-[#ec5a13] hover:text-white text-lg px-8 py-6 h-auto font-semibold transition-all"
            >
              En savoir plus
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
            <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-lg p-4 shadow-md">
              <CheckCircle2 className="h-6 w-6 text-[#ec5a13] flex-shrink-0" />
              <p className="text-gray-900 font-medium text-left">Inscription 100% gratuite</p>
            </div>
            <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-lg p-4 shadow-md">
              <CheckCircle2 className="h-6 w-6 text-[#ec5a13] flex-shrink-0" />
              <p className="text-gray-900 font-medium text-left">Support client réactif</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
