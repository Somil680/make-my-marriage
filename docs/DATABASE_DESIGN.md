# Make My Marriage — Database Design

**Phase 1 | MongoDB Data Model | Final v1.0**

**Last updated:** 23 September 2026

> **Database principle:** Keep wedding data tenant-scoped, embed only bounded aggregates, store money as integer minor units, archive business records by default, retain uploader/moderation traceability for user-generated media, and design indexes around real query patterns.

## Document Metadata

| Item | Value |
|---|---|
| Status | Final — Phase 1 (archive-first + gallery uploader/moderation revision) |
| Companion PRD | Make My Marriage Product Requirements Document v1.0 |
| Companion architecture | Make My Marriage System Design & Architecture v1.0 |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Validation | Zod |
| File storage | Cloudflare R2 |

## Contents

- 1. Document Purpose and Scope
- 2. Database Design Principles
- 3. Phase 1 Collection Inventory
- 4. Relationship Map
- 5. Common Field and Naming Conventions
- 6. users
- 7. sessions
- 8. weddings
- 9. wedding_memberships
- 10. organizer_invitations
- 11. events
- 12. tasks
- 13. timeline_items
- 14. vendors
- 15. expenses
- 16. guest_families
- 17. event_invitations
- 18. guest_sessions
- 19. documents
- 20. gallery_albums and gallery_photos
- 21. photo_share_links
- 22. communication_campaigns
- 23. email_jobs
- 24. notifications
- 25. activity_logs
- 26. rate_limits and password_reset_tokens
- 27. Embed vs Reference Decision Matrix
- 28. Wedding Tenancy and Authorization Boundaries
- 29. Validation and Normalization Rules
- 30. Transaction Boundaries and Consistency
- 31. Archival, Deletion, and Lifecycle Behavior
- 32. Primary Query Patterns
- 33. Starting Index Catalogue
- 34. Uniqueness and Concurrency Guarantees
- 35. Mongoose Implementation Conventions
- 36. Repository and Service Data-Access Rules
- 37. Schema Evolution and Data Migration
- 38. Data Security and Privacy Controls
- 39. Phase 1 Capacity and Growth Notes
- 40. Deferred / Future Database Extensions
- 41. Implementation Checklist
- 42. Database Decision Log

# 1. Document Purpose and Scope

This document defines the Phase 1 MongoDB database design for Make My Marriage. It is the implementation-level companion to the Product Requirements Document v1.0 and System Design & Architecture v1.0. It specifies collections, fields, relationships, embedding/reference decisions, query patterns, indexes, validation rules, transaction boundaries, lifecycle behavior, and Mongoose conventions.

## 1.1 In Scope

- MongoDB Atlas collections used by the Phase 1 modular monolith.
- Exact document shapes and ownership/tenancy fields.
- Guest-family, invitation, RSVP, organizer-permission, vendor, and expense models.
- Cloudflare R2 file metadata models; file bytes remain outside MongoDB.
- MongoDB-backed email jobs, sessions, rate limits, notifications, and activity logs.
- Starting indexes, uniqueness rules, TTL indexes, and transaction boundaries.
- Mongoose model conventions, validation responsibilities, and migration/versioning approach.

## 1.2 Explicitly Out of Scope

- Vendor marketplace and Google Places vendor discovery implementation.
- Accommodation, transport, advanced seating, and photo processing variants.
- A separate vendor-payment ledger or accounting/reconciliation subsystem.
- Automatic post-wedding deletion/retention automation; deferred to a later phase.
- Redis, Elasticsearch, Kafka, RabbitMQ, or a dedicated analytics warehouse.

> **Design note:** Phase 1 financial rule: money is recorded only through the expenses collection. A vendor can have an agreed amount, but advance/second/final payments are ordinary expense records linked to that vendor.

# 2. Database Design Principles

| Principle | Decision |
|---|---|
| Wedding-scoped tenancy | Most domain documents carry weddingId directly, even when it could be derived through another document. |
| Embed bounded aggregates | Embed data that is small, owned by one parent, and normally read/updated with that parent. |
| Reference independently growing data | Events, guests, tasks, expenses, vendors, photos, campaigns and jobs are separate collections. |
| One source of truth | Do not duplicate financial totals or RSVP state across multiple collections unless a deliberate denormalized field is maintained atomically. |
| Integer money | All monetary values are stored in minor units (paise) as integers. |
| Query-driven indexes | Create indexes for known access patterns; avoid indexing every field. |
| Single-document atomicity first | Design aggregates so common operations update one document. Use transactions only when a true cross-document invariant exists. |
| External bytes stay external | MongoDB stores metadata and storage keys; Cloudflare R2 stores file bytes. |
| Archive-first business lifecycle | Normal product deletion archives core domain records using archivedAt/archivedByUserId; hard deletion is reserved for technical, retention, or external-file cleanup cases. |
| User-generated media accountability | Gallery uploads require an authenticated organizer or verified guest context and store uploader/moderation metadata. |
| Temporary business rules stay in services | One active wedding per user is enforced in application logic, not as a permanent userId uniqueness rule. |

# 3. Phase 1 Collection Inventory

| Collection | Purpose | Wedding-scoped |
|---|---|---|
| users | Application identities and credential metadata | No |
| sessions | Opaque authenticated organizer sessions | No (user-scoped) |
| weddings | Core wedding workspace configuration | Root |
| wedding_memberships | Organizer membership and module permissions | Yes |
| organizer_invitations | Pending/revoked organizer invitations | Yes |
| events | Wedding functions such as Haldi/Sangeet/Wedding | Yes |
| tasks | Planning tasks and embedded checklist items | Yes |
| timeline_items | Event run-sheet entries | Yes |
| vendors | Internally managed vendor records | Yes |
| expenses | All actual spend, including vendor advance/partial/final payments | Yes |
| guest_families | Family/household aggregate with embedded members | Yes |
| event_invitations | Family-to-event invitation and RSVP aggregate | Yes |
| guest_sessions | Temporary private wedding-site guest sessions | Yes |
| documents | Metadata for receipts, contracts and attachments stored in R2 | Yes |
| gallery_albums | Photo album metadata | Yes |
| gallery_photos | Photo metadata, verified uploader/moderation audit, and R2 storage key | Yes |
| photo_share_links | Publicly shareable single-photo tokens | Yes |
| communication_campaigns | Invitation/reminder/announcement campaign state | Yes |
| email_jobs | Per-recipient queued Resend work | Yes |
| notifications | Organizer-facing in-app notifications | Yes |
| activity_logs | Wedding-scoped change/activity history | Yes |
| rate_limits | Short-lived abuse/rate-limit counters | No/mixed |
| password_reset_tokens | Short-lived password-reset secrets | No |

# 4. Relationship Map

```text
User
 ├─ Session
 └─ WeddingMembership ──────────────┐
                                    │
                                 Wedding
                                    │
      ┌─────────────┬───────────────┼──────────────┬─────────────┐
      │             │               │              │             │
    Event          Task           Vendor      GuestFamily      Expense
      │             │               │              │             │
      │          checklist[]        └──────────────┘             │
      │                                            vendorId? ────┘
      │
      ├─ TimelineItem
      └─ EventInvitation ── GuestFamily
             └─ responses[] / invitedMemberIds[]

Wedding
 ├─ Document metadata ── Cloudflare R2 object
 ├─ GalleryAlbum ── GalleryPhoto ── PhotoShareLink
 │                    └─ uploadedBy -> User or verified GuestFamily/member
 ├─ CommunicationCampaign ── EmailJob ── Resend
 ├─ Notification
 └─ ActivityLog
```

All wedding-domain queries must resolve an authorized wedding first. Repositories should prefer filters containing weddingId so tenant boundaries are visible in the query rather than inferred later.

# 5. Common Field and Naming Conventions

