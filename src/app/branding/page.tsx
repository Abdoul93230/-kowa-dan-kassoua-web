"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

// ─── Données de la charte ───────────────────────────────────────────────────

const COLORS = [
  {
    name: "TakTak Orange",
    hex: "#FF6200",
    rgb: "255, 98, 0",
    usage: "Couleur principale — fond, CTA, énergie",
    textClass: "text-white",
    border: "border-transparent",
  },
  {
    name: "Girafe Bleue",
    hex: "#2B7FE8",
    rgb: "43, 127, 232",
    usage: "Accent primaire — liens, badges, highlights",
    textClass: "text-white",
    border: "border-transparent",
  },
  {
    name: "Girafe Orange",
    hex: "#F97316",
    rgb: "249, 115, 22",
    usage: "Accent secondaire — illustrations, icônes",
    textClass: "text-white",
    border: "border-transparent",
  },
  {
    name: "Outline Cartoon",
    hex: "#1A1A1A",
    rgb: "26, 26, 26",
    usage: "Contours, textes foncés, profondeur",
    textClass: "text-white",
    border: "border-transparent",
  },
  {
    name: "Blanc pur",
    hex: "#FFFFFF",
    rgb: "255, 255, 255",
    usage: "Fonds clairs, textes sur fond sombre, espace",
    textClass: "text-[#1A1A1A]",
    border: "border-gray-200",
  },
  {
    name: "Gris Doux",
    hex: "#F5F5F5",
    rgb: "245, 245, 245",
    usage: "Fonds de sections, cartes, séparateurs",
    textClass: "text-[#1A1A1A]",
    border: "border-gray-200",
  },
];

const LOGO_VARIANTS = [
  {
    label: "Carré — fond orange",
    file: "/branding/logo1.png",
    bg: "bg-[#FF6200]",
    desc: "Format principal, fond orange vif",
  },
  {
    label: "Carré — girafes inversées",
    file: "/branding/logo2.png",
    bg: "bg-[#FF6200]",
    desc: "Variante positionnement girafes",
  },
  {
    label: "Icône seule — fond orange",
    file: "/branding/logo3.png",
    bg: "bg-[#FF6200]",
    desc: "Icône sans texte, format app",
  },
  {
    label: "Icône seule — variante",
    file: "/branding/logo4.png",
    bg: "bg-[#FF6200]",
    desc: "Icône sans texte, variante",
  },
  {
    label: "Icône — fond sombre",
    file: "/branding/logo5.png",
    bg: "bg-[#1A1A1A]",
    desc: "Usage sur fond noir",
  },
  {
    label: "Logo complet — version A",
    file: "/branding/logo6.png",
    bg: "bg-[#FF6200]",
    desc: "Logo avec texte stylisé",
  },
  {
    label: "Logo complet — version B",
    file: "/branding/logo7.png",
    bg: "bg-[#FF6200]",
    desc: "Variante texte",
  },
  {
    label: "Logo compact — fond orange",
    file: "/branding/logo8.png",
    bg: "bg-[#FF6200]",
    desc: "Format compact horizontal",
  },
  {
    label: "Texte intégré — girafes T",
    file: "/branding/logo9.png",
    bg: "bg-[#FF6200]",
    desc: "Girafes forment les T du nom",
  },
  {
    label: "Texte intégré — inversé",
    file: "/branding/logo10.png",
    bg: "bg-[#FF6200]",
    desc: "Variante couleurs inversées",
  },
  {
    label: "Texte intégré — version C",
    file: "/branding/logo11.png",
    bg: "bg-[#FF6200]",
    desc: "Version pleine largeur",
  },
  {
    label: "Sur fond blanc — no bg",
    file: "/branding/logo6-removebg-preview.png",
    bg: "bg-white",
    desc: "Usage sur fond blanc, impression",
  },
  {
    label: "Noir & Blanc — SVG vectoriel",
    file: "/branding/logo-bw.svg",
    bg: "bg-white",
    desc: "Fichier vectoriel — tampons, gravure, sérigraphie, impression N&B",
  },
];

const MOCKUPS = [
  {
    label: "Application mobile",
    file: "/branding/Screenshot 2026-06-13 171554.png",
    desc: "Écran d'accueil app — fond pastel",
  },
  {
    label: "T-shirt blanc",
    file: "/branding/Screenshot 2026-06-13 182207.png",
    desc: "Merchandising — logo sur textile clair",
  },
  {
    label: "Apple Watch",
    file: "/branding/Screenshot 2026-06-13 182425.png",
    desc: "Interface wearable",
  },
  {
    label: "Smartwatch en situation",
    file: "/branding/Screenshot 2026-06-13 182809.png",
    desc: "Usage en mobilité",
  },
  {
    label: "Smartwatch lifestyle",
    file: "/branding/Screenshot 2026-06-13 182832.png",
    desc: "Contexte décontracté",
  },
  {
    label: "App mobile — logo texte",
    file: "/branding/Screenshot 2026-06-13 183025.png",
    desc: "Splash screen logo intégré",
  },
  {
    label: "App mobile — dark",
    file: "/branding/Screenshot 2026-06-13 183103.png",
    desc: "Splash screen fond sombre",
  },
];

const DO_DONTS = [
  {
    type: "do",
    title: "Utiliser les couleurs officielles",
    desc: "Orange #FF6200 ou blanc sur fond sombre uniquement.",
  },
  {
    type: "do",
    title: "Respecter la zone de protection",
    desc: "Laisser un espace égal à la hauteur d'une girafe autour du logo.",
  },
  {
    type: "do",
    title: "Conserver le ratio girafes",
    desc: "Les deux girafes doivent toujours rester symétriques et lisibles.",
  },
  {
    type: "do",
    title: "Utiliser le contour cartoon",
    desc: "Le outline noir épais fait partie de l'identité — ne pas le supprimer.",
  },
  {
    type: "dont",
    title: "Ne pas déformer le logo",
    desc: "Pas d'étirement, compression ou rotation du logo.",
  },
  {
    type: "dont",
    title: "Ne pas changer les couleurs des girafes",
    desc: "Bleu et orange uniquement — pas d'autres teintes.",
  },
  {
    type: "dont",
    title: "Ne pas placer sur fond chargé",
    desc: "Éviter les photos ou textures derrière le logo sans fond uni.",
  },
  {
    type: "dont",
    title: "Ne pas séparer les girafes",
    desc: "Les deux girafes forment une unité — elles restent ensemble.",
  },
];

