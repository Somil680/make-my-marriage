**MAKE MY MARRIAGE**

**System Design & Architecture**

Phase 1 | Final Technical Architecture | v1.0

> **Architecture principle:** Build a simple, modular monolith that is easy to operate at pilot scale, strict about domain boundaries, and capable of evolving without a rewrite.

| **Document**        | **Value**                                           |
|---------------------|-----------------------------------------------------|
| Status              | Final - Phase 1                                     |
| Companion document  | Make My Marriage Product Requirements Document v1.0 |
| Architecture style  | Modular monolith                                    |
| Application         | Next.js App Router + Node.js runtime                |
| Primary database    | MongoDB Atlas with Mongoose                         |
| Deployment          | Vercel                                              |
| Object storage      | Cloudflare R2                                       |
| Transactional email | Resend                                              |
| Last updated        | 22 September 2026                                   |

# Contents

- 1\. Document Purpose and Scope

- 2\. Architecture Goals and Constraints

- 3\. Key Technology Decisions

- 4\. High-Level System Architecture

- 5\. Runtime Request and Data Flow

- 6\. Repository and Module Structure

- 7\. Application Layering and Dependency Rules

- 8\. REST API Architecture

- 9\. Authentication and Session Management

- 10\. Authorization and Organizer Permissions

- 11\. MongoDB Modeling Principles

- 12\. Core MongoDB Document Schemas

- 13\. Embed vs Reference Decisions

- 14\. Guest, Invitation and RSVP Model

- 15\. Expense and Vendor Financial Model

- 16\. MongoDB Transactions and Consistency

- 17\. Indexes and Unique Constraints

- 18\. Deletion and Lifecycle Behavior

- 19\. File and Gallery Architecture

- 20\. Email and Background Job Architecture

- 21\. Vercel Deployment Topology

- 22\. Security Architecture

- 23\. Rate Limiting and Abuse Protection

- 24\. Reliability and Idempotency

- 25\. Logging and Observability

- 26\. Performance and Caching Strategy

- 27\. Testing Strategy

- 28\. Environment and Configuration Management

- 29\. API Endpoint Catalogue

- 30\. Phase 2 / Future Evolution

- 31\. Architecture Risks and Mitigations

- 32\. Final Architecture Checklist

# 1. Document Purpose and Scope

This document defines the final Phase 1 system design and software architecture for Make My Marriage. It translates the approved PRD into technical boundaries, data models, runtime flows, infrastructure choices, security controls, and implementation conventions. It is intended to guide implementation and code review; it is not a replacement for the PRD.

## 1.1 In Scope

- Next.js modular-monolith architecture and repository boundaries.

- REST API conventions and request processing flow.

- Custom email/password authentication and opaque session management.

- Organizer permission model and wedding tenancy boundary.

- MongoDB collections, embed/reference decisions, indexes, and transaction usage.

- Family-based guest model with event-specific invitation and RSVP handling.

- Expense tracking linked to vendors without a separate vendor-payment ledger.

- Cloudflare R2 file storage and shareable gallery-photo design.

- Resend email delivery with MongoDB-backed queued jobs and scheduled processing on Vercel.

- Phase 1 security, logging, testing, deployment, and operational conventions.

## 1.2 Explicitly Out of Scope

- Microservices, service mesh, Kafka, RabbitMQ, Redis, or event-streaming infrastructure.

- Native mobile applications.

- Real-time multi-user collaboration via WebSockets.

- Vendor portal/accounts or vendor marketplace implementation.

- Google Places vendor discovery implementation (future marketplace feature).

- Native livestream infrastructure.

- Advanced image transformation, automatic thumbnails, or multi-variant media processing.

- Accommodation, transport, advanced seating, and automated post-wedding retention cleanup.

- Online payments, accounting ledgers, reconciliation, or escrow.

# 2. Architecture Goals and Constraints

| **Goal / Constraint**                     | **Architecture Response**                                                                                                  |
|-------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| Pilot scale: approximately 100 weddings   | Prefer simple managed services, no premature distributed systems, and query-driven MongoDB indexes.                        |
| One active wedding per account in Phase 1 | Enforce in application service logic, not through a permanent database uniqueness rule.                                    |
| Indian multi-event weddings               | Event is a first-class collection; guests, tasks, expenses, vendors and timelines can reference events.                    |
| Many family organizers                    | Use wedding membership documents with module-level permissions.                                                            |
| Family-based invitations                  | Embed family members within a bounded guest-family aggregate.                                                              |
| Different guest lists per event           | Model event-to-family relationship through event_invitations.                                                              |
| No real-time collaboration                | Use normal REST reads, revalidation and explicit refresh; no WebSocket infrastructure.                                     |
| Low-cost / free-tier friendly             | Use Vercel, MongoDB Atlas, Cloudflare R2 and Resend with quota-aware behavior.                                             |
| Large photos possible                     | Upload directly from browser to R2 using short-lived signed upload authorization; do not proxy file bytes through Next.js. |
| All business operations through REST      | Server Actions are not the business mutation interface.                                                                    |

> **Non-goal:** Phase 1 optimizes for correctness, maintainability and development speed at pilot scale. It does not optimize for millions of users or multi-region active-active operation.

# 3. Key Technology Decisions

| **Area**           | **Decision**                                      | **Rationale**                                                                                                                            |
|--------------------|---------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| Architecture       | Modular monolith                                  | Domains are strongly connected; a single deployable application avoids distributed-system complexity while preserving module boundaries. |
| Frontend / backend | Next.js App Router on Node.js runtime             | One codebase hosts UI and REST APIs without a separate Express/Nest application.                                                         |
| Language           | TypeScript                                        | Shared typing across UI, API, validation and data access.                                                                                |
| API                | REST only                                         | One explicit mutation/read contract for dashboard and guest flows; easier future mobile/API reuse.                                       |
| Database           | MongoDB Atlas                                     | Fits bounded embedded aggregates such as guest families and task checklists while supporting referenced wedding-domain collections.      |
| ODM                | Mongoose                                          | Schema definitions, indexes, middleware where needed, transactions and MongoDB integration.                                              |
| Validation         | Zod                                               | Validate API payloads and normalize data before business services.                                                                       |
| UI                 | Tailwind CSS + shadcn/ui                          | Fast consistent application UI without building a design system from scratch.                                                            |
| Client data        | Server Components + selective TanStack Query      | Use server rendering for initial reads and client querying only where interactive refresh/state benefits.                                |
| Authentication     | Custom email/password                             | Application owns user/session flow; cryptography relies on standard libraries.                                                           |
| Session            | Opaque secure cookie + server-side session record | Revocable sessions; no bearer token in localStorage.                                                                                     |
| Storage            | Cloudflare R2                                     | Object storage kept outside MongoDB; S3-compatible access and shareable media delivery.                                                  |
| Email              | Resend                                            | Transactional email provider for invitations and reminders.                                                                              |
| Background jobs    | MongoDB job collection + Vercel Cron processor    | Avoid Redis/SQS in Phase 1 while keeping batch sending asynchronous and retryable.                                                       |
| Deployment         | Vercel                                            | Managed Next.js deployment and scheduled function execution.                                                                             |
| Logging            | Vercel Logs                                       | Sufficient operational visibility for Phase 1.                                                                                           |
| Testing            | Vitest + React Testing Library + Playwright       | Unit/component coverage plus critical end-to-end user journeys.                                                                          |

