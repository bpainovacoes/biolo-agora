"use client";
/**
 * AuthScreen — Login + Register
 * Server Actions handle tokens server-side. On success the action
 * redirects via next/navigation — the client just shows a spinner.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Wrench, Eye, EyeOff, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { loginAction, registerAction } from "@/actions/auth";
import type { UserRole } from "@/lib/bioloTypes";

const modeConfig = {
  client: { label: "Cliente",       color: "text-blue-500",   desc: "Entra para encontrar profissionais perto de ti" },
  worker: { label: "Profissional",  color: "text-primary",    desc: "Entra para receber pedidos de serviço" },
  admin:  { label: "Administrador", color: "text-purple-500", desc: "Acede ao painel de gestão da plataforma" },
};

interface Props { mode: UserRole; }

export default function AuthScreen({ mode }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const config = modeConfig[mode];

  const [tab, setTab]           = useState<"login" | "register">("login");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [form, setForm]         = useState({ firstName: "", lastName: "", email: "", password: "", phoneNumber: "" });

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm({ ...form, [key]: e.target.value }),
  });

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const result =
        tab === "login"
          ? await loginAction({ email: form.email, password: form.password})
          : await registerAction({ ...form, role: mode });

      // loginAction redirects on success — if we reach here it's an error
      if (result && !result.ok) setError(result.error ?? "Erro desconhecido");
      
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <button onClick={() => router.push("/")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar ao início
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 hero-gradient rounded-2xl flex items-center justify-center">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-jakarta font-extrabold text-xl">Biolo Agora</p>
            <p className={`text-sm font-semibold ${config.color}`}>Área do {config.label}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 card-shadow">
          <p className="text-muted-foreground text-sm mb-6">{config.desc}</p>

          {/* Tabs */}
          {mode !== "admin" && (
            <div className="flex bg-muted rounded-xl p-1 mb-6">
              {(["login", "register"] as const).map((t) => (
                <button key={t} onClick={() => { setTab(t); setError(null); }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                    tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}>
                  {t === "login" ? "Entrar" : "Criar conta"}
                </button>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-3 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <div className="space-y-4">
            {tab === "register" && (
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1.5">Primeiro nome</label>
                  <input {...field("firstName")} placeholder="Nome"
                    className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1.5">Apelido</label>
                  <input {...field("lastName")} placeholder="Apelido"
                    className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background" />
                </div>
              </div>
            )}

            {tab === "register" && (
              <div>
                <label className="block text-sm font-semibold mb-1.5">Telefone</label>
                <input {...field("phoneNumber")} placeholder="+244 9XX XXX XXX" type="tel"
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background" />
              </div>
            )}


            <div>
              <label className="block text-sm font-semibold mb-1.5">Email</label>
              <input type="email" {...field("email")} placeholder="email@exemplo.com"
                className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} {...field("password")} placeholder="••••••••"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="w-full px-4 py-3 pr-12 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background" />
                <button type="button" onClick={() => setShowPass((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={isPending}
              className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-sm mt-2">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isPending ? "A entrar..." : tab === "login" ? (mode === "admin" ? "Entrar como Admin" : "Entrar") : "Criar conta"}
            </button>
          </div>

          <div className="mt-5 flex items-center gap-2 p-3 bg-primary-light rounded-xl">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            <p className="text-xs text-primary font-medium">
              Autenticação em 2 factores disponível nas definições da conta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
