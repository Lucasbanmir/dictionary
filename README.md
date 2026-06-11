# English Dictionary

Full-stack app para buscar palavras em inglês com pronúncia, áudio, definições, sinônimos e antônimos. Histórico e favoritos são salvos por usuário.

## Tech Stack

| Camada   | Stack                                               |
| -------- | --------------------------------------------------- |
| Frontend | Next.js 15 + TypeScript + Material-UI + React Query |
| Backend  | NestJS 10 + Prisma + PostgreSQL + Redis             |
| Auth     | JWT (Bearer token)                                  |
| Testes   | Vitest (frontend), Jest (backend)                   |

---

## Deploy

- Frontend: Vercel https://dictionary-frontend-pearl.vercel.app
- Backend: Render https://dictionary-8jo7.onrender.com
- Database: Neon PostgreSQL (https://neon.tech)
- Redis: Upstash (https://upstash.com)

---

## Getting Started

### Com Docker (recomendado)

```bash
docker compose up --build -d
docker exec dict-api npm run db:seed  # só na primeira vez
```

Acesse em **http://localhost:3001**

### Desenvolvimento local

```bash
# Subir apenas BD e cache
docker compose up postgres redis -d

# Backend (porta 3000)
cd backend
npm install
npx prisma migrate dev
npm run start:dev

# Frontend (porta 3001)
cd frontend
npm install
npm run dev
```

## Como Funciona

### Fluxo de Autenticação

1. Usuário faz login (`POST /auth/signin`)
2. Backend retorna token JWT (`Bearer ...`)
3. Token é salvo em cookie e localStorage
4. Middleware Next.js redireciona rotas sem autenticação
5. `apiRequest()` injeta automaticamente o token nas requisições
6. Backend valida com `JwtAuthGuard`

### Cache com Redis

- `GET /entries/en/:word` verifica Redis primeiro
- Se hit: retorna imediatamente
- Se miss: chama Free Dictionary API, salva em Redis (TTL 1h), retorna
- Em qualquer caso: registra no histórico do usuário

## Páginas do Frontend

| Rota          | O que faz                                                  |
| ------------- | ---------------------------------------------------------- |
| `/signin`     | Login                                                      |
| `/signup`     | Cadastro                                                   |
| `/dictionary` | Lista ~370k palavras com busca e paginação                 |
| `/word/:word` | Detalhes: fonética, áudio, definições, exemplos, sinônimos |
| `/favorites`  | Palavras marcadas como favoritas                           |

## API

**Autenticação (sem token):**

```
POST   /auth/signup          { name, email, password }
POST   /auth/signin          { email, password }
→ retorna: { id, name, token }
```

**Palavras (Bearer token obrigatório):**

```
GET    /entries/en?search=apple&page=1&limit=24
GET    /entries/en/:word                           # salva no histórico
POST   /entries/en/:word/favorite
DELETE /entries/en/:word/unfavorite
```

**Usuário (Bearer token obrigatório):**

```
GET    /user/me
GET    /user/me/history?page=1&limit=20
GET    /user/me/favorites?page=1&limit=20
DELETE /user/me/history                           # apaga todo histórico
```

Docs interativa:

Render
https://dictionary-8jo7.onrender.com/docs

Localhost
http://localhost:3000/docs

## Testes

A aplicação conta com uma sólida cobertura de testes automatizados para garantir a estabilidade tanto na interface quanto na API.

**Frontend (Vitest & Testing Library)**

- ✅ **50 testes** aprovados (distribuídos em 6 arquivos)
- Para rodar localmente:

```bash
cd frontend
npm run test
```

**Backend (Jest)**

- ✅ **74 testes** aprovados (distribuídos em 6 test suites)

- Para rodar localmente:

```bash
cd backend
npm run test
```

---

## Observações técnicas

- Redis usado para cache (TTL 1h)
- Prisma com PostgreSQL (Neon em produção)
- JWT para autenticação
- Arquitetura feature-based no frontend