# 4. High-Level System Architecture

Users / Guests  
|  
v  
+-----------------------------+  
| Vercel |  
| Next.js Modular Monolith |  
| |  
| - React UI |  
| - REST Route Handlers |  
| - Auth / Authorization |  
| - Domain Services |  
| - Repositories |  
| - Scheduled Job Endpoints |  
+-------------+---------------+  
|  
+--------+---------+----------------+  
| | |  
v v v  
MongoDB Atlas Cloudflare R2 Resend  
Data + jobs Files / photos Email delivery

## 4.1 Architectural Boundaries

- The browser never connects directly to MongoDB.

- All business reads and mutations pass through versioned REST API endpoints.

- Route handlers authenticate, validate, authorize, call application services, and map results to HTTP responses.

- Domain services own business rules; Mongoose access is isolated behind repositories or module data-access functions.

- R2 contains file bytes only; MongoDB contains file metadata and storage keys.

- Resend contains delivery responsibility only; campaign and recipient state remain in MongoDB.

- Cron execution is a scheduling trigger, not a business-data store.

# 5. Runtime Request and Data Flow

## 5.1 Authenticated Dashboard Request

Browser  
-\> REST /api/v1/...  
-\> Resolve secure session cookie  
-\> Validate session in MongoDB  
-\> Parse request with Zod  
-\> Resolve wedding membership  
-\> Enforce module permission  
-\> Domain service  
-\> Repository / Mongoose  
-\> MongoDB  
-\> Standard API response

## 5.2 Guest RSVP Request

Invitation URL + email verification  
-\> Create guest session cookie  
-\> GET invited events for family  
-\> PATCH event invitation responses  
-\> Validate invited member IDs  
-\> Atomically update one event_invitations document  
-\> Return updated RSVP state

## 5.3 File Upload Request

Browser  
-\> POST /api/v1/files/upload-intent  
-\> Authenticate + authorize + validate file metadata  
-\> Generate short-lived R2 upload authorization  
-\> Browser uploads file directly to R2  
-\> POST /api/v1/files/complete  
-\> Create MongoDB metadata record

# 6. Repository and Module Structure

```text
make-my-marriage/
├── docs/
├── public/
├── scripts/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   ├── (auth)/
│   │   ├── (organizer)/
│   │   ├── (guest)/
│   │   ├── (public-share)/
│   │   └── api/
│   │       ├── v1/
│   │       └── internal/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── weddings/
│   │   ├── organizers/
│   │   ├── events/
│   │   ├── tasks/
│   │   ├── timeline/
│   │   ├── guests/
│   │   ├── vendors/
│   │   ├── expenses/
│   │   ├── invitations/
│   │   ├── communications/
│   │   ├── documents/
│   │   ├── gallery/
│   │   ├── notifications/
│   │   ├── activity/
│   │   ├── dashboard/
│   │   └── reports/
│   ├── server/
│   │   ├── db/
│   │   ├── auth/
│   │   ├── storage/
│   │   ├── email/
│   │   ├── jobs/
│   │   ├── rate-limit/
│   │   └── logger/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── data-table/
│   ├── lib/
│   └── config/
├── tests/
└── package.json
```

The top-level source boundaries have the following responsibilities:

- `app/` contains Next.js App Router pages, layouts, and HTTP route entry points.
- `modules/` contains product-domain code grouped by feature.
- `server/` contains server-only technical infrastructure and must not be imported into browser bundles.
- `components/` contains shared reusable UI; feature-specific components remain inside their owning module.
- `lib/` contains small framework-agnostic helpers and must not become a general dumping ground.
- `config/` contains application and environment configuration.

## 6.1 Module Internal Structure

Product modules are flat by default:

```text
modules/guests/
├── guest.model.ts
├── guest.repository.ts
├── guest.service.ts
├── guest.schema.ts
├── guest.policy.ts
├── guest.types.ts
├── guest.api.ts
└── components/
```

These files should be created only when the module needs them. Small modules do not need empty folders simply to match a template. Do not introduce Java-style `models/`, `repositories/`, `services/`, `schemas/`, or `authorization/` subdirectories unless a module genuinely becomes large enough to require them. The important rule is that domain code stays with its domain rather than being scattered across global controllers, models, and services directories.

# 7. Application Layering and Dependency Rules

| **Layer**                | **Responsibility**                                                                       | **Must Not**                                                         |
|--------------------------|------------------------------------------------------------------------------------------|----------------------------------------------------------------------|
| UI                       | Render pages, collect input, invoke REST APIs, manage client interaction                 | Query MongoDB directly or implement business rules.                  |
| REST Route Handler       | HTTP parsing, authentication entry, Zod validation, authorization call, response mapping | Contain long domain workflows or direct cross-module database logic. |
| Domain Service           | Business rules, invariants, orchestration, transaction boundaries                        | Know presentation/UI concerns.                                       |
| Repository / Data Access | Mongoose queries, persistence details, query shaping                                     | Decide user permissions or business policy.                          |
| Infrastructure           | MongoDB connection, R2 client, Resend client, cryptographic helpers, logging             | Depend on UI components.                                             |
| Shared                   | Stable primitives and cross-cutting types/utilities                                      | Become a dumping ground for domain-specific logic.                   |

> **Dependency rule:** app/api -> module service -> repository/infrastructure. UI and API code may depend on domain modules; domain modules must not depend on UI routes or React components.

# 8. REST API Architecture

## 8.1 Versioning

All Phase 1 application APIs use the /api/v1 prefix. Breaking API changes require a version decision instead of silent behavioral drift.

## 8.2 Standard Request Pipeline

1\. Parse route params and request body.

2\. Validate input with Zod; reject malformed data before service execution.

3\. Resolve authenticated user or guest session.

4\. Resolve weddingId and membership where applicable.

5\. Enforce the required module/action permission.

