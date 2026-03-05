"use client";

import { useState } from "react";
import { User } from "@/lib/bioloTypes";
import { Star } from "lucide-react";

interface Props {
  worker: User;
  onRate: (rating: number) => void;
}

export default function RateScreen({ worker, onRate }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  const labels = ["", "Mau", "Razoável", "Bom", "Muito bom", "Excelente!"];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center text-white font-extrabold text-2xl mb-4"
            style={{ backgroundColor: worker.avatarColor }}
          >
            {worker.avatar}
          </div>
          <h1 className="font-jakarta font-extrabold text-2xl text-foreground mb-1">Serviço concluído! 🎉</h1>
          <p className="text-muted-foreground">Como foi o serviço de <span className="font-semibold text-foreground">{worker.name}</span>?</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 mb-5 card-shadow text-center">
          <p className="text-sm font-semibold text-muted-foreground mb-4">Avaliação</p>

          <div className="flex justify-center gap-3 mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setRating(s)}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                className="transition-transform hover:scale-125"
              >
                <Star
                  className={`w-10 h-10 transition-colors ${
                    s <= (hover || rating) ? "text-amber fill-current" : "text-muted"
                  }`}
                />
              </button>
            ))}
          </div>

          {(hover || rating) > 0 && (
            <p className="font-jakarta font-bold text-lg text-foreground mb-4">{labels[hover || rating]}</p>
          )}

          <textarea
            className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            rows={3}
            placeholder="Deixa um comentário (opcional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <button
          onClick={() => rating > 0 && onRate(rating)}
          disabled={rating === 0}
          className={`w-full font-extrabold py-4 rounded-2xl text-lg transition-all ${
            rating > 0
              ? "hero-gradient text-primary-foreground hover:opacity-95"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          {rating === 0 ? "Seleciona uma avaliação" : "Enviar avaliação"}
        </button>
      </div>
    </div>
  );
}
