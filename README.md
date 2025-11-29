# Collab

A Saudi-focused influencer marketing platform connecting brands with micro-influencers.

## Features

- **Localized Identity**: Arabic-first design, Saudi cultural elements.
- **GCAM Compliance**: Dedicated fields for "Mawthooq" license verification.
- **Brand Dashboard**: Campaign creation, management, and reporting.
- **Creator Dashboard**: Profile management, license upload, and campaign discovery.
- **Admin Dashboard**: License approval workflow.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS Modules (No Tailwind)
- **Database**: SQLite (Dev) / PostgreSQL (Prod) via Prisma
- **Auth**: NextAuth.js

## Getting Started

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Initialize the database:
    ```bash
    npx prisma migrate dev --name init
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000)

## Project Structure

- `src/app`: App Router pages and layouts.
- `src/components`: Reusable UI components.
- `src/styles`: Global styles and CSS variables.
- `prisma`: Database schema and migrations.
