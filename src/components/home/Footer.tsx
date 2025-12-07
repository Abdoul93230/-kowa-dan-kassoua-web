'use client';

import { ShoppingBag, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag className="h-7 w-7 text-[#ec5a13]" />
              <span className="text-xl font-bold text-white">MarketHub</span>
            </div>
            <p className="text-gray-400 mb-3 leading-relaxed text-sm">
              La plateforme qui connecte vendeurs et acheteurs dans tous les secteurs d'activité.
            </p>
            <div className="flex items-center gap-2">
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-[#ec5a13] flex items-center justify-center transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-[#ec5a13] flex items-center justify-center transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-[#ec5a13] flex items-center justify-center transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">Catégories populaires</h3>
            <ul className="space-y-1.5 text-sm">
              <li><a href="#" className="hover:text-[#ec5a13] transition-colors">Électronique</a></li>
              <li><a href="#" className="hover:text-[#ec5a13] transition-colors">Alimentation</a></li>
              <li><a href="#" className="hover:text-[#ec5a13] transition-colors">Immobilier</a></li>
              <li><a href="#" className="hover:text-[#ec5a13] transition-colors">Services à domicile</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">À propos</h3>
            <ul className="space-y-1.5 text-sm">
              <li><a href="#" className="hover:text-[#ec5a13] transition-colors">Qui sommes-nous</a></li>
              <li><a href="#" className="hover:text-[#ec5a13] transition-colors">Comment ça marche</a></li>
              <li><a href="#" className="hover:text-[#ec5a13] transition-colors">Conditions d'utilisation</a></li>
              <li><a href="#" className="hover:text-[#ec5a13] transition-colors">Centre d'aide</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-[#ec5a13] mt-0.5 flex-shrink-0" />
                <span>contact@markethub.com</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-[#ec5a13] mt-0.5 flex-shrink-0" />
                <span>+221 77 123 45 67</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-xs">
            © 2025 MarketHub. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <a href="#" className="hover:text-[#ec5a13] transition-colors">Mentions légales</a>
            <a href="#" className="hover:text-[#ec5a13] transition-colors">Confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
