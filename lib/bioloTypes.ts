// ============================================================
// Biolo Agora — Tipos e Mock Data
// Estrutura pronta para migração a backend (Supabase / REST API)
// ============================================================

// ------ ENUMS / CONSTANTES -----------------------------------

export type UserRole = "client" | "worker" | "admin";

export type ServiceStatus =
  | "pending"
  | "waiting"
  | "accepted"
  | "declined"
  | "in_progress"
  | "completed"
  | "rated";

/**
 * Passo actual do progresso do serviço em curso.
 * - "heading"   → profissional a caminho (GPS detecta automaticamente)
 * - "arrived"   → chegou ao local (confirmado por GPS ao entrar no raio de 200m)
 * - "started"   → serviço iniciado (profissional carrega no botão)
 * - "done"      → serviço concluído (profissional carrega no botão)
 *
 * No backend: coluna `service_progress_step` na tabela `service_requests`.
 * O cliente consulta via polling (GET /service-requests/:id) a cada 5 segundos.
 */
export type ServiceProgressStep = "heading" | "arrived" | "started" | "done";

/**
 * Snapshot do progresso de um serviço em curso.
 * No backend: sub-objeto dentro de `service_requests` ou tabela `service_events`.
 */
export interface ServiceProgress {
  step: ServiceProgressStep;
  /** Coordenadas actuais do profissional (actualizado a cada 10s via GPS) */
  workerLocation?: GeoLocation;
  /** Distância actual do profissional ao local do serviço (em metros) */
  distanceToServiceM?: number;
  /** Timestamp de cada etapa concluída */
  headingAt?: string; // ISO 8601
  arrivedAt?: string;
  startedAt?: string;
  doneAt?: string;
  /** Tempo total em minutos (calculado no completedAt) */
  durationMin?: number;
}

export type UserStatus = "active" | "blocked" | "suspended";

export type ClientStep =
  | "landing"
  | "auth"
  | "dashboard"
  | "search"
  | "filter"
  | "professional-list"
  | "professional-profile"
  | "send-request"
  | "waiting"
  | "declined"
  | "chat-negotiate"
  | "confirm-service"
  | "in-progress"
  | "completed"
  | "rate"
  | "done";

export type WorkerStep =
  | "landing"
  | "auth"
  | "dashboard"
  | "complete-profile"
  | "set-location"
  | "available"
  | "incoming-request"
  | "accept-decline"
  | "chat-negotiate"
  | "in-progress"
  | "finalize"
  | "commission"
  | "history";

// ------ ENTIDADES PRINCIPAIS ---------------------------------

/**
 * Coordenadas GPS do utilizador/profissional.
 * No backend: guardado em `profiles.location` como POINT(lng lat).
 */
export interface GeoLocation {
  lat: number;
  lng: number;
  /** Nome legível do bairro/área */
  area: string;
}

/**
 * Utilizador base — clientes e profissionais partilham esta estrutura.
 * No backend: tabela `profiles` ligada a `auth.users` via `id`.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  /** Iniciais para avatar gerado (ex: "JF" para João Ferreira) */
  avatar: string;
  avatarColor: string;
  status: UserStatus;
  createdAt: string; // ISO 8601

  // — Campos exclusivos do Profissional —
  profession?: string;
  bio?: string;
  rating?: number; // 0–5, calculado na app
  totalJobs?: number;
  pricePerHour?: string; // ex: "5.000 Kz/h"
  pricePerHourValue?: number; // valor numérico para cálculos
  available?: boolean; // atualizado em tempo real
  verified?: boolean; // aprovado pelo admin
  location?: GeoLocation; // posição atual (atualizada ao ativar disponibilidade)
  serviceRadius?: number; // raio em km
  skills?: string[]; // especialidades adicionais
  portfolioImages?: string[];

  // — Campos exclusivos do Cliente —
  savedWorkers?: string[]; // IDs de profissionais favoritos
}
export interface ResposeData {
  data: Worker;
}

