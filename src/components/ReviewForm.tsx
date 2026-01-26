'use client';

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Star, MessageSquarePlus } from 'lucide-react';

interface ReviewFormProps {
  itemId: number;
  onReviewSubmitted?: () => void;
}

export default function ReviewForm({ itemId, onReviewSubmitted }: ReviewFormProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0 || !comment.trim() || !userName.trim()) {
      alert('Veuillez remplir tous les champs et donner une note');
      return;
    }

    setIsSubmitting(true);

    // Créer le nouvel avis
    const newReview = {
      id: `rev_${Date.now()}`,
      userId: `user_${Date.now()}`,
      userName: userName.trim(),
      userAvatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      rating,
      comment: comment.trim(),
      date: new Date().toISOString().split('T')[0],
      helpful: 0
    };

    // Récupérer les avis existants depuis localStorage
    const existingReviews = localStorage.getItem(`reviews_${itemId}`);
    const reviews = existingReviews ? JSON.parse(existingReviews) : [];
    
    // Ajouter le nouvel avis
    reviews.unshift(newReview);
    
    // Sauvegarder dans localStorage
    localStorage.setItem(`reviews_${itemId}`, JSON.stringify(reviews));

    // Réinitialiser le formulaire
    setRating(0);
    setComment('');
    setUserName('');
    setIsSubmitting(false);
    setShowSuccess(true);

    // Masquer le message de succès après 3 secondes
    setTimeout(() => {
      setShowSuccess(false);
      setOpen(false); // Fermer le modal
    }, 2000);

    // Notifier le parent
    if (onReviewSubmitted) {
      onReviewSubmitted();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          ✓ Votre avis a été publié avec succès!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nom */}
        <div>
          <label htmlFor="userName" className="block text-sm font-medium mb-2">
            Votre nom
          </label>
          <input
            type="text"
            id="userName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Entrez votre nom"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec5a13] focus:border-transparent"
            required
          />
        </div>

        {/* Note avec étoiles */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Votre note
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
              <span className="ml-2 text-gray-600 self-center">
                {rating} / 5
              </span>
            )}
          </div>
        </div>

        {/* Commentaire */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium mb-2">
            Votre commentaire
          </label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Partagez votre expérience avec ce produit/service..."
            rows={4}
            className="w-full resize-none focus:ring-2 focus:ring-[#ec5a13]"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            {comment.length} / 500 caractères
          </p>
        </div>

        {/* Bouton de soumission */}
        <Button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="w-full bg-[#ec5a13] hover:bg-[#d64f11] text-white"
        >
          {isSubmitting ? 'Publication...' : 'Publier mon avis'}
        </Button>
      </form>
      </DialogContent>
    </Dialog>
  );
}