| Convention | Rule |
|---|---|
| Identifiers | MongoDB ObjectId for internal entities. Public tokens are random opaque strings; only hashes are stored where the token grants access. |
| Time | Store all timestamps as BSON Date in UTC. Convert to the wedding/user timezone in the presentation layer. |
| Money | Use integer minor units: ₹1,500.50 -> 150050 paise. Avoid floating-point currency fields. |
| Enums | Upper snake-case strings, e.g. IN_PROGRESS, NOT_ATTENDING, BANK_TRANSFER. |
| Normalization | Store normalized email/name helpers only where they support identity, lookup, or uniqueness. |
| Archive-first lifecycle | Core business records are archived rather than hard-deleted through normal product flows; short-lived/security data and external file bytes may still be physically deleted. |
| Media accountability | Every uploaded gallery photo records the verified uploader context and moderation state; anonymous gallery uploads are not permitted. |
| Mongoose timestamps | Use timestamps: true for createdAt and updatedAt unless a short-lived technical collection has a narrower model. |
| Archive metadata | Archive-capable business documents include archivedAt (nullable Date) and archivedByUserId (nullable ObjectId). These common optional fields are not repeated in every collection table. |
| Schema strictness | Use Mongoose strict schemas and Zod request validation; do not accept arbitrary client fields. |

# 6. users

Stores organizer/account identities and password credential metadata.

| Field | Type | Required | Rules / Notes |
|---|---|---|---|
| _id | ObjectId | Yes | Primary key. |
| name | string | Yes | Trimmed display name. |
| email | string | Yes | Original/canonical email used for display and delivery. |
| emailNormalized | string | Yes | Lowercased/trimmed identity key. |
| passwordHash | string | Yes | Argon2id output; never return through API. |
| emailVerified | boolean | Yes | Default false. |
| emailVerifiedAt | Date | No | Set when verification completes. |
| status | enum | Yes | ACTIVE \| DISABLED. |
| createdAt / updatedAt | Date | Yes | Mongoose timestamps. |

## 6.1 Representative Document Shape

```text
{
  _id,
  name: "Rahul Agrawal",
  email: "rahul@example.com",
  emailNormalized: "rahul@example.com",
  passwordHash: "<argon2id>",
  emailVerified: true,
  emailVerifiedAt: ISODate(...),
  status: "ACTIVE",
  createdAt,
  updatedAt
}
```

## 6.2 Business / Validation Rules

- Normalize email before duplicate checks and persistence.
- Never store raw passwords, reset codes, or session tokens.
- Phase 1 one-wedding rule is not encoded here; membership/service logic owns it.

## 6.3 Primary Query Patterns

- Login by emailNormalized.
- Fetch organizer identity by _id after session resolution.

## 6.4 Starting Indexes

| Index | Constraint / Purpose |
|---|---|
| { emailNormalized: 1 } | UNIQUE. Primary login lookup and duplicate prevention. |

# 7. sessions

Stores revocable server-side organizer sessions for opaque secure cookies.

| Field | Type | Required | Rules / Notes |
|---|---|---|---|
| _id | ObjectId | Yes | Primary key. |
| userId | ObjectId | Yes | Reference to users._id. |
| tokenHash | string | Yes | Hash of random token stored in the HttpOnly cookie. |
| expiresAt | Date | Yes | Session expiry; TTL cleanup target. |
| lastUsedAt | Date | Yes | Optional rolling/session activity timestamp. |
| userAgent | string | No | Diagnostic context; avoid depending on it for security. |
| createdAt | Date | Yes | Creation time. |

## 7.2 Business / Validation Rules

- Only a hash of the cookie token is persisted.
- Logout deletes/revokes the server-side session.
- Disabled users must fail authorization even if a session record still exists.

## 7.3 Primary Query Patterns

- Resolve tokenHash from cookie.
- Delete sessions for a user during security-sensitive account actions.

## 7.4 Starting Indexes

| Index | Constraint / Purpose |
|---|---|
| { tokenHash: 1 } | UNIQUE. Resolve session securely. |
| { expiresAt: 1 } | TTL with expireAfterSeconds: 0. |
| { userId: 1, createdAt: -1 } | Optional if account/session management UI is introduced. |

# 8. weddings

Root aggregate for a wedding workspace. Keep the root document small; large child data belongs in referenced collections.

| Field | Type | Required | Rules / Notes |
|---|---|---|---|
| _id | ObjectId | Yes | Primary key. |
| ownerUserId | ObjectId | Yes | Creator/owner; owner also has a membership document. |
| couple.brideName | string | Yes | Display name. |
| couple.groomName | string | Yes | Display name. |
| title | string | Yes | Wedding title. |
| startDate | Date | Yes | First wedding date. |
| endDate | Date | Yes | Last wedding date; must be >= startDate. |
| primaryCity | string | No | Primary city/location. |
| coverImageKey | string | No | R2 key or document/media reference. |
| status | enum | Yes | PLANNING \| ONGOING \| COMPLETED. Archival is represented by common archivedAt metadata. |
| currency | string | Yes | INR in Phase 1. |
| website | embedded object | Yes | Private-site feature flags/theme reference. |
| theme | embedded object | Yes | Bounded visual configuration. |
| createdAt / updatedAt | Date | Yes | Mongoose timestamps. |

## 8.2 Business / Validation Rules

- Do not embed organizers, events, guests, tasks, vendors, expenses, or photos.
- Archiving a wedding sets archivedAt/archivedByUserId; it does not trigger automatic post-wedding deletion in Phase 1.
- The owner role must not depend on editable permission fields.

## 8.3 Primary Query Patterns

- Load active wedding for owner/member.
- Load wedding header/settings for dashboard and guest site.

## 8.4 Starting Indexes

| Index | Constraint / Purpose |
|---|---|
| { ownerUserId: 1, archivedAt: 1, status: 1 } | Supports active owner workspace lookup; not unique. |

# 9. wedding_memberships

Connects users to weddings and stores organizer role, relationship, permissions, and responsibility metadata.

| Field | Type | Required | Rules / Notes |
|---|---|---|---|
| _id | ObjectId | Yes | Primary key. |
| weddingId | ObjectId | Yes | Tenant key -> weddings._id. |
| userId | ObjectId | Yes | Organizer -> users._id. |
| role | enum | Yes | OWNER \| ORGANIZER. |
| relationship | enum | Yes | BRIDE \| GROOM \| PARENT \| SIBLING \| RELATIVE \| FRIEND \| PLANNER \| OTHER. |
| customRelationship | string | No | Used when relationship=OTHER. |
| permissions | embedded object | Yes | Module values NONE \| VIEW \| MANAGE. |
| assignedEventIds | ObjectId[] | Yes | Responsibility metadata; not a security boundary in V1. |
| status | enum | Yes | ACTIVE \| DISABLED. |
| joinedAt | Date | Yes | Membership activation date. |
| createdAt / updatedAt | Date | Yes | Mongoose timestamps. |

## 9.2 Business / Validation Rules

- OWNER bypasses module permission checks and must retain full access.
- assignedEventIds controls responsibility views only; module permissions control authorization.
- Do not create a unique index on userId; multi-wedding planner support is a future requirement.

## 9.3 Primary Query Patterns

- Resolve membership for every authorized wedding request.
- List organizers for the organizer-management screen.

## 9.4 Starting Indexes

| Index | Constraint / Purpose |
|---|---|
| { weddingId: 1, userId: 1 } | UNIQUE. One membership for a user in a wedding. |
| { userId: 1, status: 1 } | Supports Phase 1 active-membership business-rule check. |
| { weddingId: 1, status: 1 } | Lists active organizers. |

# 10. organizer_invitations

Stores pending organizer invitations before a user has accepted/created an account.

| Field | Type | Required | Rules / Notes |
|---|---|---|---|
| _id | ObjectId | Yes | Primary key. |
| weddingId | ObjectId | Yes | Tenant key. |
| email | string | Yes | Delivery/display email. |
| emailNormalized | string | Yes | Identity/uniqueness key. |
| relationship | enum/string | Yes | Relationship intended by inviter. |
| permissions | embedded object | Yes | Permissions copied into membership at acceptance. |
| tokenHash | string | Yes | Hash of organizer invite token. |
| status | enum | Yes | PENDING \| ACCEPTED \| REVOKED \| EXPIRED. |
| invitedByUserId | ObjectId | Yes | Inviter. |
| expiresAt | Date | Yes | Application expiration check. |
| acceptedAt | Date | No | Set after membership creation. |
| createdAt / updatedAt | Date | Yes | Mongoose timestamps. |

## 10.2 Business / Validation Rules

- Accepting an invite creates membership and marks invitation accepted in one MongoDB transaction.
- Revoked/expired invitations may later be re-created; uniqueness therefore applies only to pending invites.

## 10.3 Primary Query Patterns

- Resolve invitation from tokenHash.
- List pending organizer invitations.

## 10.4 Starting Indexes

