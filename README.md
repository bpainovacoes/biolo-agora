# Biolo Agora — Frontend (Prototype Power)

Plataforma de marketplace de serviços domésticos em Angola. Liga clientes a profissionais qualificados (canalizadores, electricistas, mecânicos, etc.) em tempo real, com geolocalização.

---

## Stack Tecnológico

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript 5 |
| Estilo | Tailwind CSS 3 + shadcn/ui + Radix UI |
| Autenticação | NextAuth v5 (next-auth@beta 5.0.0-beta.30) |
| Formulários | React Hook Form + Zod |
| Mapas | Leaflet |
| WebSocket | Socket.IO Client |
| Cache/Data | Next.js `fetch` tags + `revalidateTag` |
| Gestor de pacotes | pnpm |

---

## Estrutura de Directórios

```
prototype-power/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Layout raiz (Providers, SessionProvider)
│   ├── page.tsx                # Redireccionamento por role
│   ├── not-found.tsx
│   ├── auth/
│   │   ├── [role]/page.tsx     # Login/Registo dinâmico (client | worker)
│   │   ├── 2fa/page.tsx        # Verificação TOTP
│   │   └── 2fa-setup/page.tsx  # Configuração 2FA
│   ├── client/                 # Fluxo do Cliente
│   │   ├── dashboard/
│   │   ├── search/
│   │   ├── profile/
│   │   ├── waiting/
│   │   ├── chat/
│   │   ├── confirm/
│   │   ├── in-progress/
│   │   ├── rate/
│   │   ├── done/
│   │   └── declined/
│   ├── worker/                 # Fluxo do Profissional
│   │   ├── dashboard/
│   │   ├── complete-profile/
│   │   ├── set-location/
│   │   ├── available/
│   │   ├── incoming/
│   │   ├── chat/
│   │   ├── in-progress/
│   │   ├── finalize/
│   │   ├── commission/
│   │   └── history/
│   ├── admin/page.tsx          # Painel de administração
│   └── api/auth/[...nextauth]/ # Handler NextAuth
│
├── actions/                    # Server Actions (Next.js)
│   ├── auth.ts                 # login, register, 2FA, logout
│   └── data.ts                 # Mutações de dados (perfil, pedidos, chat)
│
├── components/
│   ├── biolo/                  # Componentes de negócio
│   │   ├── MapView.tsx         # Mapa Leaflet interactivo
│   │   ├── screens/            # Ecrãs partilhados (Auth, Landing, 2FA)
│   │   ├── client/             # Ecrãs exclusivos do cliente
│   │   ├── worker/             # Ecrãs exclusivos do profissional
│   │   └── admin/              # Painel admin
│   ├── ui/                     # shadcn/ui (Button, Card, Dialog, etc.)
│   ├── Providers.tsx           # SessionProvider + AppProvider
│   ├── RouteGuard.tsx          # Guarda de rota client-side
│   └── LogoutButton.tsx
│
├── lib/
│   ├── auth.ts                 # Config NextAuth (CredentialsProvider, jwt/session callbacks)
│   ├── session.ts              # Helpers: getSession, requireSession, requireRole
│   ├── api.ts                  # Cliente HTTP centralizado (Bearer token automático)
│   ├── queries.ts              # Funções de leitura de dados (Server Components)
│   ├── cache-tags.ts           # Constantes de tags de cache Next.js
│   ├── bioloTypes.ts           # Tipos TypeScript + dados mock
│   ├── AppContext.tsx          # Context client-side (estado UI / prototipagem)
│   ├── useServicesSocket.ts    # Hook WebSocket (Socket.IO)
│   └── mapper/
│       ├── workerData.ts       # Mapeia Worker (backend) → User (UI)
│       └── clientData.ts       # Mapeia ClientProfile (backend) → User (UI)
│
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
│
├── types/
│   └── next-auth.d.ts          # Augmentação de tipos Session/JWT
│
└── middleware.ts               # Edge middleware (protecção de rotas + 2FA redirect)
```

---

## Arquitectura

### 1. Autenticação (NextAuth v5)

A sessão é gerida inteiramente pelo NextAuth com JWT armazenado em cookie HttpOnly. Os tokens nunca chegam ao browser directamente.

```
Browser → Server Action (loginAction)
        → NextAuth signIn("credentials")
        → authorize() → POST /auth/login (backend NestJS)
        → JWT guardado em cookie HttpOnly
        → Middleware redirecciona para o dashboard do role
```

