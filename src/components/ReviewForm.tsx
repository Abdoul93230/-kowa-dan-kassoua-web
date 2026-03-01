'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createReview } from '@/lib/api/reviews';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Star, MessageSquarePlus, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReviewFormProps {
  itemId: string;  // Changé de number à string (pour MongoDB ObjectId)
  onReviewSubmitted?: () => void;
}

export default function ReviewForm({ itemId, onReviewSubmitted }: ReviewFormProps) {
  const { user, token } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !token) {
      alert('Vous devez être connecté pour laisser un avis');
      router.push('/login');
      return;
    }
    
    if (rating === 0 || !comment.trim()) {
      alert('Veuillez donner une note et écrire un commentaire');
      return;
    }

    if (comment.length > 1000) {
      alert('Le commentaire ne peut pas dépasser 1000 caractères');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Appeler l'API pour créer l'avis
      await createReview({
        productId: itemId,
        rating,
        comment: comment.trim()
      });

      // Réinitialiser le formulaire
      setRating(0);
      setComment('');
      setShowSuccess(true);

      // Masquer le message de succès et fermer le modal
      setTimeout(() => {
        setShowSuccess(false);
        setOpen(false);
      }, 2000);

      // Notifier le parent pour recharger les avis
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }

    } catch (err: any) {
      console.error('Erreur création avis:', err);
      setError(err.message || 'Erreur lors de la publication de l\'avis');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && (!user || !token)) {
      alert('Vous devez être connecté pour laisser un avis');
      router.push('/login');
      return;
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          className="bg-[#ec5a13] hover:bg-[#d64f11] text-white gap-2"
          size="lg"
        >
          <MessageSquarePlus className="h-5 w-5" />
          Laisser un avis
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Laisser un avis</DialogTitle>
        </DialogHeader>
      
      {showSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Votre avis a été publié avec succès!
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Note avec étoiles */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Votre note *
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoverRating || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-gray-600 self-center font-medium">
                {rating} / 5
              </span>
            )}
          </div>
        </div>

        {/* Commentaire */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium mb-2">
            Votre commentaire *
          </label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Partagez votre expérience avec ce produit/service..."
            rows={4}
            className="w-full resize-none focus:ring-2 focus:ring-[#ec5a13]"
            required
            maxLength={1000}
          />
          <p className="text-sm text-gray-500 mt-1">
            {comment.length} / 1000 caractères
          </p>
        </div>

        {/* Bouton de soumission */}
        <Button
          type="submit"
          disabled={isSubmitting || rating === 0 || !comment.trim()}
          className="w-full bg-[#ec5a13] hover:bg-[#d64f11] text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Publication...' : 'Publier mon avis'}
        </Button>
      </form>
      </DialogContent>
    </Dialog>
  );
}