| Index | Constraint / Purpose |
|---|---|
| { tokenHash: 1 } | UNIQUE. Invite resolution. |
| { weddingId: 1, emailNormalized: 1 } | UNIQUE partial where status=PENDING; prevents duplicate live invites. |
| { weddingId: 1, status: 1, createdAt: -1 } | Invitation-management list. |

# 11. events

Represents each wedding function as a first-class entity.

| Field | Type | Required | Rules / Notes |
|---|---|---|---|
| _id | ObjectId | Yes | Primary key. |
| weddingId | ObjectId | Yes | Tenant key. |
| name | string | Yes | Event display name. |
| type | enum | Yes | ROKA \| ENGAGEMENT \| HALDI \| MEHENDI \| SANGEET \| COCKTAIL \| WEDDING \| RECEPTION \| CUSTOM. |
| description | string | No | Event details. |
| startAt | Date | Yes | Event start. |
| endAt | Date | No | Must be >= startAt. |
| venue | embedded object | Yes | name, address, mapUrl, optional lat/lng. |
| dressCode | string | No | Guest-facing dress code. |
| coverImageKey | string | No | R2 key/media ref. |
| status | enum | Yes | ACTIVE \| CANCELLED. Archival is represented by common archivedAt metadata. |
| createdAt / updatedAt | Date | Yes | Mongoose timestamps. |

## 11.2 Business / Validation Rules

- Venue is embedded because it is bounded and owned by the event.
- An event with RSVP/history should be archived rather than hard-deleted. Cancellation remains a business status distinct from archival.

## 11.3 Primary Query Patterns

- List wedding events in chronological order.
- Fetch event by weddingId + _id for authorized operations.

## 11.4 Starting Indexes

| Index | Constraint / Purpose |
|---|---|
| { weddingId: 1, archivedAt: 1, startAt: 1 } | Primary active chronological event list. |
| { weddingId: 1, archivedAt: 1, status: 1, startAt: 1 } | Optional if active/cancelled filtering is frequent. |

# 12. tasks

Stores wedding/event planning tasks with a bounded embedded checklist.

| Field | Type | Required | Rules / Notes |
|---|---|---|---|
| _id | ObjectId | Yes | Primary key. |
| weddingId | ObjectId | Yes | Tenant key. |
| eventId | ObjectId | No | Optional event scope. |
| assignedMembershipId | ObjectId | No | Organizer assignment. |
| title | string | Yes | Task title. |
| description | string | No | Details. |
| category | string | No | Configurable category. |
| status | enum | Yes | TODO \| IN_PROGRESS \| WAITING \| COMPLETED. |
| priority | enum | Yes | LOW \| MEDIUM \| HIGH. |
| dueAt | Date | No | Due date/time. |
| checklist | embedded array | Yes | Bounded checklist: _id, title, completed, completedAt. |
| createdByUserId | ObjectId | Yes | Audit actor. |
| completedAt | Date | No | Set when status becomes COMPLETED. |
| createdAt / updatedAt | Date | Yes | Mongoose timestamps. |

## 12.2 Business / Validation Rules

- Checklist stays embedded because it is bounded and updated with the task.
- Completing a checklist item is a single-document atomic update.
- Do not create a separate comments collection unless Phase 1 task comments are actually implemented.

## 12.3 Primary Query Patterns

- Dashboard pending/overdue tasks.
- Tasks assigned to an organizer.
- Tasks for an event.

## 12.4 Starting Indexes

| Index | Constraint / Purpose |
|---|---|
| { weddingId: 1, archivedAt: 1, status: 1, dueAt: 1 } | Pending/overdue active task views. |
| { weddingId: 1, archivedAt: 1, assignedMembershipId: 1, status: 1 } | Active organizer task view. |
| { weddingId: 1, archivedAt: 1, eventId: 1, status: 1 } | Active event task view; add only if used frequently. |

# 13. timeline_items

Stores chronological run-sheet entries for a wedding event; separate from preparation tasks.

| Field | Type | Required | Rules / Notes |
|---|---|---|---|
| _id | ObjectId | Yes | Primary key. |
| weddingId | ObjectId | Yes | Tenant key. |
| eventId | ObjectId | Yes | Owning event. |
| title | string | Yes | Timeline label. |
| description | string | No | Details. |
| startAt | Date | Yes | Scheduled start. |
| endAt | Date | No | Optional end. |
| location | string | No | Specific location/room/stage. |
| responsibleMembershipId | ObjectId | No | Responsible organizer. |
| status | enum | Yes | SCHEDULED \| DONE \| CANCELLED. |
| notes | string | No | Operational notes. |
| createdAt / updatedAt | Date | Yes | Mongoose timestamps. |

## 13.3 Primary Query Patterns

- Load event timeline ordered by startAt.

## 13.4 Starting Indexes

| Index | Constraint / Purpose |
|---|---|
| { eventId: 1, archivedAt: 1, startAt: 1 } | Active run-sheet chronological order. |
| { weddingId: 1, archivedAt: 1, startAt: 1 } | Active cross-event wedding-day view if implemented. |

# 14. vendors

Stores vendors managed internally by organizers. Vendors do not have platform accounts in Phase 1.

| Field | Type | Required | Rules / Notes |
|---|---|---|---|
| _id | ObjectId | Yes | Primary key. |
| weddingId | ObjectId | Yes | Tenant key. |
| name | string | Yes | Vendor/business name. |
| nameNormalized | string | No | Optional normalized search helper. |
| category | string | Yes | Vendor category. |
| contactPerson | string | No | Primary contact. |
| phone / email / whatsapp | string | No | Contact channels. |
| address | string | No | Vendor address. |
| eventIds | ObjectId[] | Yes | Events served; bounded array. |
| status | enum | Yes | CONTACTED \| NEGOTIATING \| CONFIRMED \| COMPLETED \| CANCELLED. |
| agreedAmountMinor | integer | No | Negotiated total in paise; not the paid total. |
| notes | string | No | Organizer notes. |
| createdAt / updatedAt | Date | Yes | Mongoose timestamps. |

## 14.2 Business / Validation Rules

- Do not store totalPaid or remainingAmount as persistent fields in Phase 1.
- Paid amount = sum of linked expenses for the vendor.
- Future Google Places integration may add source/externalPlaceId without changing the wedding vendor concept.

## 14.3 Primary Query Patterns

- List vendors by status/category.
- Load vendor plus aggregate of related expenses.

## 14.4 Starting Indexes

| Index | Constraint / Purpose |
|---|---|
| { weddingId: 1, archivedAt: 1, status: 1 } | Active vendor list/status filters. |
| { weddingId: 1, archivedAt: 1, category: 1 } | Add only if category filtering is frequent. |
| { weddingId: 1, archivedAt: 1, nameNormalized: 1 } | Optional active search helper; not unique. |

# 15. expenses

Single Phase 1 financial source of truth. Every actual payment/spend is an expense, including vendor advances and final payments.

| Field | Type | Required | Rules / Notes |
|---|---|---|---|
| _id | ObjectId | Yes | Primary key. |
| weddingId | ObjectId | Yes | Tenant key. |
| eventId | ObjectId | No | Optional event link. |
| vendorId | ObjectId | No | Optional vendor link. |
| title | string | Yes | Human-readable expense title. |
| category | string | Yes | Expense category. |
| amountMinor | integer | Yes | Amount in paise; must be > 0. |
| expenseDate | Date | Yes | Date money was paid/spent. |
| paymentStage | enum | No | ADVANCE \| SECOND_PAYMENT \| FINAL_PAYMENT \| OTHER. Informational only. |
| paidByMembershipId | ObjectId | No | Organizer/family payer if tracked. |
| paymentMethod | enum | No | CASH \| UPI \| BANK_TRANSFER \| CARD \| OTHER. |
| receiptDocumentId | ObjectId | No | Receipt metadata reference. |
| notes | string | No | Additional information. |
| createdByUserId | ObjectId | Yes | Audit actor. |
| status | enum | Yes | ACTIVE \| VOIDED. |
| createdAt / updatedAt | Date | Yes | Mongoose timestamps. |

## 15.1 Representative Document Shape

```text
{
  weddingId,
  vendorId: ObjectId("..."),
  title: "Photographer advance",
  category: "PHOTOGRAPHY",
  amountMinor: 3000000,
  expenseDate: ISODate(...),
  paymentStage: "ADVANCE",
  paymentMethod: "UPI",
  status: "ACTIVE"
}
```