6\. Execute domain service and any transaction boundary.

7\. Return a consistent JSON success/error envelope.

8\. Write structured log context without exposing secrets or raw tokens.

## 8.3 Response Shape

Success:  
{  
"data": { ... },  
"meta": { ...optional }  
}  
  
Error:  
{  
"error": {  
"code": "VALIDATION_ERROR",  
"message": "Readable message",  
"fieldErrors": { ...optional }  
}  
}

## 8.4 HTTP Semantics

| **Operation** | **Method** | **Example** |
|---|---|---|
| List / read | GET | `GET /api/v1/weddings/:weddingId/events` |
| Create | POST | `POST /api/v1/weddings/:weddingId/tasks` |
| Partial update | PATCH | `PATCH /api/v1/weddings/:weddingId/tasks/:taskId` |
| Delete where safe | DELETE | `DELETE /api/v1/weddings/:weddingId/tasks/:taskId` |
| Business action | POST | `POST /api/v1/organizer-invitations/:token/accept` |

# 9. Authentication and Session Management

## 9.1 Signup and Login

Signup -> normalize email -> validate password -> hash password -> create user -> verification flow  
Login -> normalize email -> compare password hash -> create random opaque session token -> store token hash -> set secure cookie

## 9.2 Password Storage

Use a standard Argon2id implementation. Application code must never implement custom password hashing or store plaintext/reversible passwords.

## 9.3 Session Design

| **Element**    | **Design**                                                                     |
|----------------|--------------------------------------------------------------------------------|
| Browser token  | Random opaque session token in Secure, HttpOnly, SameSite cookie.              |
| Database value | Hash of session token, never the raw token.                                    |
| Session expiry | Explicit expiresAt plus MongoDB TTL cleanup.                                   |
| Logout         | Delete/revoke server-side session and expire cookie.                           |
| Password reset | Random one-time token, store hash and expiry, invalidate after successful use. |
| Rotation       | Issue a fresh session after sensitive credential changes.                      |

## 9.4 Session Schema

sessions {  
\_id,  
userId,  
tokenHash,  
expiresAt,  
lastUsedAt,  
userAgent?,  
ipHash?,  
createdAt  
}

# 10. Authorization and Organizer Permissions

Authorization is wedding-scoped. Every organizer action must be checked against a wedding membership before querying or mutating wedding-owned resources.

## 10.1 Membership Schema

wedding_memberships {  
\_id, weddingId, userId,  
role: OWNER | ORGANIZER,  
relationship, customRelationship?,  
permissions: {  
wedding, events, tasks, guests, vendors, expenses,  
invitations, communication, gallery, documents  
},  
assignedEventIds: \[\],  
status: ACTIVE | DISABLED,  
joinedAt, createdAt, updatedAt  
}  
  
Permission value: NONE | VIEW | MANAGE

## 10.2 Permission Rules

- OWNER bypasses module permission checks and cannot accidentally lose ownership through a permission update.

- ORGANIZER permissions are module-level in Phase 1.

- assignedEventIds expresses responsibility and filtering convenience; it is not a security boundary in Phase 1.

- A resource query should include the authorized weddingId wherever practical, creating a lightweight tenancy boundary.

- Disabled membership denies organizer dashboard access immediately.

## 10.3 Organizer Invitation Flow

Admin creates invitation -> invitation email -> organizer signs up / logs in -> token validated -> email matched -> transaction creates membership + marks invitation accepted

# 11. MongoDB Modeling Principles

- Embed small, bounded children that are almost always read and updated with the parent.

- Reference independently growing entities, many-to-many relationships, and records with separate query/lifecycle needs.

- Avoid a giant Wedding document containing events, guests, tasks, vendors and expenses.

- Place weddingId directly on wedding-owned documents even when it could be derived through another reference; this simplifies authorization and wedding-scoped queries.

- Store money as integer minor units (paise for INR), never floating-point rupees.

- Use database constraints and unique indexes for invariants that must survive concurrent requests.

- Design indexes from actual query patterns; avoid speculative indexes, especially on free-tier database storage.

- Use single-document atomicity first; use multi-document transactions only for genuine cross-document invariants.

# 12. Core MongoDB Document Schemas

## 12.1 users

users {  
\_id,  
name,  
email,  
emailNormalized,  
passwordHash,  
emailVerified,  
emailVerifiedAt?,  
status: ACTIVE | DISABLED,  
createdAt, updatedAt  
}

## 12.2 weddings

weddings {  
\_id, ownerUserId,  
couple: { brideName, groomName },  
title, startDate, endDate, primaryCity?, coverImageKey?,  
status: PLANNING | ONGOING | COMPLETED | ARCHIVED,  
currency: INR,  
website: { enabled, themeId?, sections: {...} },  
theme: { primaryColor?, accentColor?, fontKey? },  
createdAt, updatedAt  
}

## 12.3 organizer_invitations

organizer_invitations {  
\_id, weddingId, emailNormalized,  
relationship, customRelationship?,  
permissions: {...},  
tokenHash,  
status: PENDING | ACCEPTED | REVOKED | EXPIRED,  
invitedByUserId, expiresAt, acceptedAt?, createdAt  
}

## 12.4 events

events {  
\_id, weddingId,  
name, type, description?,  
startAt, endAt?,  
venue: { name?, address?, mapUrl?, lat?, lng? },  
dressCode?, coverImageKey?,  
status: ACTIVE | CANCELLED | ARCHIVED,  
createdAt, updatedAt  
}

## 12.5 tasks

tasks {  
\_id, weddingId, eventId?, assignedMembershipId?,  
title, description?, category?,  
status: TODO | IN_PROGRESS | WAITING | COMPLETED,  
priority: LOW | MEDIUM | HIGH,  
dueAt?,  
checklist: \[{ \_id, title, completed, completedAt? }\],  
createdByUserId, completedAt?, createdAt, updatedAt  
}

## 12.6 timeline_items

timeline_items {  
\_id, weddingId, eventId,  
title, description?, startAt, endAt?, location?,  
responsibleMembershipId?, status?, notes?,  
createdAt, updatedAt  
}

## 12.7 vendors

vendors {  
\_id, weddingId,  
name, nameNormalized?, category,  
contactPerson?, phone?, email?, whatsapp?, address?,  
eventIds: \[\],  
status: CONTACTED | NEGOTIATING | CONFIRMED | COMPLETED | CANCELLED,  
agreedAmountMinor?,  
notes?, createdAt, updatedAt  
}

## 12.8 expenses

