# ZoneAtlas — Next Technical Challenge (Monorepo)

Aplicação **Full Stack** para gestão de zoneamento urbano com **mapa interativo**. Permite **visualizar**, **filtrar por nome** e **cadastrar** zonas com geometria **GeoJSON** (Point/Polygon).

✅ **Todos os requisitos obrigatórios e bônus do desafio foram implementados.**

## Live

- **Frontend (Vercel):** https://next-technical-challenge.vercel.app/zones
- **API (Render):** https://next-technical-challenge.onrender.com
- **Swagger:** https://next-technical-challenge.onrender.com/docs

> **Anti-sleep (Render):** UptimeRobot pingando `/health` a cada **5 min** e um endpoint de **readiness** (API + DB) a cada **1h**.

## Como testar (avaliador)

1. Abra o front: https://next-technical-challenge.vercel.app/zones
2. Use o filtro por nome e selecione uma zona (reflete no mapa).
3. Cadastre uma zona (Point ou Polygon) e confirme:
   - aparece na tabela e no mapa
   - persiste após refresh
4. Teste a API no Swagger: https://next-technical-challenge.onrender.com/docs

## Stack

**Frontend:** Next.js (App Router) + React, Mantine, Tailwind, Leaflet(+Draw), React Query, Axios, Zod  
**Backend:** NestJS, Prisma, PostgreSQL (Neon), Swagger  
**Tooling:** Prettier, ESLint, Husky, lint-staged, commitlint, GitHub Actions (CI/CD)

## Arquitetura do repo

```txt
├─ frontend/   # Next.js (UI + mapa + tabela + cadastro)
├─ backend/    # NestJS (API + Prisma + Swagger)
└─ docs/       # documentação gitflow
```

## 🔄 Gitflow e Trabalho em Equipe

O projeto foi conduzido como uma amostra de trabalho real:

- Utilização de **Gitflow**.
- Gerenciamento e documentação de tarefas via metodologia Kanban. [Board - Zone Atlas](https://github.com/users/FabioHenriqueSCC/projects/8)
- Branch `dev` definida como default para desenvolvimento contínuo.
- Evolução via **PRs** (garantindo rastreamento e organização do histórico).

## 🚀 DevOps & CI/CD

Pipeline configurado com **GitHub Actions**:

- Roda em PRs e em push/merge para `dev` e `main`.
- Executa checks de formatação, lint, testes e build.

### Secrets / Env

Variáveis e segredos foram configurados diretamente nos provedores:

- **Vercel** (frontend)
- **Render** (API)
- **Neon** (DB)

> 🔒 **Nenhum segredo foi commitado no repositório.**

### Por que hospedagem gratuita (e não AWS)?

A escolha por Vercel/Render/Neon foi intencional para entregar um deploy verificável, com **custo zero**, e com foco no que o desafio avalia (arquitetura, DX, qualidade e entrega ponta a ponta), sem o overhead de configuração de uma cloud paga/complexa.

---

## 💻 Rodando Local

**Ports:** Frontend `3001` | Backend `3000`

### 1. Instalar dependências

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

### 2. Subir Banco de Dados

```bash
docker compose up -d
```

### 3. Configurar Variáveis de Ambiente

Crie o arquivo backend/.env com o seguinte conteúdo:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DB"
FRONTEND_URL="http://localhost:3001"
PORT=3000
```

### 4. Setup do Banco (Prisma)

Rodar as migrações e o seed:

```bash
npm --prefix backend run prisma:migrate
npm --prefix backend run prisma:seed
```

### 5. Executar o projeto

Em terminais separados, rode:

```bash
# Backend
npm --prefix backend run start:dev

# Frontend
npm --prefix frontend run dev
```
