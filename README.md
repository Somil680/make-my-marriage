# Make My Marriage

A production-oriented wedding planning platform built as a modular Next.js monolith.

## Current phase

Base project scaffold. Product features and external integrations are intentionally not implemented yet.

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and set values needed by the current phase.
3. Start the app with `npm run dev`.

## Scripts

- `npm run dev` — run the development server
- `npm run build` — create a production build
- `npm start` — serve the production build
- `npm run lint` — run ESLint
- `npm run typecheck` — run TypeScript without emitting files
- `npm test` — run Vitest once
- `npm run test:watch` — run Vitest in watch mode
- `npm run test:e2e` — run Playwright end-to-end tests

## Architecture

- `src/app` — App Router pages, layouts, and HTTP entry points
- `src/modules` — product domain boundaries
- `src/server` — server-only technical infrastructure
- `src/components` — shared reusable UI
- `src/lib` — small framework-agnostic utilities
- `src/config` — application and environment configuration
- `tests` — integration, end-to-end, fixture, and test-support code

Product and technical design documents live in [`docs`](./docs).
