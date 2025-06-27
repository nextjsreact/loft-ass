# Technical Context

This document outlines the technologies, architecture, and development environment for the Loft Management System.

## Core Technologies

*   **Framework**: Next.js (v15.4.0-canary.91)
*   **Language**: TypeScript
*   **Database**: PostgreSQL (via Neon serverless)
*   **Styling**: Tailwind CSS
*   **UI Components**: Shadcn UI

## Project Structure

*   **`app/`**: Contains the core application logic, including pages, API routes, and actions.
*   **`components/`**: Reusable UI components.
*   **`lib/`**: Shared libraries and utilities, including database connection and configuration.
*   **`scripts/`**: Database migration and seeding scripts.
*   **`memory-bank/`**: Project documentation and context files.

## Module System

*   The project is configured as an **ES Module** (`"type": "module"` in `package.json`).
*   This has caused conflicts with CommonJS `require` statements and `.js` files generated from `.ts` files.
*   **Key Challenge**: The development server (`next dev`) is sensitive to duplicate files (e.g., `route.ts` and `route.js`). Compiled JavaScript files should not coexist with their TypeScript source in the `app` or `pages` directories.

## Development Environment

*   **Node.js**: v20.19.0
*   **Package Manager**: npm (with `package-lock.json`)
*   **Path Aliases**: The `tsconfig.json` is configured to use the `@/*` alias for the project root (`./*`).
