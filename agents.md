# AGENTS.md

## Purpose
Agents support the multi-tenant hospital management platform by maintaining docs, code, and workflows tailored to hospitals, doctors, patients, appointments, and medical records.

## Stack Context
- Next.js application layer
- PostgreSQL via Drizzle ORM
- Auth.js for authentication
- Tailwind CSS with shadcn/ui for UI
- Zod for schema validation

## Key Project Areas
- `src/app/api`: API routes for data reads/writes
- `src/lib/db`: DB connection, schema, seeding scripts
- `src/lib/auth`: NextAuth configuration
- `src/components`: Shared UI components
- `src/app/gadadhospital`, `src/app/admin`: Role-specific layouts and routing

## Common Workflows
### Local Development
1. `npm install`
2. `npm run dev` (served on http://localhost:3000)
3. `npm run build` for production bundle
4. `npm run start` to serve the production build

### Database Lifecycle
- Generate migrations: `npm run migration:generate`
- Apply migrations: `npm run migration:migrate`
- Seed data: `npm run drizzle:seed`

## Collaboration Guidelines
- Follow standard Next.js style and ESLint rules
- Document testing practices as they mature (see GEMINI.md TODO)
- Establish commit message conventions (see GEMINI.md TODO)
- Keep notes for tenant-specific behavior in their route folders
- Reference this file when onboarding new agents or automating workflows
