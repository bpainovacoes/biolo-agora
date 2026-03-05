"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ServiceRequest } from "@/lib/bioloTypes";
import { MapPin, Clock, X } from "lucide-react";
import { useServicesSocket } from "@/lib/useServicesSocket";

interface Props {
  request: ServiceRequest;
}

export default function WaitingScreen({ request }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const socket = useServicesSocket(session?.accessToken);
  const [dots, setDots] = useState(1);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const d = setInterval(() => setDots((v) => (v % 3) + 1), 500);
    const e = setInterval(() => setElapsed((v) => v + 1), 1000);
    return () => { clearInterval(d); clearInterval(e); };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("serviceAccepted", () => {
      router.push("/client/chat");
    });

    socket.on("serviceRejected", () => {
      router.push("/client/declined");
    });

    return () => {
      socket.off("serviceAccepted");
      socket.off("serviceRejected");
    };
  }, [socket, router]);

  function handleCancel() {
    router.push("/client/search");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm text-center">
        {/* Animated ring */}
        <div className="relative w-36 h-36 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-4 border-primary/40 animate-ping" style={{ animationDelay: "0.3s" }} />
          <div className="absolute inset-4 rounded-full flex items-center justify-center text-white font-extrabold text-2xl hero-gradient">
            {request.workerName?.slice(0, 2).toUpperCase() ?? "??"}
          </div>
        </div>

        <h1 className="font-jakarta font-extrabold text-2xl text-foreground mb-2">
          Aguardando resposta{".".repeat(dots)}
        </h1>
        <p className="text-muted-foreground mb-1">
          Pedido enviado para <span className="font-semibold text-foreground">{request.workerName}</span>
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          O profissional está a receber a notificação agora
        </p>

        <div className="bg-card border border-border rounded-2xl p-5 mb-6 text-left space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Serviço</p>
              <p className="font-semibold text-foreground">{request.service}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-amber-light rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Tempo a aguardar</p>
              <p className="font-semibold text-foreground">{elapsed}s</p>
            </div>
          </div>
        </div>

        <p className="mb-8 text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${socket?.connected ? "bg-green-500" : "bg-muted-foreground"} inline-block`} />
          {socket?.connected ? "Ligado — aguardando resposta do profissional" : "A ligar ao servidor..."}
        </p>

        <button
          onClick={handleCancel}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
        >
          <X className="w-4 h-4" /> Cancelar pedido
        </button>
      </div>
    </div>
  );
}