**Fluxo 2FA:**
```
1. Login retorna { requires2fa: true, twoFactorToken }
2. authorize() devolve sessão com twoFactorPending: true
3. Middleware detecta twoFactorPending → redireciona para /auth/2fa
4. Utilizador insere o código TOTP
5. verify2faAction() completa o login com signIn("credentials", { twoFactorToken, code })
6. Middleware redireciona para o dashboard do role
```

**Renovação de token:**
O `jwt` callback em `lib/auth.ts` renova o `accessToken` automaticamente quando este expira (com buffer de 60s), usando `POST /auth/refresh`.

---

### 2. Protecção de Rotas (`middleware.ts`)

Executado na edge runtime em todos os pedidos (excepto assets estáticos):

| Condição | Acção |
|---|---|
| `session.error === "RefreshAccessTokenError"` | Redireciona para `/auth/client` |
| `session.user.twoFactorPending` | Redireciona para `/auth/2fa` |
| Rota protegida sem sessão válida | Redireciona para `/auth/client` |
| Utilizador autenticado em página de auth | Redireciona para o seu dashboard |

Rotas protegidas: `/client/*`, `/worker/*`, `/admin/*`

---

### 3. Data Fetching (Server Components + Cache Tags)

Os dados são obtidos em Server Components via funções em `lib/queries.ts`. Cada chamada associa tags de cache Next.js:

```typescript
// lib/queries.ts — leitura com tag de cache
const data = await api.get("/workers/me", {
  tags: [TAGS.me],
  revalidate: 60,
});
```

Quando uma Server Action muta dados, invalida as tags relevantes:

```typescript
// actions/data.ts — mutação + invalidação de cache
await api.patch("/me/profile", data);
revalidateTag(TAGS.me); // próximo render vai buscar dados frescos
```

**Tags de cache disponíveis** (`lib/cache-tags.ts`):

| Tag | Dados | Revalidate |
|---|---|---|
| `me` | Perfil do utilizador actual | 60s |
| `professionals` | Lista de profissionais | 30s |
| `active-request` | Pedido de serviço activo | 10s |
| `service-request-{id}` | Pedido específico | 10s |
| `chat-{requestId}` | Mensagens de chat | 5s |
| `worker-history` | Histórico do profissional | 60s |
| `admin-stats` | Estatísticas globais | 30s |
| `admin-users` | Lista de utilizadores | 30s |

---

### 4. Cliente HTTP (`lib/api.ts`)

Wrapper sobre o `fetch` nativo com:
- Injeção automática do `Authorization: Bearer <token>` (lê da sessão NextAuth)
- Integração com o sistema de cache tags do Next.js
- Em caso de 401 → redireciona para login (token de refresh expirado)
- Suporte a `no-store` para mutações (sem cache)

```typescript
api.get<T>(path, { tags, revalidate })
api.post<T>(path, body)
api.patch<T>(path, body)
api.put<T>(path, body)
api.delete<T>(path)
```

---

### 5. WebSocket em Tempo Real (`lib/useServicesSocket.ts`)

Hook client-side que conecta ao namespace `/services` do backend NestJS via Socket.IO. Autentica com o `accessToken` da sessão NextAuth no handshake:

```typescript
const socket = useServicesSocket(accessToken);
// Usado para: actualizações de progresso do serviço,
//             localização GPS do profissional em tempo real, chat
```

A URL do socket é derivada de `NEXT_PUBLIC_API_URL` removendo o sufixo `/api/v1`.

---

### 6. Roles e Fluxos de Utilizador

#### Cliente (`UserRole = "client"`)
```
Landing → Auth → Dashboard → Search
  → Ver Perfil do Profissional → Enviar Pedido
  → Waiting (aguarda resposta) → Chat/Negociação
  → Confirmar Serviço → In Progress (GPS em tempo real)
  → Avaliar → Done
```

#### Profissional/Worker (`UserRole = "worker"`)
```
Landing → Auth → Completar Perfil → Definir Localização
  → Disponível (toggle on/off) → Incoming Request
  → Aceitar/Recusar → Chat/Negociação
  → In Progress → Finalizar → Comissão
  → Histórico
```

#### Admin (`UserRole = "admin"`)
```
Dashboard → Estatísticas globais → Gestão de utilizadores
  (activar / bloquear / suspender)
```

---

### 7. Modelos de Dados Principais (`lib/bioloTypes.ts`)

**`User`** — partilhado entre cliente e profissional:
- Campos base: `id`, `name`, `email`, `phone`, `role`, `status`, `avatar`
- Campos de profissional: `profession`, `rating`, `pricePerHour`, `available`, `location` (GPS), `serviceRadius`, `skills`, `verified`
- Campos de cliente: `savedWorkers` (IDs de profissionais favoritos)

