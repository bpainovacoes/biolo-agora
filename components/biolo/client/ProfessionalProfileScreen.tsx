"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/lib/bioloTypes";
import { ArrowLeft, Star, Shield, MapPin, Clock, CheckCircle, ChevronRight, Loader2 } from "lucide-react";
import { sendServiceRequestAction } from "@/actions/data";

interface Props {
  user?: User;
  worker: User;
  onBack?: () => void;
  onSendRequest?: () => void;
}

const reviews = [
  { client: "Paulo M.", text: "Excelente profissional, rápido e eficiente!", rating: 5, date: "10 Fev" },
  { client: "Sónia L.", text: "Muito bom trabalho, recomendo!", rating: 5, date: "5 Fev" },
  { client: "Rui C.", text: "Chegou na hora e resolveu o problema.", rating: 4, date: "28 Jan" },
];

export default function ProfessionalProfileScreen({ worker, onBack, onSendRequest }: Props) {
  const router = useRouter();
  const handleBack = onBack ?? (() => router.back());
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

    console.log(worker)

  async function handleSendRequest() {
    if (onSendRequest) { onSendRequest(); return; }
    setSending(true);
    setError(null);
    const res = await sendServiceRequestAction(worker.id, `Pedido de serviço: ${worker.profession}`);

    if (res.ok) {
      router.push("/client/waiting");
    } else {
      setError(res.error ?? "Erro ao enviar pedido");
      setSending(false);
    }

  
  }

  
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={handleBack} className="p-2 hover:bg-muted rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="font-jakarta font-bold text-lg">Perfil do profissional</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile card */}
        <div className="bg-card border border-border rounded-3xl p-6 mb-5 card-shadow">
          <div className="flex items-start gap-4 mb-5">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl flex-shrink-0"
              style={{ backgroundColor: worker.avatarColor }}
            >
              {worker.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-jakarta font-extrabold text-xl text-foreground">{worker.name}</h2>
                {worker.verified && <Shield className="w-5 h-5 text-primary" />}
              </div>
              <p className="text-muted-foreground mb-3">{worker.profession}</p>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${s <= Math.floor(worker.rating ?? 0) ? "text-amber fill-current" : "text-muted"}`} />
                  ))}
                  <span className="text-sm font-bold ml-1">{worker.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">{worker.totalJobs} serviços</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: MapPin, label: "Localização", value: worker.location?.area ?? "Luanda" },
              { icon: Clock, label: "Preço base", value: worker.pricePerHour ?? "—" },
              { icon: CheckCircle, label: "Verificado", value: worker.verified ? "Sim ✓" : "Pendente" },
              { icon: Star, label: "Avaliação", value: `${worker.rating} / 5.0` },
            ].map((item) => (
              <div key={item.label} className="bg-muted rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <item.icon className="w-3.5 h-3.5 text-primary" />
                  <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                </div>
                <p className="text-sm font-semibold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-5 card-shadow">
          <h3 className="font-jakarta font-bold text-foreground mb-2">Sobre</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
          {worker.bio ?? `Profissional com ${(worker.totalJobs ?? 0) > 100 ? "mais de 5" : "3"} anos de experiência em ${worker.profession?.toLowerCase()}. Especialista em reparações de emergência e instalações. Atendo todo o município de Luanda.`}
          </p>
        </div>

        {/* Reviews */}
        <div className="mb-24">
          <h3 className="font-jakarta font-bold text-foreground mb-3">Avaliações recentes</h3>
          <div className="space-y-3">
            {reviews.map((r, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm text-foreground">{r.client}</p>
                  <p className="text-xs text-muted-foreground">{r.date}</p>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? "text-amber fill-current" : "text-muted"}`} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">"{r.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleSendRequest}
            disabled={sending}
            className="w-full hero-gradient text-primary-foreground font-bold py-4 rounded-2xl text-lg flex items-center justify-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-60"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Enviar pedido de serviço <ChevronRight className="w-5 h-5" /></>}
          </button>
          {error && <p className="text-center text-xs text-destructive mt-2">{error}</p>}
          {!error && <p className="text-center text-xs text-muted-foreground mt-2">O profissional receberá uma notificação imediata</p>}
        </div>
      </div>
    </div>
  );
}
