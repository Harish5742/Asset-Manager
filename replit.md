# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: OpenAI via Replit AI Integrations (gpt-5.2)

## Artifacts

### soil-advisor (React + Vite, preview path: /)

AI-Powered Soil Health Advisory System for smallholder farmers. Features:
- Farmer soil input form (pH, N, P, K, moisture, location, season, water availability)
- AI-powered crop recommendations (top 3 with suitability scores)
- Fertilizer plans with dosage and timing
- Soil corrections (lime, gypsum, etc.)
- Dual-language explanations (English + Tamil)
- Admin dashboard with stats, top crops, seasonal breakdown, all submissions table

### api-server (Express 5, preview path: /api)

REST API backend. Key routes:
- `POST /api/soil/analyze` — Submit soil data, get AI recommendations
- `GET /api/soil/submissions` — List all submissions (paginated)
- `GET /api/soil/submissions/:id` — Get single submission details
- `GET /api/soil/stats` — Admin dashboard stats

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Database Schema

- `soil_submissions` — stores farmer inputs + AI recommendations (crops JSON, fertilizers JSON, soil_corrections JSON, Tamil/English explanations)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
