# MAKE MY MARRIAGE

**Product Requirements Document**

*Collaborative wedding planning and management platform for Indian weddings*

| Document | Product Requirements Document (PRD) |
| --- | --- |
| Version | 1.0 |
| Status | Product scope finalized / Ready for design & engineering planning |
| Primary Release | Version 1 |
| Prepared | September 2026 |

**Product principle**

*Wedding → Events → People → Tasks → Vendors → Money → Guests → Communication → Memories*

## 1. Document Control

| Field | Definition |
| --- | --- |
| Purpose | Define the complete Version 1 product behavior, scope, requirements, boundaries, workflows, data relationships, quality expectations, and release criteria for Make My Marriage. |
| Audience | Product, UX/UI design, frontend, backend, QA, operations, and future business stakeholders. |
| Source of truth | This PRD supersedes informal feature discussions for Version 1 unless a later approved change request updates a requirement. |
| Product maturity | Pre-build / requirements finalized. |
| Geographic focus | India-first wedding workflows with extensible terminology and custom event support. |
| Commercial model | Freemium at initial launch; no paid plan mechanics are required for V1. |

### 1.1 Requirement Priority Legend

| Priority | Meaning |
| --- | --- |
| P0 | Required for the core V1 product to function and launch. |
| P1 | Strongly recommended for V1; can ship shortly after the minimum operational core if necessary. |
| P2 | Nice-to-have enhancement; should not block launch. |

### 1.2 Definition of Version 1

Version 1 is a single-wedding collaborative planning product. It supports the couple, family members, and a professional planner collaborating inside one wedding workspace. Vendors are managed as records and do not log in. Guests access a private invitation experience rather than the organizer dashboard. Accommodation, transportation, marketplace, vendor accounts, native streaming, online payments, and advanced planner CRM are explicitly outside V1.

## 2. Executive Summary

Make My Marriage is a collaborative operating system for planning and managing an Indian wedding from initial setup through event planning, organizer coordination, task execution, vendor and expense tracking, family-based invitations, RSVP, guest communication, wedding-day operations, and post-wedding memories.

> **Core product promise**  
> Replace fragmented wedding planning across spreadsheets, notes, phone calls, WhatsApp chats, vendor diaries, and memory with one structured wedding workspace that remains simple enough for families to use.

### 2.1 Product Goals

- Give organizers one accurate place to understand what is happening and what needs attention.

- Support multi-day, multi-event Indian weddings as a native concept rather than an exception.

- Enable family members and planners to collaborate without exposing sensitive modules such as finances to everyone.

- Provide family/household-based guest management with event-specific invitations and individual attendance.

- Connect vendor payments to actual expense records so financial tracking remains consistent.

- Create a private, invitation-only guest experience that unifies invitation, RSVP, event information, announcements, gallery, and livestream links.

- Keep V1 focused enough to validate the core planning workflow before adding marketplace and logistics-heavy modules.

### 2.2 Non-Goals for V1

- Vendor marketplace or bidding

- Vendor login/dashboard

- Online payments or escrow

- Full accounting or tax software

- Multi-wedding professional planner CRM

- Accommodation and hotel room allocation

- Transportation and pickup/drop management

- Advanced seating designer

- Native livestream hosting

- WhatsApp Business API automation

- Canva-like drag-and-drop invitation editor

- AI wedding planner

- Guest social network

## 3. Users, Roles, and Access Model

### 3.1 User Categories

| User type | Primary responsibilities | Access model |
| --- | --- | --- |
| Wedding Admin | Creates wedding, controls organizers and permissions, manages all modules. | Full access; owns wedding configuration. |
| Organizer | Family member, sibling, parent, relative, friend, or professional planner helping manage the wedding. | Module-level access granted by Admin. |
| Guest | Family/household invited to one or more events. | Private invitation website only; no organizer dashboard. |

### 3.2 V1 Account Constraints

- One account may participate in one active wedding in V1.

- One wedding may have multiple organizers.

- The system architecture must still use a wedding membership model so multi-wedding support can be added later without rewriting ownership assumptions.

- Vendors are not platform users in V1.

- Guests do not need organizer accounts to RSVP.

### 3.3 Permissions

Permissions are controlled by the Wedding Admin. V1 should use module-level permissions rather than a highly granular enterprise policy engine.

