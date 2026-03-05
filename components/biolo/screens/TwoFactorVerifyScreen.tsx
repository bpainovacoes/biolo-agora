"use client";
/**
 * TwoFactorVerifyScreen
 * Shown after step-1 login when 2FA is required.
 * The twoFactorToken comes from the NextAuth session (passed as a prop
 * from the server component app/auth/2fa/page.tsx).
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { verify2faAction } from "@/actions/auth";

interface Props {
  twoFactorToken: string;
}

export default function TwoFactorVerifyScreen({ twoFactorToken }: Props) {
  const router = useRouter();

  const [otp, setOtp]                    = useState("");
  const [error, setError]                = useState<string | null>(null);
  const [isPending, startTransition]     = useTransition();

  const handleVerify = () => {
    if (otp.length !== 6) return;
    setError(null);
    startTransition(async () => {
      // On success verify2faAction calls signIn() which throws NEXT_REDIRECT —
      // we only land here on an actual failure.
      const result = await verify2faAction(twoFactorToken, otp);
      if (result && !result.ok) {
        setError(result.error ?? "Código inválido");
        setOtp("");
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao login
        </button>

        <div className="bg-card border border-border rounded-3xl p-8 card-shadow text-center">
          <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-5">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>

          <h1 className="font-jakarta font-extrabold text-2xl mb-2">Verificação em 2 passos</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Abre a tua app de autenticação (Google Authenticator, Authy) e insere o código de 6 dígitos.
          </p>

          {error && (
            <div className="flex items-center gap-2 bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-3 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="000 000"
            value={otp}
            autoFocus
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            className="w-full text-center text-3xl font-mono tracking-[0.5em] px-4 py-5 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background mb-5 transition-colors"
          />

          <button
            onClick={handleVerify}
            disabled={otp.length !== 6 || isPending}
            className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Verificar e entrar
          </button>

          <p className="text-xs text-muted-foreground mt-4">
            Perdeste o acesso à app? Usa um dos teus{" "}
            <button className="underline hover:text-foreground">códigos de recuperação</button>.
          </p>
        </div>
      </div>
    </div>
  );
}