## 15.2 Business / Validation Rules

- There is no vendor_payments collection in Phase 1.
- Vendor paid amount is aggregated from ACTIVE expenses with vendorId.
- Vendor remaining amount = agreedAmountMinor - linked active expense total, clamped/displayed according to business rules.
- A voided expense is excluded from totals. Financial correction uses VOIDED; ordinary removal from operational views uses archivedAt rather than hard deletion.

## 15.3 Primary Query Patterns

- Chronological wedding expenses.
- Sum actual spend by vendor/event/category/payer.
- Compute total spent for dashboard.

## 15.4 Starting Indexes

| Index | Constraint / Purpose |
|---|---|
| { weddingId: 1, archivedAt: 1, expenseDate: -1 } | Primary active expense ledger/list. |
| { weddingId: 1, archivedAt: 1, vendorId: 1, expenseDate: -1 } | Active vendor paid-total/history; add if vendor pages use it heavily. |
| { weddingId: 1, archivedAt: 1, eventId: 1, expenseDate: -1 } | Active event spending view; add if used frequently. |
| { weddingId: 1, archivedAt: 1, category: 1, expenseDate: -1 } | Active category report; optional until reporting query is confirmed. |

# 16. guest_families

Family-first guest aggregate. Family members are embedded because they are bounded and normally managed together.

| Field | Type | Required | Rules / Notes |
|---|---|---|---|
| _id | ObjectId | Yes | Primary key. |
| weddingId | ObjectId | Yes | Tenant key. |
| familyName | string | Yes | Household/group name. |
| primaryContact.name | string | Yes | Primary contact display name. |
| primaryContact.email | string | No | Invitation email. |
| primaryContact.emailNormalized | string | No | Email verification comparison key. |
| primaryContact.phone | string | No | Phone/WhatsApp. |
| side | enum | Yes | BRIDE \| GROOM \| BOTH. |
| relationship | string | No | Family relationship/category. |
| members | embedded array | Yes | Each item: _id, name, relationship?, ageGroup?. |
| invitationAccess.tokenHash | string | No | Hash of private family invitation link token. |
| invitationAccess.generatedAt | Date | No | Token generation timestamp. |
| invitationAccess.revokedAt | Date | No | Revocation marker. |
| notes | string | No | Organizer notes. |
| createdAt / updatedAt | Date | Yes | Mongoose timestamps. |

## 16.2 Business / Validation Rules

- members are embedded; do not create guest_members in Phase 1.
- Each embedded member receives its own ObjectId so event invitation arrays can reference specific family members.
- Family invitation is private, but individual gallery share links are separately public/shareable.
- Archiving a family hides it from active guest-management views without deleting RSVP/event-invitation history.
- Guest email verification compares normalized input with the family primary-contact email.

## 16.3 Primary Query Patterns

- List families by wedding/side.
- Resolve family from invitation token hash.
- Load whole family when editing members.

## 16.4 Starting Indexes

| Index | Constraint / Purpose |
|---|---|
| { weddingId: 1, archivedAt: 1, familyName: 1 } | Active family list/search support; not unique. |
| { weddingId: 1, archivedAt: 1, "primaryContact.emailNormalized": 1 } | Active invitation/contact lookup; not globally unique because one email may represent multiple households in edge cases. |
| { "invitationAccess.tokenHash": 1 } | UNIQUE partial when tokenHash exists. |

# 17. event_invitations

Many-to-many relationship between an event and a guest family; also the RSVP aggregate.

| Field | Type | Required | Rules / Notes |
|---|---|---|---|
| _id | ObjectId | Yes | Primary key. |
| weddingId | ObjectId | Yes | Tenant key. |
| eventId | ObjectId | Yes | Invited event. |
| familyId | ObjectId | Yes | Invited family. |
| invitedMemberIds | ObjectId[] | Yes | IDs of embedded family members invited to this event. |
| responses | embedded array | Yes | memberId + PENDING/ATTENDING/NOT_ATTENDING. |
| rsvpStatus | enum | Yes | PENDING \| PARTIAL \| RESPONDED. |
| attendingCount | integer | Yes | Denormalized count maintained in same atomic document update. |
| respondedAt | Date | No | Last/first completion timestamp per chosen service semantics. |
| updatedByGuestAt | Date | No | Guest-originated RSVP timestamp. |
| createdAt / updatedAt | Date | Yes | Mongoose timestamps. |

## 17.1 Representative Document Shape

```text
{
  weddingId,
  eventId,
  familyId,
  invitedMemberIds: [memberA, memberB, memberC],
  responses: [
    { memberId: memberA, status: "ATTENDING" },
    { memberId: memberB, status: "ATTENDING" },
    { memberId: memberC, status: "NOT_ATTENDING" }
  ],
  rsvpStatus: "RESPONDED",
  attendingCount: 2
}
```

## 17.2 Business / Validation Rules

- Only IDs present in invitedMemberIds may be submitted in guest RSVP responses.
- Responses belong in the same document so person-by-person RSVP plus attendingCount can update atomically.
- If a family member is removed after invitations exist, service logic must reconcile affected event_invitations rather than leaving dangling member IDs.
- The guest sees only event invitations associated with their family.

## 17.3 Primary Query Patterns

- List invited events for family.
- Count attending/pending/declined states for event.
- Update one family-event RSVP atomically.

## 17.4 Starting Indexes

| Index | Constraint / Purpose |
|---|---|
| { weddingId: 1, eventId: 1, familyId: 1 } | UNIQUE. One family-event invitation relationship. |
| { eventId: 1, rsvpStatus: 1 } | Event RSVP dashboard counts/lists. |
| { familyId: 1, eventId: 1 } | Guest site: all invited events for a family. |

# 18. guest_sessions

Stores short-lived guest-site sessions after invitation-link + email verification succeeds.

| Field | Type | Required | Rules / Notes |
|---|---|---|---|
| _id | ObjectId | Yes | Primary key. |
| weddingId | ObjectId | Yes | Wedding access boundary. |
| familyId | ObjectId | Yes | Verified family. |
| tokenHash | string | Yes | Hash of guest session cookie token. |
| expiresAt | Date | Yes | TTL target. |
| createdAt | Date | Yes | Session creation. |

## 18.2 Business / Validation Rules

- Guest sessions cannot authorize organizer APIs.
- Guest authorization always remains family-scoped and wedding-scoped.

## 18.3 Primary Query Patterns

- Resolve guest session cookie.

## 18.4 Starting Indexes

| Index | Constraint / Purpose |
|---|---|
| { tokenHash: 1 } | UNIQUE. Guest session lookup. |
| { expiresAt: 1 } | TTL with expireAfterSeconds: 0. |
| { familyId: 1, createdAt: -1 } | Optional if guest session management/revocation by family is needed. |

# 19. documents

Metadata for files stored in Cloudflare R2, including receipts, quotations, contracts and attachments.

| Field | Type | Required | Rules / Notes |
|---|---|---|---|
| _id | ObjectId | Yes | Primary key. |
| weddingId | ObjectId | Yes | Tenant key. |
| storageKey | string | Yes | R2 object key; unique within storage namespace. |
| originalFilename | string | Yes | Sanitized display filename. |
| mimeType | string | Yes | Validated type. |
| fileSize | integer | Yes | Bytes. |
| category | enum/string | Yes | RECEIPT \| CONTRACT \| QUOTATION \| TASK_ATTACHMENT \| EVENT_ATTACHMENT \| OTHER. |
| linkedEntityType | enum | No | EXPENSE \| VENDOR \| TASK \| EVENT \| WEDDING. |
| linkedEntityId | ObjectId | No | Referenced entity; validated in service layer. |
| uploadedByUserId | ObjectId | Yes | Uploader. |
| status | enum | Yes | ACTIVE \| DELETING \| DELETED. |
| createdAt / updatedAt | Date | Yes | Mongoose timestamps. |

## 19.2 Business / Validation Rules

- MongoDB never stores the actual file bytes.
- R2 deletion is eventually consistent with MongoDB metadata because external object storage cannot join a MongoDB transaction.

## 19.3 Primary Query Patterns

- List documents for wedding.
- Load attachments for a specific entity.

## 19.4 Starting Indexes