**`ServiceRequest`** — pedido de serviço:
- Estados: `pending → waiting → accepted/declined → in_progress → completed → rated`
- Inclui: `locationGeo` (GPS do serviço), `price`, `commission` (10%), timestamps de cada etapa

**`ServiceProgress`** — progresso em tempo real:
- Passos: `heading → arrived → started → done`
- `workerLocation` actualizado a cada 10s via GPS
- Detecta chegada automática ao entrar no raio de 200m

**`ChatMessage`** — mensagem de negociação:
- Associada a `requestId`, com `from: "client" | "worker"`

**`Category`** — categoria de serviço:
- Canalizador, Electricista, Serralheiro, Mecânico, Pintor, Carpinteiro

---

### 8. Mapeadores (`lib/mapper/`)

Convertem as respostas do backend NestJS para o formato interno da UI:
- `mapWorkerToUI(Worker) → User` — normaliza campos do profissional
- `mapClientToUI(ClientProfile) → User` — normaliza campos do cliente

O role no backend é em maiúsculas (`CLIENT | WORKER | ADMIN`); é normalizado para minúsculas em `lib/auth.ts`.

---

## Backend API (NestJS)

Base URL: `NEXT_PUBLIC_API_URL` (default: `http://localhost:3000/api/v1`)

### Autenticação
| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/auth/login` | Login — retorna tokens ou `{requires2fa, twoFactorToken}` |
| POST | `/auth/register` | Registo — retorna tokens directamente |
| POST | `/auth/2fa/verify` | Verificar código TOTP `{twoFactorToken, code}` |
| POST | `/auth/2fa/setup` | Iniciar configuração 2FA (retorna QR + secret) |
| POST | `/auth/2fa/confirm` | Confirmar primeiro OTP `{otp}` |
| POST | `/auth/refresh` | Renovar access token `{refreshToken}` |
| POST | `/auth/logout` | Invalidar refresh token (protegido) |
| GET | `/auth/me` | Perfil do utilizador autenticado |

### Profissionais & Clientes
| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/workers/me` | Perfil do profissional autenticado |
| GET | `/clients/me` | Perfil do cliente autenticado |
| GET | `/professionals` | Listar profissionais (`?category`, `?lat`, `?lng`, `?radius`, `?available`) |
| GET | `/professionals/:id` | Detalhe de um profissional |
| PATCH | `/me/profile` | Actualizar perfil |
| PATCH | `/me/location` | Actualizar localização GPS |
| PATCH | `/me/availability` | Activar/desactivar disponibilidade |

### Pedidos de Serviço
| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/service-requests` | Criar pedido |
| GET | `/service-requests/active` | Pedido activo do utilizador |
| GET | `/service-requests/:id` | Detalhe de um pedido |
| PATCH | `/service-requests/:id/accept` | Profissional aceita |
| PATCH | `/service-requests/:id/decline` | Profissional recusa |
| PATCH | `/service-requests/:id/confirm` | Cliente confirma |
| PATCH | `/service-requests/:id/progress` | Actualizar progresso GPS/passo |
| PATCH | `/service-requests/:id/finalize` | Profissional finaliza |
| POST | `/service-requests/:id/rate` | Cliente avalia `{rating, comment}` |
| GET/POST | `/service-requests/:id/messages` | Chat |
| GET | `/services/worker/history` | Histórico do profissional |

### Admin
| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/admin/stats` | Estatísticas globais |
| GET | `/admin/users` | Lista de utilizadores |
| PATCH | `/admin/users/:id/status` | Alterar estado `{status: active\|blocked\|suspended}` |

---

## Variáveis de Ambiente

```env
# Obrigatório — chave secreta para NextAuth (JWT cookie)
AUTH_SECRET=<openssl rand -base64 32>

# URL do backend NestJS
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

---

## Executar Localmente

```bash
# Instalar dependências
pnpm install

# Desenvolvimento
pnpm dev

# Build de produção
pnpm build
pnpm start
```

---

## Contexto de Produto

**Biolo Agora** é um marketplace de serviços focado em Luanda, Angola. A moeda usada é o Kwanza (Kz). A plataforma retém uma comissão de **10%** por serviço concluído. A geolocalização usa coordenadas reais dos bairros de Luanda (Rangel, Maianga, Ingombota, Sambizanga, Talatona, Viana, Kilamba Kiaxi).
