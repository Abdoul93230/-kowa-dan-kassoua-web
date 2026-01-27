'use client';

import { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { QrCode, Download, Check } from 'lucide-react';

interface SellerQRCodeProps {
  sellerId: string;
  sellerName: string;
}

const BASE_URL = 'https://kowadankassoua-v01.onrender.com';

export function SellerQRCode({ sellerId, sellerName }: SellerQRCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const sellerUrl = `${BASE_URL}/seller/${sellerId}`;

  const handleDownload = async () => {
    if (!qrRef.current) return;

    setIsDownloading(true);
    try {
      const dataUrl = await toPng(qrRef.current, {
        cacheBust: true,
        pixelRatio: 3, // Haute qualité
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = `qrcode-${sellerName.replace(/\s+/g, '-').toLowerCase()}.png`;
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
        <Button
          variant="outline"
          className="bg-white text-[#ec5a13] hover:bg-[#ec5a13] hover:text-white border-2 border-[#ec5a13]"
        >
          <QrCode className="h-4 w-4 mr-2" />
          QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            QR Code de {sellerName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          {/* QR Code Container */}
          <div
            ref={qrRef}
            className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100"
          >
            <QRCodeSVG
              value={sellerUrl}
              size={200}
              level="H"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#1f2937"
            />
            <div className="mt-4 text-center">
              <p className="font-semibold text-gray-900 text-lg">{sellerName}</p>
              <p className="text-sm text-[#ec5a13] font-medium mt-1">
                Kowa Dan Kassoua
              </p>
            </div>
          </div>

          {/* URL Preview */}
          <div className="w-full bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 text-center break-all">
              {sellerUrl}
            </p>
          </div>

          {/* Download Button */}
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`w-full ${downloaded
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-[#ec5a13] hover:bg-[#d94f0f]'
              }`}
          >
            {isDownloading ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Téléchargement...
              </>
            ) : downloaded ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Téléchargé !
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Télécharger le QR Code
              </>
            )}
          </Button>

          {/* Instructions */}
          <p className="text-xs text-gray-500 text-center">
            Scannez ce QR code avec votre téléphone pour accéder directement à cette page vendeur.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