| Index | Constraint / Purpose |
|---|---|
| { weddingId: 1, createdAt: -1 } | Documents page. |
| { weddingId: 1, linkedEntityType: 1, linkedEntityId: 1 } | Entity attachments. |
| { storageKey: 1 } | UNIQUE. Prevent duplicate metadata for same object key. |

# 20. gallery_albums and gallery_photos

Separates gallery grouping from individual photo metadata while Cloudflare R2 stores image bytes. Gallery uploads are attributable: organizers and verified guests may upload only when the album policy allows it, and every photo stores enough uploader context for moderation and audit.

| Field | Type | Required | Rules / Notes |
|---|---|---|---|
| gallery_albums._id | ObjectId | Yes | Album primary key. |
| gallery_albums.weddingId | ObjectId | Yes | Tenant key. |
| gallery_albums.eventId | ObjectId | No | Optional event association. |
| gallery_albums.name | string | Yes | Album name. |
| gallery_albums.coverPhotoId | ObjectId | No | Optional photo reference. |
| gallery_albums.uploadPolicy | enum | Yes | ORGANIZERS_ONLY \| VERIFIED_GUESTS. Controls who may upload; never anonymous. |
| gallery_photos._id | ObjectId | Yes | Photo primary key. |
| gallery_photos.weddingId | ObjectId | Yes | Tenant key. |
| gallery_photos.albumId | ObjectId | Yes | Owning album. |
| gallery_photos.storageKey | string | Yes | R2 key. |
| gallery_photos.originalFilename | string | Yes | Sanitized display/original filename. |
| gallery_photos.mimeType | string | Yes | Validated image MIME. |
| gallery_photos.fileSize | integer | Yes | Bytes. |
| gallery_photos.uploadedBy.type | enum | Yes | ORGANIZER \| GUEST. |
| gallery_photos.uploadedBy.userId | ObjectId | Conditional | Required for organizer upload. |
| gallery_photos.uploadedBy.guestFamilyId | ObjectId | Conditional | Required for guest upload. |
| gallery_photos.uploadedBy.guestMemberId | ObjectId | No | Optional identified family member if the guest flow captures it. |
| gallery_photos.moderationStatus | enum | Yes | ACTIVE \| FLAGGED \| HIDDEN \| REMOVED. |
| gallery_photos.moderationReason | string | No | Short moderator reason; do not store the prohibited content itself in metadata. |
| gallery_photos.moderatedByUserId | ObjectId | No | Organizer/admin actor performing moderation. |
| gallery_photos.moderatedAt | Date | No | Moderation timestamp. |
| gallery_photos.storageStatus | enum | Yes | ACTIVE \| DELETING \| DELETED. Tracks external R2 object lifecycle. |
| archivedAt / archivedByUserId | Date / ObjectId | No | Standard archive metadata for album/photo visibility/history. |
| createdAt / updatedAt | Date | Yes | Mongoose timestamps. |

## 20.2 Business / Validation Rules

- MongoDB stores metadata only; R2 stores the photo bytes.
- Guest uploads require a valid verified guest session and an album with uploadPolicy=VERIFIED_GUESTS. Anonymous upload endpoints are not supported.
- Every photo must record the uploader context. Public gallery/photo APIs never expose internal uploader identifiers.
- moderationStatus controls visibility. FLAGGED, HIDDEN, REMOVED, archived, or non-ACTIVE storage objects must not appear in the normal guest gallery.
- Organizers can hide/remove inappropriate content and record a moderation reason. For suspected illegal content, remove access immediately and delete the R2 bytes according to the moderation workflow while retaining only minimal non-content audit metadata where appropriate.
- This schema provides attribution and moderation capability; automated image/content scanning is not a Phase 1 requirement.
- A public photo_share_link is valid only while the underlying photo is not archived and moderationStatus/storageStatus both permit display.
- No image-variant/thumbnails model in Phase 1; image processing is deferred.
- Technical per-file MIME/size validation is required even though commercial photo/storage quotas are deferred.

## 20.3 Primary Query Patterns

- List non-archived albums for the private guest site.
- Paginate visible photos by album where archivedAt=null, moderationStatus=ACTIVE, and storageStatus=ACTIVE.
- List photos uploaded by a specific organizer/guest only for moderation/audit workflows when needed.

## 20.4 Starting Indexes

| Index | Constraint / Purpose |
|---|---|
| gallery_albums { weddingId: 1, archivedAt: 1, createdAt: -1 } | Active wedding album list. |
| gallery_photos { albumId: 1, archivedAt: 1, moderationStatus: 1, createdAt: -1 } | Visible album photo pagination. |
| gallery_photos { storageKey: 1 } | UNIQUE. |
| gallery_photos { weddingId: 1, createdAt: -1 } | Optional cross-album recent-photo query. |
| gallery_photos { weddingId: 1, "uploadedBy.type": 1, "uploadedBy.userId": 1, createdAt: -1 } | Optional organizer-upload audit/moderation query. |

# 21. photo_share_links

Allows a guest/organizer to share one individual gallery photo without granting access to the wedding site or full gallery.

| Field | Type | Required | Rules / Notes |
|---|---|---|---|
| _id | ObjectId | Yes | Primary key. |
| weddingId | ObjectId | Yes | Tenant key for operational cleanup. |
| photoId | ObjectId | Yes | Shared gallery photo. |
| tokenHash | string | Yes | Hash of public share token. |
| enabled | boolean | Yes | Revocation switch. |
| createdAt | Date | Yes | Creation time. |

## 21.2 Business / Validation Rules

- The share route exposes only the referenced photo.
- A share token does not create a guest wedding session and cannot reveal other events/photos.
- Share resolution must reject archived, HIDDEN, FLAGGED, REMOVED, DELETING, or DELETED photos.

## 21.3 Primary Query Patterns

- Resolve a public photo-share token.

## 21.4 Starting Indexes

| Index | Constraint / Purpose |
|---|---|
| { tokenHash: 1 } | UNIQUE. Public share resolution. |
| { photoId: 1, enabled: 1 } | Optional share-link management. |

# 22. communication_campaigns

Stores one organizer communication action and aggregate delivery progress.

| Field | Type | Required | Rules / Notes |
|---|---|---|---|
| _id | ObjectId | Yes | Primary key. |
| weddingId | ObjectId | Yes | Tenant key. |
| type | enum | Yes | INVITATION \| RSVP_REMINDER \| EVENT_REMINDER \| ANNOUNCEMENT. |
| channel | enum | Yes | EMAIL \| WHATSAPP. |
| subject | string | No | Email subject. |
| templateKey/bodySnapshot | string/object | Yes | Renderable template reference or immutable content snapshot. |
| recipientCount | integer | Yes | Total intended recipients. |
| queuedCount / sentCount / failedCount | integer | Yes | Operational counters. |
| status | enum | Yes | DRAFT \| QUEUED \| SENDING \| COMPLETED \| PARTIAL_FAILED \| CANCELLED. |
| createdByUserId | ObjectId | Yes | Organizer actor. |
| createdAt / updatedAt | Date | Yes | Mongoose timestamps. |

## 22.2 Business / Validation Rules

- WhatsApp Phase 1 records message preparation/action but cannot claim provider delivery confirmation.
- Email campaign counters must be updated idempotently as email jobs transition.

## 22.3 Primary Query Patterns

- List campaign history.
- Monitor an active email campaign.

## 22.4 Starting Indexes

| Index | Constraint / Purpose |
|---|---|
| { weddingId: 1, createdAt: -1 } | Communication history. |
| { weddingId: 1, status: 1, createdAt: -1 } | Active campaign monitoring. |

# 23. email_jobs

Per-recipient MongoDB-backed job queue for Resend. Processed by short scheduled Vercel executions.

| Field | Type | Required | Rules / Notes |
|---|---|---|---|
| _id | ObjectId | Yes | Primary key. |
| campaignId | ObjectId | Yes | Parent campaign. |
| weddingId | ObjectId | Yes | Tenant key. |
| familyId | ObjectId | No | Guest family when applicable. |
| recipientEmail | string | Yes | Delivery target. |
| payload | object | Yes | Minimal render variables, not sensitive full-domain snapshots. |
| status | enum | Yes | QUEUED \| PROCESSING \| SENT \| FAILED. |
| scheduledAt | Date | Yes | Earliest process time. |
| lockedAt | Date | No | Job lock timestamp. |
| lockId | string | No | Execution lock identity. |
| attemptCount | integer | Yes | Default 0. |
| lastError | string | No | Sanitized error summary. |
| providerMessageId | string | No | Resend message ID. |
| idempotencyKey | string | Yes | Unique application delivery key. |
| sentAt | Date | No | Successful completion. |
| createdAt / updatedAt | Date | Yes | Mongoose timestamps. |

