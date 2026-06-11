# English Dictionary

Full-stack app para buscar palavras em inglês com pronúncia, áudio, definições, sinônimos e antônimos. Histórico e favoritos são salvos por usuário.

## Tech Stack

| Camada | Stack |
|---|---|
| Frontend | Next.js 15 + TypeScript + Material-UI + React Query |
| Backend | NestJS 10 + Prisma + PostgreSQL + Redis |
| Auth | JWT (Bearer token) |
| Testes | Vitest (frontend), Jest (backend) |

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

## Estrutura do Projeto

```
.
├── docker-compose.yml
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           # Modelos (User, Word, History, Favorites)
│   │   └── migrations/
│   ├── src/
│   │   ├── auth/                   # JWT signin/signup
│   │   ├── entries/                # GET palavras, POST favoritos
│   │   ├── user/                   # Perfil, histórico, favoritos
│   │   ├── prisma/                 # PrismaClient wrapper
│   │   ├── redis/                  # Redis wrapper (cache 1h)
│   │   ├── common/
│   │   │   ├── guards/             # JwtAuthGuard
│   │   │   ├── decorators/         # @CurrentUser
│   │   │   └── filters/            # HttpExceptionFilter
│   │   └── main.ts
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── (auth)/             # signin, signup (públicas)
    │   │   ├── (app)/              # dictionary, word, favorites (protegidas)
    │   │   ├── layout.tsx
    │   │   └── providers.tsx        # React Query + MUI Theme
    │   ├── features/               # Feature-based: auth, dictionary, word, favorites
    │   │   └── [feature]/
    │   │       ├── components/
    │   │       ├── hooks/
    │   │       ├── services/
    │   │       ├── types/
    │   │       └── utils/
    │   ├── shared/                 # Componentes reutilizáveis, layouts
    │   ├── lib/
    │   │   ├── api.ts              # apiRequest (fetch + token + error handling)
    │   │   └── queryKeys.ts        # React Query key factory
    │   └── theme.ts
    └── package.json
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

| Rota | O que faz |
|---|---|
| `/signin` | Login |
| `/signup` | Cadastro |
| `/dictionary` | Lista ~370k palavras com busca e paginação |
| `/word/:word` | Detalhes: fonética, áudio, definições, exemplos, sinônimos |
| `/favorites` | Palavras marcadas como favoritas |

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

Docs interativa: http://localhost:3000/docs

---

## Detalhes técnicos que podem gerar dúvida

**Por que dois tsconfigs no backend?**
O `tsconfig.json` é para a IDE (inclui todos os arquivos). O `tsconfig.build.json` é usado exclusivamente pelo `nest build` em produção — ele define `rootDir: "./src"` para que o output vá para `dist/main.js` (sem o prefixo `dist/src/`) e exclui o diretório `scripts/` do bundle.

**Por que o script de seed usa ts-node em vez do arquivo compilado?**
O diretório `scripts/` é excluído do `tsconfig.build.json` propositalmente (é um script utilitário, não parte da aplicação). O Dockerfile copia a pasta `scripts/` e o `tsconfig.json` para o container runner, e o `npm run db:seed` usa `ts-node` para executá-lo diretamente.

**Por que `binaryTargets` no schema.prisma?**
O Prisma precisa de binários específicos para cada plataforma. Como o container usa Alpine Linux (musl libc, não glibc), é necessário declarar `linux-musl-openssl-3.0.x` nos targets. Sem isso, o Prisma falha ao tentar detectar a versão do OpenSSL. O Dockerfile também instala o `openssl` via `apk add`.

**Por que a porta do Redis é 6399?**
A `6379` já estava em uso no host. O container Redis escuta na `6379` internamente (os containers se comunicam por nome via rede Docker interna), mas o mapeamento para o host usa `6399:6379`.