expenses {  
\_id, weddingId,  
eventId?, vendorId?,  
title, category,  
amountMinor, expenseDate,  
paymentStage?: ADVANCE | SECOND_PAYMENT | FINAL_PAYMENT | OTHER,  
paidByMembershipId?,  
paymentMethod?: CASH | UPI | BANK_TRANSFER | CARD | OTHER,  
receiptDocumentId?, notes?, createdByUserId,  
createdAt, updatedAt  
}

> **Financial simplification:** There is no vendor_payments collection in Phase 1. If money has actually been paid, it is an expense. Vendor total paid and remaining amount are derived from expenses linked by vendorId.

## 12.9 guest_families

guest_families {  
\_id, weddingId, familyName,  
primaryContact: { name, email?, emailNormalized?, phone? },  
side: BRIDE | GROOM | BOTH,  
relationship?,  
members: \[{ \_id, name, relationship?, ageGroup? }\],  
invitationAccess: { tokenHash?, generatedAt?, revokedAt? },  
notes?, status: ACTIVE | ARCHIVED,  
createdAt, updatedAt  
}

## 12.10 event_invitations

event_invitations {  
\_id, weddingId, eventId, familyId,  
invitedMemberIds: \[\],  
responses: \[{ memberId, status: PENDING | ATTENDING | NOT_ATTENDING }\],  
rsvpStatus: PENDING | PARTIAL | RESPONDED,  
attendingCount, respondedAt?, updatedByGuestAt?,  
createdAt, updatedAt  
}

## 12.11 guest_sessions

guest_sessions {  
\_id, weddingId, familyId, tokenHash, expiresAt, createdAt  
}

## 12.12 communication_campaigns and email_jobs

communication_campaigns {  
\_id, weddingId,  
type: INVITATION | RSVP_REMINDER | EVENT_REMINDER | ANNOUNCEMENT,  
channel: EMAIL | WHATSAPP,  
subject?, templateKey?,  
recipientCount, queuedCount, sentCount, failedCount,  
status, createdByUserId, createdAt, updatedAt  
}  
  
email_jobs {  
\_id, campaignId, weddingId, familyId?, recipientEmail,  
status: QUEUED | PROCESSING | SENT | FAILED,  
scheduledAt, attemptCount, lastError?, providerMessageId?,  
idempotencyKey, createdAt, sentAt?  
}

## 12.13 documents

documents {  
\_id, weddingId,  
entityType, entityId?,  
storageKey, originalFilename, mimeType, fileSize,  
uploadedByUserId, createdAt  
}

## 12.14 gallery_albums, gallery_photos and photo_share_links

gallery_albums { \_id, weddingId, eventId?, name, coverPhotoId?, createdAt }  
  
gallery_photos {  
\_id, weddingId, albumId, storageKey, originalFilename,  
mimeType, fileSize, uploadedByUserId, status?, createdAt  
}  
  
photo_share_links {  
\_id, weddingId, photoId, tokenHash, enabled, createdAt  
}

## 12.15 activity_logs, rate_limits and notifications

activity_logs { \_id, weddingId, actorUserId?, action, entityType, entityId?, metadata?, createdAt }  
rate_limits { \_id, key, count, expiresAt, updatedAt }  
notifications { \_id, weddingId, userId, type, title, readAt?, createdAt }

# 13. Embed vs Reference Decisions

| **Relationship**                     | **Decision**                    | **Reason**                                                              |
|--------------------------------------|---------------------------------|-------------------------------------------------------------------------|
| Wedding -> theme / website settings | Embed                           | Exactly one bounded configuration set, usually read with wedding.       |
| Wedding -> organizers               | Reference                       | Independent accounts, permission queries, lifecycle.                    |
| Wedding -> events                   | Reference                       | Independent sorting/filtering and event lifecycle.                      |
| Event -> venue                      | Embed                           | Small bounded value object owned by event.                              |
| Task -> checklist items             | Embed                           | Small bounded children; atomic update useful.                           |
| Wedding -> tasks                    | Reference                       | Potentially many; queried by status, due date, assignee.                |
| Wedding -> vendors                  | Reference                       | Independent query/filter/lifecycle.                                     |
| Vendor -> payments                  | Not modeled separately          | Actual payments are expense records.                                    |
| Guest family -> members             | Embed                           | Bounded family aggregate; almost always managed together.               |
| Event \<-\> guest family             | Reference via event_invitations | Many-to-many with independent RSVP state.                               |
| Invitation -> member responses      | Embed                           | Responses belong to one family-event invitation and update atomically.  |
| Album -> photos                     | Reference                       | Photos grow independently and have share links / storage metadata.      |
| Campaign -> jobs                    | Reference                       | Potentially hundreds/thousands of independently retried recipient jobs. |

# 14. Guest, Invitation and RSVP Model

## 14.1 Family-First Model

A guest family is the primary invitation unit, but RSVP accuracy remains individual. Members are embedded inside guest_families, while event-specific invitations reference member IDs from that embedded array.

## 14.2 Event-Specific Invitation

GuestFamily  
|  
+-- members\[\]  
|  
+---- event_invitations ---- Event  
|  
+-- invitedMemberIds\[\]  
+-- responses\[\]  
+-- attendingCount

## 14.3 Invitation Access Security

1\. Generate a high-entropy invitation token and send the raw token only in the private URL.

2\. Store only a cryptographic hash of the token in guest family invitation metadata.

3\. On first access, resolve the token hash and ask the guest to enter the email address the invitation was sent to.

4\. Normalize and compare that email with the family primary contact email.

5\. On successful verification, create a short-lived guest session in guest_sessions and set a secure guest cookie.

6\. Guests see only events represented by event_invitations for their family.

## 14.4 RSVP Update Rules

- Only member IDs present in invitedMemberIds may receive a response for that event.

- Each response is PENDING, ATTENDING or NOT_ATTENDING.

- attendingCount is denormalized on the same event_invitations document for efficient event attendance totals.

- Because responses and attendingCount live in one document, a normal atomic update is sufficient; no multi-document transaction is needed.

- Unique event + family constraint prevents duplicate invitation records.

# 15. Expense and Vendor Financial Model

## 15.1 Principle

> **Single source of truth:** If money has been paid, it is an expense. The system does not maintain a second vendor-payment ledger.

## 15.2 Money Representation

Store monetary values as integers in minor units. For INR, INR 30,000.00 is stored as 3,000,000 paise. Formatting to rupees is a presentation concern. This avoids floating-point rounding errors.

## 15.3 Vendor Totals

totalPaid(vendor) = SUM(expenses.amountMinor WHERE expenses.vendorId = vendor.\_id)  
remaining(vendor) = vendor.agreedAmountMinor - totalPaid(vendor)

