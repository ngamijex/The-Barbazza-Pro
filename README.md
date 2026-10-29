# Barbazza Pro

TypeScript rebuild of the Barbazza barbershop management system.

Same Neon PostgreSQL database and data. Same light classic Barbazza brand (black accents on white, Cormorant Garamond). New stack: Express API + Next.js + Tailwind — built to feel like a native app on phones.

## Stack

| Layer | Tech |
|-------|------|
| Language | TypeScript |
| Frontend | Next.js 15, Tailwind CSS, Framer Motion, Recharts |
| Backend | Express, `pg`, JWT, Zod |
| Database | Existing Neon PostgreSQL (unchanged) |

## Folders

```
backend/     # REST API on port 4000
frontend/    # Next.js app on port 3000
```

## Roles

- **Admin** — dashboard, performance, daily records, users, services
- **Manager** — operations, floor, expenses, reports
- **Supervisor** — today + day view (read-only)
- **Barber** — personal dashboard + chair earnings

## Quick start

```bash
# 1. Install
npm run install:all

# 2. Configure backend/backend/.env
cp backend/.env.example backend/.env
# Set DATABASE_URL (Neon) and JWT_SECRET

# 3. Configure frontend
cp frontend/.env.example frontend/.env.local
# NEXT_PUBLIC_API_URL=http://localhost:4000

# 4. Run both
npm run dev:api
npm run dev:web
```

Open [http://localhost:3000](http://localhost:3000). On a phone (or Chrome device mode), the shell uses bottom tabs, safe-area padding, and standalone web-app meta — installable via “Add to Home Screen”.

## API (high level)

- `POST /api/auth/login` — bcrypt via Postgres `crypt`
- `GET /api/dashboard/overview` — admin KPIs + trend
- `GET /api/day` — floor snapshot for a date
- `POST /api/transactions` / `POST /api/expenses` — manager/admin writes
- `GET /api/barber/home` — chair earnings
- `GET /api/reports` — daily_reports range
- Users / services / barbers CRUD for admin

## Brand

Colors and layout follow the original Barbazza design tokens (light panels, black “gold” accent, burgundy logout). Do not replace with a dark/gold theme.

## Security notes

- Never commit `.env` or Google service-account JSON.
- Rotate Neon credentials if they were ever committed historically.
- Set a strong `JWT_SECRET` in production.
