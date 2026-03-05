"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AppState, PROFESSIONALS, CLIENTS } from "./bioloTypes";

const STORAGE_KEY = "biolo_app_state";

const defaultState: AppState = {
  currentUser: null,
  clientStep: "landing",
  workerStep: "landing",
  activeRequest: null,
  chatMessages: [
    { id: "1", requestId: "active", from: "worker", fromName: "João Ferreira", text: "Olá! Vi o teu pedido. Posso estar aí em 20 minutos.", time: "14:32", createdAt: "2025-02-19T14:32:00Z", read: true },
    { id: "2", requestId: "active", from: "client", fromName: "Tu", text: "Perfeito! É para um vazamento debaixo do lava-louça.", time: "14:33", createdAt: "2025-02-19T14:33:00Z", read: true },
    { id: "3", requestId: "active", from: "worker", fromName: "João Ferreira", text: "Entendido. Para um serviço assim, o valor será 15.000 Kz. Aceitas?", time: "14:33", createdAt: "2025-02-19T14:33:30Z", read: false },
  ],
  selectedWorker: PROFESSIONALS[0],
  givenRating: 0,
  userLocation: null,
  serviceProgress: { step: "heading" },
};

interface AppContextType {
  state: AppState;
  hydrated: boolean;
  update: (partial: Partial<AppState>) => void;
  login: (role: "client" | "worker" | "admin") => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  // hydrated = true after localStorage has been read on the client
  const [hydrated, setHydrated] = useState(false);

  // On mount: load persisted state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as AppState;
        setState({ ...defaultState, ...parsed });
      }
    } catch {
      // ignore parse errors
    } finally {
      setHydrated(true);
    }
  }, []);

  // Persist state to localStorage on every change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors (private mode, quota exceeded, etc.)
    }
  }, [state, hydrated]);

  const update = (partial: Partial<AppState>) =>
    setState((s) => ({ ...s, ...partial }));

  const login = (role: "client" | "worker" | "admin") => {
    if (role === "client") {
      update({ currentUser: { ...CLIENTS[0], role: "client" } });
    } else if (role === "worker") {
      update({ currentUser: { ...PROFESSIONALS[0], role: "worker" } });
    } else {
      update({
        currentUser: {
          id: "admin1", name: "Alberto Silva", email: "admin@biolo.ao",
          role: "admin", avatar: "AS", avatarColor: "#16a34a",
          status: "active", createdAt: "2024-01-01T00:00:00Z",
        },
      });
    }
  };

  const logout = () => {
    setState(defaultState);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  return (
    <AppContext.Provider value={{ state, hydrated, update, login, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