/**
 * Pedido de serviço entre cliente e profissional.
 * No backend: tabela `service_requests`.
 */
export interface ServiceRequest {
  id: string;
  clientId: string;
  clientName: string;
  workerId: string;
  workerName: string;
  service: string; // categoria (ex: "Canalizador")
  description: string;
  location: string; // endereço textual
  locationGeo?: GeoLocation; // coordenadas do serviço
  price: string; // ex: "15.000 Kz"
  priceValue?: number; // valor numérico
  status: ServiceStatus;
  date: string; // ex: "12 Fev"
  createdAt: string; // ISO 8601
  startedAt?: string;
  completedAt?: string;
  rating?: number;
  ratingComment?: string;
  commission?: string; // 10% do valor
  commissionValue?: number;
}

export interface ResposeDataHistory {
  data: ServiceRequest[];
}

export interface ResponseProfessionals {
  data: User;
}

export interface ResponseProfiles {
  data: {
    professionals: User;
  };
}

/**
 * Mensagem de chat entre cliente e profissional.
 * No backend: tabela `chat_messages` com realtime enabled.
 */
export interface ChatMessage {
  id: string;
  requestId: string; // FK para service_requests.id
  from: "client" | "worker";
  fromName: string;
  text: string;
  time: string; // HH:MM
  createdAt: string; // ISO 8601
  read: boolean;
}

/**
 * Categoria de serviço.
 * No backend: tabela `categories`.
 */
export interface Category {
  id: string;
  label: string;
  emoji: string;
  description?: string;
  active: boolean;
}

