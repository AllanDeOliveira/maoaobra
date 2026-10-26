# Mão a Obra

Marketplace de serviços locais — piloto em Cáceres/MT. Plano e decisões em [docs/PLANO.md](docs/PLANO.md).

| Pasta             | O que é                                                          |
| ----------------- | ---------------------------------------------------------------- |
| `apps/api`        | API (Node 24, Fastify, Drizzle, Postgres + PostGIS, Better Auth) |
| `apps/app`        | App Expo Router — iOS, Android e web                             |
| `packages/shared` | Schemas Zod e tipos usados pela API e pelo app                   |

A v1 (MVP em Firebase) está preservada na tag `mvp-firebase`.

## Rodando localmente

Pré-requisitos: Node 24+, pnpm (`npm i -g pnpm`) e Docker.

```bash
pnpm install
pnpm db:up                                  # Postgres + PostGIS em localhost:5434

cp apps/api/.env.example apps/api/.env      # troque o BETTER_AUTH_SECRET
cp apps/app/.env.example apps/app/.env
pnpm --filter @maoaobra/api db:migrate

pnpm dev:api                                # http://localhost:3333
pnpm dev:app                                # Expo: w = web, a = Android, i = iOS
```

Login é por celular com código. Em desenvolvimento o código **não é enviado por SMS**: ele aparece no log da API (`[sms] +55... seu código é 123456`).

## Qualidade

```bash
pnpm lint        # Biome
pnpm typecheck   # tsc em todos os pacotes
pnpm test        # testes de integração da API contra Postgres real (banco maoaobra_test)
```

O CI roda os três em todo push e pull request.

## Banco de dados

- Mudou o schema em `apps/api/src/db/schema.ts`? Gere a migration com `pnpm --filter @maoaobra/api db:generate` e versione a pasta `apps/api/drizzle`.
- Os testes recriam o banco `maoaobra_test` do zero a cada execução, então também validam as migrations.
