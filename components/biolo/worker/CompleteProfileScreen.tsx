"use client";

import { useState } from "react";
import { User } from "@/lib/bioloTypes";
import { ChevronRight } from "lucide-react";

interface Props {
  user: User;
  onNext: () => void;
}

export default function CompleteProfileScreen({ user, onNext }: Props) {
  const [form, setForm] = useState({
    bio: "",
    price: "",
    experience: "",
  });

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Step indicator */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full ${s === 1 ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">Passo 1 de 3</p>
        <h1 className="font-jakarta font-extrabold text-2xl text-foreground mb-1">Completa o teu perfil</h1>
        <p className="text-muted-foreground text-sm mb-6">Perfis completos recebem 3x mais pedidos</p>

        <div className="bg-card border border-border rounded-3xl p-6 card-shadow space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: user.avatarColor }}
            >
              {user.avatar}
            </div>
            <div>
              <p className="font-jakarta font-bold text-foreground">{user.name}</p>
              <p className="text-sm text-primary font-semibold">{user.profession}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Sobre ti</label>
            <textarea
              className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background resize-none"
              rows={3}
              placeholder="Descreve a tua experiência e especialidades..."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Preço base (Kz/hora)</label>
            <input
              className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
              placeholder="Ex: 5000"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Anos de experiência</label>
            <select
              className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
            >
              <option value="">Seleciona</option>
              <option>Menos de 1 ano</option>
              <option>1–3 anos</option>
              <option>3–5 anos</option>
              <option>Mais de 5 anos</option>
            </select>
          </div>

          <button
            onClick={onNext}
            className="w-full hero-gradient text-primary-foreground font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
          >
            Continuar <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