| Module | Supported access |
| --- | --- |
| Wedding details | View / Manage |
| Events | View / Manage |
| Tasks & timeline | View / Manage |
| Guests & RSVP | Hidden / View / Manage |
| Vendors | Hidden / View / Manage |
| Expenses & vendor payments | Hidden / View / Manage |
| Invitations | View / Manage |
| Communication | Hidden / Manage |
| Wedding website | View / Manage |
| Gallery | View / Manage |
| Documents | View / Manage |
| Reports / activity | View, subject to underlying module permissions |

> **Permission inheritance rule**  
> Dashboards, activity feeds, reports, search results, notifications, exports, and counts must never reveal data from a module the organizer cannot access.

## 4. Product Architecture and Information Model

The product is organized around a Wedding Workspace. Events are first-class entities. Most planning, guest, finance, vendor, and timeline records may belong either to the wedding generally or to a specific event.

### 4.1 Primary Navigation

| Group | Screens |
| --- | --- |
| Overview | Dashboard |
| Wedding | Wedding Details; Events; Organizers |
| Planning | Tasks; Timeline |
| People | Guests; Vendors |
| Finance | Expenses; Vendor Payments |
| Communication | Invitations; RSVP; Messages |
| Experience | Wedding Website; Gallery; Live Stream |
| Resources | Documents; Activity; Reports |
| Settings | Permissions; Wedding configuration; privacy settings |

### 4.2 Core Entity Relationships

- Wedding has many Events, Organizers, Guest Families, Vendors, Tasks, Expenses, Documents, and Communications.

- Event may have its own guest invitations, tasks, vendors, timeline items, expenses, and documents.

- Guest Family contains one or more Guest Members.

- Event Invitation links a Guest Family to an Event and defines whether that family is invited.

- Guest Member RSVP records attendance per invited event.

- Vendor may be assigned to one or more Events.

- Vendor Payment belongs to a Vendor and may create a linked Expense when marked paid.

- Invitation Token resolves a guest family into a private, filtered wedding website experience.

## 5. Functional Requirements

### 5.1 Wedding Setup and Onboarding

> **WED-001 Create wedding [P0]**  
> Admin can create a wedding with couple names, wedding title, primary wedding date, start/end dates, primary city/location, optional cover image, and optional wedding hashtag.
> **Acceptance:** A newly created wedding opens a usable dashboard and can be edited later.

> **WED-002 Select wedding events [P0]**  
> During onboarding, Admin can select standard Indian wedding event templates and add custom events.
> **Acceptance:** Selected events are created immediately with editable defaults.

> **WED-003 Wedding status [P1]**  
> Wedding supports Planning, Ongoing, and Completed status.
> **Acceptance:** Status is visible to Admin and may affect dashboard wording without deleting data.

> **WED-004 One active wedding restriction [P0]**  
> V1 prevents a user from joining or creating a second active wedding through normal UI.
> **Acceptance:** Restriction is enforced at the application layer while data model retains membership flexibility.

> **WED-005 Progressive onboarding [P0]**  
> Users are not forced to complete guest, vendor, and finance setup before using the dashboard.
> **Acceptance:** Core workspace is usable immediately after minimal setup.

### 5.2 Dashboard

> **DAS-001 Attention-first dashboard [P0]**  
> Dashboard summarizes days remaining, next event, pending/overdue tasks, RSVP status, expenses, vendor payment status, and upcoming deadlines.
> **Acceptance:** All cards use current data and respect permissions.

> **DAS-002 Upcoming actions [P0]**  
> Dashboard displays time-sensitive actions such as overdue tasks, vendor payments due, and pending RSVP follow-up.

> **DAS-003 Recent activity [P1]**  
> Dashboard may show recent changes made by collaborators if user has permission to view the underlying object.

> **DAS-004 Empty states [P0]**  
> Dashboard provides guided empty states with clear actions for first-time users.

### 5.3 Organizer and Permission Management

> **ORG-001 Invite organizer [P0]**  
> Admin can invite an organizer using email and/or shareable invitation link.

> **ORG-002 Organizer profile [P0]**  
> Organizer record stores name, phone, email, relationship/role label, assigned events, and responsibilities.

> **ORG-003 Module permissions [P0]**  
> Admin grants View/Manage/Hidden permissions per supported module.

> **ORG-004 Modify and revoke access [P0]**  
> Admin can change permissions or deactivate organizer access at any time.
> **Acceptance:** Revoked organizer can no longer access protected wedding data.

> **ORG-005 Role labels [P1]**  
> System includes Bride, Groom, Parent, Sibling, Relative, Wedding Planner, Friend, and Custom role labels.
> **Acceptance:** Role label does not override explicit permissions.

### 5.4 Event Management

