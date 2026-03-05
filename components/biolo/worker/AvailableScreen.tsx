"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { User } from "@/lib/bioloTypes";
import { MapPin, ToggleRight, Bell } from "lucide-react";
import { useServicesSocket } from "@/lib/useServicesSocket";

interface Props {
  user: User;
}

export default function AvailableScreen({ user }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const socket = useServicesSocket(session?.accessToken);
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const d = setInterval(() => setDots((v) => (v % 3) + 1), 600);
    return () => clearInterval(d);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("newServiceRequest", () => {
      router.push("/worker/incoming");
    });

    return () => {
      socket.off("newServiceRequest");
    };
  }, [socket, router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm text-center">
        <div className="flex gap-2 mb-8 justify-center">
          {[1, 2, 3].map((s) => (
            <div key={s} className="w-16 h-1.5 rounded-full bg-primary" />
          ))}
        </div>
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-6">Passo 3 de 3 — Pronto!</p>

        {/* Pulse */}
        <div className="relative w-36 h-36 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-primary/15 animate-ping" style={{ animationDelay: "0.4s" }} />
          <div className="absolute inset-4 hero-gradient rounded-full flex items-center justify-center">
            <ToggleRight className="w-10 h-10 text-white" />
          </div>
        </div>

        <h1 className="font-jakarta font-extrabold text-2xl text-foreground mb-2">
          Estás disponível{".".repeat(dots)}
        </h1>
        <p className="text-muted-foreground mb-2">A aguardar pedidos de serviço na tua área</p>

        <div className="bg-primary-light border border-primary/20 rounded-2xl p-4 mb-6 flex items-center gap-3 text-left">
          <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-primary">Visível em Luanda</p>
            <p className="text-xs text-muted-foreground">Raio de 10 km · {user.profession}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 text-left">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">Próximos passos</p>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">1</span>
              Recebes uma notificação quando houver pedido
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 bg-muted rounded-full flex items-center justify-center text-muted-foreground text-xs font-bold flex-shrink-0">2</span>
              Aceitas ou recusas em 60 segundos
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 bg-muted rounded-full flex items-center justify-center text-muted-foreground text-xs font-bold flex-shrink-0">3</span>
              Negocias pelo chat e inicias o serviço
            </li>
          </ul>
        </div>

        <p className="mt-6 text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${socket?.connected ? "bg-green-500" : "bg-muted-foreground"} inline-block`} />
          {socket?.connected ? "Ligado — a aguardar pedidos" : "A ligar ao servidor..."}
        </p>
      </div>
    </div>
  );
}
