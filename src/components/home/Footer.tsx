'use client';

import { ShoppingBag, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="h-8 w-8 text-emerald-500" />
              <span className="text-2xl font-bold text-white">MarketHub</span>
            </div>
            <p className="text-slate-400 mb-4 leading-relaxed">
              La plateforme qui connecte vendeurs et acheteurs dans tous les secteurs d'activité.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-emerald-600 flex items-center justify-center transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-emerald-600 flex items-center justify-center transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-emerald-600 flex items-center justify-center transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-emerald-600 flex items-center justify-center transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Catégories populaires</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Électronique</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Alimentation</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Immobilier</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Automobile</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Services à domicile</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">À propos</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Qui sommes-nous</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Comment ça marche</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Conditions d'utilisation</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Politique de confidentialité</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Centre d'aide</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>contact@markethub.com</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>+221 77 123 45 67</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Dakar, Sénégal</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © 2025 MarketHub. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="hover:text-emerald-500 transition-colors">Mentions légales</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Cookies</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Plan du site</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