// ─── Logique couleurs dans l'app ────────────────────────────────────────────

const COLOR_LOGIC = [
  {
    color: "orange",
    hex: "#ec5a13",
    hexSoft: "#ffe9de",
    label: "Orange — Produits physiques",
    icon: "📦",
    elements: [
      { element: "Prix de l'annonce", detail: "Texte orange vif — attire l'œil immédiatement" },
      { element: "Bouton CTA principal", detail: "Gradient orange500 → orange700" },
      { element: "Badge de type", detail: "Fond orange semi-transparent" },
      { element: "Icône localisation", detail: "Pin orange sur carte et liste" },
      { element: "Avatar du vendeur", detail: "Gradient orange en arrière-plan" },
      { element: "Barre d'accent section", detail: "Bordure gauche orange en dégradé" },
      { element: "Fond doux (soft bg)", detail: "#ffe9de pour rows, cartes, modals" },
      { element: "Bouton favoris", detail: "Cœur orange sur les cards produit" },
    ],
  },
  {
    color: "blue",
    hex: "#2563EB",
    hexSoft: "#DBEAFE",
    label: "Bleu — Services professionnels",
    icon: "🛠️",
    elements: [
      { element: "Prix du service", detail: "Texte bleu — confiance, professionnalisme" },
      { element: "Bouton CTA principal", detail: "Gradient blue-600 → blue-800" },
      { element: "Badge de type", detail: "Fond bleu semi-transparent" },
      { element: "Icône localisation", detail: "Pin bleu sur carte et liste" },
      { element: "Avatar du prestataire", detail: "Gradient bleu en arrière-plan" },
      { element: "Barre d'accent section", detail: "Bordure gauche bleue en dégradé" },
      { element: "Fond doux (soft bg)", detail: "#DBEAFE pour rows, cartes, modals" },
      { element: "Bouton favoris", detail: "Cœur bleu sur les cards service" },
    ],
  },
];

// ─── Composant AppIcon ───────────────────────────────────────────────────────

