# Make My Marriage — API Design

**Phase 1 | REST API Contract | Final v1.0**

**Last updated:** 24 September 2026

> **API principle:** Expose one predictable REST contract over the modular monolith. Every request is explicitly authenticated, authorized, validated, tenant-scoped, and mapped to a domain service before data access.

## Document Metadata

| Item | Value |
|---|---|
| Status | Final — Phase 1 |
| Companion PRD | Make My Marriage Product Requirements Document v1.0 |
| Companion architecture | Make My Marriage System Design & Architecture v1.0 |
| Companion database design | Make My Marriage Database Design Final v1.0 |
| API style | REST over HTTPS |
| Framework | Next.js App Router Route Handlers |
| Runtime | Node.js on Vercel |
| Validation | Zod |
| Authentication | Custom email/password + opaque server session |
| Database | MongoDB Atlas + Mongoose |
| File storage | Cloudflare R2 |
| Email provider | Resend |

# Contents

- 1. Document Purpose and Scope
- 2. API Design Goals and Principles
- 3. Base Path, Versioning, and Environments
- 4. Resource Naming and HTTP Semantics
- 5. Authentication Contexts and Cookies
- 6. Standard Request Processing Pipeline
- 7. Data Representation Conventions
- 8. Standard Success Responses
- 9. Standard Error Model
- 10. Pagination, Filtering, Sorting, and Search
- 11. Idempotency, Retries, and Concurrency
- 12. Authentication and Account APIs
- 13. Wedding APIs
- 14. Organizer, Membership, and Permission APIs
- 15. Event APIs
- 16. Task APIs
- 17. Timeline APIs
- 18. Vendor APIs
- 19. Expense APIs
- 20. Guest Family APIs
- 21. Event Invitation and Organizer RSVP APIs
- 22. Private Guest Access and Guest RSVP APIs
- 23. Document and Direct Upload APIs
- 24. Gallery, Guest Upload, Moderation, and Share APIs
- 25. Communication APIs — Email and WhatsApp
- 26. Notification and Activity APIs
- 27. Dashboard and Report APIs
- 28. Internal Cron and Background Job APIs
- 29. Authorization and Permission Enforcement
- 30. Rate Limiting and Abuse Protection
- 31. Security and Privacy Requirements
- 32. API-to-Database Mapping
- 33. Complete Phase 1 Endpoint Catalogue
- 34. Deferred / Future APIs
- 35. Implementation Checklist
- 36. API Decision Log

# 1. Document Purpose and Scope

This document defines the Phase 1 REST API contract for Make My Marriage. It translates the approved PRD, system architecture, and MongoDB design into HTTP resources, request/response contracts, authentication rules, permission checks, validation rules, failure semantics, upload flows, background-job interfaces, and endpoint naming conventions.

The API is implemented inside the same Next.js modular-monolith repository as the web UI, but all business mutations and resource reads exposed to the browser go through REST Route Handlers under `/api/v1`. Server Actions are not the business API.

## 1.1 In Scope

- Organizer authentication, email/password account flows, opaque sessions, and password recovery.
- Wedding creation and management.
- Organizer invitations, memberships, module permissions, and status changes.
- Events, tasks, timeline items, vendors, and expenses.
- Family-based guest management and event-specific invitations.
- Private guest invitation verification and RSVP submission.
- Cloudflare R2 direct-upload authorization and resource finalization.
- Gallery albums, organizer/verified-guest uploads, moderation, and single-photo sharing.
- Resend email campaign creation and MongoDB-backed queued delivery.
- WhatsApp message preparation/deep-link generation without provider automation.
- Dashboard summaries, notifications, activity history, and reports.
- Internal scheduled endpoints used by Vercel Cron.

## 1.2 Explicitly Out of Scope

- GraphQL, tRPC, gRPC, WebSockets, or realtime subscriptions.
- Native mobile-specific APIs.
- Vendor marketplace / Google Places APIs.
- Vendor accounts or vendor portal APIs.
- Online payments, escrow, payment gateway webhooks, or accounting-ledger APIs.
- Accommodation, transport, and advanced seating APIs.
- Native livestream ingestion or streaming APIs.
- Automated image transformation or thumbnail-processing APIs.
- Automatic post-wedding retention/deletion APIs.

# 2. API Design Goals and Principles

| Principle | Phase 1 Decision |
|---|---|
| REST first | Use explicit resources and HTTP methods; no hidden mutation path outside the REST API. |
| Wedding tenant boundary | Wedding-domain endpoints carry `weddingId` in the path and repositories also filter by `weddingId`. |
| Thin Route Handlers | Route Handler -> auth -> Zod -> authorization -> service -> repository -> response. |
| Predictable JSON | camelCase fields, ISO timestamps, ObjectIds serialized as strings, money as integer minor units. |
| Archive-first resources | `DELETE` on business resources archives them unless the endpoint explicitly documents technical hard deletion. |
| No raw secrets in responses/logs | Session tokens, token hashes, password hashes, internal moderation/audit identifiers, and provider secrets are never returned. |
| One source of financial truth | All money actually paid is created as an `expense`; no vendor-payment API exists in Phase 1. |
| Guest privacy | Guest APIs expose only the verified family's permitted wedding/event/gallery scope. |
| Asynchronous email | Bulk email requests queue work and return quickly; HTTP requests do not send hundreds of emails synchronously. |
| Direct file transfer | Large file bytes move browser <-> R2, not browser -> Next.js -> R2. |
| Query-driven lists | Large resources use cursor pagination and allowlisted filters/sorts. |

# 3. Base Path, Versioning, and Environments

## 3.1 Public API Base

```text
/api/v1
```

Examples:

```text
POST /api/v1/auth/login
GET  /api/v1/weddings/:weddingId/events
POST /api/v1/weddings/:weddingId/expenses
```

## 3.2 Internal API Base

Scheduled/background-only endpoints are not part of the browser-facing versioned API:

```text
/api/internal/jobs/...
```

These endpoints require a server-only secret and must reject ordinary browser sessions.

## 3.3 Versioning Rules

- Breaking request or response changes require a new major URL namespace such as `/api/v2`.
- Adding optional response fields is non-breaking.
- Adding optional request fields is non-breaking.
- Removing or renaming fields is breaking.
- Changing enum meaning or authorization semantics is breaking unless the old behavior remains supported.
- Phase 1 does not use per-client API version headers.

## 3.4 Environments

| Environment | Purpose |
|---|---|
| Local | Developer machine and local/test dependencies. |
| Preview | Vercel preview deployment; uses non-production secrets/data. |
| Production | Production Vercel deployment and production Atlas/R2/Resend configuration. |

API responses must never reveal which internal environment/database cluster is being used.

# 4. Resource Naming and HTTP Semantics

## 4.1 URL Rules

- Use plural resource nouns: `/events`, `/tasks`, `/vendors`, `/expenses`.
- Use kebab-case path names where multiple words are required: `/guest-families`, `/organizer-invitations`.
- JSON fields use camelCase.
- Avoid action verbs when CRUD semantics are sufficient.
- Explicit action endpoints are acceptable for state transitions that do not map cleanly to CRUD, such as `/queue`, `/verify`, `/read-all`, or `/logout`.

## 4.2 HTTP Methods

| Method | Meaning |
|---|---|
| GET | Read resource(s); no state mutation. |
| POST | Create a resource or execute a non-idempotent domain action. |
| PUT | Full replacement/upsert only where the resource naturally has a stable composite identity. Used sparingly. |
| PATCH | Partial update or controlled state change. |
| DELETE | Archive a business resource by default; hard deletion is not implied. |

## 4.3 Status Codes

