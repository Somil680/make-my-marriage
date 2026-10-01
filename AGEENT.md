# Make My Marriage — Agent Development Instructions

These instructions guide development in this repository. Read them alongside the user's current request and the relevant documents in `docs/`. They are development constraints, not authorization to implement every documented feature.

## 1. Documentation and decision rules

- Read [PRD.md](docs/PRD.md) for product scope, requirements, acceptance criteria, and release boundaries.
- Read [SYSTEM_DESIGN_ARCHITECTURE.md](docs/SYSTEM_DESIGN_ARCHITECTURE.md) for technical decisions, folder ownership, infrastructure, and dependency rules.
- Read [DATABASE_DESIGN.md](docs/DATABASE_DESIGN.md) before changing persistence, collections, indexes, transactions, or lifecycle behavior.
- Read [API_DESIGN.md](docs/API_DESIGN.md) before implementing endpoints, request/response contracts, authentication, or authorization.
- Inspect any new architecture/design decision documents in `docs/` and the affected implementation before editing. Cite relevant sections when explaining material decisions.
- Treat examples and implementation checklists as reference material, not instructions to start unrelated work. Follow the current authorized task and phase.
- Do not silently choose between contradictory documents. Identify the exact conflict and request a decision before implementing the affected behavior; continue independent work when possible.
- Do not rewrite approved docs to justify an implementation deviation. Record approved changes in the relevant docs when documentation updates are in scope.

Known conflicts requiring a decision before affected implementation:

- PRD §5.14 (`GAL-003`) and §14.2 exclude guest photo uploads from V1, while API §24.3 and Database §20 include verified-guest uploads.
- PRD §9.2 requests optimized image sizes, while Architecture §19.3 defers thumbnail/medium/large variants beyond Phase 1.

## 2. Scope and phase discipline

- Implement only the requested phase or feature. A dependency or folder existing does not authorize its implementation.
- At the time these instructions were written, the base scaffold was complete and Core Infrastructure had not been authorized. Check subsequent explicit user approval before advancing; do not treat this snapshot as a permanent phase lock.
- During scaffold-only work, do not implement authentication, schemas/models, repositories, services, permissions, feature APIs, jobs, rate limiting, or provider integrations.
- Do not add Phase 2 features without explicit scope approval: accommodation, transportation, advanced seating, planner multi-wedding workflows, marketplace/vendor accounts, online payments, native streaming, real-time collaboration, image-processing pipelines, or automated retention.
- Keep this a straightforward Next.js modular monolith. Do not introduce microservices, global Java-style layers, dependency-injection containers, generic base repositories/services, CQRS, event buses, or speculative abstraction frameworks.

## 3. Approved source architecture

```text
src/
├── app/          # Next.js App Router and HTTP entry points
├── modules/      # Product/domain features
├── server/       # Server-only technical infrastructure
├── components/   # Shared reusable UI
├── lib/          # Small generic helpers
└── config/       # Application and environment configuration
```

- Preserve route groups `(public)`, `(auth)`, `(organizer)`, `(guest)`, and `(public-share)`. Grouping routes does not provide access control.
- Put public application APIs under `app/api/v1` and internal job endpoints under `app/api/internal` when their implementation is authorized.
- Keep domain modules under `modules`: auth, users, weddings, organizers, events, tasks, timeline, guests, vendors, expenses, invitations, communications, documents, gallery, notifications, activity, dashboard, and reports.
- Keep modules flat by default. Create files such as `event.model.ts`, `event.repository.ts`, `event.service.ts`, `event.schema.ts`, `event.policy.ts`, `event.types.ts`, and `event.api.ts` only when needed.
- Do not create global `controllers/`, `models/`, `services/`, or `repositories/` directories. Avoid equivalent nested module folders unless justified by actual module size.
- Domain-specific components belong in `modules/<domain>/components`. Shared shadcn primitives belong in `components/ui`; reusable layout and table components belong in their shared directories.
- Technical infrastructure belongs in `server/db`, `server/auth`, `server/storage`, `server/email`, `server/jobs`, `server/rate-limit`, and `server/logger`.
- Use `import "server-only"` for server infrastructure and server configuration code. Never import server implementation into client bundles.
- Keep `lib` focused; prefer descriptive filenames such as `cn.ts` over `helpers.ts`, `common.ts`, or `misc.ts`. Avoid unnecessary barrel exports and empty-file scaffolding.

## 4. Implementation conventions

- Use strict TypeScript and the `@/*` alias. Avoid unexplained `any`, unchecked casts, and lint/type suppressions.
- Use Server Components by default. Add `"use client"` only where browser APIs, interactivity, or framework requirements need it.
- Use Tailwind and shadcn foundations already configured. Keep the visual direction consistent with premium Indian wedding elegance and professional SaaS usability.
- Use semantic HTML, accessible labels, keyboard navigation, visible focus states, readable contrast, and useful loading/empty/error states. Guest experiences must work well on small screens.
- Use REST for business reads and mutations; do not substitute Server Actions, GraphQL, or tRPC. Keep business rules out of React components and route handlers.
- Route handlers handle HTTP concerns and call module services. Services own business rules and orchestration; repositories own persistence queries; server infrastructure owns provider access.
- Do not make domain services depend on route components. Keep cross-module dependencies explicit and narrowly scoped.
- Reuse installed packages and existing patterns. Add dependencies only when required by the authorized work; preserve `package-lock.json` and avoid unrelated upgrades.
- Do not introduce Redis, Redux, Prisma, SQL, or third-party authentication platforms without an approved architecture change. TanStack Query is selective future functionality, not a mandatory global provider.