## 23.2 Business / Validation Rules

- Never send email inside a MongoDB transaction.
- Job claiming must be atomic (e.g. findOneAndUpdate with status/lock predicate).
- Provider free-plan quota exhaustion should defer jobs rather than mark the whole campaign as a fatal failure.
- Retry policy must cap attempts and use scheduledAt for backoff.

## 23.3 Primary Query Patterns

- Claim ready jobs in small batches.
- List failed jobs for campaign.
- Count campaign states.

## 23.4 Starting Indexes

| Index | Constraint / Purpose |
|---|---|
| { status: 1, scheduledAt: 1 } | Queue polling: ready jobs first. |
| { idempotencyKey: 1 } | UNIQUE. Prevent duplicate intended delivery. |
| { campaignId: 1, status: 1 } | Campaign progress/retry operations. |
| { lockedAt: 1 } | Optional stale-lock recovery if implementation requires it. |

# 24. notifications

Stores organizer-facing in-app notifications; no real-time delivery infrastructure in Phase 1.

| Field | Type | Required | Rules / Notes |
|---|---|---|---|
| _id | ObjectId | Yes | Primary key. |
| weddingId | ObjectId | Yes | Tenant key. |
| recipientUserId | ObjectId | Yes | Organizer recipient. |
| type | string/enum | Yes | TASK_DUE, RSVP_RECEIVED, etc. |
| title | string | Yes | Short UI text. |
| body | string | No | Optional details. |
| entityType / entityId | string + ObjectId | No | Optional deep-link context. |
| readAt | Date | No | Null means unread. |
| createdAt | Date | Yes | Creation. |

## 24.3 Primary Query Patterns

- List unread/recent notifications for current organizer.

## 24.4 Starting Indexes

| Index | Constraint / Purpose |
|---|---|
| { recipientUserId: 1, readAt: 1, createdAt: -1 } | Unread/recent notification list. |
| { weddingId: 1, createdAt: -1 } | Optional wedding-level diagnostics. |

# 25. activity_logs

Append-oriented wedding activity history for organizer accountability.

| Field | Type | Required | Rules / Notes |
|---|---|---|---|
| _id | ObjectId | Yes | Primary key. |
| weddingId | ObjectId | Yes | Tenant key. |
| actorUserId | ObjectId | No | Organizer/user actor when applicable; null for guest/system actions. |
| action | string/enum | Yes | e.g. TASK_COMPLETED, EXPENSE_CREATED, RSVP_UPDATED. |
| entityType | string | Yes | Target type. |
| entityId | ObjectId | No | Target identifier. |
| metadata | object | No | Small safe contextual fields; may include guestFamilyId/guestMemberId for guest-originated RSVP/photo actions; do not dump full before/after documents. |
| createdAt | Date | Yes | Append timestamp. |

## 25.2 Business / Validation Rules

- Activity logging should never contain password hashes, raw tokens, or unnecessary PII.
- Failure to write a non-critical activity log should not normally roll back the primary domain action unless audit strictness is later increased.

## 25.3 Primary Query Patterns

- Recent wedding activity feed.

## 25.4 Starting Indexes

| Index | Constraint / Purpose |
|---|---|
| { weddingId: 1, createdAt: -1 } | Primary activity feed. |
| { weddingId: 1, entityType: 1, entityId: 1, createdAt: -1 } | Optional entity history if needed. |

# 26. rate_limits and password_reset_tokens

Short-lived technical collections used for abuse protection and password recovery.

| Field | Type | Required | Rules / Notes |
|---|---|---|---|
| rate_limits.key | string | Yes | Composite logical key such as login:ip:<hash>. |
| rate_limits.count | integer | Yes | Attempts in the current window. |
| rate_limits.expiresAt | Date | Yes | TTL cleanup. |
| password_reset_tokens.userId | ObjectId | Yes | Target user. |
| password_reset_tokens.tokenHash | string | Yes | Hash of reset token. |
| password_reset_tokens.expiresAt | Date | Yes | TTL cleanup. |
| password_reset_tokens.usedAt | Date | No | Prevents token reuse. |

## 26.2 Business / Validation Rules

- Rate-limit keys should avoid storing raw sensitive identifiers where a hash can serve the purpose.
- Password-reset raw tokens are delivered to users and never stored directly.

## 26.3 Primary Query Patterns

- Increment/check short-lived rate counters.
- Resolve a password reset token by hash.

## 26.4 Starting Indexes

| Index | Constraint / Purpose |
|---|---|
| rate_limits { key: 1 } | UNIQUE. |
| rate_limits { expiresAt: 1 } | TTL. |
| password_reset_tokens { tokenHash: 1 } | UNIQUE. |
| password_reset_tokens { expiresAt: 1 } | TTL. |
| password_reset_tokens { userId: 1, createdAt: -1 } | Optional security/revocation lookup. |

# 27. Embed vs Reference Decision Matrix

| Parent / Relationship | Decision | Reason |
|---|---|---|
| Wedding -> website/theme | Embed | One bounded configuration normally loaded with wedding. |
| Wedding -> events | Reference | Independent lifecycle and queries; multiple events. |
| Wedding -> organizers | Reference via membership | User-to-wedding relationship and permissions grow independently. |
| Task -> checklist | Embed | Small, bounded, owned entirely by task; benefits from atomic updates. |
| Event -> venue | Embed | Small event-owned value object. |
| Vendor -> event IDs | Embed ObjectId array | Bounded list of event associations; no extra join entity required in V1. |
| GuestFamily -> members | Embed | Family-first aggregate; members are bounded and managed together. |
| Event <-> GuestFamily | Reference via event_invitations | Many-to-many relationship with its own RSVP state. |
| EventInvitation -> responses | Embed | Responses and attendingCount must update atomically. |
| Wedding -> expenses | Reference | Potentially large list, independently filtered/reported. |
| Vendor -> expenses | Reference by expense.vendorId | Expenses are the financial source of truth and independently queried. |
| Album -> photos | Reference | Photo count can grow; supports pagination. |
| Campaign -> email jobs | Reference | Jobs grow independently and have queue lifecycle. |
| Entity -> file bytes | Reference metadata + external R2 object | MongoDB is not used as blob storage. |

# 28. Wedding Tenancy and Authorization Boundaries

- Organizer REST APIs must authenticate the user, resolve an ACTIVE wedding_membership, and then evaluate module permission before calling a service.
- Repositories for wedding-domain entities should receive weddingId explicitly and include it in filters, e.g. {_id: taskId, weddingId}.
- A client-supplied weddingId is never trusted by itself; it must be matched to the authenticated membership.
- Guest APIs resolve guest_session -> familyId + weddingId. Guest queries must remain family-scoped and cannot call organizer-domain endpoints.
- OWNER bypasses editable organizer permission values; organizer permissions are VIEW/MANAGE/NONE by module.

```text
Request
  -> organizer session
  -> user
  -> wedding_membership(weddingId, userId, ACTIVE)
  -> permission check
  -> service
  -> repository query including weddingId
```

# 29. Validation and Normalization Rules

| Layer | Responsibility |
|---|---|
| Zod request schema | Shape, required inputs, enum parsing, string lengths, client-visible validation errors, basic normalization. |
| Domain service | Cross-field and business rules: membership, invited members, event/wedding ownership, one-active-wedding Phase 1 rule. |
| Mongoose schema | Persistence types, enums, minimum values, strict document structure, required server-owned fields. |
| MongoDB indexes | Uniqueness and TTL invariants that must survive concurrent requests. |

- Normalize email by trimming and lowercasing before compare/persist.
- Validate ObjectId-shaped identifiers before repository execution.
- Reject amountMinor <= 0 for active expense creation.
- Validate endDate/endAt are not earlier than startDate/startAt.
- Validate invitedMemberIds and RSVP member IDs against the current embedded guest-family members.
- Validate referenced event/vendor/expense/document belongs to the same wedding before linking.
- Do not let the client set createdByUserId, ownerUserId, tokenHash, counters, or other server-owned fields directly.