| Status | Use |
|---|---|
| 200 OK | Successful read/update/action with response body. |
| 201 Created | Resource created. |
| 202 Accepted | Background work queued, e.g. email campaign delivery. |
| 204 No Content | Successful logout/archive/action requiring no response body. |
| 400 Bad Request | Invalid JSON/query shape or Zod validation failure. |
| 401 Unauthorized | No valid organizer/guest session. |
| 403 Forbidden | Authenticated but permission/action is not allowed. |
| 404 Not Found | Resource absent or not visible inside caller's authorized wedding scope. |
| 409 Conflict | Uniqueness/state conflict: duplicate membership, invite already accepted, resource already archived, etc. |
| 413 Payload Too Large | File metadata requests exceed technical upload limit. |
| 415 Unsupported Media Type | Unsupported upload MIME type. |
| 429 Too Many Requests | Rate limit exceeded. |
| 500 Internal Server Error | Unexpected server error. |
| 502 Bad Gateway | External provider operation failed synchronously where no queue fallback exists. |
| 503 Service Unavailable | Temporary dependency or scheduled-job availability issue. |

> **Tenant-enumeration rule:** If a valid ID belongs to a different wedding than the caller can access, prefer `404` instead of revealing that the resource exists.

# 5. Authentication Contexts and Cookies

The API has three authentication contexts.

## 5.1 Organizer Session

Created after email/password login.

Cookie concept:

```text
mmm_session=<opaque-random-token>
HttpOnly
Secure (production)
SameSite=Lax
Path=/
```

MongoDB stores only the token hash. Route Handlers resolve the cookie to a `sessions` document, then a `users` document.

## 5.2 Guest Wedding Session

Created after a family invitation token + invited email are successfully verified.

```text
mmm_guest_session=<opaque-random-token>
HttpOnly
Secure (production)
SameSite=Lax
Path=/
```

The guest session is bound to one `weddingId` and one `familyId`. It does not grant organizer/dashboard access.

## 5.3 Internal Job Authentication

Internal cron/job routes require a server-side secret, for example:

```text
Authorization: Bearer <CRON_SECRET>
```

The secret must never be exposed to browser bundles or returned from any API.

## 5.4 Unsafe Request Origin Checks

Because organizer and guest authentication use cookies, every state-changing browser request (`POST`, `PUT`, `PATCH`, `DELETE`) must validate the request `Origin` against the configured application origin. SameSite cookies reduce CSRF risk, but Origin validation remains mandatory in Phase 1.

# 6. Standard Request Processing Pipeline

Every browser-facing Route Handler follows the same pipeline.

```text
HTTP request
  -> request ID
  -> origin check for unsafe method
  -> resolve organizer or guest session
  -> parse route/query/body with Zod
  -> resolve wedding tenancy context
  -> permission check
  -> domain service
  -> repository / provider abstraction
  -> activity log where applicable
  -> serialize safe response
```

## 6.1 Handler Responsibilities

Route Handlers may:

- read route/query/body data;
- call session/auth helpers;
- execute Zod schemas;
- call permission helpers;
- map domain errors to HTTP errors;
- call one application service entry point;
- serialize response.

Route Handlers should not contain:

- Mongoose queries directly;
- R2 SDK calls directly;
- Resend SDK calls directly;
- complex RSVP/permission/expense business logic;
- large aggregation pipelines;
- duplicated normalization logic.

# 7. Data Representation Conventions

## 7.1 IDs

MongoDB ObjectIds are serialized as strings.

```json
{
  "id": "66f2ec8f0e6d1f7819ec04b1"
}
```

Request validation rejects malformed ObjectId strings before repository access.

## 7.2 Date and Time

All API timestamps are ISO 8601 UTC strings.

```json
{
  "startAt": "2027-02-22T13:30:00.000Z"
}
```

The frontend renders these in the wedding/user timezone.

## 7.3 Money

All monetary values use integer minor units.

```json
{
  "amountMinor": 3000000,
  "currency": "INR"
}
```

`3000000` means ₹30,000.00. Floating-point currency values are rejected.

## 7.4 Boolean and Nullable Fields

- Omitted field: no change / not supplied.
- Explicit `null`: only accepted for fields documented as clearable.
- `false` is never treated as missing.

## 7.5 Enums

API enums use uppercase snake-case values matching the database/domain enums.

```json
{
  "status": "IN_PROGRESS"
}
```

Unknown enum values produce `400 VALIDATION_ERROR`.

## 7.6 Archived Data

Default list/read endpoints exclude archived business records unless the endpoint explicitly supports `includeArchived=true` and the caller has suitable organizer access.

# 8. Standard Success Responses

## 8.1 Single Resource

```json
{
  "data": {
    "id": "66f2ec8f0e6d1f7819ec04b1",
    "name": "Sangeet"
  },
  "meta": {
    "requestId": "req_01J8..."
  }
}
```

## 8.2 Collection

```json
{
  "data": [
    { "id": "...", "name": "Haldi" },
    { "id": "...", "name": "Sangeet" }
  ],
  "meta": {
    "requestId": "req_01J8...",
    "page": {
      "limit": 25,
      "nextCursor": "eyJjcmVhdGVkQXQiOi...",
      "hasMore": true
    }
  }
}
```

## 8.3 Background Work Accepted

```json
{
  "data": {
    "campaignId": "66f...",
    "status": "QUEUED",
    "recipientCount": 642
  },
  "meta": {
    "requestId": "req_01J8..."
  }
}
```

HTTP status: `202 Accepted`.

# 9. Standard Error Model

All non-2xx JSON errors follow one shape.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields are invalid.",
    "requestId": "req_01J8...",
    "fields": [
      {
        "path": "email",
        "message": "Enter a valid email address."
      }
    ]
  }
}
```

## 9.1 Standard Error Codes

| Code | Typical HTTP | Meaning |
|---|---:|---|
| VALIDATION_ERROR | 400 | Body/query/route validation failed. |
| INVALID_CREDENTIALS | 401 | Login credentials invalid. |
| SESSION_REQUIRED | 401 | Organizer session missing/expired. |
| GUEST_SESSION_REQUIRED | 401 | Guest session missing/expired. |
| EMAIL_NOT_VERIFIED | 403 | Action requires verified organizer email. |
| PERMISSION_DENIED | 403 | Organizer lacks module permission. |
| RESOURCE_NOT_FOUND | 404 | Missing or inaccessible resource. |
| RESOURCE_ARCHIVED | 409 | Action is not allowed on archived resource. |
| DUPLICATE_RESOURCE | 409 | Unique constraint would be violated. |
| INVALID_STATE | 409 | State transition is not allowed. |
| INVITATION_EXPIRED | 409 | Organizer/guest invitation is expired/revoked. |
| RSVP_CLOSED | 409 | RSVP is no longer accepted if a future rule enables closure. |
| UPLOAD_NOT_ALLOWED | 403 | Album policy/session does not permit upload. |
| UNSUPPORTED_FILE_TYPE | 415 | MIME type not allowed. |
| FILE_TOO_LARGE | 413 | Per-file technical size limit exceeded. |
| RATE_LIMITED | 429 | Endpoint-specific rate limit exceeded. |
| PROVIDER_UNAVAILABLE | 503 | Temporary dependency failure. |
| INTERNAL_ERROR | 500 | Unexpected server error. |

Provider SDK error bodies must not be passed directly to clients.

# 10. Pagination, Filtering, Sorting, and Search

## 10.1 Cursor Pagination

Potentially large resources use cursor pagination:

```text
?limit=25&cursor=<opaque-cursor>
```

Rules:

- default limit: 25;
- maximum limit: 100;
- cursor is opaque to clients;
- cursor encodes stable sort position, normally timestamp + `_id` tie-breaker;
- malformed/expired cursor returns `400 VALIDATION_ERROR`.

Small bounded resources such as event lists may return all active records without pagination.

## 10.2 Search

Phase 1 uses MongoDB-backed search only. Endpoint-specific `search` values are normalized and applied only to allowlisted fields.

Example:

```text
GET /guest-families?search=agrawal
```

## 10.3 Sorting

Clients may only request allowlisted sort fields. Arbitrary MongoDB field names are never accepted.

Example:

```text
?sort=dueAt&order=asc
```

## 10.4 Common Filters

| Resource | Filters |
|---|---|
| tasks | status, priority, eventId, assignedMembershipId, overdue |
| vendors | status, category, eventId |
| expenses | vendorId, eventId, category, dateFrom, dateTo, paidByMembershipId |
| guest-families | side, search, eventId, rsvpStatus |
| event-invitations | eventId, rsvpStatus, familyId |
| gallery-photos | albumId, moderationStatus (organizer only), uploadedByType (moderation only) |
| communication campaigns | channel, type, status |
| activity logs | entityType, entityId |

# 11. Idempotency, Retries, and Concurrency

## 11.1 Idempotency-Key Header

High-impact create/queue operations should accept:

```text
Idempotency-Key: <client-generated-uuid>
```

Phase 1 requires it for:

- queueing an email campaign;
- regenerating large event invitation sets where duplicate creation is harmful;
- any future endpoint documented as retry-safe through an idempotency key.

For normal CRUD, database unique constraints and state predicates are preferred over a universal idempotency store.

## 11.2 Double-Submit Protection

Services must use atomic predicates where state matters.

Example organizer invite acceptance:

```text
status must equal PENDING
```

The service performs membership creation and invitation acceptance inside one MongoDB transaction.

## 11.3 Update Concurrency

Phase 1 uses last-write-wins for ordinary non-financial/non-security metadata updates. The API returns `updatedAt`; no ETag/If-Match requirement is imposed in Phase 1.

# 12. Authentication and Account APIs

## 12.1 Endpoint Summary

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/signup` | Public | Create organizer user account. |
| POST | `/auth/login` | Public | Authenticate and create organizer session. |
| POST | `/auth/logout` | Organizer | Revoke current session and clear cookie. |
| GET | `/auth/session` | Optional organizer | Return current organizer session/user summary. |
| POST | `/auth/email/verify` | Public token | Verify account email token. |
| POST | `/auth/password/forgot` | Public | Queue password-reset email if account exists. |
| POST | `/auth/password/reset` | Public token | Reset password and revoke existing sessions as configured. |
| POST | `/auth/password/change` | Organizer | Change current password after current-password verification. |