> **EVT-001 Create and edit event [P0]**  
> Users with permission can create/edit event name, description, date, start/end time, venue, address, map link, dress code, cover image, notes, and custom event type.

> **EVT-002 Indian event presets [P0]**  
> Provide presets such as Roka, Engagement, Mehendi, Haldi, Sangeet, Cocktail, Wedding, Reception, and Custom.

> **EVT-003 Event collaborators [P1]**  
> Events can have assigned organizers/responsible people.

> **EVT-004 Event-linked data [P0]**  
> Tasks, vendors, expenses, invitations, timeline items, and documents may be linked to an event.

> **EVT-005 Event cancellation [P1]**  
> Event can be cancelled/archived without deleting historical records.

### 5.5 Tasks and Checklists

> **TSK-001 Task lifecycle [P0]**  
> Create task with title, description, assignee, event, category, priority, due date, status, notes, and attachments.

> **TSK-002 Task status [P0]**  
> Statuses: To Do, In Progress, Waiting, Completed.

> **TSK-003 Subtasks/checklist [P1]**  
> Task may contain checklist items.

> **TSK-004 Comments [P1]**  
> Authorized organizers can comment on tasks.

> **TSK-005 Filtering [P0]**  
> Tasks filter by event, assignee, status, priority, and due state.

> **TSK-006 Overdue state [P0]**  
> Open task with due date earlier than current date/time is shown as overdue.

> **TSK-007 Checklist templates [P1]**  
> System can offer Indian wedding starter checklist templates that generate editable tasks.

> **TSK-008 Task reminders [P1]**  
> Organizer can receive reminder for task due dates.

### 5.6 Wedding-Day Timeline / Run Sheet

> **TIM-001 Timeline item [P0]**  
> Create timeline item with time, title, description, event, responsible organizer, location, status, and notes.

> **TIM-002 Chronological view [P0]**  
> Timeline displays items chronologically within selected event/day.

> **TIM-003 Operational use [P0]**  
> Timeline remains distinct from tasks and optimized for wedding-day execution.

### 5.7 Vendor Management

> **VEN-001 Vendor record [P0]**  
> Create vendor with business name, category, contact person, phone, WhatsApp, email, address, notes, status, and attachments.

> **VEN-002 Vendor categories [P0]**  
> System includes common Indian wedding vendor categories and supports custom categories.

> **VEN-003 Vendor events [P0]**  
> Vendor can be linked to one or more wedding events.

> **VEN-004 Vendor commercial details [P0]**  
> Store agreed amount and payment schedule; no online payment execution.

> **VEN-005 Vendor status [P1]**  
> Contacted, Negotiating, Confirmed, Completed, Cancelled.

> **VEN-006 No vendor access [P0]**  
> Vendors do not receive accounts or portal access in V1.

### 5.8 Expenses and Vendor Payments

> **FIN-001 Record expense [P0]**  
> Authorized user can record actual expense with title, amount, date, category, event, optional vendor, payer, payment method, receipt, and notes.

> **FIN-002 No required master budget [P0]**  
> System does not require a predefined wedding budget to use expense tracking.

> **FIN-003 Expense summaries [P0]**  
> Show total actual spend and breakdown by event, category, vendor, and payer.

> **FIN-004 Partial vendor payments [P0]**  
> Vendor supports multiple payment milestones such as advance, second, third, final, or custom payment.

> **FIN-005 Payment status [P0]**  
> Each vendor payment stores amount, due date, paid date, status, and notes.

> **FIN-006 Linked expense creation [P0]**  
> When a vendor payment is marked paid, system creates or links one corresponding expense so the payment is counted once in total spending.
> **Acceptance:** A paid vendor installment cannot accidentally be double-counted in expense totals.

> **FIN-007 Outstanding balance [P0]**  
> Vendor displays agreed amount, total paid, and remaining amount.

> **FIN-008 No payment gateway [P0]**  
> V1 tracks payments only and does not transfer money.

### 5.9 Guest Families and Members

> **GST-001 Family-first guest record [P0]**  
> Create Guest Family with family name, primary contact, phone, WhatsApp, email, address, bride/groom side, relationship, and notes.

> **GST-002 Guest members [P0]**  
> Each family contains individual members with name and optional age group/relationship metadata.

> **GST-003 Individual attendance [P0]**  
> Members can independently attend or decline each invited event.

> **GST-004 Search and filters [P0]**  
> Search families/members and filter by side, event, RSVP status, or relationship.

> **GST-005 Import/export [P1]**  
> CSV import/export may be supported as P1 if implementation capacity allows.

