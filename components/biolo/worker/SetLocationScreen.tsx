"use client";

import { useState, useEffect } from "react";
import { MapPin, ChevronRight, Loader2, Navigation } from "lucide-react";
import { GeoLocation, LUANDA_CENTER } from "@/lib/bioloTypes";
import MapView from "@/components/biolo/MapView";

interface Props {
  onNext: (location: GeoLocation) => void;
}

const LUANDA_AREAS = ["Ingombota", "Maianga", "Rangel", "Sambizanga", "Kilamba", "Viana", "Cacuaco", "Talatona"];

export default function SetLocationScreen({ onNext }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [radius, setRadius] = useState(10);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          area: "A tua localização actual",
        });
        setLoading(false);
      },
      () => {
        setLocation(LUANDA_CENTER);
        setLoading(false);
      },
      { timeout: 8000 }
    );
  }, []);

  const toggle = (area: string) => {
    setSelected((s) => (s.includes(area) ? s.filter((a) => a !== area) : [...s, area]));
  };

  const handleNext = () => {
    onNext(location ?? LUANDA_CENTER);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full ${s <= 2 ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">Passo 2 de 3</p>
        <h1 className="font-jakarta font-extrabold text-2xl text-foreground mb-1">Define a tua área</h1>
        <p className="text-muted-foreground text-sm mb-6">Clientes próximos verão o teu perfil no mapa</p>

        <div className="bg-card border border-border rounded-3xl p-4 card-shadow">
          {/* Mapa real */}
          <div className="rounded-2xl overflow-hidden mb-4 relative" style={{ height: "180px" }}>
            {loading ? (
              <div className="absolute inset-0 bg-muted flex items-center justify-center z-10 rounded-2xl">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  A obter localização…
                </div>
              </div>
            ) : (
              <MapView
                professionals={[]}
                userLocation={location}
                height="180px"
              />
            )}
          </div>

          {/* Localização detectada */}
          {location && (
            <div className="flex items-center gap-2 mb-4 px-1">
              <Navigation className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="text-sm text-foreground font-semibold">{location.area}</p>
              <span className="text-xs text-muted-foreground ml-auto">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </span>
            </div>
          )}

          {/* Radius slider */}
          <div className="mb-5">
            <div className="flex justify-between text-sm mb-2">
              <label className="font-semibold text-foreground">Raio de atendimento</label>
              <span className="font-bold text-primary">{radius} km</span>
            </div>
            <input
              type="range" min={1} max={30} value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          {/* Area chips */}
          <p className="text-sm font-semibold text-foreground mb-3">Bairros de preferência</p>
          <div className="flex flex-wrap gap-2 mb-5">
            {LUANDA_AREAS.map((a) => (
              <button
                key={a}
                onClick={() => toggle(a)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  selected.includes(a)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted border-border text-muted-foreground hover:border-primary"
                }`}
              >
                <MapPin className="w-3 h-3" /> {a}
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={loading}
            className="w-full hero-gradient text-primary-foreground font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-60"
          >
            Continuar <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
