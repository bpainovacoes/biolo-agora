# Arquitectura de Autenticação — Biolo Agora

## Visão geral

```
Browser                Next.js Server              Backend API
  │                        │                            │
  │  POST /auth/login       │                            │
  │──────────────────────►  │  POST /auth/login          │
  │                        │──────────────────────────► │
  │                        │  ◄── { tokens } ou         │
  │                        │       { requires2fa, twoFactorToken }
  │                        │                            │
  │  Set-Cookie (HttpOnly) │                            │
  │  ◄────────────────────  │                            │
  │  Redirect → /dashboard │                            │
```

Os tokens **nunca chegam ao JavaScript do browser** — ficam em cookies HttpOnly.

---

## Endpoints esperados no backend

### Auth

| Método | Path | Body | Resposta |
|--------|------|------|----------|
| POST | `/auth/login` | `{ email, password, role }` | `{ tokens }` ou `{ requires2fa: true, twoFactorToken }` |
| POST | `/auth/register` | `{ name, email, password, role, profession? }` | `{ tokens, user }` |
| POST | `/auth/refresh` | `{ refreshToken }` | `{ tokens }` |
| POST | `/auth/logout` | — | `204` |
| POST | `/auth/2fa/verify` | `{ twoFactorToken, otp }` | `{ tokens, user }` |
| POST | `/auth/2fa/setup` | — (autenticado) | `{ qrCodeUrl, secret, backupCodes }` |
| POST | `/auth/2fa/confirm` | `{ otp }` | `{ tokens, backupCodes }` |
| POST | `/auth/2fa/disable` | `{ otp }` | `{ tokens }` |

### Formato dos Tokens (TokenPair)

```json
{
  "accessToken":  "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "expiresIn":    900
}
```

`expiresIn` em segundos (ex: 900 = 15 minutos).

### JWT Payload (accessToken)

```json
{
  "sub":               "user-uuid",
  "name":              "João Silva",
  "email":             "joao@biolo.ao",
  "role":              "client",
  "avatarColor":       "#16a34a",
  "avatar":            "JS",
  "twoFactorEnabled":  true,
  "twoFactorVerified": true,
  "iat":               1700000000,
  "exp":               1700000900
}
```

O campo `twoFactorVerified: true` **só deve estar no token depois de o utilizador ter completado o passo 2FA** na sessão actual. Se o utilizador fez login mas ainda não verificou o OTP, o token temporário `twoFactorToken` é uma JWT diferente (curta duração, sem acesso a recursos).

---

## Fluxo de login com 2FA

```
1. POST /auth/login  →  { requires2fa: true, twoFactorToken: "eyJ..." }
2. Redirect para /auth/2fa?token=<twoFactorToken>
3. Utilizador insere OTP
4. POST /auth/2fa/verify { twoFactorToken, otp }  →  { tokens }
5. Cookies definidos, redirect para dashboard
```

O `twoFactorToken` é uma JWT de curta duração (ex: 5 minutos) que apenas autoriza o endpoint `/auth/2fa/verify`. Não dá acesso a nenhum outro recurso.

---

## Fluxo de setup de 2FA (TOTP — Google Authenticator)

```
1. POST /auth/2fa/setup  →  { qrCodeUrl, secret, backupCodes }
   - qrCodeUrl: data URI de uma imagem PNG com o QR code
   - secret: chave base32 para entrada manual
   - backupCodes: 8 códigos de recuperação de uso único

2. Utilizador escaneia QR code na app

3. POST /auth/2fa/confirm { otp }  →  { tokens, backupCodes }
   - tokens: novo JWT com twoFactorEnabled: true
   - backupCodes: mostrar uma única vez ao utilizador
```

---

## Renovação automática de tokens

O `lib/api.ts` faz isto automaticamente:

```
Request → 401  →  POST /auth/refresh  →  200  →  Retry request original
                                      →  401  →  Clear cookies, redirect /
```

---

## Variáveis de ambiente

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.biolo.ao
```

Apenas esta variável é necessária no lado Next.js.
Todos os segredos (JWT secret, TOTP secret, DB, etc.) ficam no backend.

---

## Invalidação de cache automática

O Next.js usa `revalidateTag()` para refrescar dados sem react-query:

```
Server Action  →  revalidateTag("professionals")
                      ↓
Next.js invalida o fetch cacheado com tag "professionals"
                      ↓
Próximo render do Server Component vai buscar dados frescos
```

Cada tipo de dado tem uma tag definida em `actions/data.ts → TAGS`.