Phase 1 does not persist vendor.totalPaid or vendor.remainingAmount. They are derived values. At pilot scale, the aggregation cost is acceptable and avoids inconsistent duplicated totals.

## 15.4 Partial Payments

Advance, second payment and final payment are ordinary expense records linked to vendorId. paymentStage is descriptive and optional; there is no forced accounting workflow.

# 16. MongoDB Transactions and Consistency

The architecture prefers single-document atomicity. Transactions are reserved for cross-document business invariants that must never be partially completed.

| **Operation**                                   | **Transaction?**                                  | **Reason**                                                      |
|-------------------------------------------------|---------------------------------------------------|-----------------------------------------------------------------|
| Create task / update checklist                  | No                                                | Single-document write.                                          |
| Submit RSVP                                     | No                                                | Responses and counters live in one event_invitations document.  |
| Create vendor                                   | No                                                | Single-document write.                                          |
| Create expense                                  | No                                                | Single-document write; no vendor-payment ledger to synchronize. |
| Create wedding + owner membership               | Yes                                               | A usable wedding must have its owner membership.                |
| Accept organizer invitation + create membership | Yes                                               | Invite state and membership must change together.               |
| Delete family with invitation records           | Prefer transaction or controlled archive workflow | Avoid orphan event_invitations.                                 |
| Send email                                      | Never                                             | External network I/O must not run inside a DB transaction.      |
| Delete R2 object                                | Never as part of MongoDB transaction              | R2 is an external system; use retryable workflow.               |

## 16.1 Mongoose Transaction Rule

Use Mongoose connection transaction/session APIs only around the minimum set of database operations. Do not perform email delivery, R2 operations or unrelated parallel work inside a transaction.

# 17. Indexes and Unique Constraints

Indexes are created for known query paths and invariants. Phase 1 avoids speculative indexes to limit write overhead and Atlas storage usage.

| **Collection**        | **Index / Constraint**                                          | **Purpose**                                   |
|-----------------------|-----------------------------------------------------------------|-----------------------------------------------|
| users                 | { emailNormalized: 1 } UNIQUE                                   | One account per normalized email.             |
| sessions              | { tokenHash: 1 } UNIQUE                                         | Fast session resolution.                      |
| sessions              | { expiresAt: 1 } TTL                                            | Automatic expired-session cleanup.            |
| wedding_memberships   | { weddingId: 1, userId: 1 } UNIQUE                              | One membership per user per wedding.          |
| organizer_invitations | { tokenHash: 1 } UNIQUE                                         | Secure invite lookup.                         |
| organizer_invitations | { weddingId: 1, emailNormalized: 1 } UNIQUE partial for PENDING | No duplicate active invitation.               |
| events                | { weddingId: 1, startAt: 1 }                                    | Chronological event list.                     |
| tasks                 | { weddingId: 1, status: 1, dueAt: 1 }                           | Wedding task board / overdue queries.         |
| tasks                 | { weddingId: 1, assignedMembershipId: 1, status: 1 }            | Organizer task view.                          |
| timeline_items        | { eventId: 1, startAt: 1 }                                      | Event run sheet.                              |
| vendors               | { weddingId: 1, status: 1 }                                     | Vendor list filtering.                        |
| expenses              | { weddingId: 1, expenseDate: -1 }                               | Recent expenses / reporting.                  |
| expenses              | { weddingId: 1, vendorId: 1, expenseDate: -1 }                  | Vendor paid total/history.                    |
| guest_families        | { weddingId: 1, familyName: 1 }                                 | Family search/sort.                           |
| guest_families        | { weddingId: 1, primaryContact.emailNormalized: 1 }             | Invitation email lookup.                      |
| event_invitations     | { weddingId: 1, eventId: 1, familyId: 1 } UNIQUE                | One invitation relationship per family/event. |
| event_invitations     | { eventId: 1, rsvpStatus: 1 }                                   | Event RSVP summary.                           |
| guest_sessions        | { tokenHash: 1 } UNIQUE                                         | Guest session resolution.                     |
| guest_sessions        | { expiresAt: 1 } TTL                                            | Expired guest-session cleanup.                |
| email_jobs            | { status: 1, scheduledAt: 1 }                                   | Claim ready jobs.                             |
| email_jobs            | { idempotencyKey: 1 } UNIQUE                                    | Prevent duplicated recipient job.             |
| photo_share_links     | { tokenHash: 1 } UNIQUE                                         | Share-link resolution.                        |
| activity_logs         | { weddingId: 1, createdAt: -1 }                                 | Recent activity feed.                         |
| rate_limits           | { key: 1 } UNIQUE                                               | One counter per limiter key/window.           |
| rate_limits           | { expiresAt: 1 } TTL                                            | Automatic limiter cleanup.                    |

> **V1 membership rule:** Do not add a UNIQUE index on wedding_memberships.userId. The one-wedding-per-user rule is a temporary Phase 1 service rule; a unique index would block the future planner multi-wedding model.

# 18. Deletion and Lifecycle Behavior

| **Entity**                                 | **Phase 1 Behavior**                                                                                    |
|--------------------------------------------|---------------------------------------------------------------------------------------------------------|
| Task                                       | Hard delete acceptable when user intentionally removes it.                                              |
| Event with no meaningful dependent history | Hard delete may be allowed.                                                                             |
| Event with RSVP/history                    | Prefer CANCELLED or ARCHIVED rather than destructive removal.                                           |
| Vendor without financial history           | Hard delete acceptable.                                                                                 |
| Vendor referenced by expenses              | Prefer status change/archive to preserve expense references.                                            |
| Expense                                    | User may delete/correct; activity logging recommended. No accounting-grade immutable ledger in Phase 1. |
| Guest family before RSVP                   | Hard delete with dependent invitation cleanup.                                                          |
| Guest family with RSVP history             | Archive or controlled delete with dependent event invitations.                                          |
| Organizer membership                       | Disable/remove access; do not delete user account.                                                      |
| Photo                                      | Delete through storage workflow so MongoDB and R2 converge.                                             |
| Wedding retention after completion         | Automatic seven-day deletion is deferred to Phase 2/3 per latest scope.                                 |

## 18.1 External Storage Deletion

DELETE photo request  
-\> mark metadata DELETING (optional state)  
-\> attempt R2 object deletion  
-\> on success delete/mark metadata deleted  
-\> on failure retain retryable state and log error

# 19. File and Gallery Architecture

## 19.1 Storage Rule

MongoDB stores metadata only. Cloudflare R2 stores user file bytes: gallery photos, vendor documents, receipts, contracts and other attachments. All file access is mediated through a storage abstraction so provider-specific logic is isolated.

