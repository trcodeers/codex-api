# MockPrep Backend (NestJS + MongoDB)

Production-ready modular backend for mock test preparation platform.

## Setup

1. Copy env file:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run in dev:
   ```bash
   npm run start:dev
   ```

## Scripts

- `npm run build` - TypeScript production build to `dist/`
- `npm start` - Run compiled app from `dist/main.js`
- `npm run start:dev` - Run app with `ts-node`
- `npm run seed` - Seed exams, tests, and questions

## API Base Path

All routes are prefixed with `/api`.

## Seed Data

```bash
npm run seed
```


Seed also creates a sample aspirant user:
- Email: `sample@gmail.com`
- Password: `12345`
- Role: `Aspirant`

Mongo connection logs are printed on app startup (connected / error / disconnected).

On app startup, an idempotent seed runs to ensure default exams/questions and the sample user exist (without deleting existing data).

