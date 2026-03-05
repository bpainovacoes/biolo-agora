"use client";

import { User } from "@/lib/bioloTypes";
import { Wrench, Bell, LogOut, Play, History } from "lucide-react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/actions/auth";

interface Props {
  user: User;
}

export default function WorkerDashboardHome({ user }: Props) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-sidebar text-sidebar-foreground sticky top-0 z-40 border-b border-sidebar-border">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 hero-gradient rounded-lg flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="font-jakarta font-extrabold text-lg text-white">Biolo <span className="text-primary-glow">Agora</span></span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2">
              <Bell className="w-5 h-5 text-sidebar-foreground/70" />
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
        <div className="mb-6">
          <h1 className="font-jakarta font-extrabold text-2xl text-foreground">Olá, {user.name.split(' ')[0]} 👷</h1>
          <p className="text-muted-foreground text-sm mt-1">{user.profession} · Perfil activo</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Este mês", value: user.pricePerHour, icon: "💰" },
            { label: "Serviços", value: user.serviceRadius, icon: "✅" },
            { label: "Avaliação", value: `${user.rating} ★`, icon: "⭐" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-4 text-center card-shadow">
              <p className="text-xl mb-1">{s.icon}</p>
              <p className="font-jakarta font-bold text-base text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => router.push('/worker/available')}
          className="w-full hero-gradient text-white rounded-2xl p-5 text-left flex items-center justify-between mb-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Play className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold">Ficar disponível</p>
              <p className="text-xs text-white/70">Começa a receber pedidos de serviço</p>
            </div>
          </div>
          <span className="text-white">→</span>
        </button>

        <button
          onClick={() => router.push('/worker/history')}
          className="w-full bg-card border border-border text-foreground rounded-2xl p-5 text-left hover:border-primary transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
              <History className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold">Histórico de serviços</p>
              <p className="text-xs text-muted-foreground">Ver todos os serviços anteriores</p>
            </div>
          </div>
          <span className="text-muted-foreground">→</span>
        </button>

        <button onClick={() => logoutAction()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-6">
          <LogOut className="w-4 h-4" /> Terminar sessão
        </button>
      </main>
    </div>
  );
}