StorageService  
createUploadAuthorization()  
deleteObject()  
getObjectUrl() / getSignedReadUrl()  
objectExists()

## 19.2 Upload Flow

1\. Client asks the REST API for an upload intent and supplies metadata such as MIME type and file size.

2\. API authenticates the user, checks wedding permission, applies technical file guards, and creates a short-lived R2 upload authorization.

3\. Browser uploads the file directly to R2; Next.js does not proxy large bytes.

4\. Client calls a completion endpoint; API verifies expected metadata/storage key and creates the MongoDB document/photo record.

5\. If the completion call never arrives, a future cleanup job may remove abandoned objects.

## 19.3 Gallery Privacy and Sharing

- Gallery listing is visible only to verified invited guests with a valid guest session.

- Individual photos may intentionally be shared outside the wedding through a dedicated share URL.

- Share URLs use random tokens; MongoDB stores token hashes rather than raw tokens.

- A shared photo URL grants access only to that photo, not the wedding site, RSVP data, guest list or surrounding gallery.

- Phase 1 does not create thumbnail/medium/large variants; image processing is deferred to later phases.

## 19.4 Technical Upload Guards

Even though business storage/photo quotas are deferred, Phase 1 should still enforce safe MIME types and a maximum individual upload size. These are infrastructure safety controls, not pricing-plan limits.

# 20. Email and Background Job Architecture

## 20.1 Why Email Is Asynchronous

A wedding may contain hundreds or thousands of recipients while provider quotas may be much smaller. An API request must therefore enqueue work rather than attempt to send the entire campaign synchronously.

Organizer clicks Send  
-\> POST communication campaign  
-\> create communication_campaigns record  
-\> create one email_jobs record per recipient  
-\> return immediately  
  
Vercel Cron  
-\> invoke internal job endpoint  
-\> claim a quota-aware batch of QUEUED jobs  
-\> send through Resend  
-\> mark each SENT / FAILED  
-\> update campaign counters

## 20.2 Job Claiming

The processor should atomically claim jobs before sending so overlapping cron invocations do not send the same email. Jobs use an idempotencyKey unique index for a second layer of duplicate protection.

## 20.3 Retry Policy

- Retry transient provider/network failures with bounded attempts and backoff via scheduledAt.

- Do not retry permanent validation errors indefinitely.

- Store providerMessageId when available for debugging and delivery correlation.

- Do not store invitation raw access tokens in logs.

- Display queued/sent/failed counts to organizers; provider quota exhaustion means delayed sending, not false success.

## 20.4 WhatsApp Phase 1

WhatsApp is not automated through a provider API in Phase 1. The application generates a personalized message and opens WhatsApp for the organizer. The system may record that the message action was initiated, but must not claim delivery confirmation it cannot observe.

# 21. Vercel Deployment Topology

Git repository  
-\> Vercel deployment  
-\> Next.js pages / Server Components  
-\> REST Route Handlers (Node.js runtime)  
-\> Internal scheduled endpoints  
  
External managed services:  
MongoDB Atlas - persistent application data and job queue  
Cloudflare R2 - file / gallery object storage  
Resend - transactional email delivery

## 21.1 Vercel-Specific Design Rules

- Do not assume a permanently running application worker.

- Long background workflows are represented as durable MongoDB job state and processed in bounded scheduled executions.

- Reuse a cached Mongoose connection/promise inside warm function instances rather than intentionally opening a new connection for every repository call.

- Keep route handlers within execution limits by avoiding large email loops and file proxying.

- Use environment variables/secrets managed by Vercel for database, R2, Resend and cryptographic configuration.

- Cron/internal job endpoints must require a server-side secret or platform-verified authorization so public callers cannot trigger arbitrary job execution.

# 22. Security Architecture

| **Area**                | **Control**                                                                                                                                                                  |
|-------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Passwords               | Argon2id hashing; never plaintext or reversible encryption.                                                                                                                  |
| Sessions                | Opaque random tokens, hash stored server-side, Secure + HttpOnly cookie.                                                                                                     |
| Authorization           | Wedding membership + explicit module permission on every protected resource operation.                                                                                       |
| Tenant isolation        | Wedding-owned documents carry weddingId; queries scope by authorized weddingId.                                                                                              |
| Input validation        | Zod at API boundary plus Mongoose schema constraints.                                                                                                                        |
| Tokenized links         | Invitation, reset and photo-share raw tokens are sent to user but stored hashed where practical.                                                                             |
| CSRF / browser requests | Use SameSite cookies plus Origin/Host validation for state-changing authenticated requests; add explicit CSRF token if deployment patterns require cross-site cookies later. |
| File upload             | Allow-list MIME types, enforce size guard, authorize upload before issuing R2 credentials.                                                                                   |
| Secrets                 | Vercel environment secrets; never committed to repository or exposed to client bundle.                                                                                       |
| Logging                 | Never log passwords, raw session tokens, reset tokens or private invitation tokens.                                                                                          |
| Rate limiting           | MongoDB-backed limits on auth, reset, invite verification and public guest endpoints.                                                                                        |

## 22.1 Security Checks by Request

Protected organizer request:  
session -> user -> active membership -> weddingId -> permission -> resource scope  
  
Protected guest request:  
guest session -> familyId + weddingId -> event invitation relationship -> requested guest resource

# 23. Rate Limiting and Abuse Protection

Phase 1 uses MongoDB-backed fixed-window or sliding-window counters. Redis is intentionally deferred. Rate limit keys should avoid storing unnecessary raw personal information; hash normalized identifiers when appropriate.

| **Endpoint Category**   | **Example Limiter Key**                                           |
|-------------------------|-------------------------------------------------------------------|
| Login                   | login:\<ip-or-ip-hash\> and optionally login-email:\<email-hash\> |
| Signup                  | signup:\<ip-or-ip-hash\>                                          |
| Forgot password         | password-reset:\<email-hash\>                                     |
| Invitation verification | invite-verify:\<familyId\>:\<ip-hash\>                            |
| Guest RSVP write        | guest-rsvp:\<familyId\>                                           |
| Upload intent           | upload:\<userId\>                                                 |

# 24. Reliability and Idempotency

## 24.1 Duplicate Request Protection

- Unique database indexes protect identity/invitation invariants under concurrent requests.

- Email jobs include a unique idempotencyKey such as campaignId + recipient identity.

- Business-action endpoints that can be retried should update from an expected prior state when possible.

- File completion endpoints should tolerate the same client confirmation being submitted more than once.

- External email/storage failures are retried outside MongoDB transactions.

## 24.2 Failure Examples