### 5.10 Event Invitations and RSVP

> **RSV-001 Event-specific guest list [P0]**  
> Invitation relationship is per family per event. A family may be invited to one event and excluded from another.

> **RSV-002 Private family link [P0]**  
> Each invited family receives a secure invitation token/link.

> **RSV-003 Filtered event visibility [P0]**  
> Guest sees only events to which the family is invited.
> **Acceptance:** A Reception-only guest cannot access Haldi details through normal guest routes.

> **RSV-004 Event-by-event RSVP [P0]**  
> Family can RSVP separately for each invited event.

> **RSV-005 Person-by-person RSVP [P0]**  
> For each invited event, family can select which members are attending.

> **RSV-006 RSVP statuses [P0]**  
> Pending, Attending/Confirmed, Declined, and partially attending family states are represented.

> **RSV-007 Organizer summary [P0]**  
> Organizer can view invited family count, invited member count, expected attendance, declined count, and pending count per event.

> **RSV-008 Edit RSVP [P1]**  
> Guest can update RSVP while response window remains open; organizer can also correct RSVP with permission.

> **RSV-009 Token revocation [P1]**  
> Admin can revoke/regenerate invitation link if it is shared incorrectly.

### 5.11 Digital Invitation Templates

> **INV-001 Professional templates [P0]**  
> Launch with a curated library of professionally designed base invitation themes.

> **INV-002 Safe customization [P0]**  
> User can customize names, photos, monogram/logo, approved fonts, colors, family names, message, event details, and imagery without breaking layout.

> **INV-003 No freeform builder [P0]**  
> V1 does not include a Canva-style arbitrary drag-and-drop design surface.

> **INV-004 Preview [P0]**  
> Organizer can preview invitation in desktop/mobile guest view before distribution.

> **INV-005 Theme reuse [P1]**  
> Chosen invitation theme can be reused by the private wedding website for visual consistency.

### 5.12 Private Wedding Website

> **WEB-001 Invitation-only access [P0]**  
> Guest wedding website is private and accessed through invitation token.

> **WEB-002 Guest-aware content [P0]**  
> Website resolves family identity and filters events/information accordingly.

> **WEB-003 Configurable sections [P0]**  
> Organizer can enable/disable sections including Home, Our Story, Your Events, Schedule, Venues, Dress Code, RSVP, Announcements, Contacts, Live Stream, and Gallery.

> **WEB-004 Mobile-first [P0]**  
> Guest website is optimized for mobile because invitation links are likely opened from WhatsApp.

> **WEB-005 Privacy/no indexing [P0]**  
> Private guest pages should not be indexed by search engines and should not reveal data without valid guest authorization.

### 5.13 Communication and Reminders

> **COM-001 WhatsApp message generator [P0]**  
> Organizer selects a family and message template; system pre-fills personalized text and opens WhatsApp for the organizer to send manually.

> **COM-002 No delivery claim [P0]**  
> System may record that WhatsApp was opened/prepared but must not claim confirmed delivery/read status in V1.

> **COM-003 Email communication [P0]**  
> Organizer can send invitation, RSVP reminder, event reminder, venue update, schedule update, and general announcement by email.

> **COM-004 Guest segmentation [P0]**  
> Messages can target all guests, specific event invitees, bride/groom side, RSVP status, or selected families.

> **COM-005 Communication history [P1]**  
> System stores communication attempts/history for organizer reference.

> **COM-006 Guest reminders [P0]**  
> Organizer can send reminder to pending RSVP families.

> **COM-007 Organizer reminders [P1]**  
> System can notify organizers about overdue tasks, due vendor payments, and approaching events.

### 5.14 Documents, Gallery, and Live Stream

> **DOC-001 Linked documents [P0]**  
> Upload document/attachment and associate it with wedding, event, vendor, task, or expense.

> **DOC-002 Central document view [P1]**  
> Documents screen consolidates accessible files while preserving object relationship.

> **GAL-001 Organizer gallery [P1]**  
> Authorized organizers can create albums and upload photos.

> **GAL-002 Guest gallery view [P1]**  
> Guests may view enabled gallery albums from private website.

> **GAL-003 No guest upload [P0]**  
> Guest photo upload is excluded from V1.

> **LIV-001 External livestream [P1]**  
> Organizer can add external livestream URL to selected event.

> **LIV-002 Guest visibility [P1]**  
> Livestream appears only to guest families invited to the relevant event.

> **LIV-003 No native streaming [P0]**  
> Platform does not host video stream in V1.

