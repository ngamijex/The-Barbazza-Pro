# Barbazza

The Barbazza barbershop system, rebuilt in TypeScript.

The shop still runs on the same Neon PostgreSQL database. What changed is the product around it: a typed API and a Next.js app that feels like a phone app in the hand and a desk console on a larger screen.

## Layout

```
backend/    Express + TypeScript API
frontend/   Next.js + Tailwind
```

## Roles

| Role | What they see |
| --- | --- |
| Admin | House numbers, monthly performance, people, service menu, any day’s floor |
| Manager | Record services and expenses, review a day, read closed-day books |
| Supervisor | Read-only day view: income, clients, expenses, net, chair breakdown |
| Barber | Personal chair: today’s commission and the month so far |

Recruitment advances keep the amount already paid when an admin edits the original advance. **Recover advance balances** rebuilds remaining balances from monthly salary deductions.

## Run it

1. Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL` plus `JWT_SECRET`.
2. Copy `frontend/.env.example` to `frontend/.env.local`.
3. Start both:

```bash
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The API listens on port 4000.

Sign in with the same usernames and passwords already stored in the database. Passwords stay as bcrypt hashes and are checked with PostgreSQL `crypt()`.