| **Failure**              | **Expected Behavior**                                                                               |
|--------------------------|-----------------------------------------------------------------------------------------------------|
| Resend unavailable       | Job remains/reverts to retryable failed/queued state; organizer sees delayed campaign.              |
| R2 upload fails          | No completed MongoDB photo/document metadata is created.                                            |
| R2 delete fails          | Metadata retains retryable deleting/error state rather than pretending deletion succeeded.          |
| MongoDB unavailable      | API returns service error; do not send email/file side effects that depend on uncommitted DB state. |
| Cron invocation overlaps | Atomic job claim/idempotency prevents duplicate email sends.                                        |

# 25. Logging and Observability

Phase 1 uses Vercel Logs and structured application logs. External observability SaaS is deferred until operational need justifies it.

## 25.1 Required Log Context

- requestId / correlation identifier

- route and HTTP method

- userId or familyId when safe and relevant

- weddingId

- domain action

- result / error code

- duration where useful

- email job/campaign ID for background work

## 25.2 Never Log

- Passwords or password hashes

- Raw session cookies/tokens

- Password reset tokens

- Raw private invitation tokens

- Provider API secrets

- Full sensitive request bodies when not needed

## 25.3 Phase 1 Operational Metrics

- API error rate by route/domain.

- Queued/failed email job count and oldest queued job age.

- Campaign sent/failed totals.

- MongoDB connection/query failures.

- R2 upload/delete errors.

- Authentication/rate-limit failures for abuse detection.

# 26. Performance and Caching Strategy

No Redis or dedicated application cache is required in Phase 1. MongoDB queries should be wedding-scoped and indexed by observed query patterns. Next.js rendering/data cache features may be used only where data freshness semantics are clear.

- Dashboard counts may be computed with targeted aggregations at pilot scale.

- Do not denormalize financial totals prematurely.

- Use pagination for potentially large guest, expense, activity and email-job lists.

- Project only required fields for list endpoints.

- Use direct-to-R2 upload to protect function bandwidth and memory.

- If performance issues appear, measure slow endpoints/queries before adding caches or indexes.

# 27. Testing Strategy

| **Layer**       | **Tool**                       | **Focus**                                                                             |
|-----------------|--------------------------------|---------------------------------------------------------------------------------------|
| Unit            | Vitest                         | Domain services, permission functions, money helpers, validation and normalization.   |
| Component       | React Testing Library + Vitest | Forms, tables, permission-based UI states, RSVP controls.                             |
| API integration | Vitest / test MongoDB setup    | Route validation, authentication, authorization, repository behavior and constraints. |
| End-to-end      | Playwright                     | Critical user journeys across actual pages and REST APIs.                             |

## 27.1 Critical E2E Journeys

1\. Sign up -> login -> create wedding -> owner dashboard.

2\. Owner invites organizer -> organizer signs up/logs in -> accepts invite -> permission-restricted dashboard.

3\. Create event -> create family -> assign event invitation -> send/open invitation -> verify email -> submit RSVP.

4\. Create vendor -> record advance expense -> confirm vendor total paid/remaining calculation.

5\. Create gallery album -> direct upload -> guest gallery access -> create/share single-photo link.

6\. Create email campaign -> jobs queued -> scheduled processor sends mocked/test-provider batch -> campaign counters update.

# 28. Environment and Configuration Management

| **Category**     | **Examples**                                                             |
|------------------|--------------------------------------------------------------------------|
| Application      | APP_URL, NODE_ENV                                                        |
| MongoDB          | MONGODB_URI, database name if separate                                   |
| Session/security | SESSION_SECRET / token pepper where used, cookie configuration           |
| Cloudflare R2    | account/bucket/endpoint credentials, public/custom delivery host if used |
| Resend           | RESEND_API_KEY, verified sender identity                                 |
| Cron/jobs        | CRON_SECRET, batch size, max attempts, retry timing                      |
| Upload guards    | allowed MIME types, max file size                                        |
| Feature flags    | Phase-gated optional modules where needed                                |

- Development, preview and production environments must use separate secrets and preferably separate databases/buckets where feasible.

- Configuration values such as email batch size and provider quotas must not be hard-coded into domain logic.

- Never expose server-only credentials through NEXT_PUBLIC\_\* variables.

# 29. API Endpoint Catalogue

The following catalogue is an architecture-level starting contract. Detailed request/response DTOs belong in API specifications or implementation tickets.

| **Domain**    | **Representative Endpoints**                                                                                         |
|---------------|----------------------------------------------------------------------------------------------------------------------|
| Auth          | POST /api/v1/auth/signup; POST /auth/login; POST /auth/logout; POST /auth/forgot-password; POST /auth/reset-password |
| Wedding       | POST /api/v1/weddings; GET/PATCH /weddings/:weddingId                                                                |
| Organizers    | GET /weddings/:weddingId/organizers; POST /organizer-invitations; PATCH /organizers/:membershipId                    |
| Events        | GET/POST /weddings/:weddingId/events; GET/PATCH/DELETE /events/:eventId                                              |
| Tasks         | GET/POST /weddings/:weddingId/tasks; PATCH/DELETE /tasks/:taskId                                                     |
| Timeline      | GET/POST /events/:eventId/timeline; PATCH/DELETE /timeline/:itemId                                                   |
| Vendors       | GET/POST /weddings/:weddingId/vendors; PATCH/DELETE /vendors/:vendorId                                               |
| Expenses      | GET/POST /weddings/:weddingId/expenses; PATCH/DELETE /expenses/:expenseId                                            |
| Guests        | GET/POST /weddings/:weddingId/guest-families; PATCH/DELETE /guest-families/:familyId                                 |
| Invitations   | POST /events/:eventId/invitations; PATCH /event-invitations/:invitationId                                            |
| Guest access  | POST /guest/invitations/:token/verify; GET /guest/wedding; PATCH /guest/event-invitations/:id/rsvp                   |
| Communication | POST /weddings/:weddingId/communications; GET /communications/:campaignId                                            |
| Files         | POST /files/upload-intent; POST /files/complete; DELETE /files/:documentId                                           |
| Gallery       | GET/POST /weddings/:weddingId/albums; POST /albums/:albumId/photos/complete; POST /photos/:photoId/share             |
| Jobs/internal | POST /api/internal/jobs/email (cron protected)                                                                       |

# 30. Phase 2 / Future Evolution