## 12.2 `POST /auth/signup`

Request:

```json
{
  "name": "Somil Agrawal",
  "email": "somil@example.com",
  "password": "strong-password"
}
```

Rules:

- normalize email before uniqueness lookup;
- password is hashed with the configured password-hashing library; raw password is never persisted/logged;
- duplicate email returns `409 DUPLICATE_RESOURCE`;
- account creation may queue a verification email;
- signup is rate-limited by IP and normalized email.

Response: `201 Created`.

```json
{
  "data": {
    "user": {
      "id": "...",
      "name": "Somil Agrawal",
      "email": "somil@example.com",
      "emailVerified": false
    }
  },
  "meta": { "requestId": "..." }
}
```

## 12.3 `POST /auth/login`

Request:

```json
{
  "email": "somil@example.com",
  "password": "strong-password"
}
```

Success creates the opaque session cookie. Invalid email and invalid password intentionally return the same `401 INVALID_CREDENTIALS` response.

## 12.4 `GET /auth/session`

If authenticated:

```json
{
  "data": {
    "authenticated": true,
    "user": {
      "id": "...",
      "name": "Somil Agrawal",
      "email": "somil@example.com",
      "emailVerified": true
    },
    "activeWedding": {
      "id": "...",
      "role": "OWNER"
    }
  },
  "meta": { "requestId": "..." }
}
```

If not authenticated, return `200` with `authenticated:false`; protected endpoints still return `401`.

# 13. Wedding APIs

## 13.1 Endpoint Summary

| Method | Path | Permission | Purpose |
|---|---|---|---|
| POST | `/weddings` | Authenticated user | Create Phase 1 wedding + owner membership. |
| GET | `/weddings` | Organizer | List weddings visible to current user; Phase 1 normally returns one. |
| GET | `/weddings/:weddingId` | wedding VIEW | Get wedding configuration. |
| PATCH | `/weddings/:weddingId` | wedding MANAGE or OWNER | Update wedding details/settings. |
| DELETE | `/weddings/:weddingId` | OWNER | Archive wedding; does not perform Phase 2 retention cleanup. |

## 13.2 `POST /weddings`

Request:

```json
{
  "couple": {
    "brideName": "Ananya",
    "groomName": "Somil"
  },
  "title": "Somil & Ananya",
  "startDate": "2027-02-21T00:00:00.000Z",
  "endDate": "2027-02-23T23:59:59.000Z",
  "primaryCity": "Indore"
}
```

Rules:

- Phase 1 service rejects creation if user already has an active wedding membership;
- create `weddings` + OWNER `wedding_memberships` in one transaction;
- transaction does not include email, storage, or external provider operations.

Response: `201 Created`.

## 13.3 `PATCH /weddings/:weddingId`

Accepts a controlled partial body. Example:

```json
{
  "title": "Somil Weds Ananya",
  "website": {
    "enabled": true,
    "sections": {
      "story": true,
      "schedule": true,
      "gallery": true,
      "livestream": false,
      "contacts": true
    }
  }
}
```

Unknown top-level fields are rejected by Zod strict schemas.

# 14. Organizer, Membership, and Permission APIs

## 14.1 Endpoint Summary

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/weddings/:weddingId/memberships` | OWNER or wedding MANAGE | List organizers/memberships. |
| GET | `/weddings/:weddingId/memberships/:membershipId` | OWNER or wedding MANAGE | Get organizer membership. |
| PATCH | `/weddings/:weddingId/memberships/:membershipId` | OWNER | Update relationship, permissions, assigned events, or status. |
| DELETE | `/weddings/:weddingId/memberships/:membershipId` | OWNER | Disable/archive organizer membership. |
| GET | `/weddings/:weddingId/organizer-invitations` | OWNER | List organizer invitations. |
| POST | `/weddings/:weddingId/organizer-invitations` | OWNER | Invite organizer by email. |
| PATCH | `/weddings/:weddingId/organizer-invitations/:invitationId` | OWNER | Revoke/update pending invite. |
| POST | `/organizer-invitations/:token/accept` | Authenticated user | Accept invite and create membership. |

## 14.2 Permission Payload

```json
{
  "permissions": {
    "wedding": "VIEW",
    "events": "MANAGE",
    "tasks": "MANAGE",
    "guests": "MANAGE",
    "vendors": "VIEW",
    "expenses": "NONE",
    "invitations": "MANAGE",
    "communication": "NONE",
    "gallery": "MANAGE",
    "documents": "VIEW"
  }
}
```

Allowed values:

```text
NONE | VIEW | MANAGE
```

OWNER bypasses this permission map and cannot be demoted through the ordinary organizer update endpoint.

## 14.3 Organizer Invitation Acceptance

`POST /organizer-invitations/:token/accept`

Rules:

- requires authenticated user;
- token is hashed before lookup;
- invitation email must match authenticated user's normalized email;
- invite must be PENDING and not expired/revoked;
- Phase 1 one-active-wedding rule must pass;
- membership creation + invite status change use one MongoDB transaction;
- raw token is never written to logs.

# 15. Event APIs

## 15.1 Endpoint Summary

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/weddings/:weddingId/events` | events VIEW | List active events chronologically. |
| POST | `/weddings/:weddingId/events` | events MANAGE | Create event. |
| GET | `/weddings/:weddingId/events/:eventId` | events VIEW | Get event. |
| PATCH | `/weddings/:weddingId/events/:eventId` | events MANAGE | Update event. |
| DELETE | `/weddings/:weddingId/events/:eventId` | events MANAGE | Archive/cancel event according to service rules. |

## 15.2 Create Event Request