### 5.15 Activity, Notifications, Reports, and Search

> **ACT-001 Activity log [P1]**  
> Record important actions such as task completion, expense addition, RSVP submission, venue change, and permission update.

> **ACT-002 Permission-safe activity [P0]**  
> Activity entries hidden when viewer lacks access to the underlying module.

> **NOT-001 In-app notifications [P1]**  
> Notify organizers about relevant operational updates within permitted modules.

> **REP-001 Operational reports [P1]**  
> Provide RSVP/event attendance, expense, vendor outstanding payment, and task completion reports.

> **SEA-001 Module search [P0]**  
> Guests, vendors, tasks, and events have local search/filter.

> **SEA-002 Global search [P2]**  
> Optional V1 global search may search only entities the user can access.

## 6. Key User Flows

### 6.1 Admin Creates a Wedding

1. Create account/sign in.

2. Enter couple and wedding basics.

3. Select standard and custom wedding events.

4. Land on dashboard with guided setup actions.

5. Invite organizers and configure permissions.

6. Add vendors/tasks/guest families as planning progresses.

### 6.2 Invite Organizer

1. Admin opens Organizers.

2. Adds organizer identity and role label.

3. Selects module permissions.

4. Sends email or copies invitation link.

5. Organizer accepts and joins wedding.

6. Admin may later update or revoke access.

### 6.3 Add Guest Family and Send Invitation

1. Organizer creates family and members.

2. Selects which wedding events the family is invited to.

3. Chooses invitation theme/content.

4. System generates private invitation token.

5. Organizer opens WhatsApp with prefilled personalized message or sends email.

6. Family opens private site and responds.

### 6.4 Guest RSVP

1. Guest opens secure family invitation link.

2. System resolves family and invited events.

3. Guest reviews invitation details.

4. For each event, guest selects attending/declined and selects attending members.

5. Guest submits.

6. Organizer dashboard and event attendance update.

7. Pending families remain eligible for reminder.

### 6.5 Vendor Payment

1. Organizer creates vendor and agreed amount.

2. Creates one or more planned payment milestones.

3. Marks an installment as paid with date/payment method/receipt.

4. System creates/links expense once.

5. Vendor total paid and remaining balance update.

6. Expense reports reflect the payment exactly once.

### 6.6 Wedding-Day Operation

1. Organizer opens selected event timeline.

2. Views time-ordered run sheet and assigned responsibilities.

3. Updates operational status as activities occur.

4. Uses important contacts, event details, vendor records, and tasks as needed.

5. Guests access private site for venue/schedule/announcements/livestream.

## 7. Business Rules and Edge Cases

| Rule ID | Rule |
| --- | --- |
| BR-001 | A guest family cannot access an event unless an Event Invitation exists for that family/event. |
| BR-002 | Family RSVP may be partial: some members attending and others declining. |
| BR-003 | If an event is removed after invitations are sent, organizer must confirm handling of existing invitations; historical RSVP should not silently disappear. |
| BR-004 | Paid vendor installment must map to one expense record to prevent duplicate spend. |
| BR-005 | Removing organizer access must invalidate active authenticated access to protected wedding data as soon as practical. |
| BR-006 | Changing permissions must affect dashboards, reports, search, activity, exports, and notifications—not just navigation visibility. |
| BR-007 | Invitation token should be revocable and unguessable. |
| BR-008 | The platform must not claim WhatsApp delivery/read status unless an official integration exists. |
| BR-009 | Guest website must display times/venues from current event data so organizers do not maintain duplicate copies. |
| BR-010 | Deleting high-value records such as vendor payment, expense, event, or guest family should require confirmation and preferably soft-delete/archive where practical. |
| BR-011 | One active wedding per account is a V1 product rule, not a permanent database ownership assumption. |
| BR-012 | Financial views must be hidden from organizers without finance permission, including summary cards and activity descriptions. |
| BR-013 | A completed wedding remains readable; destructive auto-deletion is not permitted. |
| BR-014 | Invitation templates may expose only data intended for guest-facing use. |

## 8. Data Model (Logical)

The following is a logical entity model for product and engineering alignment. It is not a final database schema and does not prescribe SQL/NoSQL technology.

