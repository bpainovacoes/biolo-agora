"use client";
/**
 * TwoFactorSetupScreen
 * Guides the user through enabling 2FA:
 *   Step 1 → Show QR code + secret to scan with authenticator app
 *   Step 2 → Confirm with first OTP to prove setup worked
 *   Step 3 → Show backup codes (one-time reveal)
 */

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2, AlertCircle, Copy, Check, ArrowLeft, KeyRound, QrCode } from "lucide-react";
import { setup2faAction, confirm2faSetupAction } from "@/actions/auth";
import type { SessionUser } from "@/lib/session";

interface Props {
  session: SessionUser;
}

type Step = "loading" | "scan" | "confirm" | "backup";

export default function TwoFactorSetupScreen({ session }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [step, setStep]               = useState<Step>("loading");
  const [qrUrl, setQrUrl]             = useState("");
  const [secret, setSecret]           = useState("");
  const [otp, setOtp]                 = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError]             = useState<string | null>(null);
  const [copied, setCopied]           = useState(false);

  // Fetch QR code on mount
  useEffect(() => {
    startTransition(async () => {
      const result = await setup2faAction();
      if (!result.ok || !result.data) {
        setError(result.error ?? "Erro ao gerar QR code");
        return;
      }
      setQrUrl(result.data.qrCodeUrl);
      setSecret(result.data.secret);
      setStep("scan");
    });
  }, []);

  const handleConfirm = () => {
    if (otp.length !== 6) return;
    setError(null);
    startTransition(async () => {
      const result = await confirm2faSetupAction(otp);
      if (!result.ok) {
        setError(result.error ?? "Código inválido");
        setOtp("");
        return;
      }
      setBackupCodes(result.data?.backupCodes ?? []);
      setStep("backup");
    });
  };

  const copySecret = async () => {
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (step === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // ── Backup codes reveal ────────────────────────────────────────────────────
  if (step === "backup") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-3xl p-8 card-shadow">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <ShieldCheck className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="font-jakarta font-extrabold text-2xl text-center mb-2">2FA activado!</h1>
            <p className="text-muted-foreground text-sm text-center mb-6">
              Guarda estes códigos de recuperação num lugar seguro. Cada código só pode ser usado uma vez se perderes acesso à app.
            </p>

            <div className="bg-muted rounded-xl p-4 mb-6 grid grid-cols-2 gap-2">
              {backupCodes.map((code) => (
                <code key={code} className="text-sm font-mono text-center py-1 bg-card rounded-lg border border-border">
                  {code}
                </code>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 text-xs text-amber-800">
              ⚠️ Estes códigos não voltam a ser mostrados. Guarda-os agora.
            </div>

            <button
              onClick={() => router.push(session.role === "worker" ? "/worker/dashboard" : session.role === "admin" ? "/admin" : "/client/dashboard")}
              className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Continuar para a aplicação
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Scan QR + Confirm ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="bg-card border border-border rounded-3xl p-8 card-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-jakarta font-extrabold text-xl">Activar autenticação 2FA</h1>
              <p className="text-xs text-muted-foreground">Google Authenticator · Authy · 1Password</p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[
              { id: "scan",    label: "Scan QR", icon: QrCode },
              { id: "confirm", label: "Verificar", icon: ShieldCheck },
            ].map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === s.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                }`}>{i + 1}</div>
                <span className={`text-xs font-medium ${step === s.id ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
                {i < 1 && <div className="flex-1 h-px bg-border" />}
              </div>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-3 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {step === "scan" && (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Abre a tua app de autenticação e escaneia o QR code abaixo.
              </p>

              {/* QR Code */}
              <div className="flex justify-center mb-4">
                {qrUrl ? (
                  <img src={qrUrl} alt="QR Code 2FA" className="w-48 h-48 rounded-xl border border-border" />
                ) : (
                  <div className="w-48 h-48 bg-muted rounded-xl flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Manual secret */}
              <p className="text-xs text-muted-foreground text-center mb-2">
                Ou insere o código manualmente:
              </p>
              <div className="flex items-center gap-2 bg-muted rounded-xl px-4 py-3 mb-6">
                <code className="text-xs font-mono flex-1 break-all">{secret}</code>
                <button onClick={copySecret} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <button
                onClick={() => { setStep("confirm"); setError(null); }}
                className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-colors"
              >
                Já escanei o QR code →
              </button>
            </>
          )}

          {step === "confirm" && (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Insere o código de 6 dígitos que aparece na tua app de autenticação para confirmar a configuração.
              </p>

              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000 000"
                value={otp}
                autoFocus
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                className="w-full text-center text-3xl font-mono tracking-[0.5em] px-4 py-5 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background mb-5 transition-colors"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => { setStep("scan"); setError(null); }}
                  className="flex-1 border border-border text-foreground font-semibold py-3.5 rounded-xl hover:bg-muted transition-colors"
                >
                  ← Voltar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={otp.length !== 6 || isPending}
                  className="flex-1 bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirmar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
