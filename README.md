# Barbazza

Premium barbershop operations platform — **TypeScript**, **Next.js**, **Tailwind CSS**, and an **Express** API on the same Neon PostgreSQL database as before.

On a phone it behaves like a native app: safe areas, bottom tab bar, dark luxury chrome, and role-specific screens. On desktop you get a full console with the same data.

## Stack

| Layer | Tech |
| --- | --- |
| Language | TypeScript |
| Frontend | Next.js 15 (App Router) + Tailwind + Framer Motion + Recharts |
| Backend | Express + Zod + JWT + `pg` |
| Database | Existing Neon PostgreSQL (unchanged schema) |

```
backend/     API on :4000
frontend/    Web app on :3000
```

## Roles

| Role | Access |
| --- | --- |
| **Admin** | House overview, monthly performance (salon + barber), floor history, people, services |
| **Manager** | Record services & expenses, day floor, books/reports |
| **Supervisor** | Read-only day view: income, clients, expenses, net, chair breakdown |
| **Barber** | Personal chair: commission today & month, advances |

Recruitment advances **keep amount already paid** when edited. Admin can **Recover advance balances** from monthly salary deductions.

## Setup

1. Copy env files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

2. In `backend/.env` set your Neon `DATABASE_URL` and a strong `JWT_SECRET`.

3. Install & run:

```bash
npm run install:all
npm run dev:api    # terminal 1
npm run dev:web    # terminal 2
```

Open [http://localhost:3000](http://localhost:3000). Sign in with the same usernames/passwords already in the database (bcrypt via PostgreSQL `crypt()`).

## Mobile

- `viewport-fit=cover` + safe-area padding  
- Fixed bottom navigation (iOS-style tabs)  
- Apple web-app capable meta for home-screen install  

## GitHub

Repository: [github.com/ngamijex/the-barbazza](https://github.com/ngamijex/the-barbazza)

## Legacy R Shiny

The previous R Shiny app remains in this workspace for reference. Runtime secrets (`.env`, Google JSON keys) are gitignored — never commit them.
