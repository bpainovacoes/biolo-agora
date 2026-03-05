"use client";

import { useRouter } from "next/navigation";
import { User, COMPLETED_SERVICES } from "@/lib/bioloTypes";
import { logoutAction } from "@/actions/auth";
import { Search, Clock, Star, Bell, LogOut, Wrench, CheckCircle } from "lucide-react";

interface Props {
  user: User;
  onSearch?: () => void;
  onLogout?: () => void;
}

export default function ClientDashboardHome({ user, onSearch, onLogout }: Props) {
  
  console.log(user);
  
  const router = useRouter();
  const handleSearch = onSearch ?? (() => router.push("/client/search"));
  const handleLogout = onLogout ?? (() => logoutAction());
  const myServices = COMPLETED_SERVICES.filter((s) => s.clientId === "c1");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 hero-gradient rounded-lg flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="font-jakarta font-extrabold text-lg">Biolo <span className="text-primary">Agora</span></span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            </button>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: user.avatarColor }}
            >
              {user.avatar}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="font-jakarta font-extrabold text-2xl text-foreground">Olá, {user.name.split(" ")[0]}! 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">O que precisas hoje?</p>
        </div>

        {/* Search CTA */}
        <button
          onClick={handleSearch}
          className="w-full hero-gradient text-white rounded-2xl p-6 text-left mb-6 hover:opacity-95 transition-opacity card-shadow-hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-jakarta font-extrabold text-xl mb-1">Encontrar profissional</p>
              <p className="text-white/70 text-sm">Pesquisa por categoria ou localização</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
          </div>
        </button>

        {/* Quick categories */}
        <div className="mb-6">
          <h2 className="font-jakarta font-bold text-lg text-foreground mb-3">Categorias rápidas</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Canalizador", emoji: "🔧" },
              { label: "Electricista", emoji: "⚡" },
              { label: "Serralheiro", emoji: "🔨" },
              { label: "Mecânico", emoji: "🔩" },
              { label: "Pintor", emoji: "🖌️" },
              { label: "Carpinteiro", emoji: "🪵" },
            ].map((c) => (
              <button
                key={c.label}
                onClick={handleSearch}
                className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary-light transition-all"
              >
                <span className="text-2xl">{c.emoji}</span>
                <span className="text-xs font-semibold text-foreground text-center leading-tight">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent services */}
        <div className="mb-6">
          <h2 className="font-jakarta font-bold text-lg text-foreground mb-3">Histórico de pedidos</h2>
          {myServices.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <Clock className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Nenhum serviço ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myServices.map((s) => (
                <div key={s.id} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{s.workerName}</p>
                      <p className="text-xs text-muted-foreground">{s.service} · {s.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground text-sm">{s.price}</p>
                    {s.rating && (
                      <p className="text-xs text-amber flex items-center gap-0.5 justify-end">
                        <Star className="w-3 h-3 fill-current" /> {s.rating}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <LogOut className="w-4 h-4" /> Terminar sessão
        </button>
      </main>
    </div>
  );
}
