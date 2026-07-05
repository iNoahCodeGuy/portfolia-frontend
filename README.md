# Portfolia — Frontend

The Next.js chat UI for **Portfolia**, Noah De La Calzada's AI portfolio assistant.
Live at **[noahdelacalzada.com](https://noahdelacalzada.com/)**.

Portfolia is a RAG-powered conversational portfolio: visitors chat with an assistant
that answers from a curated knowledge base about Noah's projects and background,
runs multi-step capture flows (contact form, crush confession), and executes real
side effects (Supabase writes, SMS, email) through a deterministic backend pipeline.

## How it fits together

```
Browser ──▶ this app (Next.js 14, Vercel)
              ├─ chat UI ──▶ FastAPI backend on Railway (${NEXT_PUBLIC_API_URL}/chat)
              │                └─ 22-node pipeline: intent routing → pgvector retrieval
              │                   → Claude Sonnet 4.5 generation → quality gates
              └─ /dashboard (password-protected) ──▶ /api/analytics (Supabase, server-side)
```

The backend lives in its own repo: [portfolia-backend](https://github.com/iNoahCodeGuy/portfolia-backend).

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev                  # http://localhost:3000
```

Point `NEXT_PUBLIC_API_URL` at a running backend (see the backend repo's README),
or the chat will show its error state.

## Environment variables

| Variable | Used by | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `lib/api.ts` | Base URL of the FastAPI backend |
| `DASHBOARD_PASSWORD` | `middleware.ts`, `/api/dashboard-auth` | Gates `/dashboard` and `/api/analytics`; fails closed if unset |
| `SUPABASE_URL` | `/api/analytics` routes | Supabase project URL (server-side only) |
| `SUPABASE_SERVICE_ROLE_KEY` | `/api/analytics` routes | Supabase service-role key (server-side only, never exposed to the client) |

## Structure

- `components/` — chat UI (message list, input, welcome buttons, inline forms)
- `app/dashboard/` — analytics dashboard behind signed-cookie session auth
- `app/api/` — server routes: dashboard login, analytics reads
- `lib/api.ts` — backend client
- `middleware.ts` — auth gate for dashboard routes

## License

MIT — see [LICENSE](LICENSE).