function AppIcon({ bg, label, dark = false, children }: {
  bg: string;
  label: string;
  dark?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="rounded-[18px] flex items-center justify-center overflow-hidden"
        style={{ width: 56, height: 56, background: bg, boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
        {children}
      </div>
      <span
        className="text-[10px] font-medium truncate w-14 text-center"
        style={{ color: dark ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.7)", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Composant Lightbox ──────────────────────────────────────────────────────

function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-all"
        onClick={onClose}
        aria-label="Fermer"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div
        className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center"
        onClick={e => e.stopPropagation()}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain drop-shadow-2xl"
          sizes="(max-width: 1280px) 100vw, 1280px"
        />
      </div>
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs">
        Appuyez sur Échap ou cliquez en dehors pour fermer
      </p>
    </div>
  );
}

// ─── Composant principal ─────────────────────────────────────────────────────

export default function BrandingPage() {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  function copyHex(hex: string) {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  }

  const openLightbox = useCallback((src: string, alt: string) => {
    setLightbox({ src, alt });
  }, []);

  const closeLightbox = useCallback(() => {
    setLightbox(null);
  }, []);

  return (
    <main className="min-h-screen bg-white font-sans">
      {lightbox && <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={closeLightbox} />}

      {/* ── NAV ─────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-[#1A1A1A]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-white font-bold text-lg tracking-wide">TakTak · Brand Guidelines</span>
          <div className="hidden md:flex items-center gap-6 text-sm text-white/70">
            <a href="#logo" className="hover:text-white transition-colors">Logo</a>
            <a href="#couleurs" className="hover:text-white transition-colors">Couleurs</a>
            <a href="#typographie" className="hover:text-white transition-colors">Typographie</a>
            <a href="#mascotte" className="hover:text-white transition-colors">Mascotte</a>
            <a href="#app-mockup" className="hover:text-[#FF6200] transition-colors font-semibold text-[#FF6200]/80">App Icon</a>
            <a href="#mockups" className="hover:text-white transition-colors">Mockups</a>
            <a href="#logique-couleurs" className="hover:text-white transition-colors">Orange vs Bleu</a>
            <a href="#usage" className="hover:text-white transition-colors">Usage</a>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative bg-[#FF6200] overflow-hidden min-h-[90vh] flex items-center">
        {/* Cercles décoratifs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-black/10" />
        <div className="absolute top-1/2 right-1/4 w-40 h-40 rounded-full bg-white/5" />

        <div className="relative max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
          {/* Texte */}
          <div>
            <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-widest">
              Brand Guidelines 2026
            </span>
            <h1 className="text-7xl md:text-8xl font-black text-white mb-4 leading-none tracking-tight">
              Tak<span className="text-[#1A1A1A]">Tak</span>
            </h1>
            <p className="text-white/90 text-xl md:text-2xl font-medium mb-8 leading-relaxed">
              Une identité visuelle dynamique,<br />
              cartoon et pleine d&apos;énergie.
            </p>
            <p className="text-white/70 text-base max-w-md leading-relaxed">
              Deux girafes. Deux couleurs. Une plateforme. Ce guide rassemble tout ce qu&apos;il faut savoir pour utiliser la marque TakTak de manière cohérente et impactante.
            </p>
            <div className="mt-10 flex gap-4 flex-wrap">
              <a href="#logo" className="bg-[#1A1A1A] text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-black transition-colors">
                Explorer le guide →
              </a>
              <a href="#couleurs" className="bg-white/20 text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-white/30 transition-colors backdrop-blur-sm">
                Voir les couleurs
              </a>
            </div>
          </div>

          {/* Logo hero */}
          <div className="flex justify-center items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 rounded-3xl blur-3xl scale-110" />
              <Image
                src="/branding/logo1.png"
                alt="TakTak Logo"
                width={420}
                height={420}
                className="relative drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                priority
              />
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ── À PROPOS DE LA MARQUE ───────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#FF6200]/5 border border-[#FF6200]/20 rounded-2xl p-8">
              <div className="text-4xl mb-4">🦒</div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">La symbolique</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Deux girafes face-à-face — acheteur et vendeur. Leurs corps forment naturellement les deux <strong>T</strong> de TakTak. Un logo qui raconte la rencontre.
              </p>
            </div>
            <div className="bg-[#2B7FE8]/5 border border-[#2B7FE8]/20 rounded-2xl p-8">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">Le style cartoon</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Des contours épais, des taches rondes sur les girafes, une énergie pop et accessible. Un design qui inspire confiance et bonne humeur.
              </p>
            </div>
            <div className="bg-[#F97316]/5 border border-[#F97316]/20 rounded-2xl p-8">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">L&apos;énergie</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                L&apos;orange vif domine — couleur de l&apos;action, de la dynamique et du commerce. Le bleu apporte confiance et sérieux. Ensemble ils créent l&apos;équilibre TakTak.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── LOGO & VARIANTES ────────────────────────────────────── */}
      <section id="logo" className="py-24 bg-[#F5F5F5]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14">
            <span className="text-[#FF6200] text-sm font-bold uppercase tracking-widest">01 — Logo</span>
            <h2 className="text-4xl font-black text-[#1A1A1A] mt-2 mb-4">Logo & Variantes</h2>
            <p className="text-gray-500 text-lg max-w-2xl">
              Toutes les déclinaisons officielles du logo TakTak. Chaque format est conçu pour un contexte d&apos;usage spécifique.
            </p>
          </div>

          {/* Logo principal mis en avant */}
          <div className="bg-[#FF6200] rounded-3xl p-12 mb-8 flex flex-col md:flex-row items-center gap-12">
            <button
              onClick={() => openLightbox("/branding/logo1.png", "Logo TakTak principal")}
              className="shrink-0 group/lb relative"
              title="Cliquer pour agrandir"
            >
              <Image
                src="/branding/logo1.png"
                alt="Logo TakTak principal"
                width={280}
                height={280}
                className="drop-shadow-2xl group-hover/lb:scale-105 transition-transform duration-300"
              />
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/lb:opacity-100 transition-opacity bg-black/20 rounded-2xl">
                <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full font-medium">🔍 Agrandir</span>
              </span>
            </button>
            <div>
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Logo principal</span>
              <h3 className="text-white text-3xl font-black mt-4 mb-3">Version carré fond orange</h3>
              <p className="text-white/80 leading-relaxed max-w-lg">
                C&apos;est la version de référence. Deux girafes bleue et orange face-à-face, nom de la marque en blanc. À utiliser en priorité sur tous les supports digitaux et print.
              </p>
            </div>
          </div>

          {/* SVG Noir & Blanc mis en avant */}
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-10 mb-8 flex flex-col md:flex-row items-center gap-10 hover:border-gray-400 transition-colors">
            <button
              onClick={() => openLightbox("/branding/logo-bw.svg", "Logo TakTak — Noir & Blanc SVG")}
              className="shrink-0 group/lb relative bg-gray-50 rounded-2xl p-6 border border-gray-100"
              title="Cliquer pour agrandir"
            >
              <Image
                src="/branding/logo-bw.svg"
                alt="Logo TakTak noir et blanc SVG"
                width={220}
                height={220}
                className="group-hover/lb:scale-105 transition-transform duration-300"
              />
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/lb:opacity-100 transition-opacity bg-black/10 rounded-2xl">
                <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full font-medium">🔍 Agrandir</span>
              </span>
            </button>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-[#1A1A1A] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">SVG Vectoriel</span>
                <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">Noir & Blanc</span>
              </div>
              <h3 className="text-[#1A1A1A] text-2xl font-black mb-3">Version Noir & Blanc</h3>
              <p className="text-gray-500 leading-relaxed max-w-lg text-sm mb-4">
                Format vectoriel SVG — s&apos;adapte à n&apos;importe quelle taille sans perte de qualité. Indispensable pour les impressions, tampons, gravures, sérigraphie et tout support monochrome.
              </p>
              <div className="flex gap-3 flex-wrap">
                {["Impression", "Tampon", "Gravure laser", "Sérigraphie", "Broderie", "Fax / PDF"].map(tag => (
                  <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Grille variantes */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {LOGO_VARIANTS.map((v, i) => (
              <div key={i} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
                <button
                  onClick={() => openLightbox(v.file, v.label)}
                  className={`${v.bg} flex items-center justify-center p-6 h-40 w-full relative`}
                  title="Cliquer pour agrandir"
                >
                  <Image
                    src={v.file}
                    alt={v.label}
                    width={140}
                    height={140}
                    className="object-contain max-h-28 group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-full">🔍</span>
                  </span>
                </button>
                <div className="p-4">
                  <p className="font-semibold text-[#1A1A1A] text-sm">{v.label}</p>
                  <p className="text-gray-400 text-xs mt-1">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Formats */}
          <div className="mt-10 bg-white rounded-2xl p-8 border border-gray-100">
            <h3 className="font-bold text-[#1A1A1A] text-lg mb-6">Formats disponibles</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { fmt: "Carré", usage: "Réseaux sociaux, app icon" },
                { fmt: "Rond", usage: "Avatar, profil" },
                { fmt: "Horizontal", usage: "Header, bannière" },
                { fmt: "Sur fond blanc", usage: "Impression, documents" },
                { fmt: "Noir & Blanc (SVG)", usage: "Vectoriel — tampon, gravure, sérigraphie, impression N&B" },
                { fmt: "Icône seule", usage: "Favicon, app store, badge" },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-[#F5F5F5] rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-[#FF6200] mt-1.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-[#1A1A1A] text-sm">{f.fmt}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{f.usage}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PALETTE DE COULEURS ─────────────────────────────────── */}
      <section id="couleurs" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14">
            <span className="text-[#FF6200] text-sm font-bold uppercase tracking-widest">02 — Couleurs</span>
            <h2 className="text-4xl font-black text-[#1A1A1A] mt-2 mb-4">Color Harmony</h2>
            <p className="text-gray-500 text-lg max-w-2xl">
              La palette TakTak reflète l&apos;énergie et le dynamisme de la plateforme. Cliquez sur une couleur pour copier le code hex.
            </p>
          </div>

          {/* Bandes de couleur */}
          <div className="flex rounded-3xl overflow-hidden h-32 mb-10 shadow-lg">
            {COLORS.map((c, i) => (
              <button
                key={i}
                onClick={() => copyHex(c.hex)}
                style={{ backgroundColor: c.hex }}
                className={`flex-1 relative group transition-all duration-300 hover:flex-[2] ${c.border !== "border-transparent" ? `border-r ${c.border}` : ""}`}
                title={c.hex}
              >
                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className={`text-xs font-bold ${c.textClass} bg-black/20 px-2 py-1 rounded`}>
                    {copiedHex === c.hex ? "Copié !" : c.hex}
                  </span>
                </span>
              </button>
            ))}
          </div>

          {/* Cartes couleurs */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {COLORS.map((c, i) => (
              <button
                key={i}
                onClick={() => copyHex(c.hex)}
                className="text-left group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  style={{ backgroundColor: c.hex }}
                  className={`h-24 border-b ${c.border}`}
                />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-[#1A1A1A] text-sm">{c.name}</p>
                    <span className="text-xs text-gray-400 group-hover:text-[#FF6200] transition-colors font-mono">
                      {copiedHex === c.hex ? "✓ Copié" : c.hex}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono mb-2">RGB {c.rgb}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{c.usage}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Combos recommandés */}
          <div className="mt-10 bg-[#F5F5F5] rounded-2xl p-8">
            <h3 className="font-bold text-[#1A1A1A] text-lg mb-6">Combinaisons recommandées</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-[#FF6200] text-white rounded-xl p-6 text-center">
                <p className="font-black text-2xl">TakTak</p>
                <p className="text-white/70 text-xs mt-2">Blanc sur Orange</p>
              </div>
              <div className="bg-[#1A1A1A] text-white rounded-xl p-6 text-center">
                <p className="font-black text-2xl" style={{ color: "#FF6200" }}>TakTak</p>
                <p className="text-white/50 text-xs mt-2">Orange sur Noir</p>
              </div>
              <div className="bg-white border border-gray-200 text-[#1A1A1A] rounded-xl p-6 text-center">
                <p className="font-black text-2xl text-[#2B7FE8]">TakTak</p>
                <p className="text-gray-400 text-xs mt-2">Bleu sur Blanc</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TYPOGRAPHIE ─────────────────────────────────────────── */}
      <section id="typographie" className="py-24 bg-[#1A1A1A]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14">
            <span className="text-[#FF6200] text-sm font-bold uppercase tracking-widest">03 — Typographie</span>
            <h2 className="text-4xl font-black text-white mt-2 mb-4">Typographie</h2>
            <p className="text-white/50 text-lg max-w-2xl">
              Une hiérarchie typographique claire pour des communications accessibles et percutantes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Police principale */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <span className="text-[#FF6200] text-xs font-bold uppercase tracking-widest">Police principale</span>
              <h3 className="text-white text-2xl font-bold mt-3 mb-1">Nunito</h3>
              <p className="text-white/40 text-sm mb-6">Bold, arrondi, friendly — parfaite pour une marque cartoon</p>
              <div className="space-y-3">
                <p className="text-white text-5xl font-black leading-none">Aa</p>
                <p className="text-white/70 text-lg font-bold">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
                <p className="text-white/60 text-lg">abcdefghijklmnopqrstuvwxyz</p>
                <p className="text-white/50 text-lg font-mono">0123456789 !@#$%</p>
              </div>
            </div>

            {/* Police secondaire */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <span className="text-[#2B7FE8] text-xs font-bold uppercase tracking-widest">Police secondaire</span>
              <h3 className="text-white text-2xl font-bold mt-3 mb-1">Inter</h3>
              <p className="text-white/40 text-sm mb-6">Corps de texte, UI, descriptions — lisibilité maximale</p>
              <div className="space-y-3">
                <p className="text-white text-5xl font-black leading-none" style={{ fontFamily: "var(--font-geist-sans)" }}>Aa</p>
                <p className="text-white/70 text-lg" style={{ fontFamily: "var(--font-geist-sans)" }}>ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
                <p className="text-white/60 text-lg" style={{ fontFamily: "var(--font-geist-sans)" }}>abcdefghijklmnopqrstuvwxyz</p>
                <p className="text-white/50 text-lg font-mono">0123456789 !@#$%</p>
              </div>
            </div>
          </div>

          {/* Échelle typographique */}
          <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-8">
            <h3 className="text-white font-bold text-lg mb-6">Échelle typographique</h3>
            <div className="space-y-4 divide-y divide-white/10">
              {[
                { name: "Display", size: "text-5xl", weight: "font-black", sample: "TakTak — Ensemble, on trouve tout !", note: "72px / Black" },
                { name: "Heading 1", size: "text-4xl", weight: "font-bold", sample: "Découvrez des milliers d'annonces", note: "48px / Bold" },
                { name: "Heading 2", size: "text-2xl", weight: "font-bold", sample: "Les meilleures offres du moment", note: "32px / Bold" },
                { name: "Heading 3", size: "text-xl", weight: "font-semibold", sample: "Catégories populaires", note: "24px / Semibold" },
                { name: "Body", size: "text-base", weight: "font-normal", sample: "Achetez, vendez et trouvez facilement ce dont vous avez besoin.", note: "16px / Regular" },
                { name: "Caption", size: "text-sm", weight: "font-medium", sample: "Publié il y a 2 heures · Dakar, Sénégal", note: "14px / Medium" },
              ].map((t, i) => (
                <div key={i} className="flex items-baseline gap-6 pt-4 first:pt-0">
                  <div className="w-28 shrink-0">
                    <p className="text-white/40 text-xs font-mono">{t.name}</p>
                    <p className="text-white/20 text-xs">{t.note}</p>
                  </div>
                  <p className={`text-white/80 ${t.size} ${t.weight} leading-tight`}>{t.sample}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MASCOTTE ────────────────────────────────────────────── */}
      <section id="mascotte" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14">
            <span className="text-[#FF6200] text-sm font-bold uppercase tracking-widest">04 — Mascotte</span>
            <h2 className="text-4xl font-black text-[#1A1A1A] mt-2 mb-4">Les Girafes TakTak</h2>
            <p className="text-gray-500 text-lg max-w-2xl">
              Au cœur de l&apos;identité : deux girafes cartoon qui symbolisent la rencontre entre acheteur et vendeur.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Girafe bleue */}
            <div className="relative bg-[#2B7FE8] rounded-3xl p-10 overflow-hidden group">
              <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-white/10" />
              <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-white/5" />
              <div className="relative flex gap-8 items-center">
                <Image
                  src="/branding/logo7-removebg-preview.png"
                  alt="Girafe bleue TakTak"
                  width={160}
                  height={160}
                  className="object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-500"
                />
                <div>
                  <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Tak #1</span>
                  <h3 className="text-white text-2xl font-black mt-3 mb-2">La Girafe Bleue</h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Représente l&apos;acheteur — curieux, confiant, en quête de bonnes affaires. Bleu dynamique, taches rondes, regard ouvert.
                  </p>
                  <div className="mt-4 flex gap-2">
                    <span className="bg-white/20 text-white text-xs px-2 py-1 rounded font-mono">#2B7FE8</span>
                    <span className="bg-white/20 text-white text-xs px-2 py-1 rounded">Confiance</span>
                    <span className="bg-white/20 text-white text-xs px-2 py-1 rounded">Acheteur</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Girafe orange */}
            <div className="relative bg-[#FF6200] rounded-3xl p-10 overflow-hidden group">
              <div className="absolute -left-8 -bottom-8 w-48 h-48 rounded-full bg-white/10" />
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/5" />
              <div className="relative flex gap-8 items-center flex-row-reverse md:flex-row">
                <Image
                  src="/branding/logo8-removebg-preview.png"
                  alt="Girafe orange TakTak"
                  width={160}
                  height={160}
                  className="object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-500"
                />
                <div>
                  <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Tak #2</span>
                  <h3 className="text-white text-2xl font-black mt-3 mb-2">La Girafe Orange</h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Représente le vendeur — dynamique, actif, prêt à proposer. Orange chaud, énergie commerce, taches caractéristiques.
                  </p>
                  <div className="mt-4 flex gap-2">
                    <span className="bg-white/20 text-white text-xs px-2 py-1 rounded font-mono">#F97316</span>
                    <span className="bg-white/20 text-white text-xs px-2 py-1 rounded">Énergie</span>
                    <span className="bg-white/20 text-white text-xs px-2 py-1 rounded">Vendeur</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ensemble */}
          <div className="mt-8 bg-[#F5F5F5] rounded-3xl p-10 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <h3 className="text-2xl font-black text-[#1A1A1A] mb-4">Ensemble : la rencontre TakTak</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Quand les deux girafes se font face, leurs corps forment naturellement les lettres <strong>T</strong> et <strong>T</strong> — un logo qui raconte l&apos;histoire de la plateforme sans avoir besoin de mots.
              </p>
              <p className="text-gray-500 text-sm leading-relaxed">
                Le style cartoon avec les contours épais et les taches rondes crée une identité accessible, mémorable et adaptée à tous les âges. Un design qui dit : c&apos;est simple, c&apos;est fun, ça marche.
              </p>
            </div>
            <Image
              src="/branding/logo6-removebg-preview.png"
              alt="TakTak ensemble"
              width={260}
              height={180}
              className="object-contain"
            />
          </div>
        </div>
      </section>

      {/* ── PHONE MOCKUP ────────────────────────────────────────── */}
      <section id="app-mockup" className="py-24 bg-[#1A1A1A] overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14">
            <span className="text-[#FF6200] text-sm font-bold uppercase tracking-widest">05 — App Icon</span>
            <h2 className="text-4xl font-black text-white mt-2 mb-4">TakTak sur votre écran</h2>
            <p className="text-white/50 text-lg max-w-2xl">
              L&apos;icône TakTak en situation réelle — sur l&apos;écran d&apos;accueil aux côtés des autres apps.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-16 justify-center">

            {/* ── Téléphone ── */}
            <div className="relative shrink-0" style={{ width: 320 }}>
              {/* Lueur ambiante */}
              <div className="absolute inset-0 blur-3xl scale-75 opacity-40 rounded-full"
                style={{ background: "radial-gradient(circle, #FF6200 0%, #2B7FE8 60%, transparent 100%)" }} />

              {/* Corps du téléphone */}
              <div className="relative rounded-[48px] overflow-hidden border-[8px] border-[#2a2a2a]"
                style={{ boxShadow: "0 0 0 2px #3a3a3a, 0 40px 80px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.05)" }}>

                {/* Écran */}
                <div className="bg-[#0a0a0a] relative" style={{ aspectRatio: "9/19.5" }}>

                  {/* Wallpaper gradient */}
                  <div className="absolute inset-0"
                    style={{ background: "linear-gradient(160deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #1a1a1a 100%)" }} />

                  {/* Étoiles décoratives */}
                  {[
                    { top: "8%", left: "15%", size: 2, opacity: 0.6 },
                    { top: "12%", left: "70%", size: 1.5, opacity: 0.4 },
                    { top: "5%", left: "45%", size: 1, opacity: 0.5 },
                    { top: "18%", left: "85%", size: 2, opacity: 0.3 },
                    { top: "22%", left: "30%", size: 1, opacity: 0.5 },
                  ].map((star, i) => (
                    <div key={i} className="absolute rounded-full bg-white"
                      style={{ top: star.top, left: star.left, width: star.size, height: star.size, opacity: star.opacity }} />
                  ))}

                  {/* Dynamic Island */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black rounded-full z-10"
                    style={{ width: 120, height: 34 }} />

                  {/* Status bar */}
                  <div className="relative z-10 flex items-center justify-between px-8 pt-12 pb-1">
                    <span className="text-white text-[11px] font-semibold">9:41</span>
                    <div className="flex items-center gap-1.5">
                      {/* Signal */}
                      <div className="flex items-end gap-0.5">
                        {[3, 5, 7, 9].map((h, i) => (
                          <div key={i} className="w-1 rounded-sm bg-white" style={{ height: h }} />
                        ))}
                      </div>
                      {/* WiFi */}
                      <svg className="text-white" width="16" height="12" viewBox="0 0 24 18" fill="currentColor">
                        <path d="M12 5.5C8.5 5.5 5.3 6.9 3 9.3l1.5 1.5C6.3 8.9 9 7.5 12 7.5s5.7 1.4 7.5 3.3l1.5-1.5C18.7 6.9 15.5 5.5 12 5.5z" opacity="0.4"/>
                        <path d="M12 9c-2.2 0-4.2.9-5.6 2.3l1.4 1.5C8.8 11.7 10.3 11 12 11s3.2.7 4.2 1.8l1.4-1.5C16.2 9.9 14.2 9 12 9z" opacity="0.7"/>
                        <path d="M12 12.5c-1.1 0-2.1.4-2.8 1.1L12 17l2.8-3.4c-.7-.7-1.7-1.1-2.8-1.1z"/>
                      </svg>
                      {/* Battery */}
                      <div className="flex items-center gap-0.5">
                        <div className="rounded-sm border border-white/70 relative" style={{ width: 22, height: 11 }}>
                          <div className="absolute inset-0.5 bg-white rounded-sm" style={{ right: "25%" }} />
                        </div>
                        <div className="rounded-sm bg-white/70" style={{ width: 2, height: 5 }} />
                      </div>
                    </div>
                  </div>

                  {/* Date & heure widget */}
                  <div className="relative z-10 text-center pt-2 pb-4">
                    <p className="text-white/50 text-xs">Vendredi 13 juin</p>
                    <p className="text-white font-thin" style={{ fontSize: 56, lineHeight: 1.1, letterSpacing: -2 }}>9:41</p>
                  </div>

                  {/* Grille d'apps — rangée 1 */}
                  <div className="relative z-10 px-5 space-y-3">
                    {/* Rangée 1 */}
                    <div className="grid grid-cols-4 gap-3">
                      {/* Appareil photo */}
                      <AppIcon bg="linear-gradient(135deg,#1c1c1e,#3a3a3c)" label="Appareil">
                        <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
                          <path d="M12 8a4 4 0 100 8 4 4 0 000-8zm0 6a2 2 0 110-4 2 2 0 010 4zm-6-9l-1.5 2H3a2 2 0 00-2 2v10a2 2 0 002 2h18a2 2 0 002-2V9a2 2 0 00-2-2h-1.5L18 5H6z" />
                        </svg>
                      </AppIcon>
                      {/* Météo */}
                      <AppIcon bg="linear-gradient(135deg,#4facfe,#00f2fe)" label="Météo">
                        <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
                          <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/>
                        </svg>
                      </AppIcon>
                      {/* Maps */}
                      <AppIcon bg="linear-gradient(135deg,#43e97b,#38f9d7)" label="Plans">
                        <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
                          <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>
                        </svg>
                      </AppIcon>
                      {/* Musique */}
                      <AppIcon bg="linear-gradient(135deg,#f093fb,#f5576c)" label="Musique">
                        <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                        </svg>
                      </AppIcon>
                    </div>

                    {/* Rangée 2 */}
                    <div className="grid grid-cols-4 gap-3">
                      {/* Messages */}
                      <AppIcon bg="linear-gradient(135deg,#43e97b,#38f9d7)" label="Messages">
                        <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
                          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                        </svg>
                      </AppIcon>
                      {/* Photos */}
                      <AppIcon bg="linear-gradient(135deg,#fa709a,#fee140)" label="Photos">
                        <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
                          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                        </svg>
                      </AppIcon>
                      {/* Réglages */}
                      <AppIcon bg="linear-gradient(135deg,#868f96,#596164)" label="Réglages">
                        <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
                          <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                        </svg>
                      </AppIcon>
                      {/* Calendrier */}
                      <AppIcon bg="linear-gradient(135deg,#fff,#f5f5f5)" label="Calendrier" dark>
                        <div className="flex flex-col items-center">
                          <span className="text-red-500 text-[8px] font-bold uppercase tracking-wider leading-none">juin</span>
                          <span className="text-black text-lg font-black leading-none">13</span>
                        </div>
                      </AppIcon>
                    </div>

                    {/* Rangée 3 */}
                    <div className="grid grid-cols-4 gap-3">
                      {/* Mail */}
                      <AppIcon bg="linear-gradient(135deg,#4facfe,#00f2fe)" label="Mail">
                        <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
                          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                        </svg>
                      </AppIcon>
                      {/* Notes */}
                      <AppIcon bg="linear-gradient(135deg,#f6d365,#fda085)" label="Notes">
                        <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                      </AppIcon>
                      {/* Safari */}
                      <AppIcon bg="linear-gradient(135deg,#e0eafc,#cfdef3)" label="Safari" dark>
                        <svg viewBox="0 0 24 24" className="w-7 h-7 text-blue-500" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                        </svg>
                      </AppIcon>
                      {/* ★ TAKTAK ★ */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="relative rounded-[18px] overflow-hidden"
                          style={{ width: 56, height: 56, boxShadow: "0 0 0 2px rgba(255,98,0,0.5), 0 8px 24px rgba(255,98,0,0.4)" }}>
                          <Image
                            src="/branding/logo3.png"
                            alt="TakTak app icon"
                            fill
                            className="object-cover"
                          />
                          {/* Shimmer */}
                          <div className="absolute inset-0 rounded-[18px]"
                            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 60%)" }} />
                        </div>
                        <span className="text-white text-[10px] font-semibold drop-shadow"
                          style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>TakTak</span>
                      </div>
                    </div>

                    {/* Rangée 4 */}
                    <div className="grid grid-cols-4 gap-3 mt-1">
                      {/* Podcast */}
                      <AppIcon bg="linear-gradient(135deg,#a18cd1,#fbc2eb)" label="Podcasts">
                        <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
                          <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/>
                        </svg>
                      </AppIcon>
                      {/* Fitness */}
                      <AppIcon bg="linear-gradient(135deg,#f093fb,#f5576c)" label="Fitness">
                        <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
                          <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>
                        </svg>
                      </AppIcon>
                      {/* Wallet */}
                      <AppIcon bg="linear-gradient(135deg,#1a1a2e,#16213e)" label="Wallet">
                        <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
                          <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                        </svg>
                      </AppIcon>
                      {/* Appels */}
                      <AppIcon bg="linear-gradient(135deg,#43e97b,#38f9d7)" label="Appels">
                        <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
                          <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                        </svg>
                      </AppIcon>
                    </div>
                  </div>

                  {/* Barre du bas (home indicator) */}
                  <div className="relative z-10 mt-4 pb-3 flex justify-center">
                    <div className="bg-white/30 rounded-full" style={{ width: 120, height: 5 }} />
                  </div>

                </div>{/* fin écran */}
              </div>{/* fin corps téléphone */}

              {/* Bouton côté droit */}
              <div className="absolute right-[-10px] top-32 bg-[#2a2a2a] rounded-r-lg"
                style={{ width: 4, height: 64, boxShadow: "2px 0 4px rgba(0,0,0,0.5)" }} />
              {/* Boutons volume gauche */}
              <div className="absolute left-[-10px] top-24 bg-[#2a2a2a] rounded-l-lg"
                style={{ width: 4, height: 40 }} />
              <div className="absolute left-[-10px] top-[76px] bg-[#2a2a2a] rounded-l-lg"
                style={{ width: 4, height: 40 }} />
            </div>{/* fin téléphone container */}

            {/* ── Texte explicatif ── */}
            <div className="max-w-md">
              <div className="inline-flex items-center gap-2 bg-[#FF6200]/10 border border-[#FF6200]/20 rounded-full px-4 py-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-[#FF6200] animate-pulse" />
                <span className="text-[#FF6200] text-sm font-semibold">Icône App Store</span>
              </div>

              <h3 className="text-white text-3xl font-black mb-4 leading-tight">
                Une icône qui se reconnaît au premier coup d&apos;œil
              </h3>
              <p className="text-white/60 leading-relaxed mb-8">
                L&apos;orange vif du fond capte l&apos;attention dans une grille d&apos;apps. Les deux girafes sont immédiatement reconnaissables même à 60×60px. Le contraste fort de l&apos;outline cartoon garantit une lisibilité parfaite sur fond sombre comme clair.
              </p>

              <div className="space-y-4">
                {[
                  { size: "1024×1024px", usage: "App Store — résolution maximale", color: "#FF6200" },
                  { size: "180×180px", usage: "iPhone — écran d'accueil (@3x)", color: "#2B7FE8" },
                  { size: "120×120px", usage: "iPhone — écran d'accueil (@2x)", color: "#2B7FE8" },
                  { size: "87×87px", usage: "iPhone — Réglages (@3x)", color: "#F97316" },
                  { size: "60×60px", usage: "Notifications, spotlight", color: "#F97316" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white/5 rounded-xl px-4 py-3 border border-white/5">
                    <div className="rounded-lg shrink-0 flex items-center justify-center"
                      style={{ width: 36, height: 36, backgroundColor: s.color + "20", border: `1px solid ${s.color}30` }}>
                      <span className="font-mono text-[9px] font-bold" style={{ color: s.color }}>
                        {s.size.split("×")[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{s.size}</p>
                      <p className="text-white/40 text-xs">{s.usage}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Aperçu tailles */}
              <div className="mt-8 bg-white/5 rounded-2xl p-6 border border-white/10">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-4 font-semibold">Aperçu à différentes tailles</p>
                <div className="flex items-end gap-5">
                  {[80, 60, 44, 29, 20].map((size, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="relative overflow-hidden"
                        style={{ width: size, height: size, borderRadius: size * 0.225,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>
                        <Image src="/branding/logo3.png" alt="TakTak" fill className="object-cover" />
                      </div>
                      <span className="text-white/30 font-mono" style={{ fontSize: 9 }}>{size}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── MOCKUPS ─────────────────────────────────────────────── */}
      <section id="mockups" className="py-24 bg-[#F5F5F5]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14">
            <span className="text-[#FF6200] text-sm font-bold uppercase tracking-widest">06 — Mockups</span>
            <h2 className="text-4xl font-black text-[#1A1A1A] mt-2 mb-4">La marque en situation</h2>
            <p className="text-gray-500 text-lg max-w-2xl">
              TakTak sur différents supports — digital, wearable et textile.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {MOCKUPS.map((m, i) => (
              <div key={i} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <button
                  onClick={() => openLightbox(m.file, m.label)}
                  className="relative h-48 bg-gray-100 overflow-hidden w-full block"
                  title="Cliquer pour agrandir"
                >
                  <Image
                    src={m.file}
                    alt={m.label}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <span className="bg-black/70 text-white text-xs px-3 py-1.5 rounded-full font-medium">🔍 Agrandir</span>
                  </span>
                </button>
                <div className="p-4">
                  <p className="font-semibold text-[#1A1A1A] text-sm">{m.label}</p>
                  <p className="text-gray-400 text-xs mt-1">{m.desc}</p>
                </div>
              </div>
            ))}

            {/* Carte logo sur fond blanc */}
            <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <button
                onClick={() => openLightbox("/branding/logo6-removebg-preview.png", "Logo sur fond blanc")}
                className="h-48 bg-white flex items-center justify-center border-b border-gray-100 w-full relative"
                title="Cliquer pour agrandir"
              >
                <Image
                  src="/branding/logo6-removebg-preview.png"
                  alt="Logo sur fond blanc"
                  width={200}
                  height={120}
                  className="object-contain group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                  <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-full">🔍</span>
                </span>
              </button>
              <div className="p-4">
                <p className="font-semibold text-[#1A1A1A] text-sm">Sur fond blanc</p>
                <p className="text-gray-400 text-xs mt-1">Documents, print, papier</p>
              </div>
            </div>

            {/* Carte logo sur fond sombre */}
            <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <button
                onClick={() => openLightbox("/branding/logo5.png", "Logo sur fond sombre")}
                className="h-48 bg-[#1A1A1A] flex items-center justify-center w-full relative"
                title="Cliquer pour agrandir"
              >
                <Image
                  src="/branding/logo5.png"
                  alt="Logo sur fond sombre"
                  width={160}
                  height={160}
                  className="object-contain group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-full">🔍</span>
                </span>
              </button>
              <div className="p-4">
                <p className="font-semibold text-[#1A1A1A] text-sm">Sur fond sombre</p>
                <p className="text-gray-400 text-xs mt-1">Dark mode, packagings noirs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LOGIQUE COULEURS DANS L'APP ─────────────────────────── */}
      <section id="logique-couleurs" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14">
            <span className="text-[#FF6200] text-sm font-bold uppercase tracking-widest">07 — Système de couleurs</span>
            <h2 className="text-4xl font-black text-[#1A1A1A] mt-2 mb-4">Orange vs Bleu dans l&apos;app</h2>
            <p className="text-gray-500 text-lg max-w-2xl">
              Dans TakTak, orange et bleu ne sont pas interchangeables — chaque couleur porte une signification précise dans l&apos;interface.
            </p>
          </div>

          {/* Résumé visuel */}
          <div className="grid md:grid-cols-2 gap-4 mb-10">
            <div className="bg-[#FF6200] rounded-3xl p-8 text-white">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">📦</span>
                <div>
                  <p className="font-black text-2xl">Orange</p>
                  <p className="text-white/70 text-sm font-mono">#ec5a13</p>
                </div>
              </div>
              <p className="text-white/90 text-lg font-semibold mb-2">= Produits physiques</p>
              <p className="text-white/70 text-sm leading-relaxed">
                Tout ce qui concerne un objet à acheter ou vendre. Chaleur, commerce, transaction immédiate. L&apos;orange dit <em>&ldquo;c&apos;est concret, c&apos;est disponible, prends-le maintenant&rdquo;</em>.
              </p>
              <div className="mt-6 flex gap-2 flex-wrap">
                <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">Prix</span>
                <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">CTA</span>
                <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">Badge</span>
                <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">Favori</span>
                <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">Localisation</span>
              </div>
            </div>

            <div className="rounded-3xl p-8 text-white" style={{ background: "linear-gradient(135deg, #2563EB, #1E40AF)" }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🛠️</span>
                <div>
                  <p className="font-black text-2xl">Bleu</p>
                  <p className="text-white/70 text-sm font-mono">#2563EB</p>
                </div>
              </div>
              <p className="text-white/90 text-lg font-semibold mb-2">= Services professionnels</p>
              <p className="text-white/70 text-sm leading-relaxed">
                Tout ce qui concerne une prestation, un service, un professionnel. Confiance, expertise, fiabilité. Le bleu dit <em>&ldquo;c&apos;est sérieux, c&apos;est professionnel, fais-moi confiance&rdquo;</em>.
              </p>
              <div className="mt-6 flex gap-2 flex-wrap">
                <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">Tarif</span>
                <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">CTA</span>
                <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">Badge</span>
                <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">Favori</span>
                <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">Localisation</span>
              </div>
            </div>
          </div>

          {/* Tableaux détaillés */}
          <div className="grid md:grid-cols-2 gap-6">
            {COLOR_LOGIC.map((cl, ci) => (
              <div
                key={ci}
                className="bg-white rounded-2xl border overflow-hidden shadow-sm"
                style={{ borderColor: cl.color === "orange" ? "#FF6200" : "#2563EB", borderWidth: 1 }}
              >
                <div
                  className="px-6 py-4 flex items-center gap-3"
                  style={{ backgroundColor: cl.color === "orange" ? "#FFF4EE" : "#EFF6FF" }}
                >
                  <span className="text-2xl">{cl.icon}</span>
                  <div>
                    <p className="font-bold text-[#1A1A1A]">{cl.label}</p>
                    <p className="text-xs font-mono" style={{ color: cl.hex }}>{cl.hex} · soft: {cl.hexSoft}</p>
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {cl.elements.map((el, ei) => (
                    <div key={ei} className="flex items-start gap-3 px-6 py-3">
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: cl.hex }}
                      />
                      <div>
                        <p className="text-[#1A1A1A] font-semibold text-sm">{el.element}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{el.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Code snippet */}
          <div className="mt-8 bg-[#1A1A1A] rounded-2xl p-8 overflow-x-auto">
            <p className="text-white/40 text-xs font-mono mb-4 uppercase tracking-widest">Logique d&apos;implémentation (React Native / React)</p>
            <pre className="text-sm font-mono leading-relaxed">
              <span className="text-purple-400">const</span>
              <span className="text-white"> isService </span>
              <span className="text-blue-400">= </span>
              <span className="text-yellow-300">item</span>
              <span className="text-white">.type </span>
              <span className="text-blue-400">=== </span>
              <span className="text-green-400">&apos;service&apos;</span>
              <span className="text-white">;</span>
              {"\n\n"}
              <span className="text-purple-400">const</span>
              <span className="text-white"> accent     </span>
              <span className="text-blue-400">= </span>
              <span className="text-yellow-300">isService </span>
              <span className="text-blue-400">? </span>
              <span className="text-green-400">&apos;#2563EB&apos; </span>
              <span className="text-blue-400">: </span>
              <span className="text-[#FF6200]">&apos;#ec5a13&apos;</span>
              <span className="text-white">;</span>
              {"\n"}
              <span className="text-purple-400">const</span>
              <span className="text-white"> accentDark </span>
              <span className="text-blue-400">= </span>
              <span className="text-yellow-300">isService </span>
              <span className="text-blue-400">? </span>
              <span className="text-green-400">&apos;#1E40AF&apos; </span>
              <span className="text-blue-400">: </span>
              <span className="text-[#FF6200]">&apos;#d44f11&apos;</span>
              <span className="text-white">;</span>
              {"\n"}
              <span className="text-purple-400">const</span>
              <span className="text-white"> accentSoft </span>
              <span className="text-blue-400">= </span>
              <span className="text-yellow-300">isService </span>
              <span className="text-blue-400">? </span>
              <span className="text-green-400">&apos;#DBEAFE&apos; </span>
              <span className="text-blue-400">: </span>
              <span className="text-[#FF6200]">&apos;#ffe9de&apos;</span>
              <span className="text-white">;</span>
              {"\n\n"}
              <span className="text-gray-500">{"// Tous les éléments UI utilisent ces variables :"}</span>
              {"\n"}
              <span className="text-gray-500">{"// prix, badge, CTA, icône, avatar, fond doux..."}</span>
            </pre>
          </div>
        </div>
      </section>

      {/* ── DO / DON'T ──────────────────────────────────────────── */}
      <section id="usage" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14">
            <span className="text-[#FF6200] text-sm font-bold uppercase tracking-widest">08 — Règles d&apos;usage</span>
            <h2 className="text-4xl font-black text-[#1A1A1A] mt-2 mb-4">Do &amp; Don&apos;t</h2>
            <p className="text-gray-500 text-lg max-w-2xl">
              Pour préserver l&apos;intégrité de la marque TakTak, voici les règles à respecter absolument.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Do */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentWidth" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A]">À faire</h3>
              </div>
              <div className="space-y-3">
                {DO_DONTS.filter(d => d.type === "do").map((item, i) => (
                  <div key={i} className="flex gap-4 p-5 bg-green-50 border border-green-100 rounded-2xl">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-[#1A1A1A] text-sm">{item.title}</p>
                      <p className="text-gray-500 text-xs mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Don't */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A]">À éviter</h3>
              </div>
              <div className="space-y-3">
                {DO_DONTS.filter(d => d.type === "dont").map((item, i) => (
                  <div key={i} className="flex gap-4 p-5 bg-red-50 border border-red-100 rounded-2xl">
                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-[#1A1A1A] text-sm">{item.title}</p>
                      <p className="text-gray-500 text-xs mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="bg-[#1A1A1A] py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <Image
            src="/branding/logo1.png"
            alt="TakTak"
            width={100}
            height={100}
            className="mx-auto mb-6"
          />
          <h2 className="text-white text-2xl font-black mb-2">TakTak</h2>
          <p className="text-white/40 text-sm mb-8">Brand Guidelines — Version 1.0 · 2026</p>
          <div className="flex justify-center gap-3 flex-wrap">
            {["#FF6200", "#2B7FE8", "#F97316", "#1A1A1A", "#FFFFFF"].map((hex) => (
              <div
                key={hex}
                style={{ backgroundColor: hex }}
                className="w-8 h-8 rounded-full border-2 border-white/10"
                title={hex}
              />
            ))}
          </div>
          <p className="text-white/20 text-xs mt-8">
            Conçu avec soin pour une identité cohérente et mémorable.
          </p>
        </div>
      </footer>
    </main>
  );
}
