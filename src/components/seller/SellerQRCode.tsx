'use client';

// QR code de la boutique : à imprimer ou partager pour renvoyer vers le profil TakTak
import { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { QrCode, Download, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://taktak-ne.com';

interface SellerQRCodeProps {
  sellerId: string;
  sellerName: string;
  className?: string;
}

export function SellerQRCode({ sellerId, sellerName, className }: SellerQRCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const sellerUrl = `${SITE_URL}/seller/${sellerId}`;

  const handleDownload = async () => {
    if (!qrRef.current) return;

    setIsDownloading(true);
    try {
      const dataUrl = await toPng(qrRef.current, { cacheBust: true, pixelRatio: 3, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `taktak-${sellerName.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn('inline-flex h-11 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-sm font-bold text-gray-800 transition hover:border-gray-300 hover:bg-gray-50', className)}
        >
          <QrCode className="h-4 w-4" />
          QR code
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">QR code de la boutique</DialogTitle>
          <DialogDescription className="text-center">
            Imprimez-le sur votre vitrine ou vos cartes : un scan suffit pour voir toutes vos annonces.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-2">
          <div ref={qrRef} className="rounded-3xl border border-gray-100 bg-white p-5 text-center shadow-[0_20px_50px_-30px_rgba(15,23,42,0.5)]">
            <QRCodeSVG value={sellerUrl} size={200} level="H" marginSize={2} bgColor="#ffffff" fgColor="#0b1020" />
            <p className="mt-3 max-w-[220px] truncate text-base font-black text-gray-900">{sellerName}</p>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ec5a13]">TakTak</p>
          </div>

          <p className="w-full truncate rounded-xl bg-gray-50 px-3 py-2 text-center text-xs text-gray-500">{sellerUrl}</p>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className={cn(
              'inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-bold text-white transition disabled:opacity-60',
              downloaded ? 'bg-emerald-600' : 'bg-[#ec5a13] hover:bg-[#d44f11]'
            )}
          >
            {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : downloaded ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
            {isDownloading ? 'Préparation…' : downloaded ? 'Téléchargé' : 'Télécharger (PNG)'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