```json
{
  "name": "Sangeet",
  "type": "SANGEET",
  "description": "Family performances and dinner",
  "startAt": "2027-02-22T13:30:00.000Z",
  "endAt": "2027-02-22T18:30:00.000Z",
  "venue": {
    "name": "Grand Palace",
    "address": "Indore, Madhya Pradesh",
    "mapUrl": "https://maps.example/..."
  },
  "dressCode": "Traditional"
}
```

Rules:

- `endAt` cannot precede `startAt`;
- event always inherits `weddingId` from route, never from request body;
- deleting an event with historical RSVP/expense/activity data archives it instead of cascading hard deletion.

# 16. Task APIs

## 16.1 Endpoint Summary

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/weddings/:weddingId/tasks` | tasks VIEW | List/filter tasks. |
| POST | `/weddings/:weddingId/tasks` | tasks MANAGE | Create task. |
| GET | `/weddings/:weddingId/tasks/:taskId` | tasks VIEW | Get task. |
| PATCH | `/weddings/:weddingId/tasks/:taskId` | tasks MANAGE | Update task/status/assignee/checklist. |
| DELETE | `/weddings/:weddingId/tasks/:taskId` | tasks MANAGE | Archive task. |

## 16.2 Create Task Request

```json
{
  "eventId": "...",
  "assignedMembershipId": "...",
  "title": "Finalize Sangeet playlist",
  "description": "Confirm songs with choreographer",
  "priority": "HIGH",
  "dueAt": "2027-02-15T12:00:00.000Z",
  "checklist": [
    { "title": "Collect family song choices" },
    { "title": "Confirm DJ final list" }
  ]
}
```

The service validates that referenced event/membership belong to the same wedding.

## 16.3 Checklist Update

Checklist items are embedded. A normal `PATCH /tasks/:taskId` can update a checklist item using its embedded item ID rather than exposing a separate checklist REST resource in Phase 1.

# 17. Timeline APIs

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/weddings/:weddingId/timeline-items` | events VIEW | List run-sheet items; filter by eventId. |
| POST | `/weddings/:weddingId/timeline-items` | events MANAGE | Create timeline item. |
| GET | `/weddings/:weddingId/timeline-items/:timelineItemId` | events VIEW | Get item. |
| PATCH | `/weddings/:weddingId/timeline-items/:timelineItemId` | events MANAGE | Update item. |
| DELETE | `/weddings/:weddingId/timeline-items/:timelineItemId` | events MANAGE | Archive item. |

Create example:

```json
{
  "eventId": "...",
  "title": "Bride entry",
  "startAt": "2027-02-23T07:15:00.000Z",
  "location": "Main Lawn",
  "responsibleMembershipId": "...",
  "notes": "Coordinate with photographer and music team"
}
```

# 18. Vendor APIs

## 18.1 Endpoint Summary

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/weddings/:weddingId/vendors` | vendors VIEW | List/filter vendors. |
| POST | `/weddings/:weddingId/vendors` | vendors MANAGE | Create vendor. |
| GET | `/weddings/:weddingId/vendors/:vendorId` | vendors VIEW | Get vendor. |
| PATCH | `/weddings/:weddingId/vendors/:vendorId` | vendors MANAGE | Update vendor. |
| DELETE | `/weddings/:weddingId/vendors/:vendorId` | vendors MANAGE | Archive vendor. |

## 18.2 Create Vendor Request

```json
{
  "name": "Royal Photography",
  "category": "PHOTOGRAPHER",
  "contactPerson": "Amit Sharma",
  "phone": "+919999999999",
  "email": "amit@example.com",
  "whatsapp": "+919999999999",
  "eventIds": ["...", "..."],
  "status": "CONFIRMED",
  "agreedAmountMinor": 15000000,
  "notes": "Covers Sangeet, Wedding and Reception"
}
```

Vendor `agreedAmountMinor` is optional commercial context. It is not a payment ledger. Amounts actually paid are stored only as expenses.

# 19. Expense APIs

## 19.1 Endpoint Summary

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/weddings/:weddingId/expenses` | expenses VIEW | List/filter expenses. |
| POST | `/weddings/:weddingId/expenses` | expenses MANAGE | Record actual spend. |
| GET | `/weddings/:weddingId/expenses/:expenseId` | expenses VIEW | Get expense. |
| PATCH | `/weddings/:weddingId/expenses/:expenseId` | expenses MANAGE | Update expense. |
| DELETE | `/weddings/:weddingId/expenses/:expenseId` | expenses MANAGE | Archive expense. |

## 19.2 Create Expense Request

```json
{
  "vendorId": "...",
  "eventId": "...",
  "title": "Photographer advance",
  "category": "PHOTOGRAPHY",
  "amountMinor": 3000000,
  "expenseDate": "2027-01-12T00:00:00.000Z",
  "paymentStage": "ADVANCE",
  "paidByMembershipId": "...",
  "paymentMethod": "UPI",
  "receiptDocumentId": "...",
  "notes": "Advance paid after contract confirmation"
}
```

Rules:

- `amountMinor` must be positive integer;
- referenced vendor/event/membership/document must belong to same wedding;
- there is no `vendorPaymentId`, payment-status endpoint, or separate payment collection in Phase 1;
- vendor paid/remaining totals are calculated from vendor-linked active expenses.

# 20. Guest Family APIs

## 20.1 Endpoint Summary

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/weddings/:weddingId/guest-families` | guests VIEW | Paginated/filterable family list. |
| POST | `/weddings/:weddingId/guest-families` | guests MANAGE | Create family and members. |
| GET | `/weddings/:weddingId/guest-families/:familyId` | guests VIEW | Get family. |
| PATCH | `/weddings/:weddingId/guest-families/:familyId` | guests MANAGE | Update family/members. |
| DELETE | `/weddings/:weddingId/guest-families/:familyId` | guests MANAGE | Archive family according to lifecycle rules. |
| POST | `/weddings/:weddingId/guest-families/:familyId/invitation-access` | invitations MANAGE | Create/rotate private family invitation token and return shareable URL once. |

## 20.2 Create Family Request

```json
{
  "familyName": "Agrawal Family",
  "primaryContact": {
    "name": "Rajesh Agrawal",
    "email": "rajesh@example.com",
    "phone": "+919999999999"
  },
  "side": "GROOM",
  "relationship": "UNCLE",
  "members": [
    { "name": "Rajesh Agrawal", "ageGroup": "ADULT" },
    { "name": "Sunita Agrawal", "ageGroup": "ADULT" },
    { "name": "Rohan Agrawal", "ageGroup": "ADULT" },
    { "name": "Priya Agrawal", "ageGroup": "ADULT" }
  ]
}
```

The response exposes embedded member IDs because event invitations/RSVPs refer to them.

## 20.3 Invitation Access Rotation

`POST /guest-families/:familyId/invitation-access`

Response:

```json
{
  "data": {
    "familyId": "...",
    "invitationUrl": "https://app.example.com/invite/<raw-token>",
    "generatedAt": "2026-09-24T00:00:00.000Z"
  },
  "meta": { "requestId": "..." }
}
```

The raw token is returned only at generation time. MongoDB stores its hash. Rotating the token invalidates the previous link.

# 21. Event Invitation and Organizer RSVP APIs

This API models the many-to-many relation between an event and a guest family.

## 21.1 Endpoint Summary

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/weddings/:weddingId/event-invitations` | guests VIEW | List invitations; filter by event/family/RSVP status. |
| POST | `/weddings/:weddingId/event-invitations` | guests MANAGE | Create one event-family invitation. |
| POST | `/weddings/:weddingId/event-invitations/bulk` | guests MANAGE | Create/update multiple event-family invitations, max 100 per request. |
| GET | `/weddings/:weddingId/event-invitations/:invitationId` | guests VIEW | Get invitation + member response state. |
| PATCH | `/weddings/:weddingId/event-invitations/:invitationId` | guests MANAGE | Update invited members or organizer-entered RSVP. |
| DELETE | `/weddings/:weddingId/event-invitations/:invitationId` | guests MANAGE | Archive/remove invitation according to history rules. |

