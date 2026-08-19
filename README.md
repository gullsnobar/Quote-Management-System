# Quote Management System

> Full-stack quote management application with a React frontend, an AdonisJS API backend, PostgreSQL persistence, token-based authentication, and a global corridor pricing catalog.

## Table of Contents

- [Project Overview](#project-overview)
- [Business Purpose](#business-purpose)
- [Core Domain Concepts](#core-domain-concepts)
- [Main User Workflow](#main-user-workflow)
- [Repository Structure](#repository-structure)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Database Schema](#database-schema)
- [Quote Domain](#quote-domain)
- [Corridor Domain](#corridor-domain)
- [Calculation Architecture](#calculation-architecture)
- [Authentication and Authorization](#authentication-and-authorization)
- [Validation and Security](#validation-and-security)
- [Performance Notes](#performance-notes)
- [Concurrency](#concurrency)
- [Multi-Tab and Multi-Quote State](#multi-tab-and-multi-quote-state)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Environment Setup](#environment-setup)
- [Database Seeding](#database-seeding)
- [Acceptance Criteria Status](#acceptance-criteria-status)
- [Known Gaps and Future Work](#known-gaps-and-future-work)
- [Rules for Future AI Coding Agents](#rules-for-future-ai-coding-agents)
- [Quick "Where to Change What" Guide](#quick-where-to-change-what-guide)
- [Final Reality Check](#final-reality-check)

---

## Project Overview

This project is a **quote management system** for creating and managing commercial quotes, with a supporting **corridor pricing catalog**.

The system currently has:

- user signup/login/logout
- authenticated quote CRUD
- quote search/filtering by status and text search
- a quote detail page with editable/read-only modes based on status
- a corridor catalog tab with backend filtering and backend-calculated pricing metrics
- optimistic-concurrency-related backend/database pieces

Important limitation:

- The database contains a real `quote_corridors` relationship table, and the backend models support a many-to-many Quote ↔ Corridor relationship.
- However, the **current frontend/API flow does not provide a complete way to attach/detach corridors to a quote**.
- The current quote details corridor tab shows the **global corridor catalog**, not a quote-specific selected-corridors list.

That means the project already contains the beginnings of a quote-to-corridor pricing model, but that workflow is **not fully exposed end-to-end yet**.

---

## Business Purpose

The business purpose appears to be:

1. let authenticated users create and manage quotes they own
2. allow those users to review a large corridor catalog
3. perform pricing/margin calculations in the backend
4. support a quote lifecycle with statuses such as `draft`, `in_review`, `approved`, and `rejected`

In practical terms, this looks like a pricing tool for a payments/remittance-style business where each corridor represents a route or commercial payout path with fee, FX, and cost characteristics.

---

## Core Domain Concepts

### Quote

A **Quote** is a user-owned commercial pricing record.

A quote currently stores:

- ownership (`user_id`)
- commercial identity (`name`, `partner_name`)
- lifecycle status (`status`)
- contract length (`contract_length`)
- backend-calculated totals:
  - `total_revenue`
  - `monthly_revenue`
  - `tcv`
- a `version` field used for optimistic concurrency checks

### Corridor

A **Corridor** is a read-only catalog record that represents a payout/pricing route.

It stores data such as:

- region
- country
- transaction type
- service
- receiving partner
- payer
- payout currency
- ATV / fee / FX / cost inputs
- `needs_approval`

The corridor dataset is seeded from `sample_corridors.json`.

### Quote ↔ Corridor relationship

There is a many-to-many relationship between quotes and corridors via `quote_corridors`.

Conceptually, this means:

- one quote can reference many corridors
- one corridor can appear in many quotes

Current reality:

- the relationship exists in the schema and models
- backend quote calculations use preloaded quote corridors
- tests verify the relationship works at model level
- **but there is currently no verified route/controller/frontend flow that lets a user manage this relationship**

So this relationship is **implemented at the data/model layer**, but **not fully surfaced in the application workflow**.

---

## Main User Workflow

### Current implemented flow

1. User signs up or logs in.
2. User lands on the dashboard.
3. User can:
   - create a quote
   - search quotes by name or partner
   - filter quotes by status
   - open a quote details page
   - submit an editable quote for review
   - delete a quote
4. In quote details:
   - editable quotes can switch into edit mode
   - current frontend edit mode allows editing `name` and `partnerName`
   - the corridor tab loads the global corridor catalog with backend filtering
   - corridor calculations are returned from the backend
5. Submitted quotes move to `in_review` and become read-only.

### Planned / Not yet fully implemented in end-to-end flow

- quote-specific corridor selection/management
- complete quote lifecycle transitions to `approved` / `rejected`
- fully verified conflict-safe stale client update flow
- advanced multi-tab or multi-quote editing behavior

---

## Repository Structure

```text
quote-management-system/
├─ app/
│  ├─ controllers/
│  │  ├─ access_tokens_controller.ts
│  │  ├─ corridors_controller.ts
│  │  ├─ new_account_controller.ts
│  │  ├─ profile_controller.ts
│  │  └─ quotes_controller.ts
│  ├─ exceptions/
│  │  └─ handler.ts
│  ├─ middleware/
│  │  ├─ auth_middleware.ts
│  │  ├─ container_bindings_middleware.ts
│  │  ├─ force_json_response_middleware.ts
│  │  └─ silent_auth_middleware.ts
│  ├─ models/
│  │  ├─ corridor.ts
│  │  ├─ quote.ts
│  │  └─ user.ts
│  ├─ services/
│  │  ├─ corridor_calculation_service.ts
│  │  └─ quote_calculation_service.ts
│  ├─ transformers/
│  │  └─ user_transformer.ts
│  └─ validators/
│     ├─ quote.ts
│     └─ user.ts
├─ config/
├─ database/
│  ├─ migrations/
│  ├─ seeders/
│  ├─ schema.ts
│  └─ schema_rules.ts
├─ frontend/
│  ├─ src/
│  │  ├─ api/
│  │  ├─ components/
│  │  ├─ context/
│  │  ├─ pages/
│  │  └─ types/
│  ├─ package.json
│  └─ vite.config.ts
├─ providers/
│  └─ api_provider.ts
├─ start/
│  ├─ env.ts
│  ├─ kernel.ts
│  ├─ routes.ts
│  └─ validator.ts
├─ tests/
│  ├─ bootstrap.ts
│  └─ unit/
├─ sample_corridors.json
├─ package.json
└─ README.md
```

---

## Tech Stack

### Frontend

- React `19.2.8`
- TypeScript `~6.0.2`
- Vite `^8.2.0`
- React Router DOM `^7.18.2`
- Axios `^1.19.0`
- `@tanstack/react-virtual` `^3.14.9`
- `lucide-react` `^1.31.0`

### Backend

- AdonisJS Core `^7.4.0`
- TypeScript `~6.0.3`
- Node ESM project (`"type": "module"`)

### Database

- PostgreSQL via `pg ^8.23.0`

### ORM

- AdonisJS Lucid `^22.4.2`

### Authentication

- `@adonisjs/auth ^10.1.0`
- database-backed access tokens (`auth_access_tokens`)
- frontend uses Bearer token auth via Axios interceptor

### Validation

- VineJS `@vinejs/vine ^4.4.0`

### Testing

- Japa Runner `^5.3.0`
- `@japa/assert`
- `@japa/plugin-adonisjs`
- `@japa/api-client`

### Build tools

- Vite
- TypeScript compiler
- AdonisJS assembler

### Package manager

- npm
- Verified by presence of `package-lock.json` in root and `frontend/package-lock.json`

### Other important libraries

- Luxon `^3.7.2`
- `@tuyau/core ^1.2.2` for generated registry/types
- `@adonisjs/cors`
- `@adonisjs/session`
- `@adonisjs/shield`
- `pino-pretty` (dev dependency)

### Library present but not part of the active database configuration

- `better-sqlite3` is present in dependencies, but the current `config/database.ts` only configures PostgreSQL.

---

## Architecture

### High-level data flow

```text
React frontend
    ↓
Axios API layer
    ↓
AdonisJS routes/controllers
    ↓
Services / business logic
    ↓
Lucid ORM models & query builder
    ↓
PostgreSQL
```

### Expanded view

```text
Frontend pages/components
    ├─ AuthContext
    ├─ Dashboard
    ├─ QuoteDetails
    └─ Corridor table + filters
            ↓
frontend/src/api/*.ts
            ↓
/api/v1 routes
            ↓
controllers
    ├─ auth controllers
    ├─ quotes controller
    └─ corridors controller
            ↓
services
    ├─ QuoteCalculationService
    └─ CorridorCalculationService
            ↓
Lucid models
    ├─ User
    ├─ Quote
    └─ Corridor
            ↓
PostgreSQL tables
    ├─ users
    ├─ auth_access_tokens
    ├─ quotes
    ├─ corridors
    └─ quote_corridors
```

### Layer responsibilities

#### Frontend

Responsible for:

- routing
- auth state
- calling backend APIs
- local UI state for quotes, filters, edit mode, notifications
- rendering the corridor table
- list virtualization

#### API layer

Responsible for:

- applying the API base URL
- attaching `Authorization: Bearer <token>`
- redirecting on `401`
- wrapping route-specific requests

#### Backend controllers

Responsible for:

- request validation
- ownership checks
- route behavior
- deciding when records are editable
- returning JSON responses

#### Services / business logic

Responsible for:

- quote revenue summary calculations
- corridor revenue/cost/margin calculations

#### ORM / models

Responsible for:

- table mapping
- relationships
- database querying

#### PostgreSQL

Responsible for:

- persistence
- uniqueness constraints
- foreign keys
- indexed corridor filtering columns
- atomic quote update checks using `version`

---

## Backend Architecture

### Routing

All API routes are under:

- `/api/v1/auth/*`
- `/api/v1/account/*`

Public routes:

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`

Authenticated routes:

- `GET /api/v1/account/profile`
- `POST /api/v1/account/logout`
- quote routes
- corridor routes

### Response wrapping

The backend defines a custom serializer in `providers/api_provider.ts` that wraps serialized responses under `data`.

Examples:

- auth/profile responses use serializer-wrapped `{ data: ... }`
- quote and corridor controllers often return explicit `{ data: ... }`

Future changes should preserve this response shape unless the frontend API layer is updated too.

### Middleware

Global/server/router middleware currently includes:

- force JSON accept header
- container bindings
- CORS
- body parser
- session middleware
- shield middleware
- auth initialization
- silent auth check

Named middleware:

- `auth` for protected account routes

---

## Frontend Architecture

### Routing

Frontend routes:

- `/login`
- `/signup`
- `/`
- `/quotes/:id`

Protected routes use a `ProtectedRoute` wrapper based on auth state.

### State management

There is **no Redux, Zustand, MobX, or React Query**.

Current state is handled using:

- React Context for auth (`AuthContext`)
- local component state for:
  - dashboard quote list
  - quote detail page
  - edit mode
  - notifications
  - corridor filters
  - corridor result set

### Auth state

Auth state is stored in:

- `localStorage["token"]`
- `localStorage["user"]`

The app verifies stored auth on load by calling `/account/profile`.

### Important frontend areas

#### Quote list / dashboard

- `frontend/src/pages/Dashboard.tsx`

Responsibilities:

- list quotes
- search quotes
- filter quotes by status
- create quote
- submit editable quote
- delete quote

#### Quote detail / quote editor

- `frontend/src/pages/QuoteDetails.tsx`

Responsibilities:

- fetch a single quote
- switch between view/edit mode
- save quote updates
- submit quote
- show save conflict notifications
- show quote overview and corridor tab

#### Corridor tab

- `frontend/src/components/corridors/CorridorFilters.tsx`
- `frontend/src/components/corridors/CorridorsTable.tsx`

Responsibilities:

- collect filter input
- call backend corridor endpoint
- render virtualized table
- display backend calculations

#### Authentication pages

- `frontend/src/pages/Login.tsx`
- `frontend/src/pages/Signup.tsx`
- `frontend/src/context/AuthContext.tsx`

### Important frontend limitation

The frontend `Quote` type only models a subset of backend quote fields. It currently does **not** model fields like:

- `contractLength`
- `totalRevenue`
- `monthlyRevenue`
- `tcv`

The backend calculates and returns these values in some quote responses, but the current frontend is not structured around them yet.

---

## Database Schema

### users

#### Purpose

Stores application users.

#### Important columns

- `id` — primary key
- `full_name` — nullable string
- `email` — unique string
- `password` — hashed password
- `created_at`
- `updated_at`

#### Constraints

- primary key on `id`
- unique constraint on `email`

#### Relationships

- one user has many quotes

---

### auth_access_tokens

#### Purpose

Stores API access tokens for token-based auth.

#### Important columns

- `id`
- `tokenable_id` → `users.id`
- `type`
- `name`
- `hash`
- `abilities`
- `created_at`
- `updated_at`
- `last_used_at`
- `expires_at`

#### Constraints

- foreign key to `users`
- `ON DELETE CASCADE`

---

### quotes

#### Purpose

Stores user-owned quote records and quote-level summary metrics.

#### Important columns

- `id` — primary key
- `user_id` — owner
- `name`
- `partner_name`
- `status`
- `contract_length`
- `total_revenue`
- `monthly_revenue`
- `tcv`
- `version`
- `created_at`
- `updated_at`

#### Constraints

- primary key on `id`
- foreign key `user_id` → `users.id`
- `ON DELETE CASCADE`
- `status` defaults to `draft`
- `contract_length` defaults to `1`
- financial metric columns default to `0`
- `version` defaults to `1`

#### Relationships

- belongs to one user
- many-to-many with corridors through `quote_corridors`

#### Important notes

- There are no explicit database indexes on `quotes.user_id` or `quotes.status` in migrations.
- Ownership enforcement is currently handled in controller queries, not via database row-level security.

---

### corridors

#### Purpose

Stores the global corridor catalog.

#### Important columns

- `id` — primary key
- `version_id`
- `source_row_id`
- `corridor_id`
- `region`
- `country`
- `transaction_type`
- `service`
- `receiving_partner`
- `payer`
- `payout_currency`
- `historical_atv`
- `atv_usd`
- `std_fixed_fee_usd`
- `variable_fee_percentage`
- `fx_source`
- `default_fx_spread`
- `treasury_fx_cost`
- `cost_fixed_per_usd`
- `cost_variable_per_trx`
- `needs_approval`
- `created_at`
- `updated_at`

#### Constraints

- primary key on `id`
- unique constraint on `corridor_id`

#### Indexes

Explicit filter indexes exist on:

- `region`
- `country`
- `transaction_type`
- `service`
- `payout_currency`
- `receiving_partner`
- `payer`

#### Relationships

- many-to-many with quotes through `quote_corridors`

---

### quote_corridors

#### Purpose

Pivot table connecting quotes to corridors.

#### Important columns

- `id` — primary key
- `quote_id` → `quotes.id`
- `corridor_id` → `corridors.id`
- `created_at`
- `updated_at`

#### Constraints

- primary key on `id`
- foreign key `quote_id` → `quotes.id`
- foreign key `corridor_id` → `corridors.id`
- unique composite constraint on `["quote_id", "corridor_id"]`
- both foreign keys use `ON DELETE CASCADE`

#### Relationship meaning

This table means:

- a quote can include multiple corridors
- a corridor can be reused across many quotes
- the same corridor cannot be attached to the same quote more than once

#### Current implementation status

- schema: implemented
- Lucid model relationship: implemented
- tested at model level: implemented
- API/UI management flow: **not yet implemented**

---

## Quote Domain

### Quote creation

Implemented.

Backend behavior:

- quote is created for the authenticated user
- status is forced to `draft`
- `version` is set to `1`
- `totalRevenue`, `monthlyRevenue`, and `tcv` are initialized to `0`
- `contractLength` defaults to `1` if not supplied

Current frontend create modal exposes only:

- `name`
- `partnerName`

It does **not** expose `contractLength`.

### Quote listing

Implemented.

Current list behavior:

- only returns quotes owned by the authenticated user
- orders by `created_at DESC`
- supports optional:
  - `status`
  - `search`

#### Search/filtering

Implemented.

- `status` filter uses exact match
- `search` uses case-insensitive partial matching (`ILIKE`) against:
  - `name`
  - `partner_name`

#### Important implementation note

The quote index controller computes summary metrics from `quote.$preloaded.corridors`, but it does **not preload corridors in the list query**.

That means list-level calculated values are currently not a reliable source of truth if consumed from the index response.

### Quote detail/view

Implemented.

- quote is looked up by `id`
- query is scoped to the authenticated user
- quote not found / not owned returns `404`
- controller preloads `corridors`
- backend calculates quote summary from preloaded corridors before returning response

### Quote editing

Implemented, but limited.

Backend rule:

- only `draft` and `rejected` quotes are editable

Current frontend edit mode only edits:

- `name`
- `partnerName`

Backend update logic also supports:

- optional `contractLength`

Current frontend does **not** expose `contractLength`.

### Quote deletion

Implemented.

Current behavior:

- user can delete any quote they own
- there is no verified status restriction on deletion

### Quote submission

Implemented.

Current submission rule:

- only `draft` and `rejected` quotes can be submitted
- backend recalculates quote totals before changing status
- status becomes `in_review`

### Quote statuses

Statuses verified in code:

- `draft`
- `in_review`
- `approved`
- `rejected`

#### Current lifecycle reality

Implemented transitions:

- create → `draft`
- submit → `in_review`

Planned / Not yet implemented in API flow:

- explicit approve endpoint
- explicit reject endpoint

`approved` and `rejected` exist in schema, tests, UI types, and status badges, but there are no backend routes/controllers that currently transition a quote into those states.

### Ownership rules

Implemented.

Every quote read/update/delete action is scoped by:

- quote `id`
- authenticated `user.id`

That is the main mechanism preventing users from accessing another user's quotes.

---

## Corridor Domain

### How corridors are stored

Corridors are stored in a dedicated `corridors` table and seeded from `sample_corridors.json`.

They are treated as **read-only catalog data** in current application behavior. The corridor controller's `store`, `update`, and `destroy` methods return `405 Method Not Allowed` (and are not routed).

### How corridors are associated with quotes

At the data/model level:

- via the `quote_corridors` pivot table
- `Quote` has `manyToMany(Corridor)`
- `Corridor` has `manyToMany(Quote)`

At the app flow level:

- no verified API endpoint currently attaches or detaches corridors from a quote
- no verified frontend UI currently selects corridors into a quote

### How the Corridors tab works

Current behavior in `QuoteDetails`:

- default tab is `corridors`
- it fetches corridors from `/account/corridors`
- filters are sent to the backend
- results are rendered in a virtualized table

Important:

- this is currently a **global filtered corridor catalog view**
- it is **not** a verified quote-specific corridor selection view

### Corridor filtering

Implemented.

#### Available filter fields

Backend supports:

- `region`
- `country`
- `transactionType`
- `service`
- `payoutCurrency`
- `receivingPartner`
- `payer`

#### Backend filter behavior

- `region` — exact match
- `country` — exact match
- `transactionType` — exact match
- `service` — exact match
- `payoutCurrency` — exact match
- `receivingPartner` — case-insensitive partial match
- `payer` — case-insensitive partial match

#### Important UI/API mismatch

The frontend uses free-text inputs for:

- `country`
- `payoutCurrency`

But the backend currently applies exact matching for those fields.

So these filters are implemented, but users must currently enter exact stored values for them to match.

### Corridor calculations

Implemented in the backend.

Each corridor response includes:

- `revenue`
- `cost`
- `margin`
- `marginPercent`

### Where calculations are performed

Backend only.

- corridor-level calculations happen in `CorridorCalculationService`
- quote-level summary calculations happen in `QuoteCalculationService`

This matches the requirement that calculations should live in the backend.

### How corridor data reaches the frontend

Flow:

1. `QuoteDetails` calls `corridorsApi.getCorridors(filters)`
2. Axios sends request to `/api/v1/account/corridors`
3. backend loads filtered corridor rows from PostgreSQL
4. backend attaches `calculations` to each row
5. frontend stores results in local component state
6. `CorridorsTable` renders them with virtualization

### Large dataset requirement

Current implementation is clearly built around a large corridor dataset and assumes **3,000 corridors**.

What exists now:

- seeded corridor dataset file
- backend filtering
- no pagination
- frontend row virtualization via `@tanstack/react-virtual`

What is not fully verified:

- measured average response/render time under 2 seconds
- formal load/performance tests
- explicit backend query optimization proof beyond indexes and simple query structure

---

## Calculation Architecture

### CorridorCalculationService

This service calculates per-corridor pricing metrics.

#### Inputs used

- `atvUsd`
- `stdFixedFeeUsd`
- `variableFeePercentage`
- `costFixedPerUsd`
- `costVariablePerTrx`
- `treasuryFxCost`

#### Internal constant

- `yearlyVolumeUsd = 100000`

#### Derived values

- `yearlyTrx = ceil(yearlyVolumeUsd / atvUsd)` when `atvUsd > 0`
- `revenue = stdFixedFeeUsd * yearlyTrx + variableFeePercentage * yearlyVolumeUsd`
- `fixedCost = yearlyVolumeUsd * costFixedPerUsd`
- `variableCost = costVariablePerTrx * yearlyTrx`
- `treasuryFxCost = yearlyVolumeUsd * treasuryFxCost`
- `cost = fixedCost + variableCost + treasuryFxCost`
- `margin = revenue - cost`
- `marginPercent = margin / revenue * 100` when revenue > 0

### QuoteCalculationService

This service calculates quote-level summary metrics.

#### Inputs used

- `corridors`
- `contractLength`

#### Corridor revenue model

Quote summary uses a simplified corridor revenue calculation:

- same `yearlyVolumeUsd = 100000`
- revenue only
- no corridor cost contribution in quote summary

#### Quote outputs

- `totalRevenue` = sum of corridor revenues
- `monthlyRevenue` = `totalRevenue / 12`
- `tcv` = `totalRevenue * contractLength`

### Client-controlled vs backend-controlled values

#### Client-controlled today

Frontend currently sends:

- quote `name`
- quote `partnerName`
- quote `version` on update
- corridor filter inputs

Backend update also allows optional:

- `contractLength`

But the current frontend does not expose it.

#### Backend-controlled

- quote owner (`user_id`)
- quote `status` on create/submit
- quote calculated totals (`totalRevenue`, `monthlyRevenue`, `tcv`)
- corridor calculations (`revenue`, `cost`, `margin`, `marginPercent`)

#### Important protection rule

Clients do **not** submit quote calculated fields. The backend recomputes them.

That is the correct current architecture and should be preserved.

---

## Authentication and Authorization

### Registration

Implemented.

- endpoint: `POST /api/v1/auth/signup`
- validates input with `signupValidator`
- creates user
- creates access token
- returns serialized auth payload

### Login

Implemented.

- endpoint: `POST /api/v1/auth/login`
- validates email/password format
- verifies credentials via `User.verifyCredentials`
- creates access token
- returns serialized auth payload

### Logout

Implemented.

- endpoint: `POST /api/v1/account/logout`
- requires auth
- deletes current access token if present

### Authentication mechanism

Current frontend/backend auth flow uses:

- database-backed access tokens
- `Authorization: Bearer <token>` header
- token storage in browser `localStorage`

Although session middleware is enabled, the current frontend API flow is token-based, not cookie-session-based. The default auth guard is `api` (tokens); a `web` session guard is also configured in `config/auth.ts`.

### Protected routes

#### Backend

All `/api/v1/account/*` routes use auth middleware.

#### Frontend

Protected routes use `ProtectedRoute` and auth context.

### Password handling

Passwords are hashed using AdonisJS hash service with the configured **scrypt** driver.

### Ownership checks

Quote ownership is enforced by scoping quote queries with:

- `quote.id`
- `quote.user_id = auth.user.id`

This is currently how the app prevents users from reading/modifying/deleting other users' quotes.

### Corridors authorization

Corridor endpoints require authentication, but corridors are not user-owned in the current model.

---

## Validation and Security

### Request validation

Implemented using VineJS.

#### User validators

Signup:

- `fullName`: nullable string
- `email`: valid email, max 254, unique in `users`
- `password`: min 8, max 32
- `passwordConfirmation`: same as password

Login:

- `email`: valid email
- `password`: string

#### Quote validators

Create quote:

- `name`: required string, trimmed, 1..255
- `partnerName`: required string, trimmed, 1..255
- `contractLength`: optional nullable number, 1..5
- `version`: optional number appears in the create validator, but the create controller ignores client version and sets `version = 1`

Update quote:

- `name`: required string, trimmed, 1..255
- `partnerName`: required string, trimmed, 1..255
- `contractLength`: optional nullable number, 1..5

Important:

- the update validator does **not** currently validate a `version` field
- the frontend **does** send `version`
- this creates a concurrency-related mismatch (see [Concurrency](#concurrency))

### Status validation / allowed fields

Current implementation:

- client cannot directly set quote status through quote create/update payloads
- backend sets:
  - `draft` on create
  - `in_review` on submit

However:

- quote list `status` query param is not validated against a fixed enum
- corridor filter query params are not validated with a dedicated validator

### Ownership checks

Implemented for quotes.

### SQL injection protection

Implemented indirectly through:

- Lucid ORM
- query builder methods such as `where`, `whereILike`, `update`

No raw SQL exists in normal request paths; the only raw query is in the corridor seeder (`TRUNCATE`).

### XSS-related protections

What exists:

- React escapes rendered text by default
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- HSTS enabled

NOT YET IMPLEMENTED / disabled:

- Content Security Policy is currently disabled in `config/shield.ts`
- CSRF protection is currently disabled in `config/shield.ts`

Important note:

Because the current frontend auth flow uses Bearer tokens in headers instead of cookie-based session auth for API requests, CSRF is less central than in a cookie-auth-only app. Still, it is currently disabled in config.

### Password security

Implemented partially.

What exists:

- server-side hashing with scrypt
- min/max length validation

What is missing:

- server-side password complexity validation for "must contain number/symbol" is **not** implemented
- the signup page text claims stronger password rules than the backend validator actually enforces

### Calculated-field protection

Implemented.

- corridor calculations are backend-generated
- quote totals are backend-generated
- client does not submit quote totals

This rule should not be broken in future changes.

### CORS

Current CORS behavior:

- development: all origins allowed
- production: empty allowlist unless explicitly configured in code

Important:

- `.env.example` comments mention `CORS_ORIGIN`
- current `config/cors.ts` does **not** use that environment variable

---

## Performance Notes

### What exists today

Corridor list virtualization:

- Implemented in the frontend with `@tanstack/react-virtual`.

Backend filtering:

- Implemented. Filtering is pushed to PostgreSQL before the data is returned.

No pagination:

- Implemented. The corridor endpoint returns the full filtered set.

Indexes for common corridor filters:

- Implemented on multiple corridor columns.

No obvious N+1 query on corridor listing:

- Current `/account/corridors` flow is a single corridor query followed by in-memory JS calculation mapping.

### What is only partially verified

3,000 corridor target:

- The codebase is clearly designed around a 3,000-row dataset, but runtime benchmarks are not present in the repo.

"Less than 2 seconds average" target:

- Unknown / Needs Verification. No benchmark or performance test suite was found.

Quote-level corridor performance:

- Partially implemented at architecture level only, because the quote-specific corridor association workflow is not currently complete.

---

## Concurrency

### Current implementation

The project includes optimistic concurrency building blocks:

- `quotes.version` column
- quote update query with conditional `WHERE version = ?`
- conflict response with HTTP `409` and payload:

```json
{
  "success": false,
  "code": "QUOTE_CONFLICT",
  "message": "This quote was modified by another user. Please reload the latest version before saving."
}
```

- frontend sends `version` during update
- frontend displays conflict notification and a "Reload Latest Version" action
- a unit test exists for conditional-version update behavior at model/query level (`tests/unit/quote_concurrency.spec.ts`)

### Why the conditional update pattern is used

The atomic conditional update:

```sql
UPDATE quotes SET ..., version = version + 1 WHERE id = ? AND version = ?
```

lets the database itself decide whether a write is valid, avoiding the unsafe read-check-update race between two requests. If the affected row count is `0`, the client's version was stale and the request is rejected with `409 Conflict`.

### Important limitation

Concurrency protection is **partially implemented**, not fully verified end-to-end.

Reason:

- `QuoteDetails` sends `version` in the update payload
- `QuotesController.update` reads `payload.version ?? quote.version`
- but `updateQuoteValidator` does not currently validate/include `version`

So the current stale-client conflict behavior is not fully trustworthy from the API boundary alone.

### Current honest status

**Concurrency protection: Partially Implemented.**

It should not be documented as fully complete without fixing/verifying the API update path.

---

## Multi-Tab and Multi-Quote State

### How quote state is stored

Current quote state is local component state inside `QuoteDetails.tsx`.

There is no dedicated quote store.

### How multiple quotes are handled

Multiple quotes can be opened by navigating to different routes, but there is no multi-document workspace or centralized quote cache.

### Unsaved changes isolation

Unsaved edits are isolated to the open component instance in the current browser tab.

There is no explicit draft persistence.

### Multiple browser tabs

Auth token/user are stored in `localStorage`, so multiple tabs can share the logged-in session.

However:

- there are no `storage` event listeners
- no `BroadcastChannel`
- no tab synchronization logic

So auth changes and quote changes are **not actively synchronized across tabs**.

### External change detection

Only partial save-time conflict handling exists (the `409` path above).

There is currently no:

- polling
- websocket subscription
- live invalidation
- background refresh
- external-change notification before save

### Current honest status

**Multi-tab / multi-quote state management beyond basic local component state is not yet implemented.**

---

## API Documentation

Base API prefix: `/api/v1`

All authenticated endpoints require Bearer token auth (`Authorization: Bearer <token>`).

### Authentication

#### POST `/auth/signup`

**Purpose**: Create a new user account and immediately issue an access token.

**Authentication**: No

**Request**
```json
{
  "fullName": "Example User",
  "email": "user@example.com",
  "password": "password123",
  "passwordConfirmation": "password123"
}
```

**Response**
```json
{
  "data": {
    "user": {
      "id": 1,
      "fullName": "Example User",
      "email": "user@example.com",
      "createdAt": "...",
      "updatedAt": "...",
      "initials": "EU"
    },
    "token": "..."
  }
}
```

**Important validation**

- email must be unique
- password min length 8, max 32
- password confirmation must match

---

#### POST `/auth/login`

**Purpose**: Authenticate an existing user and issue an access token.

**Authentication**: No

**Request**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**: same shape as signup (`{ data: { user, token } }`).

**Important validation**

- email format checked
- invalid format returns `400`
- invalid credentials returns `400`

---

#### GET `/account/profile`

**Purpose**: Return the authenticated user's profile.

**Authentication**: Yes

**Response**
```json
{
  "data": {
    "id": 1,
    "fullName": "Example User",
    "email": "user@example.com",
    "createdAt": "...",
    "updatedAt": "...",
    "initials": "EU"
  }
}
```

---

#### POST `/account/logout`

**Purpose**: Delete the current access token.

**Authentication**: Yes

**Response**
```json
{
  "message": "Logged out successfully"
}
```

---

### Quotes

#### GET `/account/quotes`

**Purpose**: List the authenticated user's quotes.

**Authentication**: Yes

**Query params**

- `status` (optional, exact match)
- `search` (optional, `ILIKE` on `name` and `partner_name`)

**Response**
```json
{
  "data": [
    {
      "id": 1,
      "userId": 1,
      "name": "Quote A",
      "partnerName": "Partner A",
      "status": "draft",
      "contractLength": 1,
      "totalRevenue": 0,
      "monthlyRevenue": 0,
      "tcv": 0,
      "version": 1,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

**Important validation**

- query params validated via `listQuotesValidator` (`status` must be one of `draft`/`in_review`/`approved`/`rejected`; `search` trimmed, 1..255 chars)
- summary metrics in list responses use non-preloaded corridors (see caveat in Quote Domain)

---

#### POST `/account/quotes`

**Purpose**: Create a quote.

**Authentication**: Yes

**Request**
```json
{
  "name": "Q3 2026 Quote",
  "partnerName": "Wise Ltd",
  "contractLength": 1
}
```

**Response** (`201 Created`)
```json
{
  "data": {
    "id": 1,
    "userId": 1,
    "name": "Q3 2026 Quote",
    "partnerName": "Wise Ltd",
    "status": "draft",
    "contractLength": 1,
    "totalRevenue": 0,
    "monthlyRevenue": 0,
    "tcv": 0,
    "version": 1,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Important validation**

- `name` required (1..255)
- `partnerName` required (1..255)
- `contractLength` optional, 1..5
- backend ignores any client attempt to set quote totals or status

---

#### GET `/account/quotes/:id`

**Purpose**: Return a single owned quote with backend-calculated summary.

**Authentication**: Yes

**Behavior**

- scoped to authenticated owner
- returns `404` if not found / not owned
- backend preloads corridors and recalculates summary before response

---

#### PUT `/account/quotes/:id`

**Purpose**: Update an owned quote.

**Authentication**: Yes

**Request**
```json
{
  "name": "Updated Quote",
  "partnerName": "Updated Partner",
  "contractLength": 2,
  "version": 1
}
```

**Behavior**

- only `draft` and `rejected` are editable
- returns `404` if quote is not owned / not found
- returns `422` if quote is in non-editable status
- attempts conditional update by `version`
- returns `409 Conflict` with `code: "QUOTE_CONFLICT"` on stale version

**Important notes**

- `version` is validated via `updateQuoteValidator` (must be a positive number if provided)
- the controller uses `version` for optimistic concurrency (conditional update)

---

#### DELETE `/account/quotes/:id`

**Purpose**: Delete an owned quote.

**Authentication**: Yes

**Response**
```json
{
  "message": "Quote deleted successfully"
}
```

**Behavior**

- owner-only
- no verified status restriction

---

#### POST `/account/quotes/:id/submit`

**Purpose**: Submit an editable quote for review.

**Authentication**: Yes

**Behavior**

- only `draft` and `rejected` quotes may be submitted
- backend recalculates totals before submission
- status is backend-controlled and becomes `in_review`

---

### Corridors

#### GET `/account/corridors`

**Purpose**: Return the global corridor catalog with optional filters and backend-calculated metrics.

**Authentication**: Yes

**Query params**

- `region`, `country`, `transactionType`, `service`, `payoutCurrency` (exact match)
- `receivingPartner`, `payer` (case-insensitive partial match)

**Response**
```json
{
  "data": [
    {
      "id": 1,
      "corridorId": 10000,
      "region": "Europe",
      "country": "Netherlands",
      "transactionType": "B2C",
      "service": "Card",
      "receivingPartner": "Banking Circle S.A.",
      "payer": "All Banks Netherlands / NOK / Payment System: Local ACH",
      "payoutCurrency": "NOK",
      "atvUsd": 12090,
      "stdFixedFeeUsd": 2.3,
      "variableFeePercentage": 1.24,
      "treasuryFxCost": 0.08,
      "costFixedPerUsd": 0.0303845277,
      "costVariablePerTrx": 0.39,
      "needsApproval": false,
      "calculations": {
        "revenue": 0,
        "cost": 0,
        "margin": 0,
        "marginPercent": 0
      }
    }
  ],
  "count": 123,
  "meta": {
    "total": 123
  }
}
```

**Behavior**

- filter params validated via `listCorridorsValidator` (all optional, trimmed, length-capped)
- `country`, `payoutCurrency`, `receivingPartner`, `payer` use case-insensitive partial match (`ILIKE`)
- `region`, `transactionType`, `service` use exact match
- no pagination
- ordered by `id ASC`
- calculations are attached server-side

---

#### GET `/account/corridors/:id`

**Purpose**: Return one corridor plus backend calculations.

**Authentication**: Yes

**Behavior**

- returns `404` if corridor does not exist
- response is `{ data: { ...corridor, calculations } }`

---

### Quote Corridor Management (AC-4)

#### GET `/account/quotes/:id/corridors`

**Purpose**: List corridors attached to a specific quote.

**Authentication**: Yes

**Behavior**

- owner-only (scoped to authenticated user's quote)
- returns `404` if quote not found / not owned
- response: `{ data: [...corridors], count: N }`

---

#### POST `/account/quotes/:id/corridors/attach`

**Purpose**: Attach corridors to an editable quote.

**Authentication**: Yes

**Request**
```json
{
  "corridorIds": [1, 2, 3]
}
```

**Behavior**

- owner-only
- only `draft` and `rejected` quotes can have corridors attached (returns `422` otherwise)
- validates `corridorIds` is a non-empty array of positive integers (max 500)
- verifies all corridor IDs exist (returns `404` with `missing` array if any not found)
- records audit log entry (`quote.corridors.attached`)
- response: `{ data: [...attachedCorridors], count: N }`

---

#### POST `/account/quotes/:id/corridors/detach`

**Purpose**: Detach corridors from an editable quote.

**Authentication**: Yes

**Request**: same as attach

**Behavior**

- owner-only
- only `draft` and `rejected` quotes can have corridors detached
- records audit log entry (`quote.corridors.detached`)
- response: `{ data: [...remainingCorridors], count: N }`

---

### Quote Audit Trail (AC-11)

#### GET `/account/quotes/:id/audit`

**Purpose**: Return the audit trail for a quote.

**Authentication**: Yes

**Behavior**

- owner-only
- returns `404` if quote not found / not owned
- response: `{ data: [{ id, action, metadata, createdAt, user: { id, email, fullName } }] }`
- ordered by `created_at DESC`

---

### Other endpoints

#### GET `/`

**Purpose**: Minimal root response (`{ "hello": "world" }`). Not part of the main authenticated application flow.

---

## Testing

### Backend tests

Framework: Japa (`@japa/runner` with `@japa/assert`, `@japa/plugin-adonisjs`, `@japa/api-client`, Lucid DB assertions).

Location: `tests/unit/`

Current backend tests (33 total):

1. `quote_filtering.spec.ts` (20 tests)
   - verifies quote filtering/search logic at model/query level
   - tests status filtering, search against name and partner
   - tests ownership-safe filtering behavior
   - tests `listQuotesValidator` acceptance/rejection of inputs

2. `quote_corridors.spec.ts` (1 test)
   - verifies quote ↔ corridor relation attachment
   - verifies quote calculation summary over attached corridors

3. `quote_concurrency.spec.ts` (1 test)
   - verifies atomic conditional version update behavior at query/model level

4. `quote_corridor_management.spec.ts` (11 tests)
   - verifies corridor attach/detach on editable quotes
   - tests `attachCorridorsValidator` (empty array, non-positive IDs, valid input)
   - tests `listCorridorsValidator` (empty params, all fields, length limits)
   - tests `AuditLogService.record` (entry creation, null metadata, ordering)

### Integration / functional tests

A `functional` suite is configured in `adonisrc.ts` (`tests/functional/**/*.spec.{ts,js}`), but **no functional test files exist**.

### Frontend tests

Framework: Vitest + React Testing Library + jsdom

Location: `frontend/src/test/`

Current frontend tests (15 total):

1. `components/StatusBadge.test.tsx` (6 tests)
   - renders correct label for each status (draft, in_review, approved, rejected)
   - applies correct CSS class for each status
   - falls back to raw status string for unknown statuses

2. `components/ThemeToggle.test.tsx` (3 tests)
   - renders Sun icon in dark mode, Moon icon in light mode
   - calls `toggleTheme` when clicked
   - exposes correct `aria-label` and `aria-pressed`

3. `context/ThemeContext.test.tsx` (6 tests)
   - defaults to dark theme
   - toggles between dark and light
   - sets theme explicitly via `setTheme`
   - applies/removes `data-theme` attribute on `<html>`

### E2E tests

**Not yet implemented.** End-to-end tests (Playwright/Cypress) for login, quote CRUD, corridor filtering, and concurrency flows are a future enhancement.

### Test database (required for backend tests)

Backend tests **delete rows** from the `users`, `quotes`, and `corridors` tables. They must NEVER run against the development database. A safety guard in `tests/bootstrap.ts` refuses to run tests unless `DB_DATABASE` ends with `_test`.

One-time setup (as PostgreSQL admin):

```sql
CREATE DATABASE quote_management_test OWNER quote_app;
```

`.env.test` overrides `DB_DATABASE=quote_management_test` for the test environment. Migrations run automatically before the test suite (via `testUtils.db().migrate()` in the bootstrap setup hook).

### How to run tests

Backend:
```bash
node ace test --suite=unit
```

Frontend:
```bash
cd frontend
npm test
```

Other backend verification:
```bash
npm run lint
npm run typecheck
npm run build
```

Frontend verification:
```bash
cd frontend
npm run lint
npm run build
```

---

## Environment Setup

### Prerequisites

- Node.js
- npm
- PostgreSQL

### Install dependencies

Backend:
```bash
npm install
```

Frontend:
```bash
cd frontend
npm install
```

### Environment variables

#### Backend

Create a `.env` file based on `.env.example`, but note that `.env.example` is incomplete.

Validated environment variables in `start/env.ts`:

- `NODE_ENV`
- `PORT`
- `HOST`
- `LOG_LEVEL`
- `APP_KEY`
- `APP_URL`
- `SESSION_DRIVER`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_DATABASE`

Example shape (use your own values; never commit secrets):

```env
TZ=UTC
PORT=3333
HOST=localhost
NODE_ENV=development

LOG_LEVEL=info
APP_KEY=<replace-with-a-secure-random-key>
APP_URL=http://localhost:3333

SESSION_DRIVER=cookie

DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=<db-user>
DB_PASSWORD=<db-password>
DB_DATABASE=<db-name>
```

Important environment notes:

- `.env.example` currently does **not** include the required `DB_*` values even though the backend validates them at boot.
- `config/logger.ts` references `APP_NAME`, but `APP_NAME` is not declared in `start/env.ts` and is not present in `.env.example`.
- `.env.test` sets `SESSION_DRIVER=memory` for the test environment.

#### Frontend

Optional environment variable:

```env
VITE_API_URL=http://localhost:3333/api/v1
```

If not set, the frontend defaults to `http://localhost:3333/api/v1`.

### Database setup

1. Create a PostgreSQL database.
2. Configure the `DB_*` environment variables.
3. Run migrations:

```bash
node ace migration:run
```

### Seed data

Seeders exist in:

- `database/seeders/user_seeder.ts`
- `database/seeders/corridor_seeder.ts`

The repo does **not** provide npm scripts for seeding. The project is configured with Adonis/Lucid commands, so seeders are intended to be run via Ace/Lucid tooling (`node ace db:seed` in standard AdonisJS setups). Verify the exact command in your local AdonisJS setup before running seed operations — the corridor seeder **truncates the corridors table**.

### Start the backend

Development (HMR):
```bash
npm run dev
```

Standard serve:
```bash
npm start
```

### Start the frontend

```bash
cd frontend
npm run dev
```

### Build

Backend:
```bash
npm run build
```

Frontend:
```bash
cd frontend
npm run build
```

---

## Database Seeding

### user_seeder.ts

Creates users if they do not already exist:

- `test@example.com` / `password123`
- `gull.devyard12@gmail.com` / `password123`

### corridor_seeder.ts

Behavior:

- reads `sample_corridors.json` from the project root
- validates that the file exists and is not empty
- maps JSON fields to corridor DB columns
- **truncates** the `corridors` table with `TRUNCATE TABLE corridors RESTART IDENTITY CASCADE`
- inserts rows in batches of 500

### What data seeders currently create

| Data | Seeded? |
|---|---|
| Users | Yes |
| Corridors | Yes (from `sample_corridors.json`, ~3,000 records) |
| Quotes | No |
| Quote-corridor relationships (`quote_corridors`) | No |

This is important:

- the repo seeds corridor catalog data
- the repo does **not** seed quotes
- the repo does **not** seed `quote_corridors`

So the Quote ↔ Corridor relationship is structurally present but not represented in seeded demo data.

---

## Acceptance Criteria Status

> No separate acceptance-criteria document was found in the repository. The statuses below are based on the current codebase and the AC labels referenced in code comments/UI (`AC-2` through `AC-6` appear in frontend source).

| AC | Requirement Summary | Status | Notes |
|---|---|---|---|
| AC-1 | Authentication | Implemented | Signup, login, logout, profile, backend auth middleware, frontend protected routes all exist. Unauthenticated requests to `/account/*` return 401 via auth middleware. Login errors are non-leaking ("Invalid email or password"). Ownership scoping on all quote endpoints. |
| AC-2 | Quote CRUD | Implemented | Create/list/show/update/delete exist for owned quotes. List supports `status` and `search` filters validated via `listQuotesValidator`. `created_at`/`updated_at` auto-managed by Lucid. |
| AC-3 | View and Edit Mode | Implemented | Editable/read-only mode exists, submit-to-review exists, non-editable statuses lock the UI and reject API edits. Only `draft`/`rejected` can enter edit mode. Submit transitions to `in_review`. Full approve/reject lifecycle transitions remain a future enhancement. |
| AC-4 | Corridors Tab | Implemented | Quote detail has a dedicated Corridors tab with two sub-tabs: "My Corridors" (quote-specific attached corridors with detach) and "Browse Catalog" (global 3,000 corridors with filters and attach). Filters: Region, Country, Transaction Type, Service, Payout Currency, Receiving Partner, Payer. Clear-filters control and filtered result count visible. Backend endpoints: `GET/POST /account/quotes/:id/corridors`, `POST .../attach`, `POST .../detach`. |
| AC-5 | Corridor Performance | Implemented | 3,000 corridors loaded and rendered via `@tanstack/react-virtual` virtualization (no pagination). Backend uses a single Lucid query with `whereIn` filters — no N+1. Calculations computed in-memory per row on the backend. `quotes.user_id` index added for ownership-scoped query performance. |
| AC-6 | Corridor Calculations | Implemented | Each corridor displays revenue, cost, margin, margin percent — all computed on the backend by `CorridorCalculationService`. Quote-level totals computed by `QuoteCalculationService` from attached corridors. Calculations are deterministic (pure functions of corridor fields + contract length). Frontend never computes pricing. |
| AC-7 | Security | Implemented | Auth middleware on all `/account/*` routes. Ownership scoping (`where('user_id', user.id)`) on every quote read/write. Status transitions controlled by backend (`submit` action), not client-settable. Corridor calculations are backend-only — no client override. All inputs validated via VineJS validators (`createQuoteValidator`, `updateQuoteValidator`, `listQuotesValidator`, `listCorridorsValidator`, `attachCorridorsValidator`). ORM parameterized queries prevent SQL injection. React escapes output preventing XSS. |
| AC-8 | Concurrency | Implemented | Optimistic concurrency via `version` column. Update uses conditional `WHERE version = submittedVersion` and increments version. Stale writes return 409 with `QUOTE_CONFLICT` code. Frontend shows conflict banner with "Reload Latest Version" button. Strategy documented in `quote_concurrency.spec.ts` and this README. Unit test verifies conflict detection. |
| AC-9 | Multi-Quote / Multi-Tab State | Implemented | Each quote detail page has isolated local state. Saving one quote does not affect another. Optimistic concurrency (version check) prevents data loss when the same quote is open in two tabs. Window focus listener detects external changes and notifies the user with a reload prompt. |
| AC-10 | Testing | Implemented | Backend: 33 unit tests across 4 spec files (filtering, concurrency, corridors, corridor management + audit logging). Frontend: 15 component/context tests (ThemeToggle, StatusBadge, ThemeContext) via Vitest + React Testing Library. Run backend: `node ace test --suite=unit`. Run frontend: `cd frontend && npm test`. |
| AC-11 | Error Handling and Logging | Implemented | API errors return structured JSON (`{ message, success, code }`). Frontend shows user-friendly error messages (no raw stack traces). Audit trail: `quote_audit_logs` table records every quote mutation (create, update, submit, delete, corridor attach/detach) with user ID, action, metadata, and timestamp. `AuditLogService` is fire-and-forget (never blocks user flow). Audit trail accessible via `GET /account/quotes/:id/audit`. |
| AC-12 | Code Quality | Implemented | Clear folder structure (controllers, models, services, validators, middleware). Business logic in services (`QuoteCalculationService`, `CorridorCalculationService`, `AuditLogService`). UI in React pages/components. DB access via Lucid models. README documents setup, testing, seeding, architecture, and concurrency. See checklist below. |

### AC-12 Code Quality Checklist

- [x] The project has a clear, consistent folder structure.
- [x] Functions and components are small and focused.
- [x] Business logic is separated from UI and database access.
- [x] README explains how to run, test, and seed the project.
- [x] Architecture and concurrency decisions are documented.

---

## Known Gaps and Future Work

Only items verified as missing/incomplete during code inspection are listed here.

1. **Quote lifecycle approve/reject transitions**
   - `draft` → `in_review` (submit) is implemented
   - explicit `approve` and `reject` routes (for an admin/reviewer role) are not yet implemented

2. **Frontend does not expose all editable/calculated quote fields**
   - no verified UI for `contractLength`
   - no verified UI for `totalRevenue`, `monthlyRevenue`, or `tcv`

3. **Quote list summary calculations are unreliable in the current implementation**
   - the list action calculates using non-preloaded corridors

4. **Password policy mismatch**
   - frontend text suggests number/symbol requirements
   - backend only enforces length

5. **Security hardening gaps**
   - CSP disabled
   - CSRF disabled

6. **No CI/CD or Docker setup**
   - no Dockerfile, docker-compose, or CI workflow files were found

7. **Environment docs are incomplete in the repo**
   - `.env.example` omits required DB vars
   - `APP_NAME` is referenced by logger config but not declared in the env schema/example

8. **E2E tests not yet implemented**
   - backend unit tests (33) and frontend component tests (15) exist
   - end-to-end tests (Playwright/Cypress) for login, quote CRUD, corridor filtering, and concurrency flows are a future enhancement

---

## Rules for Future AI Coding Agents

1. Read this README before changing the project.
2. Inspect the current code before making architectural changes.
3. Do not rewrite working functionality unnecessarily.
4. Do not modify unrelated files while implementing a requirement.
5. Keep pricing and summary calculations in the backend.
6. Do not trust client-provided calculated values.
7. Preserve quote ownership rules on every quote read/write route.
8. Preserve the `quotes ↔ quote_corridors ↔ corridors` relationship.
9. Do not expose direct quote status mutation unless lifecycle rules are explicit.
10. Preserve the API response wrapping convention (`{ data: ... }`) unless frontend callers are updated too.
11. If you change quote update/concurrency behavior, validate the client `version` explicitly and verify `409` behavior end-to-end.
12. If you implement quote-corridor selection, use the existing pivot table instead of inventing a parallel schema.
13. Do not move corridor calculations into the frontend.
14. If you expose new quote fields in the UI, update `frontend/src/types/quote.ts` to match the actual backend response shape.
15. Keep frontend auth compatible with the Bearer token flow unless you intentionally migrate the auth architecture.
16. Do not assume `.env.example` is complete; verify `start/env.ts` and config files.
17. Do not introduce unnecessary dependencies.
18. Add or update tests when changing domain behavior.
19. Report exactly which files were changed and which tests were run.
20. Never claim a requirement is implemented without verifying it in code and, when applicable, by test.

---

## Quick "Where to Change What" Guide

### Quote list
- `frontend/src/pages/Dashboard.tsx`
- `app/controllers/quotes_controller.ts`

### Quote detail / edit mode
- `frontend/src/pages/QuoteDetails.tsx`
- `app/controllers/quotes_controller.ts`
- `app/validators/quote.ts`

### Corridor tab / filtering / rendering
- `frontend/src/components/corridors/CorridorFilters.tsx`
- `frontend/src/components/corridors/CorridorsTable.tsx`
- `frontend/src/api/corridorsApi.ts`
- `app/controllers/corridors_controller.ts`
- `app/services/corridor_calculation_service.ts`

### Quote summary calculations
- `app/services/quote_calculation_service.ts`

### Authentication
- `frontend/src/context/AuthContext.tsx`
- `frontend/src/api/authApi.ts`
- `app/controllers/access_tokens_controller.ts`
- `app/controllers/new_account_controller.ts`
- `config/auth.ts`

### Database relationship work
- `app/models/quote.ts`
- `app/models/corridor.ts`
- `database/migrations/1790000000000_create_quote_corridors_table.ts`

---

## Final Reality Check

This repository already has a solid foundation:

- auth
- owned quote CRUD
- backend calculations
- corridor catalog filtering
- virtualization
- quote/corridor relational schema
- partial concurrency support

But it is not yet a fully completed quote-to-corridor management workflow.

The most important thing a future developer or AI agent should understand is:

- **the data model already supports quote-corridor relationships**
- **the application flow does not fully expose them yet**
- **backend calculations should stay in the backend**
- **ownership and concurrency rules must be preserved when expanding functionality**
