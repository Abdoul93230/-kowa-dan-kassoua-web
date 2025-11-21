'use client'
import { 
  ChevronRight, 
} from 'lucide-react';


export function Breadcrumb({ category }: { category: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
      <a href="/" className="hover:text-emerald-600 transition-colors">Accueil</a>
      <ChevronRight className="h-4 w-4" />
      <a href="/categories" className="hover:text-emerald-600 transition-colors">Catégories</a>
      <ChevronRight className="h-4 w-4" />
      <span className="text-slate-900 font-medium">{category}</span>
    </div>
  );
}