# 30. Transaction Boundaries and Consistency

Most Phase 1 writes should rely on MongoDB single-document atomicity. Multi-document transactions are reserved for operations where partial success would violate a meaningful business invariant. Archive-first behavior reduces the need for destructive cascade transactions.

| Operation | Transaction | Reason |
|---|---|---|
| Create/update task or embedded checklist | No | One document. |
| Submit RSVP for one family/event | No | One event_invitations document. |
| Create/update/archive expense | No | Expense is the single financial record; no separate payment document exists. |
| Archive event/vendor/guest family | No | Archive is a single-document state change; referenced history remains intact. |
| Create wedding + owner membership | Yes | Workspace must not exist without its owner membership. |
| Accept organizer invite + create membership + mark invite accepted | Yes | Membership and invite state must move together. |
| Delete an R2 file + update metadata | No distributed transaction | Mark storageStatus=DELETING, perform external delete, then finalize; retry on failure. |
| Send Resend email | Never in transaction | External side effect; use queued idempotent job. |

> **Design note:** Phase 1 has no vendor_payments collection. Vendor advance/partial/final payments are ordinary expense documents linked to the vendor. Normal product deletion of business entities archives rather than cascading hard deletes.

# 31. Archival, Deletion, and Lifecycle Behavior

Phase 1 uses an **archive-first** lifecycle for business records. A normal product “Delete” action should usually set archivedAt and archivedByUserId instead of physically removing the document. Archived records are excluded from ordinary screens but remain available to preserve references, RSVP history, expense history, and audit context.

## 31.1 Standard Archive Contract

- Archive-capable documents use archivedAt: Date|null and archivedByUserId: ObjectId|null.
- Normal repository list/detail methods include archivedAt: null unless a history/restore workflow explicitly requests archived data.
- Restore, where allowed, clears archivedAt/archivedByUserId after dependency validation.
- Archiving a parent does not automatically hard-delete referenced children.
- Workflow status (for example COMPLETED, CANCELLED, VOIDED) is separate from archival state.

| Entity | Phase 1 Behavior |
|---|---|
| Wedding | Archive; no automatic seven-day purge in Phase 1. |
| Event | Archive rather than hard-delete; invitations/RSVP/timeline/task history remains referenced. |
| Task | Archive through normal UI. Hard deletion is limited to explicit maintenance/testing cases. |
| Timeline item | Archive through normal UI when removal/history matters. |
| Vendor | Archive; linked expenses remain valid and reportable. |
| Expense | VOIDED expresses financial correction; archivedAt controls whether the record is hidden from normal operational views. Do not destroy financial history through ordinary UI deletion. |
| Guest family | Archive; existing event invitations/RSVP history remains intact. |
| Organizer membership | Disable access; preserve membership/actor references. Optional later archival may be used for management history. |
| Album | Archive; hides the album without automatically deleting photo bytes. |
| Gallery photo | Archive for ordinary removal from the gallery. Inappropriate/illegal content uses moderationStatus plus physical R2 removal when required; retain only minimal audit metadata, not the removed bytes. |
| Document metadata/file | Archive metadata when business history is needed; physical R2 bytes may be deleted through DELETING -> DELETED workflow according to retention/policy. |
| Session / guest session | Hard delete or TTL expiration. |
| Password reset / rate limit records | TTL expiration/hard delete. |
| Failed temporary upload/job artifacts | Hard delete/cleanup. |

## 31.2 External Object Deletion

MongoDB and Cloudflare R2 cannot participate in one ACID transaction. Physical deletion therefore uses an idempotent workflow:

```text
ACTIVE metadata
  -> storageStatus = DELETING
  -> delete R2 object
  -> storageStatus = DELETED (or purge metadata where policy permits)
```

If R2 deletion fails, the metadata remains retryable and the object is not exposed through normal APIs.

## 31.3 Wedding Retention

The previously discussed automatic post-wedding retention/purge workflow is deferred beyond Phase 1. Phase 1 may archive a wedding manually, but automated gallery/data destruction and minimal long-term archive records are future policy work.

# 32. Primary Query Patterns

| Screen / Operation | Representative Query Shape |
|---|---|
| Dashboard events | events.find({weddingId,archivedAt:null,status:"ACTIVE"}).sort({startAt:1}) |
| Pending tasks | tasks.find({weddingId,archivedAt:null,status:{\$ne:"COMPLETED"}}).sort({dueAt:1}) |
| My tasks | tasks.find({weddingId,archivedAt:null,assignedMembershipId,status}) |
| Vendor list | vendors.find({weddingId,archivedAt:null,status}) |
| Vendor paid amount | expenses aggregate match {weddingId,vendorId,archivedAt:null,status:"ACTIVE"} + sum amountMinor |
| Wedding total spend | expenses aggregate match {weddingId,archivedAt:null,status:"ACTIVE"} + sum amountMinor |
| Event RSVP summary | event_invitations aggregate/filter by eventId and rsvpStatus; sum attendingCount |
| Guest private site | event_invitations.find({familyId,weddingId}) + referenced event details |
| Guest families | guest_families.find({weddingId,archivedAt:null}) |
| Activity | activity_logs.find({weddingId}).sort({createdAt:-1}) |
| Email worker | email_jobs.find({status:"QUEUED",scheduledAt:{\$lte:now}}).sort({scheduledAt:1}).limit(N) |
| Album photos | gallery_photos.find({albumId,archivedAt:null,moderationStatus:"ACTIVE",storageStatus:"ACTIVE"}).sort({createdAt:-1}) |

# 33. Starting Index Catalogue

| Collection | Index | Type / Purpose |
|---|---|---|
| users | { emailNormalized: 1 } | UNIQUE |
| sessions | { tokenHash: 1 } | UNIQUE |
| sessions | { expiresAt: 1 } | TTL |
| weddings | { ownerUserId: 1, archivedAt: 1, status: 1 } | Active workspace lookup |
| wedding_memberships | { weddingId: 1, userId: 1 } | UNIQUE |
| wedding_memberships | { userId: 1, status: 1 } | Active membership rule/lookup |
| organizer_invitations | { tokenHash: 1 } | UNIQUE |
| organizer_invitations | { weddingId: 1, emailNormalized: 1 } | UNIQUE partial: status=PENDING |
| events | { weddingId: 1, archivedAt: 1, startAt: 1 } | Active chronological events |
| tasks | { weddingId: 1, archivedAt: 1, status: 1, dueAt: 1 } | Active task queue |
| tasks | { weddingId: 1, archivedAt: 1, assignedMembershipId: 1, status: 1 } | Active assignee view |
| timeline_items | { eventId: 1, archivedAt: 1, startAt: 1 } | Active run sheet |
| vendors | { weddingId: 1, archivedAt: 1, status: 1 } | Active vendor list |
| expenses | { weddingId: 1, archivedAt: 1, expenseDate: -1 } | Active expense list/report |
| guest_families | { weddingId: 1, archivedAt: 1, familyName: 1 } | Active guest list |
| guest_families | { "invitationAccess.tokenHash": 1 } | UNIQUE partial |
| event_invitations | { weddingId: 1, eventId: 1, familyId: 1 } | UNIQUE relationship |
| event_invitations | { eventId: 1, rsvpStatus: 1 } | RSVP summary |
| event_invitations | { familyId: 1, eventId: 1 } | Guest private site |
| guest_sessions | { tokenHash: 1 } | UNIQUE |
| guest_sessions | { expiresAt: 1 } | TTL |
| documents | { storageKey: 1 } | UNIQUE |
| documents | { weddingId: 1, linkedEntityType: 1, linkedEntityId: 1 } | Attachments |
| gallery_albums | { weddingId: 1, archivedAt: 1, createdAt: -1 } | Active album list |
| gallery_photos | { albumId: 1, archivedAt: 1, moderationStatus: 1, createdAt: -1 } | Visible photo pagination |
| gallery_photos | { storageKey: 1 } | UNIQUE |
| photo_share_links | { tokenHash: 1 } | UNIQUE |
| communication_campaigns | { weddingId: 1, createdAt: -1 } | History |
| email_jobs | { status: 1, scheduledAt: 1 } | Queue |
| email_jobs | { idempotencyKey: 1 } | UNIQUE |
| notifications | { recipientUserId: 1, readAt: 1, createdAt: -1 } | Unread/recent |
| activity_logs | { weddingId: 1, createdAt: -1 } | Feed |
| rate_limits | { key: 1 } | UNIQUE |
| rate_limits | { expiresAt: 1 } | TTL |
| password_reset_tokens | { tokenHash: 1 } | UNIQUE |
| password_reset_tokens | { expiresAt: 1 } | TTL |