## 21.2 Create Invitation Request

```json
{
  "eventId": "...",
  "familyId": "...",
  "invitedMemberIds": ["memberA", "memberB", "memberC"]
}
```

Unique database constraint prevents more than one active logical invitation for the same wedding + event + family combination.

## 21.3 Organizer-Entered RSVP Update

```json
{
  "responses": [
    { "memberId": "memberA", "status": "ATTENDING" },
    { "memberId": "memberB", "status": "NOT_ATTENDING" },
    { "memberId": "memberC", "status": "PENDING" }
  ]
}
```

The service recomputes `rsvpStatus` and `attendingCount` in the same `event_invitations` document update.

# 22. Private Guest Access and Guest RSVP APIs

Guest APIs use the guest session cookie and are intentionally separate from organizer `/weddings/:weddingId/...` endpoints.

## 22.1 Endpoint Summary

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/guest/access/verify` | Public token + email | Verify family invitation and create guest session. |
| POST | `/guest/access/logout` | Guest | Revoke guest session. |
| GET | `/guest/site` | Guest | Return guest-safe wedding website data. |
| GET | `/guest/events` | Guest | Return only events this family is invited to. |
| GET | `/guest/rsvps` | Guest | Return event invitations + current member responses. |
| PATCH | `/guest/rsvps/:invitationId` | Guest | Submit/update person-level RSVP for one event. |
| GET | `/guest/gallery/albums` | Guest | List visible private gallery albums. |
| GET | `/guest/gallery/albums/:albumId/photos` | Guest | Paginate visible active photos. |

## 22.2 `POST /guest/access/verify`

Request:

```json
{
  "token": "raw-token-from-invitation-url",
  "email": "rajesh@example.com"
}
```

Rules:

- hash token before lookup;
- compare normalized email to the family's primary invited email;
- rate-limit failed verification attempts by IP and family/token context;
- on success create `guest_sessions` record and secure HttpOnly cookie;
- do not return guest family internal notes, organizer data, private IDs not required by the client, or uninvited event metadata.

## 22.3 Guest RSVP Update

Request:

```json
{
  "responses": [
    { "memberId": "memberA", "status": "ATTENDING" },
    { "memberId": "memberB", "status": "ATTENDING" },
    { "memberId": "memberC", "status": "NOT_ATTENDING" }
  ]
}
```

Rules:

- invitation must belong to the guest session's `familyId` and `weddingId`;
- only `invitedMemberIds` may be updated;
- duplicate member entries in one request are rejected;
- `attendingCount` and aggregate RSVP status are recomputed server-side;
- activity log records a guest-originated RSVP update without exposing unnecessary PII.

# 23. Document and Direct Upload APIs

File bytes go directly to Cloudflare R2. Next.js authorizes the upload and later persists metadata after the client confirms completion.

## 23.1 Organizer Document Endpoints

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/weddings/:weddingId/documents` | documents VIEW | List/filter document metadata. |
| POST | `/weddings/:weddingId/uploads/presign` | module-specific MANAGE | Create short-lived direct R2 upload URL. |
| POST | `/weddings/:weddingId/documents` | documents MANAGE | Finalize document metadata after upload. |
| GET | `/weddings/:weddingId/documents/:documentId` | documents VIEW | Get metadata / authorized access URL as appropriate. |
| DELETE | `/weddings/:weddingId/documents/:documentId` | documents MANAGE | Archive metadata and schedule/perform storage cleanup per lifecycle. |

## 23.2 Presign Request

```json
{
  "resourceType": "DOCUMENT",
  "filename": "photographer-contract.pdf",
  "mimeType": "application/pdf",
  "sizeBytes": 384221,
  "context": {
    "vendorId": "..."
  }
}
```

Response:

```json
{
  "data": {
    "storageKey": "weddings/.../documents/<random>.pdf",
    "uploadUrl": "https://<signed-r2-url>",
    "method": "PUT",
    "expiresAt": "2026-09-24T00:10:00.000Z",
    "requiredHeaders": {
      "content-type": "application/pdf"
    }
  },
  "meta": { "requestId": "..." }
}
```

Rules:

- server chooses the `storageKey`; client cannot choose arbitrary bucket paths;
- presigned URL is short-lived and bound to the exact key/method;
- MIME and per-file technical size limits are checked before signing;
- finalization endpoint verifies storage key belongs to the wedding/purpose and may HEAD the R2 object before storing metadata.

# 24. Gallery, Guest Upload, Moderation, and Share APIs

## 24.1 Organizer Album Endpoints

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/weddings/:weddingId/gallery/albums` | gallery VIEW | List albums. |
| POST | `/weddings/:weddingId/gallery/albums` | gallery MANAGE | Create album. |
| GET | `/weddings/:weddingId/gallery/albums/:albumId` | gallery VIEW | Get album. |
| PATCH | `/weddings/:weddingId/gallery/albums/:albumId` | gallery MANAGE | Update name/event/upload policy. |
| DELETE | `/weddings/:weddingId/gallery/albums/:albumId` | gallery MANAGE | Archive album. |

Album creation:

```json
{
  "name": "Sangeet",
  "eventId": "...",
  "uploadPolicy": "VERIFIED_GUESTS"
}
```

Allowed upload policy:

```text
ORGANIZERS_ONLY | VERIFIED_GUESTS
```

## 24.2 Organizer Photo Upload Endpoints

| Method | Path | Permission | Purpose |
|---|---|---|---|
| POST | `/weddings/:weddingId/gallery/albums/:albumId/photos/presign` | gallery MANAGE | Get direct R2 upload URL. |
| POST | `/weddings/:weddingId/gallery/albums/:albumId/photos` | gallery MANAGE | Finalize uploaded photo metadata. |
| GET | `/weddings/:weddingId/gallery/albums/:albumId/photos` | gallery VIEW | Paginate organizer-visible photos. |
| GET | `/weddings/:weddingId/gallery/photos/:photoId` | gallery VIEW | Get photo metadata. |
| DELETE | `/weddings/:weddingId/gallery/photos/:photoId` | gallery MANAGE | Archive ordinary photo. |
| PATCH | `/weddings/:weddingId/gallery/photos/:photoId/moderation` | gallery MANAGE | Hide/flag/remove inappropriate content. |
| POST | `/weddings/:weddingId/gallery/photos/:photoId/share-links` | gallery MANAGE | Create public single-photo share link. |
| PATCH | `/weddings/:weddingId/gallery/share-links/:shareLinkId` | gallery MANAGE | Enable/disable share link. |

## 24.3 Verified Guest Photo Upload

If album policy is `VERIFIED_GUESTS`, a guest session may upload.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/guest/gallery/albums/:albumId/photos/presign` | Guest | Get signed R2 upload URL if policy allows. |
| POST | `/guest/gallery/albums/:albumId/photos` | Guest | Finalize metadata and record uploader family/member context. |

Guest finalize request:

```json
{
  "storageKey": "weddings/.../gallery/<random>.jpg",
  "originalFilename": "IMG_4821.jpg",
  "mimeType": "image/jpeg",
  "fileSize": 4820193,
  "guestMemberId": "optional-embedded-member-id"
}
```

Server writes uploader metadata from the verified guest session; client cannot claim a different `guestFamilyId`.

## 24.4 Moderation

Request:

```json
{
  "moderationStatus": "HIDDEN",
  "reason": "Inappropriate content"
}
```

Allowed organizer transitions include:

```text
ACTIVE -> FLAGGED
ACTIVE -> HIDDEN
FLAGGED -> HIDDEN
ACTIVE/FLAGGED/HIDDEN -> REMOVED
HIDDEN/FLAGGED -> ACTIVE (manual restore where appropriate)
```

For suspected illegal content, normal guest/public access must be removed immediately. R2 bytes may be physically deleted while only minimal non-content audit metadata is retained according to the moderation policy.