| **Future Need**                                  | **Likely Evolution**                                                                                                                                     |
|--------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| Professional planners managing multiple weddings | Remove Phase 1 one-wedding membership service restriction; existing membership schema already supports many weddings.                                    |
| Vendor marketplace                               | Add external discovery source such as Google Places; create internal vendor records after selection rather than making external API the source of truth. |
| Higher email volume                              | Upgrade provider plan and/or replace MongoDB job execution with a dedicated queue if throughput/operability requires it.                                 |
| Higher rate-limit volume                         | Move limiter storage to Redis/managed KV if MongoDB counters become inefficient.                                                                         |
| Image optimization                               | Background thumbnail/medium/large generation and CDN optimization.                                                                                       |
| Accommodation / transport / seating              | Add dedicated domain modules and collections without changing core wedding/event/guest identity.                                                         |
| Mobile application                               | REST API and domain services can be reused as mobile backend surface.                                                                                    |
| Real-time collaboration                          | Introduce WebSocket/realtime service only when product requirements justify it.                                                                          |
| Retention automation                             | Scheduled post-wedding archive/deletion workflow for R2 and MongoDB with core-history retention.                                                         |
| Advanced observability                           | Add dedicated error monitoring/APM when operational volume justifies cost.                                                                               |

# 31. Architecture Risks and Mitigations

| **Risk**                                            | **Impact**                                         | **Mitigation**                                                                                                                       |
|-----------------------------------------------------|----------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| Free-tier provider quotas change                    | Email/storage/database behavior or cost may change | Keep quotas/config outside domain logic; surface queue state; plan provider upgrades rather than relying on permanent free capacity. |
| MongoDB free cluster storage/index pressure         | Pilot may hit limits sooner than expected          | Keep files out of MongoDB, avoid speculative indexes, TTL transient data, monitor growth and upgrade Atlas when needed.              |
| Vercel serverless job execution overlap/time limits | Duplicate or partial email batches                 | Durable jobs, atomic claim, idempotency keys, bounded batch execution.                                                               |
| Custom authentication mistakes                      | Security compromise                                | Use standard crypto libraries, narrow auth module, strong tests, secure cookies, rate limits and review security-sensitive code.     |
| Permission leakage                                  | Organizer sees sensitive finance/guest data        | Central permission function/middleware; weddingId-scoped queries; integration tests for denied access.                               |
| Invitation link forwarding                          | Unauthorized person may know URL/email             | Email-match verification in V1; OTP can be added later if stronger assurance is required.                                            |
| Large original images                               | Slow guest experience / storage growth             | Direct object storage upload; technical size guards now; thumbnails/variants and business quotas in Phase 2.                         |
| Overgrown monolith                                  | Tight coupling makes future change hard            | Enforce module ownership, domain services/repositories and dependency rules; extract services only when operational need exists.     |

# 32. Final Architecture Checklist

- PASS - One Next.js modular monolith is the Phase 1 deployable application.

- PASS - All business operations use versioned REST APIs.

- PASS - Business rules are kept out of React components and thin route handlers.

- PASS - Custom authentication uses standard password hashing and server-side opaque sessions.

- PASS - Authorization is wedding-scoped through wedding_memberships and module permissions.

- PASS - MongoDB schemas use embedding only for bounded aggregates such as family members, task checklist items and invitation responses.

- PASS - Every major wedding-owned record carries weddingId for tenancy/query simplicity.

- PASS - Expenses are the only financial payment records; there is no vendor-payment collection.

- PASS - Money is stored as integer minor units.

- PASS - RSVP state is modeled in event_invitations with one unique family/event relationship.

- PASS - Cloudflare R2 stores file bytes; MongoDB stores metadata.

- PASS - Gallery listing remains invitation-only while individual photos may have explicit share links.

- PASS - Email campaigns enqueue one durable job per recipient; Vercel Cron processes bounded batches through Resend.

- PASS - No Redis, Kafka, SQS, RabbitMQ or WebSocket infrastructure is required in Phase 1.

- PASS - Vercel Logs are the initial observability surface.

- PASS - Vitest/RTL/Playwright cover unit, component and critical E2E behavior.

- PASS - Phase 2 features can extend the model without rewriting the Phase 1 core.

> **Architecture status:** The Phase 1 architecture is considered implementation-ready. Changes that materially alter authentication, wedding tenancy, guest RSVP structure, financial modeling, REST API strategy, deployment provider, or persistence model should be recorded as architecture decisions before implementation diverges from this document.

# Appendix A. Architecture Decision Log

| **Decision**                     | **Final Phase 1 Choice**                                                            |
|----------------------------------|-------------------------------------------------------------------------------------|
| Monolith vs microservices        | Modular monolith.                                                                   |
| Separate backend server          | No. Next.js Node.js runtime is the backend.                                         |
| API interface                    | REST for all business operations.                                                   |
| Database                         | MongoDB Atlas + Mongoose.                                                           |
| Deployment                       | Vercel.                                                                             |
| Authentication library/service   | No third-party auth platform; custom auth flow with standard cryptographic package. |
| Session mechanism                | Opaque server-side session + HttpOnly cookie.                                       |
| UI                               | Tailwind CSS + shadcn/ui.                                                           |
| Validation                       | Zod.                                                                                |
| Interactive client data          | TanStack Query selectively; Server Components for initial reads.                    |
| Object storage                   | Cloudflare R2.                                                                      |
| Image processing                 | Deferred to Phase 2/3.                                                              |
| Email provider                   | Resend.                                                                             |
| Background work                  | MongoDB job collection + Vercel Cron, no permanent worker.                          |
| Real-time                        | None in Phase 1.                                                                    |
| Search                           | MongoDB only.                                                                       |
| Rate limiting                    | MongoDB-backed initially.                                                           |
| Vendor payments                  | No separate model; recorded as expenses.                                            |
| Post-wedding automatic retention | Deferred to Phase 2/3.                                                              |
| Testing                          | Vitest + React Testing Library + Playwright.                                        |

# Appendix B. Glossary

| **Term**          | **Meaning**                                                                                            |
|-------------------|--------------------------------------------------------------------------------------------------------|
| Wedding Workspace | The tenant-like scope containing one wedding and all related planning data.                            |
| Owner             | User who owns the wedding and has unrestricted wedding management access.                              |
| Organizer         | Authenticated collaborator with module-level permissions.                                              |
| Guest Family      | Household/group used as the primary invitation unit.                                                   |
| Event Invitation  | Relationship document between an event and guest family, including invited members and RSVP responses. |
| Guest Session     | Short-lived session created after invitation token + email verification.                               |
| Campaign          | Organizer communication action targeting one or more guest families.                                   |
| Email Job         | Durable per-recipient queued unit processed asynchronously.                                            |
| Minor Unit        | Integer subunit of currency; paise for INR.                                                            |
| R2 Storage Key    | Internal object identifier for a file stored in Cloudflare R2.                                         |