| Entity | Key fields / relationships |
| --- | --- |
| User | Identity, contact, authentication state |
| Wedding | Couple, title, date range, city, theme, status |
| WeddingMember | User ↔ Wedding membership, role label, status |
| WeddingPermission | Member + module + access level |
| Event | Wedding, type, date/time, venue, guest-facing details |
| Task | Wedding/event, assignee, due date, status, priority |
| TaskChecklistItem | Task child item |
| TaskComment | Task, author, body, timestamp |
| Vendor | Wedding, category, contact, agreed amount, status |
| VendorEvent | Vendor ↔ Event |
| VendorPayment | Vendor, amount, due/paid dates, status, linked expense |
| Expense | Wedding/event, category, vendor, payer, amount, receipt |
| GuestFamily | Wedding, household contact data, side, relationship |
| GuestMember | GuestFamily member |
| EventInvitation | GuestFamily ↔ Event, invitation state |
| GuestEventRSVP | GuestMember + Event response |
| InvitationToken | GuestFamily, token/hash, active/revoked, expiry policy if used |
| InvitationTemplate | Theme/design configuration |
| Communication | Channel, template/body, sender, segment, timestamp |
| CommunicationRecipient | Communication ↔ GuestFamily, attempt status |
| WeddingWebsite | Wedding, enabled sections, theme config |
| TimelineItem | Wedding/event, time, owner, location, status |
| Document | File metadata + linked object type/id |
| GalleryAlbum | Wedding/event album |
| GalleryPhoto | Album photo metadata |
| LiveStream | Event, provider/external URL, visibility |
| Notification | User, type, object reference, read state |
| ActivityLog | Actor, action, object, timestamp |

## 9. Non-Functional Requirements

### 9.1 Security and Privacy

- Authorization must be enforced server-side for every protected module and object; hidden UI alone is insufficient.

- Guest invitation tokens must be high-entropy, non-sequential, and revocable.

- Private wedding pages should use noindex directives and must not be discoverable through unauthenticated directory listing.

- Uploaded documents and photos should use access-controlled URLs or signed delivery where appropriate.

- Sensitive fields such as financial data must be excluded from API responses when the requester lacks permission.

- Audit security events such as organizer permission changes and invitation-token revocation.

- Protect against common web risks including CSRF where applicable, XSS, injection, broken access control, insecure direct object references, and rate abuse.

### 9.2 Performance

- Organizer dashboard should become usable quickly on common mobile/laptop connections.

- Guest invitation pages should prioritize fast mobile loading and defer heavy gallery media.

- Large guest lists should use pagination/virtualization as needed.

- Search/filter operations should remain responsive for weddings with several thousand guest members.

- Image upload pipeline should generate optimized guest-facing sizes rather than serving only originals.

### 9.3 Reliability and Data Integrity

- Financial totals must be deterministic and avoid double-counting vendor payments.

- RSVP updates should be transactional at the family/event level where practical.

- Soft delete/archive should be preferred for records with downstream history.

- Activity timestamps should be consistent and timezone-aware.

- Automated backups and restoration procedures must exist before production launch.

### 9.4 Accessibility and Usability

- Use semantic labels, keyboard-friendly controls, readable contrast, meaningful error messages, and accessible form validation.

- Guest RSVP should be understandable to non-technical users and usable on small screens.

- Avoid relying on color alone for RSVP/payment/task status.

- Design for mixed digital literacy among family organizers.

### 9.5 Localization and India-first Formatting

- Support Indian names, phone formats, and INR currency formatting.

- Dates/times should display in a clear local format while stored consistently.

- Event names and relationship labels must be customizable.

- Architecture should not hard-code one culture or ceremony list even though defaults are India-first.

## 10. Product Analytics and Success Metrics

Because the commercial model is initially freemium, early measurement should focus on activation, collaboration, and workflow completion rather than revenue.

| Metric | Definition / intent |
| --- | --- |
| Wedding activation | Wedding created plus at least two meaningful setup actions, e.g., event + guest/task/vendor. |
| Organizer collaboration | Percent of activated weddings with at least one additional organizer. |
| Guest setup adoption | Percent with at least one family and event invitation. |
| Invitation adoption | Percent of weddings generating at least one private invitation link. |
| RSVP completion | Responses received / invited families or members. |
| Task engagement | Tasks created and completion rate. |
| Vendor finance adoption | Weddings with vendor amount/payment records. |
| Expense adoption | Weddings recording at least one expense. |
| Guest website engagement | Invitation link opens and section usage. |
| Communication adoption | WhatsApp-open actions and emails initiated. |
| Retention to wedding date | Active organizer use in key periods before the wedding. |

### 10.1 Analytics Events (illustrative)

- wedding_created

- event_created

- organizer_invited

- organizer_joined

- permission_updated

- guest_family_created

- event_invitation_created