## 24.5 Public Single-Photo Share

Public route/API concept:

```text
GET /api/v1/public/photos/:shareToken
```

It returns only the shared photo's safe display information if the share link is enabled and underlying photo is active, not archived, and not hidden/flagged/removed.

It never creates a wedding guest session and never exposes neighboring gallery photos.

# 25. Communication APIs — Email and WhatsApp

## 25.1 Communication Campaign Endpoints

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/weddings/:weddingId/communication-campaigns` | communication VIEW | Campaign history/status. |
| POST | `/weddings/:weddingId/communication-campaigns` | communication MANAGE | Create draft campaign. |
| GET | `/weddings/:weddingId/communication-campaigns/:campaignId` | communication VIEW | Campaign details/counters. |
| PATCH | `/weddings/:weddingId/communication-campaigns/:campaignId` | communication MANAGE | Update DRAFT campaign. |
| POST | `/weddings/:weddingId/communication-campaigns/:campaignId/queue` | communication MANAGE | Materialize recipient email jobs and queue sending. |
| POST | `/weddings/:weddingId/communication-campaigns/:campaignId/cancel` | communication MANAGE | Cancel pending queued work where possible. |
| POST | `/weddings/:weddingId/whatsapp/prepare` | communication MANAGE | Prepare one personalized WhatsApp message/deep link. |

## 25.2 Create Email Campaign

```json
{
  "type": "RSVP_REMINDER",
  "channel": "EMAIL",
  "subject": "RSVP reminder for Somil & Ananya",
  "body": "We would love to know if you can join us...",
  "audience": {
    "eventId": "...",
    "rsvpStatus": "PENDING"
  }
}
```

Audience filters are validated server-side; arbitrary MongoDB queries are never accepted.

## 25.3 Queue Campaign

```text
POST /.../communication-campaigns/:campaignId/queue
Idempotency-Key: 0d38f6bb-...
```

Response `202 Accepted`:

```json
{
  "data": {
    "campaignId": "...",
    "status": "QUEUED",
    "recipientCount": 642,
    "queuedCount": 642,
    "sentCount": 0,
    "failedCount": 0
  },
  "meta": { "requestId": "..." }
}
```

Rules:

- campaign must be DRAFT;
- recipients are snapshotted/materialized as `email_jobs` so later guest edits do not create ambiguous queue state;
- each email job has an idempotency key;
- provider quota limits defer jobs instead of converting the whole campaign into a synchronous error;
- campaign creation/queue request must not loop through provider sends inside the browser request.

## 25.4 WhatsApp Preparation

Request:

```json
{
  "familyId": "...",
  "template": "INVITATION",
  "message": "Hi Rajesh Uncle, Somil & Ananya would love to celebrate with you..."
}
```

Response:

```json
{
  "data": {
    "phone": "+919999999999",
    "message": "Hi Rajesh Uncle...",
    "deepLink": "https://wa.me/..."
  },
  "meta": { "requestId": "..." }
}
```

The API may record a communication action, but Phase 1 must not claim the message was sent/delivered by WhatsApp because there is no WhatsApp Business API integration.

# 26. Notification and Activity APIs

## 26.1 Notifications

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/notifications` | Organizer | List current user's notifications. |
| PATCH | `/notifications/:notificationId` | Organizer | Mark one notification read/unread. |
| POST | `/notifications/read-all` | Organizer | Mark all current-user notifications read. |

Notifications are recipient-user scoped; caller does not supply another `recipientUserId`.

## 26.2 Activity

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/weddings/:weddingId/activity` | wedding VIEW | Paginate wedding activity history. |

Activity is read-only through public APIs. Clients cannot create arbitrary activity records.

# 27. Dashboard and Report APIs

Dashboard/report endpoints return derived summaries and never become a second source of truth.

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/weddings/:weddingId/dashboard` | wedding VIEW | Main dashboard aggregate respecting permissions. |
| GET | `/weddings/:weddingId/reports/rsvp` | guests VIEW | Event/family/attendee RSVP summary. |
| GET | `/weddings/:weddingId/reports/expenses` | expenses VIEW | Expense totals by event/vendor/category/payer/date. |
| GET | `/weddings/:weddingId/reports/tasks` | tasks VIEW | Completion/status/overdue summary. |
| GET | `/weddings/:weddingId/reports/vendors` | vendors VIEW + expenses VIEW for money | Vendor list and optional paid/remaining derived totals. |

## 27.1 Permission-Aware Dashboard

If organizer lacks expense permission, dashboard response omits financial cards rather than returning their data hidden behind frontend logic.

Example:

```json
{
  "data": {
    "wedding": { "title": "Somil & Ananya", "daysRemaining": 152 },
    "tasks": { "pending": 12, "overdue": 3, "completed": 48 },
    "guests": { "families": 210, "attendingIndividuals": 428 },
    "expenses": null
  },
  "meta": {
    "requestId": "...",
    "omittedSections": ["expenses"]
  }
}
```

# 28. Internal Cron and Background Job APIs

These routes are internal only and must not accept organizer/guest cookies as sufficient authorization.

## 28.1 Email Job Processor

```text
POST /api/internal/jobs/email
Authorization: Bearer <CRON_SECRET>
```

Behavior:

1. atomically claim a small ready batch of `email_jobs` where `status=QUEUED` and `scheduledAt <= now`;
2. set processing lock fields;
3. send through Resend using the email infrastructure module;
4. mark each job SENT or FAILED/re-scheduled;
5. update campaign counters idempotently;
6. stop before Vercel execution limits/provider quotas are threatened.

The batch size is configuration, not an API parameter supplied by the cron caller.

Response:

```json
{
  "data": {
    "claimed": 40,
    "sent": 38,
    "retried": 2,
    "failedPermanently": 0
  },
  "meta": { "requestId": "..." }
}
```

## 28.2 Internal Route Rules

- reject missing/invalid internal secret with `401`;
- never expose recipient payloads in response;
- safe to invoke more than once because job claiming/idempotency prevents duplicate send intent;
- no user-provided URL can invoke this route through a normal dashboard action.

# 29. Authorization and Permission Enforcement

## 29.1 Organizer Permission Levels

```text
NONE | VIEW | MANAGE
```

OWNER is a membership role that bypasses module permission checks.

## 29.2 Permission Mapping

| Module | Reads | Mutations |
|---|---|---|
| wedding | VIEW | MANAGE |
| events | VIEW | MANAGE |
| tasks | VIEW | MANAGE |
| guests | VIEW | MANAGE |
| vendors | VIEW | MANAGE |
| expenses | VIEW | MANAGE |
| invitations | VIEW | MANAGE |
| communication | VIEW | MANAGE |
| gallery | VIEW | MANAGE |
| documents | VIEW | MANAGE |

A request that needs multiple modules must check all required permissions. Example: vendor report with money requires `vendors:VIEW` and `expenses:VIEW`.

## 29.3 Authorization Algorithm

```text
resolve organizer session
  -> load requested wedding membership
  -> if role OWNER: allow
  -> if membership inactive/archived: deny
  -> check required module level
  -> repository query includes weddingId
```

## 29.4 Guest Authorization

Guest session authorizes only:

- one wedding;
- one guest family;
- events represented by that family's event invitations;
- visible guest-site sections;
- visible gallery albums/photos;
- upload only when album policy is `VERIFIED_GUESTS`;
- the family's own RSVP records.

Guest session never grants vendor, expense, organizer, internal document, or other-family data access.

# 30. Rate Limiting and Abuse Protection

Phase 1 rate limits are stored in MongoDB with TTL cleanup.

Suggested initial policy (configurable, not hard-coded into clients):

