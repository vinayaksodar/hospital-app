# GEMINI.md

## Project Overview

This is a multi-tenant hospital management application built with Next.js. It provides a platform for hospitals to manage doctors, patients, appointments, and medical records.

**Key Technologies:**

- **Framework:** Next.js
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** Auth.js
- **Styling:** Tailwind CSS with shadcn/ui components
- **Schema Validation:** Zod

**Architecture:**

The application follows a standard Next.js project structure.

- `src/app/api`: Contains the API routes for handling data fetching and mutations.
- `src/lib/db`: Manages the database connection, schema, and seeding.
- `src/lib/auth`: Configures NextAuth.js for authentication.
- `src/components`: Reusable React components.
- `src/app/gadadhospital` and `src/app/admin`: Role-based routing and layouts for gadadhospital and administrators.

## Building and Running

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Run the development server:**

    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:3000`.

3.  **Build for production:**

    ```bash
    npm run build
    ```

4.  **Run in production mode:**
    ```bash
    npm run start
    ```

**Database:**

- **Generate migrations:**
  ```bash
  npm run migration:generate
  ```
- **Apply migrations:**
  ```bash
  npm run migration:migrate
  ```
- **Seed the database:**
  ```bash
  npm run drizzle:seed
  ```

## Development Conventions

- **Coding Style:** The project uses the standard Next.js coding style and ESLint for linting.
- **Testing:** TODO: Add information about testing practices.
- **Commits:** TODO: Add information about commit message conventions.