- invitation_link_generated

- invitation_opened

- rsvp_submitted

- task_created

- task_completed

- vendor_created

- vendor_payment_marked_paid

- expense_created

- whatsapp_message_opened

- email_sent

- website_section_viewed

- livestream_clicked

## 11. V1 Launch Acceptance Criteria

V1 is considered functionally launch-ready when the following end-to-end scenarios can be completed without administrative workarounds.

- Admin can create a multi-event wedding and edit core information.

- Admin can invite at least one organizer, restrict finance access, and verify restricted data is not visible through dashboard, reports, activity, or direct routes.

- Organizer can create tasks and wedding-day timeline items associated with events.

- Organizer can create vendors, payment milestones, mark an installment paid, and see exactly one corresponding expense counted.

- Organizer can create a family with multiple members and invite that family to only selected events.

- Guest can open a private link and cannot view non-invited events.

- Guest can submit different attendance choices for different family members and events.

- RSVP summary updates accurately on organizer side.

- Organizer can prepare a personalized WhatsApp message that opens WhatsApp with invitation link.

- Organizer can send supported email communication and view communication history where implemented.

- Private wedding website works on common mobile screen sizes and reflects current event information.

- Uploaded documents are visible only to authorized organizers; gallery and livestream respect guest event visibility where applicable.

- Critical destructive actions have confirmation and do not silently corrupt downstream records.

- Core workflows have clear loading, success, empty, validation, and error states.

## 12. UX and Content Principles

**Attention over analytics:** The dashboard should prioritize what needs action now rather than maximizing charts.

**Progressive complexity:** Do not force complete wedding setup on day one; allow the workspace to grow as planning progresses.

**Family-first language:** Use everyday wedding language instead of project-management jargon where possible.

**Mobile guest experience:** Invitation and RSVP are designed primarily for phones.

**Permission clarity:** When an organizer lacks access, the product should clearly omit restricted content without leaking counts or values.

**One source of truth:** Guest-facing pages should read live event data; vendor payments should feed expenses; duplicate manual entry should be minimized.

**Forgiving workflows:** Allow corrections to RSVP, expenses, guest details, and tasks with appropriate history rather than forcing irreversible actions.

## 13. Screen State Requirements

Every primary screen must define these states during design and implementation:

- Loading

- First-use empty

- Populated

- Filtered-no-results

- Validation error

- Network/server error

- Permission denied

- Archived/cancelled object where applicable

- Mobile responsive state

## 14. Release Scope and Roadmap

### 14.1 V1 - Core Wedding Management

- Wedding workspace and events

- Organizers and permissions

- Dashboard

- Tasks/checklists

- Wedding-day timeline

- Vendor management

- Expenses and partial vendor payments

- Family guest management

- Event-specific invitations

- RSVP

- Professionally designed customizable invitations

- Private wedding website

- WhatsApp message generation/open

- Email communication

- Documents

- Basic gallery

- External livestream link

- Notifications/activity/reports at defined V1 priority

### 14.2 Version 2 - Logistics and Enhanced Guest Operations

- Accommodation and room allocation

- Transportation, vehicles, drivers, pickups/drop-offs

- Advanced seating management

- Guest photo uploads / QR experience

- More invitation themes

- Advanced analytics and exports

- Deeper communication automation/integrations

### 14.3 Future - Professional Planner Platform

- Multiple weddings per planner account

- Planner staff/team management

- Reusable templates across weddings

- Cross-wedding dashboard

- Client management and planner-specific reporting

### 14.4 Future - Vendor Marketplace

- Vendor profiles and portfolios

- Location/category discovery

- Availability enquiries

- Quotation requests

- Reviews

- Lead generation

- Potential subscriptions/commissions/bookings only after marketplace validation

## 15. Explicitly Out of Scope for V1

| Area | Excluded capability |
| --- | --- |
| Marketplace | Vendor discovery marketplace, bidding, reviews, commissions |
| Payments | Gateway, escrow, UPI collection, payment links |
| Planner SaaS | Multiple simultaneous weddings per planner |
| Logistics | Accommodation, transport, airport pickup/drop |
| Seating | Advanced visual drag-and-drop seating planner |
| Streaming | Native video capture/hosting |
| WhatsApp | Official Business API automation or delivery/read receipts |
| Design tools | Freeform drag-and-drop invitation design editor |
| AI | Autonomous AI planner or recommendation engine |
| Vendor access | Vendor login/dashboard/upload portal |
| Guest social | Public profiles, chat, feed, social network |

