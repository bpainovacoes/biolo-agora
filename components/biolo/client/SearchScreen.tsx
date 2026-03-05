"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, MapPin, Star, Shield, Loader2 } from "lucide-react";
import { User, CATEGORIES, GeoLocation, LUANDA_CENTER, PROFESSIONALS, getProfessionalsNearby } from "@/lib/bioloTypes";
import MapView from "@/components/biolo/MapView";

interface Props {
  user?: User;
  professionals?: User[];
  onBack?: () => void;
  onSelectWorker?: (w: User) => void;
  userLocation?: GeoLocation | null;
  onLocationFound?: (loc: GeoLocation) => void;
}

export default function SearchScreen({ professionals, onBack, onSelectWorker, userLocation: userLocationProp, onLocationFound }: Props) {
  const router = useRouter();
  const handleBack = onBack ?? (() => router.back());
  const handleSelectWorker = onSelectWorker ?? ((w: User) => router.push(`/client/profile/${w.id}`));

  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [localUserLocation, setLocalUserLocation] = useState<GeoLocation | null>(null);
  const onLocationFoundRef = useRef(onLocationFound);
  onLocationFoundRef.current = onLocationFound;

  const userLocation = userLocationProp ?? localUserLocation;

  // Pede geolocalização ao entrar (apenas se não vier do pai)
  useEffect(() => {
    if (userLocationProp) return;
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: GeoLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          area: "A tua localização",
        };
        setLocalUserLocation(loc);
        onLocationFoundRef.current?.(loc);
        setLocLoading(false);
      },
      () => {
        setLocalUserLocation(LUANDA_CENTER);
        onLocationFoundRef.current?.(LUANDA_CENTER);
        setLocLoading(false);
      },
      { timeout: 8000 }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!userLocationProp]);

  const allProfessionals = professionals ?? PROFESSIONALS;
  const origin = userLocation ?? LUANDA_CENTER;

  // Profissionais ordenados por distância com campo calculado
  const nearby = getProfessionalsNearby(origin, allProfessionals);

  const filtered = nearby.filter((p) => {
    const matchCat = !selectedCat || p.profession?.toLowerCase().includes(selectedCat.toLowerCase());
    const matchQ =
      !query ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.profession?.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={handleBack} className="p-2 hover:bg-muted rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 className="font-jakarta font-bold text-lg">Pesquisar profissional</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className="w-full pl-11 pr-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-card"
              placeholder="Ex: canalizador, electricista..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5">
        {/* Mapa real */}
        <div className="rounded-2xl overflow-hidden border border-border mb-2 relative">
          {locLoading && (
            <div className="absolute inset-0 z-10 bg-card/80 flex items-center justify-center rounded-2xl">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                A obter localização…
              </div>
            </div>
          )}
          <MapView
            professionals={filtered}
            userLocation={userLocation}
            onSelectWorker={onSelectWorker}
            height="220px"
          />
        </div>

        {/* Info localização */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 px-1">
          <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span>
            {userLocation
              ? `${userLocation.area} · ${filtered.length} profissionais próximos`
              : `Luanda · ${filtered.length} profissionais`}
          </span>
        </div>

        {/* Category filters */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCat(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
              !selectedCat
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:border-primary"
            }`}
          >
            Todos
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.label}
              onClick={() => setSelectedCat(selectedCat === c.label ? null : c.label)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                selectedCat === c.label
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:border-primary"
              }`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        {/* Results ordenados por distância */}
        <div className="space-y-3">
          {filtered.map((w) => (
            <button
              key={w.id}
              onClick={() => handleSelectWorker(w)}
              className="w-full bg-card border border-border rounded-2xl p-4 text-left hover:border-primary transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: w.avatarColor }}
                  >
                    {w.avatar}
                  </div>
                  {w.available && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-primary rounded-full border-2 border-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-jakarta font-bold text-foreground text-sm truncate">{w.name}</p>
                    {w.verified && <Shield className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{w.profession}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-0.5 text-xs font-semibold text-amber">
                      <Star className="w-3 h-3 fill-current" /> {w.rating}
                    </span>
                    <span className="text-xs text-muted-foreground">{w.totalJobs} serviços</span>
                    <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" /> {w.distanceLabel}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-foreground">{w.pricePerHour}</p>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${
                      w.available
                        ? "bg-primary-light text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {w.available ? "Disponível" : "Ocupado"}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
