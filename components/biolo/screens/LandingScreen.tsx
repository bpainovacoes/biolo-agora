"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, Wrench, Shield, Clock, Star, MapPin, Users, Zap } from "lucide-react";

export default function LandingScreen() {
  const router = useRouter();
  const onNavigate = (mode: "client" | "worker" | "admin") => router.push(`/auth/${mode}`);
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 hero-gradient rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="font-jakarta font-extrabold text-xl">Biolo <span className="text-primary">Agora</span></span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate("worker")} className="text-sm font-semibold text-muted-foreground hover:text-foreground px-3 py-2">
              Sou profissional
            </button>
            <button onClick={() => onNavigate("client")} className="bg-primary text-primary-foreground text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors">
              Contratar
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-gradient py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-white text-sm font-semibold mb-8">
            <MapPin className="w-4 h-4" /> Profissionais verificados em Luanda
          </div>
          <h1 className="font-jakarta text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
            O serviço certo,<br />
            <span className="text-yellow-300">agora mesmo</span>
          </h1>
          <p className="text-white/75 text-xl mb-12 max-w-lg mx-auto">
            Liga-te a canalizadores, electricistas, serralheiros e outros profissionais em minutos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate("client")}
              className="flex items-center justify-center gap-2 bg-white text-primary font-extrabold px-8 py-4 rounded-2xl text-lg hover:bg-white/90 transition-all shadow-lg"
            >
              Preciso de um profissional <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate("worker")}
              className="flex items-center justify-center gap-2 border-2 border-white/40 text-white font-bold px-8 py-4 rounded-2xl text-lg hover:bg-white/10 transition-all"
            >
              Quero oferecer serviços
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-card border-b border-border py-6">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { label: "Profissionais", value: "342+", icon: Users },
            { label: "Serviços feitos", value: "2.891", icon: Wrench },
            { label: "Avaliação média", value: "4.8 ★", icon: Star },
            { label: "Tempo resposta", value: "< 5 min", icon: Clock },
          ].map((s) => (
            <div key={s.label} className="py-2">
              <p className="font-jakarta font-extrabold text-2xl text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-jakarta text-4xl font-extrabold text-center mb-3">Como funciona</h2>
          <p className="text-muted-foreground text-center mb-12">Em 3 passos simples</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Pesquisa", desc: "Escolhe a categoria de serviço e vê profissionais perto de ti em tempo real.", emoji: "🔍" },
              { step: "2", title: "Pede", desc: "Envia o pedido ao profissional. Ele aceita e o chat abre automaticamente.", emoji: "📲" },
              { step: "3", title: "Recebe", desc: "Serviço feito, avalias o profissional e o sistema calcula a comissão.", emoji: "✅" },
            ].map((s) => (
              <div key={s.step} className="bg-card border border-border rounded-2xl p-6 relative card-shadow">
                <div className="absolute -top-4 left-6 w-8 h-8 hero-gradient rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {s.step}
                </div>
                <div className="text-4xl mb-4 mt-2">{s.emoji}</div>
                <h3 className="font-jakarta font-bold text-xl mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 px-4 text-center">
        <h2 className="font-jakarta text-3xl font-extrabold text-primary-foreground mb-4">Pronto para começar?</h2>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => onNavigate("client")} className="bg-white text-primary font-bold px-8 py-3.5 rounded-xl hover:bg-white/90 transition-colors">
            Entrar como Cliente
          </button>
          <button onClick={() => onNavigate("worker")} className="border-2 border-white/40 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors">
            Entrar como Profissional
          </button>
        </div>
        <p className="mt-4 text-primary-foreground/60 text-sm">
          És administrador?{" "}
          <button onClick={() => onNavigate("admin")} className="underline text-primary-foreground/80 hover:text-primary-foreground">
            Acede ao painel admin →
          </button>
        </p>
      </section>

      <footer className="bg-sidebar py-8 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 hero-gradient rounded-lg flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="font-jakarta font-bold text-white">Biolo Agora</span>
          </div>
          <p className="text-sidebar-foreground/40 text-sm">© 2025 Biolo Agora · Luanda, Angola</p>
        </div>
      </footer>
    </div>
  );
}