## 16. Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Feature overload | Users may find product overwhelming. | Progressive onboarding, grouped navigation, sensible defaults, hide advanced settings. |
| Permission leakage | Sensitive financial/guest data exposed. | Server-side authorization, permission-aware queries, security tests for every module. |
| Guest-link forwarding | Invitation link shared unintentionally. | Revocable high-entropy tokens; optional future OTP/access code; event-level filtering. |
| WhatsApp expectations | Users assume automatic send/delivery tracking. | Clear UI wording: prepare/open WhatsApp; do not claim delivery. |
| Financial double counting | Vendor payment and manual expense both counted. | Linked expense model and duplicate prevention UI. |
| Large guest lists | Slow UI and difficult management. | Pagination/virtualization, bulk selection, search/filter; consider CSV import. |
| Cultural variety | Defaults do not match every Indian community. | Custom event names, custom categories, editable terminology. |
| Last-minute wedding changes | Stale guest-facing information. | Single source of truth and immediate website updates from event data. |

## 17. Design and Engineering Decisions Still to Specify

These are implementation-level decisions, not unresolved product scope. They can be finalized during UX/technical design without reopening the V1 feature set.

- Authentication provider and sign-in methods.

- Exact email delivery provider and sender-domain configuration.

- Cloud file/image storage provider and media limits.

- Database technology and detailed schema/indexing.

- Whether CSV guest import ships in first public release or shortly after.

- Invitation token expiry policy vs persistent links until revoked.

- Whether completed weddings become read-only by default.

- Exact notification transport (in-app only vs optional email notifications).

- Exact number and visual direction of launch invitation templates.

- Operational limits for guest count, file size, image count, email volume, and organizer count.

## 18. Glossary

| Term | Definition |
| --- | --- |
| Wedding Workspace | The organizer-side environment containing all planning data for one wedding. |
| Wedding Admin | Owner/controller with full access and permission-management authority. |
| Organizer | Collaborator helping manage the wedding with granted permissions. |
| Guest Family | Household/invitation unit that may contain multiple guest members. |
| Event Invitation | Relationship indicating that a guest family is invited to a specific event. |
| RSVP | Attendance response at family-member and event level. |
| Vendor Payment | Installment/payment milestone against a vendor agreed amount. |
| Expense | Actual spending record included in total wedding spending. |
| Private Wedding Website | Guest-facing invitation-only site filtered to the family’s invited events. |
| Invitation Token | Secure identifier used to resolve a family into its private guest experience. |
| Timeline / Run Sheet | Time-ordered operational schedule for an event/day, distinct from planning tasks. |

## 19. Requirement Index

Requirement prefixes: WED Wedding Setup; DAS Dashboard; ORG Organizer; EVT Events; TSK Tasks; TIM Timeline; VEN Vendors; FIN Finance; GST Guests; RSV RSVP; INV Invitations; WEB Website; COM Communication; DOC Documents; GAL Gallery; LIV Live Stream; ACT Activity; NOT Notifications; REP Reports; SEA Search.

> **Feature freeze statement**  
> This PRD defines the approved Version 1 product scope. New capabilities should be evaluated as change requests or assigned to Version 2/Future unless they are necessary to satisfy an existing requirement.

## 20. Appendix: Representative Scenarios

### 20.1 Family Invitation Scenario

The Sharma family contains four members. They are invited to Sangeet, Wedding, and Reception, but not Haldi. The private website therefore displays only those three events. For the Wedding, three members attend and one declines; for Reception all four attend. Organizer counts update by event and retain the family as one communication unit.

### 20.2 Restricted Organizer Scenario

A sibling is granted Events, Tasks, Guests, Invitations, and Communication access but Finance is Hidden. They can coordinate guest reminders and Sangeet tasks but cannot view expense totals, vendor agreed amounts, vendor payment activity, finance reports, or finance-derived dashboard cards.

### 20.3 Partial Vendor Payment Scenario

A photographer has an agreed amount of ₹150,000. Admin records ₹30,000 advance, ₹50,000 second payment, and ₹70,000 final payment. When the advance is marked paid, one linked ₹30,000 expense is created. Marking the second payment paid increases total paid to ₹80,000 and remaining to ₹70,000; wedding expense totals increase by only ₹50,000 for that action.

### 20.4 Last-Minute Venue Update Scenario

The Reception venue changes. An organizer updates the event once. The private wedding website immediately uses the new venue for all invited families. Organizer can then send an email or open WhatsApp with a venue-change message to Reception invitees without maintaining duplicate event data.
