"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

/**
 * Conecta ao namespace /services do backend NestJS WebSocket Gateway.
 * Autentica com o accessToken do NextAuth via handshake.auth.token.
 * Desconecta automaticamente ao desmontar o componente.
 */
export function useServicesSocket(accessToken: string | null | undefined): Socket | null {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";
    // Remove o /api/v1 para obter a base do servidor socket.io
    const socketUrl = apiUrl.replace(/\/api\/v1\/?$/, "");

    const s = io(`${socketUrl}/services`, {
      auth: { token: accessToken },
      transports: ["websocket"],
    });

    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [accessToken]);

  return socket;
}