> **Design note:** Indexes marked optional in individual collection sections should be added only after the related query exists and explain/profile results justify them. The catalogue above is the recommended launch baseline, not an invitation to index every filterable field.

# 34. Uniqueness and Concurrency Guarantees

| Invariant | Database Enforcement |
|---|---|
| One account per normalized email | users.emailNormalized unique index. |
| One membership per user per wedding | wedding_memberships(weddingId,userId) unique. |
| One pending organizer invite per email per wedding | Partial unique index where status=PENDING. |
| One event invitation per family per event | event_invitations(weddingId,eventId,familyId) unique. |
| Opaque token hashes cannot collide in same collection | Unique indexes on session/invite/share/reset token hashes. |
| One logical email delivery per idempotency key | email_jobs.idempotencyKey unique. |
| One metadata row per R2 storage key | documents/gallery_photos.storageKey unique in their collection. |

Service-level validation should provide friendly errors, but database uniqueness is still required because concurrent requests can race past application checks.

# 35. Mongoose Implementation Conventions

- One model file per persisted collection, owned by its business module or infrastructure module.
- Use Schema.Types.ObjectId with ref metadata for developer clarity, but avoid uncontrolled populate() chains in hot paths.
- Prefer explicit repository queries and projections over returning unrestricted Mongoose documents to the API layer.
- Set strict: true; avoid Mixed unless the field is intentionally flexible and bounded (for example small sanitized activity metadata).
- Use timestamps: true for domain collections.
- Disable automatic production index creation if deployment/index migrations are managed explicitly; maintain indexes as reviewed code.
- Convert Mongoose documents to domain/API DTOs before serialization; never expose passwordHash, tokenHash, internal lock fields, or server-owned metadata.
- Use lean() for read-only list/report queries where Mongoose document methods/change tracking are unnecessary.
- Reuse the MongoDB connection across warm Vercel invocations through a cached connection/promise.

```text
// Representative model registration pattern
const schema = new Schema({...}, {
  timestamps: true,
  strict: true,
});

schema.index({ weddingId: 1, startAt: 1 });

export const EventModel =
  models.Event ?? model("Event", schema);
```

# 36. Repository and Service Data-Access Rules

```text
Route Handler
  -> Zod parse
  -> authenticate
  -> authorize membership/guest session
  -> domain service
  -> repository
  -> Mongoose
  -> MongoDB
```

- Route handlers must not contain collection-specific business logic beyond request/response mapping.
- Services own cross-collection validation and transaction selection.
- Repositories do not decide authorization; they require already-resolved weddingId/familyId constraints from the service.
- Avoid generic repository abstractions that hide useful MongoDB operations. Domain-specific query methods are preferred.
- For updates, filter by both _id and weddingId when possible to prevent accidental cross-wedding access.
- Normal repository methods for archive-capable entities must apply archivedAt: null by default; history/restore methods must opt in explicitly.

# 37. Schema Evolution and Data Migration

- Treat MongoDB as schema-flexible, not schema-less. Every application release still has an expected document contract.
- Backward-compatible additions: add optional/defaulted fields, deploy code that tolerates old documents, then backfill if needed.
- Breaking changes: ship an explicit migration script under scripts/migrations with an idempotent migration identifier.
- Do not perform large collection-wide migrations synchronously inside a user request.
- Track a lightweight schemaVersion only on collections/documents that genuinely require version-dependent interpretation; do not add it everywhere preemptively.
- Index changes should be reviewed separately because indexes consume storage and affect writes, especially on small Atlas tiers.

# 38. Data Security and Privacy Controls

- Password hashes, session hashes, organizer-invite hashes, guest-session hashes and reset-token hashes are never returned through public APIs.
- Guest-family contact information is organizer-visible only according to guest permissions.
- Guest-site API responses should return only information relevant to the verified family and invited events.
- Do not include sensitive request bodies or secret tokens in application logs.
- R2 object keys should be non-guessable or protected through application-controlled access where content is private.
- Public photo sharing uses a separate single-photo token; it does not reuse family invitation access.
- Every gallery upload is attributable to an organizer user or verified guest family/member; uploader identifiers are internal moderation data and are not exposed publicly.
- Hidden/flagged/removed/archived photos and photos whose R2 object is not ACTIVE are denied by gallery and share APIs.
- Activity metadata should be minimal and should not duplicate entire guest/expense documents.

# 39. Phase 1 Capacity and Growth Notes

- The initial target is approximately 100 weddings, so correctness and simple managed operations are prioritized over sharding or distributed caches.
- Photo/file bytes are kept outside MongoDB, which protects the database from gallery growth; MongoDB retains only metadata, uploader traceability, moderation state, and storage keys.
- Growing technical collections such as sessions, guest_sessions, rate_limits and password_reset_tokens use expiration/cleanup strategies.
- Email jobs should be retained only as long as operational/history requirements justify; a later cleanup policy can archive/delete old job records.
- If query volume grows, first measure slow queries and add/adjust compound indexes before introducing a cache.
- If Atlas capacity becomes insufficient, move to a larger Atlas tier without changing the logical data model.

# 40. Deferred / Future Database Extensions

| Feature | Likely Database Extension |
|---|---|
| Accommodation | hotels, room_allocations or bounded booking aggregates. |
| Transportation | vehicles, drivers, pickup/drop assignments. |
| Advanced seating | tables/seats/assignments; likely own collections. |
| Image variants | photo_variants embedded in photo or referenced processing state, depending on scale. |
| Automated media moderation | Optional scanning/moderation provider and report/review workflow; existing uploader/moderation fields remain the source of audit state. |
| Planner multi-wedding | Remove service restriction; existing wedding_memberships already supports many weddings per user. |
| Vendor marketplace | Marketplace vendor/profile collections distinct from wedding-local vendors; optional externalPlaceId/source. |
| Automated retention | Wedding cleanup workflow/jobs plus minimal archived-wedding record. |
| Higher-scale background jobs | Replace MongoDB queue with dedicated queue if operational load justifies it. |

# 41. Implementation Checklist

- Create Mongoose schemas with reviewed enums/defaults and strict mode.
- Create launch indexes and unique/TTL constraints explicitly.
- Implement email and token normalization helpers once in shared/server code.
- Implement wedding-scoped repository filters and membership authorization utilities.
- Implement guest-family member reconciliation before allowing member removal with existing invitations.
- Implement expense aggregations using amountMinor integers and status=ACTIVE filters.
- Implement organizer invite and wedding+owner creation transactions.
- Implement atomic email-job claiming/idempotency.
- Implement archive-first repository behavior and restore-safe service methods for archive-capable business entities.
- Implement gallery upload authorization for ORGANIZERS_ONLY vs VERIFIED_GUESTS, record uploader identity, and enforce moderation visibility rules.
- Implement R2 metadata lifecycle with DELETING/retry behavior for physical file removal.
- Add tests for every uniqueness rule, tenant-boundary query, archive filter, RSVP constraint, permission boundary, gallery uploader/moderation rule, and financial aggregation.
- Profile real Phase-1 queries before adding optional indexes.

# 42. Database Decision Log

| Decision | Final Phase 1 Choice |
|---|---|
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Request validation | Zod |
| Guest members | Embedded in guest_families |
| Event guest relationship | event_invitations referenced collection |
| RSVP responses | Embedded in event_invitations |
| Organizer authorization | wedding_memberships with module permissions |
| Money representation | Integer minor units (paise) |
| Vendor payments | No separate ledger; actual payments are expenses linked to vendor |
| Files | Metadata in MongoDB, bytes in Cloudflare R2 |
| Gallery uploads | Organizer or verified guest uploads only; every photo records uploader context and moderation state |
| Business deletion | Archive-first using archivedAt/archivedByUserId; hard deletion reserved for technical/retention cases |
| Email queue | email_jobs in MongoDB, processed by Vercel scheduled execution |
| Search | MongoDB indexes/queries only in Phase 1 |
| Transactions | Only true multi-document invariants |
| Automatic wedding retention | Deferred beyond Phase 1 |