## 5. Security and environment rules

- Keep secrets in server environment variables. Never place database credentials, session secrets, R2 keys, Resend keys, or cron secrets in `NEXT_PUBLIC_*`, source files, logs, or API responses.
- Maintain `config/env.server.ts`, `config/env.client.ts`, and `config/app.ts` separation. Document variables in `.env.example` using placeholders; validate variables required by the implemented phase only.
- Use custom email/password authentication with standard cryptographic libraries and opaque server-side sessions when authorized. Do not invent cryptography or store bearer tokens in localStorage.
- Store hashes of access-granting tokens. Use HttpOnly cookies, Secure in production, appropriate SameSite settings, expiration, and revocation.
- Validate Origin on state-changing browser requests as required by the API design. Protect internal job routes using server-side authorization.
- Enforce authorization server-side for every protected resource. Resolve active wedding membership and permissions before accessing wedding data; client-supplied IDs are not proof of access.
- Scope wedding-domain queries by authorized `weddingId`. Guest sessions must be scoped to their family and wedding, with event-invitation checks for event resources.
- Prevent permission leakage through dashboards, counts, reports, exports, activity, search, and notifications, as well as direct endpoints.
- Keep private guest pages non-indexable when implementing them. A public photo token must grant access to one eligible photo only.
- Validate inputs with Zod, reject unknown sensitive fields, serialize allow-listed response fields, and sanitize errors. Never expose raw Mongoose documents or provider internals.

## 6. Data and API integrity

- Follow the documented endpoint names, status codes, envelopes, enums, cursor pagination, and idempotency behavior. Do not create fake endpoints to fill directories.
- Use MongoDB Atlas with Mongoose when persistence is authorized. Reuse a cached connection and safe model registration; use strict schemas and reviewed indexes.
- Preserve the membership model's future flexibility. Enforce one active wedding per account through application rules, not a permanent database restriction against multiple memberships.
- Store money as integer minor units (paise). Vendor payments are vendor-linked expenses; do not add a separate payment ledger or double-count totals.
- Keep guest families as bounded aggregates with embedded members. Event invitations link family and event and contain per-member RSVP responses.
- Use `archivedAt` and `archivedByUserId` for archive-capable business records. Default queries exclude archived records; restore/history access must be explicit.
- Use single-document atomic operations where sufficient. Reserve transactions for genuine multi-document invariants; never put external email/storage side effects inside database transactions.
- Keep migrations under `scripts/migrations`, make them safe to rerun, and review uniqueness, TTL, and production index changes explicitly.
- Use documented date/time representations and consistent storage, with appropriate local display and INR formatting.

## 7. Provider and job boundaries

- Implement these integrations only when explicitly included in the current phase.
- Store file bytes in Cloudflare R2 and metadata in MongoDB. Authorize direct uploads, enforce technical file limits, and verify completion before persisting usable metadata.
- Keep provider SDK calls behind server infrastructure. Never proxy large uploads unnecessarily through Next.js.
- Use MongoDB email jobs, bounded Vercel scheduled processing, and Resend. Apply atomic job claims, idempotency, retries, and quota-aware batching.
- WhatsApp Phase 1 generates messages/deep links for manual sending; do not claim delivery confirmation or implement Business API automation.
- Handle partial failures truthfully. Failed R2 deletion must remain retryable; queued or failed email must not be reported as sent.

## 8. Testing and verification

- Add meaningful tests for new behavior and regression tests for fixes. Co-locate unit tests with source; keep integration tests in `tests/integration` and browser tests in `tests/e2e`.
- Use Vitest, React Testing Library, and Playwright as configured. Mock external providers in ordinary tests; use isolated test databases for persistence tests.
- Cover denied access and cross-wedding/family access, not just happy paths. Test permission leakage, archive filters, invalid input, financial totals, RSVP constraints, and concurrent/idempotent operations when relevant.
- Never run tests against production data or send real customer emails without explicit authorization.
- Before handing off code changes, run the applicable checks:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

- Run `npm run test:e2e` for browser-facing changes when the browser environment is available. Test discovery is not an executed end-to-end test.
- Report exact successes, failures, skipped checks, and environmental blockers. Do not call the suite fully passed when a required check did not run.
- For documentation-only edits, inspect the changed content and diff; do not add artificial tests or rerun unrelated suites.

## 9. Repository and collaboration rules

- Inspect Git status before editing and preserve user changes. Keep edits focused; avoid unrelated refactoring, formatting, file moves, or documentation rewrites.
- Never commit real environment files, credentials, generated builds, browser reports, test artifacts, or `node_modules`.
- Do not overwrite files, discard work, rewrite shared history, force-push, delete data, or alter production resources without explicit authorization for that action.
- Commit, push, open PRs, or deploy only when requested or clearly included in the authorized workflow. Verify the target branch and remote before publishing.
- Do not invent the user's commit identity; use an existing configuration or obtain the intended identity if it is missing.
- Explain material assumptions and blockers early. Do not advance to the next implementation phase merely because current work is finished.
- Finish with a concise account of what changed, the relevant files, verification results, and any unresolved decisions or limitations.