| Endpoint class | Key | Example policy |
|---|---|---|
| login | IP + normalized email | Strict short-window limit |
| signup | IP | Strict short-window limit |
| forgot password | IP + normalized email | Low frequency |
| guest invitation verification | IP + token/family context | Strict failure limit |
| public photo share resolution | IP | Moderate anti-scraping limit |
| upload presign | organizer/guest session + wedding | Moderate per-minute limit |
| communication queue | membership + wedding | Low frequency / high impact |
| general authenticated API | user/session | Broad abuse guard |

When limited:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
```

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Try again later.",
    "requestId": "..."
  }
}
```

Rate-limit implementation must fail safely without storing raw passwords, invitation tokens, or unnecessary PII in keys.

# 31. Security and Privacy Requirements

## 31.1 Input Security

- strict Zod objects reject unknown fields on sensitive create/update endpoints;
- validate ObjectIds, enums, dates, strings, lengths, file metadata, and integer money;
- never accept `weddingId`, `userId`, `guestFamilyId`, or uploader identity from body when it can be derived from route/session;
- sanitize/escape user content at rendering layer; do not trust invitation messages, notes, or filenames as HTML.

## 31.2 Session Security

- session cookies are HttpOnly and Secure in production;
- raw session tokens are not stored in MongoDB;
- logout revokes server session;
- password-reset/change can revoke existing sessions according to account security policy;
- login errors do not reveal account existence through password mismatch messages.

## 31.3 Secret URL Security

Organizer invitation tokens, guest invitation tokens, password reset tokens, and public photo-share tokens are random high-entropy opaque tokens. MongoDB stores hashes where the token grants access.

## 31.4 Response Privacy

The API must never return:

- passwordHash;
- session tokenHash;
- password reset tokenHash;
- organizer/guest invitation tokenHash;
- R2 credentials;
- Resend API key;
- cron/internal secret;
- MongoDB connection string;
- moderation/audit uploader identifiers to public share endpoints;
- another family's RSVP or contact details to guest APIs.

## 31.5 Logging Privacy

Vercel logs should contain request ID, endpoint, status, duration, safe entity IDs, and sanitized errors. Do not log raw request bodies for auth/invitation/password endpoints.

# 32. API-to-Database Mapping

| API Resource | Primary Collection(s) | Notes |
|---|---|---|
| auth users | users, sessions, password_reset_tokens | Sessions store hashed opaque tokens. |
| weddings | weddings, wedding_memberships | Create wedding + owner membership transaction. |
| organizers | wedding_memberships, organizer_invitations | Invite acceptance is transactional. |
| events | events | Tenant scoped by weddingId. |
| tasks | tasks | Checklist embedded. |
| timeline | timeline_items | References event/membership. |
| vendors | vendors | No vendor account/payment ledger. |
| expenses | expenses | All actual spend lives here. |
| guest families | guest_families | Members embedded. |
| event invitations / RSVP | event_invitations | Invited member IDs + responses embedded. |
| guest access | guest_sessions, guest_families | Guest session scoped to one family/wedding. |
| documents | documents + R2 | MongoDB stores metadata only. |
| gallery | gallery_albums, gallery_photos + R2 | Photo uploader/moderation metadata in MongoDB. |
| public photo share | photo_share_links | Does not create guest session. |
| communications | communication_campaigns, email_jobs | Email jobs processed asynchronously. |
| notifications | notifications | Current-user scoped. |
| activity | activity_logs | Append-oriented read-only public API. |
| rate limiting | rate_limits | TTL cleanup. |

# 33. Complete Phase 1 Endpoint Catalogue

## 33.1 Authentication

```text
POST   /api/v1/auth/signup
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/session
POST   /api/v1/auth/email/verify
POST   /api/v1/auth/password/forgot
POST   /api/v1/auth/password/reset
POST   /api/v1/auth/password/change
```

## 33.2 Weddings and Organizers

```text
POST   /api/v1/weddings
GET    /api/v1/weddings
GET    /api/v1/weddings/:weddingId
PATCH  /api/v1/weddings/:weddingId
DELETE /api/v1/weddings/:weddingId

GET    /api/v1/weddings/:weddingId/memberships
GET    /api/v1/weddings/:weddingId/memberships/:membershipId
PATCH  /api/v1/weddings/:weddingId/memberships/:membershipId
DELETE /api/v1/weddings/:weddingId/memberships/:membershipId

GET    /api/v1/weddings/:weddingId/organizer-invitations
POST   /api/v1/weddings/:weddingId/organizer-invitations
PATCH  /api/v1/weddings/:weddingId/organizer-invitations/:invitationId
POST   /api/v1/organizer-invitations/:token/accept
```

## 33.3 Events, Tasks, Timeline

```text
GET    /api/v1/weddings/:weddingId/events
POST   /api/v1/weddings/:weddingId/events
GET    /api/v1/weddings/:weddingId/events/:eventId
PATCH  /api/v1/weddings/:weddingId/events/:eventId
DELETE /api/v1/weddings/:weddingId/events/:eventId

GET    /api/v1/weddings/:weddingId/tasks
POST   /api/v1/weddings/:weddingId/tasks
GET    /api/v1/weddings/:weddingId/tasks/:taskId
PATCH  /api/v1/weddings/:weddingId/tasks/:taskId
DELETE /api/v1/weddings/:weddingId/tasks/:taskId

GET    /api/v1/weddings/:weddingId/timeline-items
POST   /api/v1/weddings/:weddingId/timeline-items
GET    /api/v1/weddings/:weddingId/timeline-items/:timelineItemId
PATCH  /api/v1/weddings/:weddingId/timeline-items/:timelineItemId
DELETE /api/v1/weddings/:weddingId/timeline-items/:timelineItemId
```

## 33.4 Vendors and Expenses

```text
GET    /api/v1/weddings/:weddingId/vendors
POST   /api/v1/weddings/:weddingId/vendors
GET    /api/v1/weddings/:weddingId/vendors/:vendorId
PATCH  /api/v1/weddings/:weddingId/vendors/:vendorId
DELETE /api/v1/weddings/:weddingId/vendors/:vendorId

GET    /api/v1/weddings/:weddingId/expenses
POST   /api/v1/weddings/:weddingId/expenses
GET    /api/v1/weddings/:weddingId/expenses/:expenseId
PATCH  /api/v1/weddings/:weddingId/expenses/:expenseId
DELETE /api/v1/weddings/:weddingId/expenses/:expenseId
```

## 33.5 Guests, Event Invitations, RSVP

```text
GET    /api/v1/weddings/:weddingId/guest-families
POST   /api/v1/weddings/:weddingId/guest-families
GET    /api/v1/weddings/:weddingId/guest-families/:familyId
PATCH  /api/v1/weddings/:weddingId/guest-families/:familyId
DELETE /api/v1/weddings/:weddingId/guest-families/:familyId
POST   /api/v1/weddings/:weddingId/guest-families/:familyId/invitation-access

GET    /api/v1/weddings/:weddingId/event-invitations
POST   /api/v1/weddings/:weddingId/event-invitations
POST   /api/v1/weddings/:weddingId/event-invitations/bulk
GET    /api/v1/weddings/:weddingId/event-invitations/:invitationId
PATCH  /api/v1/weddings/:weddingId/event-invitations/:invitationId
DELETE /api/v1/weddings/:weddingId/event-invitations/:invitationId

POST   /api/v1/guest/access/verify
POST   /api/v1/guest/access/logout
GET    /api/v1/guest/site
GET    /api/v1/guest/events
GET    /api/v1/guest/rsvps
PATCH  /api/v1/guest/rsvps/:invitationId
```

## 33.6 Documents and Gallery

