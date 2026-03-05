"use client";

import { useState } from "react";
import { User, PROFESSIONALS, CLIENTS, COMPLETED_SERVICES } from "@/lib/bioloTypes";
import { BarChart3, Users, Briefcase, TrendingUp, Shield, AlertTriangle, CheckCircle, XCircle, LogOut, Wrench, Settings } from "lucide-react";

const STATS = [
  { label: "Clientes", value: "1.204", delta: "+23 este mês", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Profissionais", value: "342", delta: "+8 este mês", icon: Briefcase, color: "text-primary", bg: "bg-primary-light" },
  { label: "Serviços / mês", value: "2.891", delta: "+12%", icon: BarChart3, color: "text-orange-600", bg: "bg-orange-50" },
  { label: "Comissões (Kz)", value: "289.100", delta: "+18%", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
];

const CATEGORIES_DATA = [
  { label: "Canalizador", pct: 42, color: "bg-blue-500" },
  { label: "Electricista", pct: 28, color: "bg-yellow-500" },
  { label: "Serralheiro", pct: 19, color: "bg-orange-500" },
  { label: "Mecânico", pct: 11, color: "bg-red-500" },
];

interface Props {
  user: User;
  onLogout: () => void;
}

type Tab = "overview" | "clients" | "workers" | "services" | "commissions" | "categories";

export default function AdminApp({ user, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const [statuses, setStatuses] = useState<Record<string, string>>({});

  const getStatus = (id: string, def: string) => statuses[id] ?? def;
  const setStatus = (id: string, s: string) => setStatuses((p) => ({ ...p, [id]: s }));

  const navItems: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
    { id: "overview", label: "Visão Geral", icon: BarChart3 },
    { id: "clients", label: "Clientes", icon: Users },
    { id: "workers", label: "Profissionais", icon: Briefcase },
    { id: "services", label: "Serviços", icon: CheckCircle },
    { id: "commissions", label: "Comissões", icon: TrendingUp },
    { id: "categories", label: "Categorias", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-sidebar text-sidebar-foreground sticky top-0 z-40 border-b border-sidebar-border">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 hero-gradient rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-jakarta font-extrabold text-lg text-white">
              Biolo <span className="text-primary-glow">Admin</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-sidebar-accent px-3 py-1.5 rounded-full">
              <div
                className="w-6 h-6 hero-gradient rounded-full flex items-center justify-center text-white text-xs font-bold"
              >
                {user.avatar}
              </div>
              <span className="text-xs font-medium text-sidebar-foreground">{user.name.split(" ")[0]}</span>
            </div>
            <button onClick={onLogout} className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors">
              <LogOut className="w-4 h-4 text-sidebar-foreground/70" />
            </button>
          </div>
        </div>

        {/* Nav tabs */}
        <div className="max-w-5xl mx-auto px-4 flex gap-0 overflow-x-auto border-t border-sidebar-border">
          {navItems.map((n) => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                tab === n.id ? "border-primary text-primary" : "border-transparent text-sidebar-foreground/60 hover:text-sidebar-foreground"
              }`}
            >
              <n.icon className="w-3.5 h-3.5" /> {n.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {/* OVERVIEW */}
        {tab === "overview" && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {STATS.map((s) => (
                <div key={s.label} className="bg-card border border-border rounded-2xl p-4 card-shadow">
                  <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <p className="font-jakarta font-extrabold text-xl text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xs text-primary font-semibold mt-1">{s.delta}</p>
                </div>
              ))}
            </div>

            {/* Alerts */}
            <h3 className="font-jakarta text-lg font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber" /> Casos suspeitos / Pendentes
            </h3>
            <div className="space-y-3 mb-8">
              {[...PROFESSIONALS, ...CLIENTS].filter((u) => u.status === "suspended" || u.status === "blocked").map((u) => (
                <div key={u.id} className="bg-card border-2 border-amber/30 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: u.avatarColor }}>{u.avatar}</div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.role === "worker" ? u.profession : "Cliente"} · {u.status}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setStatus(u.id, "active")} className="flex items-center gap-1 text-xs font-semibold text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary-light transition-colors">
                      <CheckCircle className="w-3 h-3" /> Aprovar
                    </button>
                    <button onClick={() => setStatus(u.id, "blocked")} className="flex items-center gap-1 text-xs font-semibold text-destructive border border-destructive/30 px-3 py-1.5 rounded-lg hover:bg-destructive/5 transition-colors">
                      <XCircle className="w-3 h-3" /> Bloquear
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            <h3 className="font-jakarta text-lg font-bold mb-4">Serviços por categoria</h3>
            <div className="bg-card border border-border rounded-2xl p-5 card-shadow">
              {CATEGORIES_DATA.map((b) => (
                <div key={b.label} className="mb-4 last:mb-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-foreground">{b.label}</span>
                    <span className="text-muted-foreground">{b.pct}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div className={`${b.color} h-2.5 rounded-full`} style={{ width: `${b.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CLIENTS */}
        {tab === "clients" && (
          <UserList title="Clientes" users={CLIENTS} statuses={statuses} setStatus={setStatus} />
        )}

        {/* WORKERS */}
        {tab === "workers" && (
          <UserList title="Profissionais" users={PROFESSIONALS} statuses={statuses} setStatus={setStatus} />
        )}

        {/* SERVICES */}
        {tab === "services" && (
          <div>
            <h2 className="font-jakarta text-xl font-bold mb-5">Serviços realizados</h2>
            <div className="space-y-3">
              {COMPLETED_SERVICES.map((s) => (
                <div key={s.id} className="bg-card border border-border rounded-2xl p-4 card-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold mr-2 ${
                        s.status === "rated" ? "bg-primary-light text-primary" : "bg-amber-light text-amber-700"
                      }`}>{s.status}</span>
                      <span className="text-xs text-muted-foreground">{s.date}</span>
                      <p className="font-jakarta font-semibold text-foreground mt-1">{s.service} — {s.description}</p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{s.clientName}</span> → <span className="font-medium text-foreground">{s.workerName}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{s.price}</p>
                      <p className="text-xs text-primary font-semibold">+{s.commission}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMMISSIONS */}
        {tab === "commissions" && (
          <div>
            <h2 className="font-jakarta text-xl font-bold mb-5">Gestão de comissões</h2>
            <div className="bg-primary-light border border-primary/20 rounded-2xl p-5 mb-5">
              <p className="text-sm text-muted-foreground mb-1">Total de comissões cobradas</p>
              <p className="font-jakarta font-extrabold text-3xl text-primary">289.100 Kz</p>
              <p className="text-xs text-muted-foreground mt-1">Fevereiro 2025 · Taxa: 10%</p>
            </div>
            <div className="space-y-3">
              {COMPLETED_SERVICES.map((s) => (
                <div key={s.id} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{s.workerName}</p>
                    <p className="text-xs text-muted-foreground">{s.service} · {s.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{s.price}</p>
                    <p className="text-sm font-bold text-primary">{s.commission}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CATEGORIES */}
        {tab === "categories" && (
          <div>
            <h2 className="font-jakarta text-xl font-bold mb-5">Gerir categorias de serviços</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Canalizador", emoji: "🔧", workers: 89, active: true },
                { label: "Electricista", emoji: "⚡", workers: 64, active: true },
                { label: "Serralheiro", emoji: "🔨", workers: 47, active: true },
                { label: "Mecânico", emoji: "🔩", workers: 38, active: true },
                { label: "Pintor", emoji: "🖌️", workers: 22, active: false },
                { label: "Carpinteiro", emoji: "🪵", workers: 15, active: false },
              ].map((c) => (
                <div key={c.label} className="bg-card border border-border rounded-2xl p-4 card-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{c.emoji}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${c.active ? "bg-primary-light text-primary" : "bg-muted text-muted-foreground"}`}>
                      {c.active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <p className="font-jakarta font-bold text-foreground">{c.label}</p>
                  <p className="text-xs text-muted-foreground">{c.workers} profissionais</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function UserList({ title, users, statuses, setStatus }: {
  title: string;
  users: User[];
  statuses: Record<string, string>;
  setStatus: (id: string, s: string) => void;
}) {
  const getStatus = (u: User) => statuses[u.id] ?? u.status ?? "active";

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-jakarta text-xl font-bold">{title}</h2>
        <span className="text-sm text-muted-foreground">{users.length} registados</span>
      </div>
      <div className="space-y-3">
        {users.map((u) => {
          const status = getStatus(u);
          return (
            <div key={u.id} className="bg-card border border-border rounded-2xl p-4 card-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: u.avatarColor }}>{u.avatar}</div>
                  <div>
                    <p className="font-jakarta font-semibold text-foreground text-sm">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.role === "worker" ? u.profession : "Cliente"} · {u.email}</p>
                    {u.role === "worker" && u.rating && (
                      <p className="text-xs text-amber font-semibold">★ {u.rating} · {u.totalJobs} serviços</p>
                    )}
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                  status === "active" ? "bg-primary-light text-primary"
                  : status === "blocked" ? "bg-red-50 text-red-600"
                  : "bg-amber-light text-amber-700"
                }`}>{status === "active" ? "ativo" : status === "blocked" ? "bloqueado" : "suspeito"}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStatus(u.id, "active")} className="flex-1 text-xs font-semibold text-primary border border-primary/30 py-2 rounded-xl hover:bg-primary-light transition-colors">
                  Aprovar
                </button>
                <button onClick={() => setStatus(u.id, "blocked")} className="flex-1 text-xs font-semibold text-destructive border border-destructive/30 py-2 rounded-xl hover:bg-destructive/5 transition-colors">
                  Bloquear
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