export interface Worker {
  id: string;
  firstName: string;
  lastName: string;
  bio: string;
  availability: "AVAILABLE" | "UNAVAILABLE" | "BUSY";
  experience: number;
  averageRating: number;
  basePrice: number;
  pricePerHour: number;
  serviceRadius: number;
  latitude: number;
  longitude: number;
  completedJobs: number;
  totalJobs: number;
  totalEarnings: number;
  isVerified: boolean;
  categories: Category[];
  documents: Document[];
  user: WorkerUser;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkerUser {
  email: string;
  phoneNumber: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}
// ------ ESTADO GLOBAL DA APP ---------------------------------

export interface AppState {
  currentUser: User | null;
  clientStep: ClientStep;
  workerStep: WorkerStep;
  activeRequest: ServiceRequest | null;
  chatMessages: ChatMessage[];
  selectedWorker: User | null;
  givenRating: number;
  /** Localização atual do utilizador (obtida via navigator.geolocation) */
  userLocation: GeoLocation | null;
  /**
   * Progresso em tempo real do serviço em curso.
   * Partilhado entre cliente e profissional.
   * No backend: polling ao endpoint GET /service-requests/:id/progress
   */
  serviceProgress: ServiceProgress;
}

// ------ DADOS MOCK -------------------------------------------
// Coordenadas reais dos bairros de Luanda, Angola

/** Centro aproximado de Luanda */
export const LUANDA_CENTER: GeoLocation = {
  lat: -8.8368,
  lng: 13.2343,
  area: "Luanda Centro",
};

export const CATEGORIES: Category[] = [
  {
    id: "cat1",
    label: "Canalizador",
    emoji: "🔧",
    description: "Reparações e instalações de canalizações",
    active: true,
  },
  {
    id: "cat2",
    label: "Electricista",
    emoji: "⚡",
    description: "Instalações e reparações eléctricas",
    active: true,
  },
  {
    id: "cat3",
    label: "Serralheiro",
    emoji: "🔨",
    description: "Fechaduras, grades e portões",
    active: true,
  },
  {
    id: "cat4",
    label: "Mecânico",
    emoji: "🔩",
    description: "Reparação e manutenção de viaturas",
    active: true,
  },
  {
    id: "cat5",
    label: "Pintor",
    emoji: "🖌️",
    description: "Pintura interior e exterior",
    active: true,
  },
  {
    id: "cat6",
    label: "Carpinteiro",
    emoji: "🪵",
    description: "Móveis, portas e estruturas em madeira",
    active: true,
  },
];

export const PROFESSIONALS: User[] = [
  {
    id: "w1",
    name: "João Ferreira",
    email: "joao@email.com",
    phone: "+244 923 111 222",
    role: "worker",
    avatar: "JF",
    avatarColor: "#3b82f6",
    status: "active",
    createdAt: "2024-01-10T08:00:00Z",
    profession: "Canalizador",
    bio: "Especializado em reparações de canalizações residenciais e comerciais com mais de 8 anos de experiência.",
    rating: 4.9,
    totalJobs: 142,
    pricePerHour: "5.000 Kz/h",
    pricePerHourValue: 5000,
    available: true,
    verified: true,
    location: { lat: -8.8214, lng: 13.24, area: "Rangel" },
    serviceRadius: 10,
    skills: ["Encanamento", "Aquecedor solar", "WC e casa de banho"],
  },
  {
    id: "w2",
    name: "Maria Santos",
    email: "maria@email.com",
    phone: "+244 923 333 444",
    role: "worker",
    avatar: "MS",
    avatarColor: "#eab308",
    status: "active",
    createdAt: "2024-02-15T09:00:00Z",
    profession: "Electricista",
    bio: "Técnica certificada em instalações eléctricas residenciais. Rápida e de confiança.",
    rating: 4.8,
    totalJobs: 98,
    pricePerHour: "6.000 Kz/h",
    pricePerHourValue: 6000,
    available: true,
    verified: true,
    location: { lat: -8.815, lng: 13.23, area: "Maianga" },
    serviceRadius: 8,
    skills: ["Quadros eléctricos", "Tomadas e interruptores", "Iluminação LED"],
  },
  {
    id: "w3",
    name: "Carlos Lopes",
    email: "carlos@email.com",
    phone: "+244 923 555 666",
    role: "worker",
    avatar: "CL",
    avatarColor: "#f97316",
    status: "active",
    createdAt: "2023-11-05T10:00:00Z",
    profession: "Serralheiro",
    bio: "Fabricação e reparação de fechaduras, grades e estruturas metálicas. Urgências 24h.",
    rating: 4.7,
    totalJobs: 203,
    pricePerHour: "4.500 Kz/h",
    pricePerHourValue: 4500,
    available: false,
    verified: true,
    location: { lat: -8.805, lng: 13.25, area: "Sambizanga" },
    serviceRadius: 12,
    skills: ["Fechaduras", "Grades", "Portões automáticos"],
  },
  {
    id: "w4",
    name: "Ana Pereira",
    email: "ana@email.com",
    phone: "+244 923 777 888",
    role: "worker",
    avatar: "AP",
    avatarColor: "#22c55e",
    status: "active",
    createdAt: "2024-03-20T11:00:00Z",
    profession: "Electricista",
    bio: "Especialidade em instalações solares e sistemas trifásicos. Formação técnica certificada.",
    rating: 4.9,
    totalJobs: 87,
    pricePerHour: "5.500 Kz/h",
    pricePerHourValue: 5500,
    available: true,
    verified: false,
    location: { lat: -8.83, lng: 13.22, area: "Ingombota" },
    serviceRadius: 6,
    skills: ["Solar", "Trifásico", "Ar condicionado"],
  },
  {
    id: "w5",
    name: "Rui Domingos",
    email: "rui@email.com",
    phone: "+244 923 999 000",
    role: "worker",
    avatar: "RD",
    avatarColor: "#8b5cf6",
    status: "suspended",
    createdAt: "2023-08-12T07:00:00Z",
    profession: "Mecânico",
    bio: "Mecânico geral e especialista em viaturas japonesas. Diagnóstico computorizado.",
    rating: 4.6,
    totalJobs: 311,
    pricePerHour: "7.000 Kz/h",
    pricePerHourValue: 7000,
    available: true,
    verified: true,
    location: { lat: -8.905, lng: 13.37, area: "Viana" },
    serviceRadius: 15,
    skills: ["Motor", "Suspensão", "Diagnóstico OBD"],
  },
  {
    id: "w6",
    name: "Filipe Neto",
    email: "filipe@email.com",
    phone: "+244 924 111 222",
    role: "worker",
    avatar: "FN",
    avatarColor: "#ef4444",
    status: "active",
    createdAt: "2024-04-01T09:30:00Z",
    profession: "Pintor",
    bio: "Pintura interior e exterior, texturas decorativas e acabamentos de alto padrão.",
    rating: 4.7,
    totalJobs: 65,
    pricePerHour: "4.000 Kz/h",
    pricePerHourValue: 4000,
    available: true,
    verified: true,
    location: { lat: -8.915, lng: 13.19, area: "Talatona" },
    serviceRadius: 10,
    skills: ["Textura", "Tinta acrílica", "Impermeabilização"],
  },
  {
    id: "w7",
    name: "Beatriz Cunha",
    email: "beatriz@email.com",
    phone: "+244 924 333 444",
    role: "worker",
    avatar: "BC",
    avatarColor: "#06b6d4",
    status: "active",
    createdAt: "2024-01-25T08:45:00Z",
    profession: "Carpinteiro",
    bio: "Fabricação e restauro de móveis em madeira maciça. Cozinhas e roupeiros sob medida.",
    rating: 4.8,
    totalJobs: 44,
    pricePerHour: "5.200 Kz/h",
    pricePerHourValue: 5200,
    available: false,
    verified: true,
    location: { lat: -8.84, lng: 13.28, area: "Kilamba Kiaxi" },
    serviceRadius: 8,
    skills: ["Móveis", "Cozinhas", "Roupeiros"],
  },
];

export const CLIENTS: User[] = [
  {
    id: "c1",
    name: "Paulo Mendes",
    email: "paulo@email.com",
    phone: "+244 921 111 222",
    role: "client",
    avatar: "PM",
    avatarColor: "#06b6d4",
    status: "active",
    createdAt: "2024-01-05T10:00:00Z",
    location: { lat: -8.8368, lng: 13.2343, area: "Luanda Centro" },
    savedWorkers: ["w1", "w2"],
  },
  {
    id: "c2",
    name: "Sónia Lima",
    email: "sonia@email.com",
    phone: "+244 921 333 444",
    role: "client",
    avatar: "SL",
    avatarColor: "#ec4899",
    status: "active",
    createdAt: "2024-02-10T11:00:00Z",
    location: { lat: -8.82, lng: 13.24, area: "Maianga" },
    savedWorkers: ["w4"],
  },
  {
    id: "c3",
    name: "Bruno Gomes",
    email: "bruno@email.com",
    phone: "+244 921 555 666",
    role: "client",
    avatar: "BG",
    avatarColor: "#64748b",
    status: "blocked",
    createdAt: "2023-12-01T09:00:00Z",
    location: { lat: -8.85, lng: 13.26, area: "Rangel" },
    savedWorkers: [],
  },
];

export const COMPLETED_SERVICES: ServiceRequest[] = [
  {
    id: "s1",
    clientId: "c1",
    clientName: "Paulo Mendes",
    workerId: "w1",
    workerName: "João Ferreira",
    service: "Canalizador",
    description: "Vazamento na cozinha debaixo do lava-louça",
    location: "Rangel, Luanda",
    locationGeo: { lat: -8.8214, lng: 13.24, area: "Rangel" },
    price: "15.000 Kz",
    priceValue: 15000,
    status: "rated",
    date: "12 Fev",
    createdAt: "2025-02-12T09:00:00Z",
    startedAt: "2025-02-12T10:30:00Z",
    completedAt: "2025-02-12T12:00:00Z",
    rating: 5,
    ratingComment: "Excelente serviço, muito profissional!",
    commission: "1.500 Kz",
    commissionValue: 1500,
  },
  {
    id: "s2",
    clientId: "c2",
    clientName: "Sónia Lima",
    workerId: "w3",
    workerName: "Carlos Lopes",
    service: "Serralheiro",
    description: "Fechadura arrombada na porta principal",
    location: "Maianga, Luanda",
    locationGeo: { lat: -8.815, lng: 13.23, area: "Maianga" },
    price: "20.000 Kz",
    priceValue: 20000,
    status: "completed",
    date: "15 Fev",
    createdAt: "2025-02-15T14:00:00Z",
    startedAt: "2025-02-15T15:00:00Z",
    completedAt: "2025-02-15T16:30:00Z",
    commission: "2.000 Kz",
    commissionValue: 2000,
  },
  {
    id: "s3",
    clientId: "c1",
    clientName: "Paulo Mendes",
    workerId: "w2",
    workerName: "Maria Santos",
    service: "Electricista",
    description: "Curto-circuito no quadro eléctrico",
    location: "Rangel, Luanda",
    locationGeo: { lat: -8.8214, lng: 13.24, area: "Rangel" },
    price: "10.000 Kz",
    priceValue: 10000,
    status: "rated",
    date: "10 Fev",
    createdAt: "2025-02-10T08:00:00Z",
    startedAt: "2025-02-10T09:00:00Z",
    completedAt: "2025-02-10T10:30:00Z",
    rating: 5,
    ratingComment: "Muito rápida e competente.",
    commission: "1.000 Kz",
    commissionValue: 1000,
  },
  {
    id: "s4",
    clientId: "c2",
    clientName: "Sónia Lima",
    workerId: "w4",
    workerName: "Ana Pereira",
    service: "Electricista",
    description: "Instalação de tomadas no escritório",
    location: "Maianga, Luanda",
    locationGeo: { lat: -8.815, lng: 13.23, area: "Maianga" },
    price: "8.000 Kz",
    priceValue: 8000,
    status: "rated",
    date: "8 Fev",
    createdAt: "2025-02-08T11:00:00Z",
    startedAt: "2025-02-08T12:00:00Z",
    completedAt: "2025-02-08T14:00:00Z",
    rating: 4,
    ratingComment: "Bom trabalho, recomendo.",
    commission: "800 Kz",
    commissionValue: 800,
  },
  {
    id: "s5",
    clientId: "c1",
    clientName: "Paulo Mendes",
    workerId: "w5",
    workerName: "Rui Domingos",
    service: "Mecânico",
    description: "Revisão geral do carro + troca de óleo",
    location: "Viana, Luanda",
    locationGeo: { lat: -8.905, lng: 13.37, area: "Viana" },
    price: "35.000 Kz",
    priceValue: 35000,
    status: "rated",
    date: "5 Fev",
    createdAt: "2025-02-05T08:00:00Z",
    startedAt: "2025-02-05T09:00:00Z",
    completedAt: "2025-02-05T13:00:00Z",
    rating: 4,
    commission: "3.500 Kz",
    commissionValue: 3500,
  },
];

// ------ UTILITÁRIOS ------------------------------------------

/**
 * Calcula a distância em km entre dois pontos GPS (fórmula Haversine).
 * Equivalente ao que o backend fará via PostGIS `ST_Distance`.
 */
export function calcDistance(a: GeoLocation, b: GeoLocation): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

/**
 * Formata a distância para exibição.
 */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

/**
 * Retorna profissionais ordenados por distância a partir de um ponto.
 */
export function getProfessionalsNearby(
  origin: GeoLocation,
  professionals: User[] = PROFESSIONALS,
): Array<User & { distanceKm: number; distanceLabel: string }> {
  console.log("Datos", professionals);
  return professionals
    .filter((p) => p.location)
    .map((p) => {
      const km = calcDistance(origin, p.location!);
      return { ...p, distanceKm: km, distanceLabel: formatDistance(km) };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
