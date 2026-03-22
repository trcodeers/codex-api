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

## Session Auth

The API now uses cookie-backed sessions alongside JWT responses:
- `POST /api/auth/register` creates a user and stores `userId` in the session.
- `POST /api/auth/login` authenticates and stores `userId` in the session.
- `GET /api/auth/me` returns the currently authenticated session user.

User login sessions are persisted in MongoDB through the `userSessions` collection, so session state survives Nest restarts instead of relying on the default in-memory store.

Configure session behavior with these environment variables:
- `SESSION_SECRET`
- `SESSION_COOKIE_NAME`
- `SESSION_COOKIE_MAX_AGE`
- `SESSION_COOKIE_SECURE`
- `SESSION_COOKIE_SAME_SITE`

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

## Admin APIs

Protected admin-only endpoints are available under `/api/admin` for question management and section-based test publishing workflows.

## Test Session APIs

The backend also exposes authenticated session APIs for starting, resuming, syncing, and submitting in-progress tests:
- `POST /api/tests/:testId/start-session`
- `GET /api/test-sessions/:sessionId`
- `PATCH /api/test-sessions/:sessionId`
- `POST /api/test-sessions/:sessionId/submit`
