"use client";

import { ServiceRequest } from "@/lib/bioloTypes";
import { ArrowLeft, Star, Clock, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  history: ServiceRequest[];
}

export default function WorkerHistoryScreen({ history }: Props) {
  const router = useRouter();
  const services = history;
  const total = services.reduce((acc, s) => acc + parseInt(s.price.replace(/\D/g, ""), 10), 0);
  const totalCommission = services.reduce((acc, s) => acc + parseInt((s.commission ?? "0").replace(/\D/g, ""), 10), 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-sidebar text-sidebar-foreground border-b border-sidebar-border sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.push('/worker/dashboard')} className="p-2 hover:bg-sidebar-accent rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-sidebar-foreground/70" />
          </button>
          <h1 className="font-jakarta font-bold text-lg text-white">Histórico de serviços</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-card border border-border rounded-2xl p-4 card-shadow">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground font-medium">Total ganho</p>
            </div>
            <p className="font-jakarta font-extrabold text-xl text-foreground">{total.toLocaleString()} Kz</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 card-shadow">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-destructive" />
              <p className="text-xs text-muted-foreground font-medium">Comissões pagas</p>
            </div>
            <p className="font-jakarta font-extrabold text-xl text-destructive">{totalCommission.toLocaleString()} Kz</p>
          </div>
        </div>

        <div className="space-y-3">
          {services.map((s) => (
            <div key={s.id} className="bg-card border border-border rounded-2xl p-4 card-shadow">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-jakarta font-semibold text-foreground">{s.clientName}</p>
                  <p className="text-sm text-muted-foreground">{s.service} · {s.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">{s.price}</p>
                  <p className="text-xs text-destructive">−{s.commission}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" /> {s.date}
                </span>
                {s.rating && (
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map((n) => (
                      <Star key={n} className={`w-3.5 h-3.5 ${n <= s.rating! ? "text-amber fill-current" : "text-muted"}`} />
                    ))}
                  </div>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  s.status === "rated" ? "bg-primary-light text-primary" : "bg-amber-light text-amber-700"
                }`}>{s.status === "rated" ? "avaliado" : s.status}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
