# Barbazza

Barbershop management system — **TypeScript** stack with the **same Neon PostgreSQL data** and the **same Barbazza light classic look** (white panels, black accents, Cormorant display type).

```
backend/    Express + TypeScript API  →  :4000
frontend/   Next.js + Tailwind        →  :3000
```

## Roles

| Role | Screens |
| --- | --- |
| Admin | Dashboard, Performance, Daily Records, Users, Services |
| Manager | Operations, Floor (services/expenses), Expenses, Reports |
| Supervisor | Today + Day view (read-only) |
| Barber | Dashboard + Chair |

## Run

```bash
cp backend/.env.example backend/.env   # set DATABASE_URL + JWT_SECRET
cp frontend/.env.example frontend/.env.local

npm run install:all
npm run dev:api
npm run dev:web
```

Open [http://localhost:3000](http://localhost:3000). Use existing usernames/passwords from the database.

## Design

Colors and layout follow the existing Barbazza system (`www/styles.css`): light background, charcoal panels, black “gold” accent, header with logo + **BARBAZZA**, horizontal tabs on desktop, bottom tabs on phone for a native-app feel.

## GitHub

[github.com/ngamijex/the-barbazza](https://github.com/ngamijex/the-barbazza)