```text
GET    /api/v1/weddings/:weddingId/documents
POST   /api/v1/weddings/:weddingId/uploads/presign
POST   /api/v1/weddings/:weddingId/documents
GET    /api/v1/weddings/:weddingId/documents/:documentId
DELETE /api/v1/weddings/:weddingId/documents/:documentId

GET    /api/v1/weddings/:weddingId/gallery/albums
POST   /api/v1/weddings/:weddingId/gallery/albums
GET    /api/v1/weddings/:weddingId/gallery/albums/:albumId
PATCH  /api/v1/weddings/:weddingId/gallery/albums/:albumId
DELETE /api/v1/weddings/:weddingId/gallery/albums/:albumId

POST   /api/v1/weddings/:weddingId/gallery/albums/:albumId/photos/presign
POST   /api/v1/weddings/:weddingId/gallery/albums/:albumId/photos
GET    /api/v1/weddings/:weddingId/gallery/albums/:albumId/photos
GET    /api/v1/weddings/:weddingId/gallery/photos/:photoId
DELETE /api/v1/weddings/:weddingId/gallery/photos/:photoId
PATCH  /api/v1/weddings/:weddingId/gallery/photos/:photoId/moderation
POST   /api/v1/weddings/:weddingId/gallery/photos/:photoId/share-links
PATCH  /api/v1/weddings/:weddingId/gallery/share-links/:shareLinkId

GET    /api/v1/guest/gallery/albums
GET    /api/v1/guest/gallery/albums/:albumId/photos
POST   /api/v1/guest/gallery/albums/:albumId/photos/presign
POST   /api/v1/guest/gallery/albums/:albumId/photos

GET    /api/v1/public/photos/:shareToken
```

## 33.7 Communications, Notifications, Activity, Reports

```text
GET    /api/v1/weddings/:weddingId/communication-campaigns
POST   /api/v1/weddings/:weddingId/communication-campaigns
GET    /api/v1/weddings/:weddingId/communication-campaigns/:campaignId
PATCH  /api/v1/weddings/:weddingId/communication-campaigns/:campaignId
POST   /api/v1/weddings/:weddingId/communication-campaigns/:campaignId/queue
POST   /api/v1/weddings/:weddingId/communication-campaigns/:campaignId/cancel
POST   /api/v1/weddings/:weddingId/whatsapp/prepare

GET    /api/v1/notifications
PATCH  /api/v1/notifications/:notificationId
POST   /api/v1/notifications/read-all

GET    /api/v1/weddings/:weddingId/activity
GET    /api/v1/weddings/:weddingId/dashboard
GET    /api/v1/weddings/:weddingId/reports/rsvp
GET    /api/v1/weddings/:weddingId/reports/expenses
GET    /api/v1/weddings/:weddingId/reports/tasks
GET    /api/v1/weddings/:weddingId/reports/vendors
```

## 33.8 Internal

```text
POST   /api/internal/jobs/email
```

# 34. Deferred / Future APIs

The following are intentionally outside Phase 1 and must not shape the current REST contract prematurely.

## Phase 2 Candidates

- accommodation/hotel allocation;
- transport vehicles, drivers, pickup/drop assignments;
- advanced seating and visual table assignment;
- gallery quotas and storage plans;
- automated image processing/thumbnails;
- automatic post-wedding retention/archive cleanup;
- richer guest upload/report/moderation tooling;
- export jobs for PDF/Excel reports.

## Marketplace / Later Platform

- Google Places vendor discovery;
- vendor marketplace profiles;
- vendor onboarding/accounts;
- vendor quotation/bidding;
- planner multi-wedding workspace APIs;
- payment gateway/commission/booking APIs;
- WhatsApp Business API automation;
- native mobile client requirements.

# 35. Implementation Checklist

## Shared Infrastructure

- [ ] Create `/api/v1` Route Handler structure by domain.
- [ ] Implement request ID middleware/helper and safe Vercel logging.
- [ ] Implement standard success/error serializer.
- [ ] Implement Zod helpers for body/query/params.
- [ ] Implement ObjectId schema helper.
- [ ] Implement normalized email helper.
- [ ] Implement organizer session resolver and guest session resolver.
- [ ] Implement Origin validation for unsafe cookie-authenticated requests.
- [ ] Implement permission helper with OWNER bypass.
- [ ] Ensure repository functions always accept/use wedding tenant context where applicable.
- [ ] Implement cursor encode/decode helper and allowlisted sort/filter parsers.
- [ ] Implement MongoDB-backed rate limiter.

## Authentication

- [ ] Signup/login/logout/session endpoints.
- [ ] Email verification flow.
- [ ] Forgot/reset/change password endpoints.
- [ ] Hashed opaque session tokens and TTL session expiry.
- [ ] Brute-force/rate-limit tests.

## Wedding Domains

- [ ] Wedding + owner membership transaction.
- [ ] Organizer invite + acceptance transaction.
- [ ] Events, tasks, timeline, vendors, expenses CRUD/archive APIs.
- [ ] Family/member guest APIs.
- [ ] Event invitation bulk API with max batch size.
- [ ] Guest verification/session/RSVP APIs.

## Storage and Gallery

- [ ] R2 signed-upload abstraction; server-generated storage keys.
- [ ] File MIME/size allowlists.
- [ ] Upload finalization verification.
- [ ] Organizer/guest uploader attribution.
- [ ] Album upload policy enforcement.
- [ ] Moderation status transitions and visibility filters.
- [ ] Public single-photo share links with no wedding-session escalation.

## Communication

- [ ] Campaign draft/update endpoints.
- [ ] Audience resolver with allowlisted filters.
- [ ] Queue endpoint using idempotency key.
- [ ] MongoDB email job creation and atomic claiming.
- [ ] Vercel Cron internal endpoint protected by secret.
- [ ] Resend adapter and quota-aware retry scheduling.
- [ ] WhatsApp deeplink preparation without false delivery claims.

## Quality

- [ ] Unit tests for Zod schemas, permissions, normalization, cursor helpers, and state transitions.
- [ ] Integration tests for repositories/services against test MongoDB.
- [ ] Route tests for auth, tenant isolation, error shape, and permissions.
- [ ] Playwright end-to-end path: signup -> wedding -> organizer/event/guest -> invitation -> guest verify -> RSVP.
- [ ] Playwright gallery path including verified guest upload and organizer moderation.
- [ ] API contract examples kept synchronized with implementation.

# 36. API Decision Log

| Decision | Final Phase 1 Choice | Reason |
|---|---|---|
| Business API | REST only under `/api/v1` | Explicit reusable contract; no Server Action business interface. |
| Backend | Next.js Route Handlers on Node.js runtime | Fits modular monolith and Vercel deployment. |
| Authentication | Custom email/password with opaque server sessions | Revocable and owned by application; no third-party auth provider. |
| Guest access | Private invitation token + invited email -> guest session | Lightweight invitation-only protection without OTP cost. |
| Tenant model | `weddingId` in URL and database filters | Clear authorization boundary and future multi-wedding evolution. |
| Archive semantics | DELETE archives business records | Preserves relationships/history and matches database lifecycle. |
| Money | Integer minor units | Avoid floating-point currency errors. |
| Vendor finance | No vendor-payment endpoint/collection | Actual payments are ordinary vendor-linked expenses. |
| Guest family | Embedded members | Bounded aggregate normally managed together. |
| RSVP | Event-family invitation resource with embedded member responses | Supports event-specific invitations and person-level attendance atomically. |
| File upload | Direct R2 signed PUT + metadata finalization | Avoids proxying large files through Vercel. |
| Gallery accountability | Organizer or verified guest only; uploader metadata mandatory | Enables moderation and traceability; anonymous upload prohibited. |
| Public photo sharing | Separate share token for one photo | Does not leak full wedding/gallery access. |
| Bulk email | Campaign -> MongoDB email jobs -> Vercel Cron -> Resend | Quota-aware, retryable, avoids long browser requests. |
| WhatsApp | Message + deeplink generation only | No Business API integration in Phase 1. |
| Realtime | None | Normal REST refresh/revalidation is sufficient. |
| Pagination | Cursor for potentially large collections | Stable and scalable while keeping API consistent. |
| Provider errors | Mapped to stable application error codes | Clients do not depend on vendor-specific error payloads. |

---

**End of Make My Marriage — API Design v1.0**
