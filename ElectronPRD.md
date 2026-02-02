# Electron Integration PRD (Desktop Application)

## Overview
This document outlines the requirements and tasks to convert the Personal Stock Investment Tracker (PSIT) into a standalone desktop application using **Electron**. The goal is to provide a native-like experience on macOS without needing to run a terminal or a separate browser.

## Objectives
- Package the Next.js application into a macOS `.app` or `.dmg`.
- Ensure the Supabase database connection persists and works correctly.
- Maintain all existing functionality (Server Actions, Supabase integration, JSON Import/Export).
- Single-command start and build process.

---

## Technical Strategy

### 1. Architecture
- **Main Process**: Handles window creation, system menus, and lifecycle events.
- **Renderer Process**: The Next.js application.
- **Next.js Integration**: Since the app uses Server Actions and Supabase (Node.js environment), we will run a local Next.js server within the Electron main process. For personal use, running the Next.js server on a local port and pointing Electron to it is the most reliable path for compatibility with Server Actions.

### 2. Database Connection
- The application connects to Supabase PostgreSQL database via environment variables.
- No local database file needed (cloud-based).
- Environment variables must be bundled or configured for production builds.

---

## Implementation Tasks

### Phase 1: Setup & Configuration
- [x] **T1.1: Add Dependencies**
  - Install `electron`, `electron-builder`, and `concurrently` (to run Next.js and Electron together).
  - Install `wait-on` to ensure Electron waits for the Next.js server.
- [x] **T1.2: Electron Entry Point**
  - Create `electron/main.js` to manage the `BrowserWindow`.
  - Configure `main.js` to load `http://localhost:3000` during development.
- [x] **T1.3: Update `package.json`**
  - Add `main` field pointing to the electron entry point.
  - Add scripts: `electron:dev`, `electron:build`, `electron:package`.

### Phase 2: Production Readiness
- [x] **T2.1: Production Server Handling**
  - Implement logic in `main.js` to start the Next.js production server (via `next start`) when running in packaged mode.
- [x] **T2.2: Database Configuration**
  - Ensure Supabase environment variables are available in production builds.
  - No local database migrations needed (using cloud Supabase).
- [x] **T2.3: Menu & Native Features**
  - Add a basic macOS application menu (Quit, Copy/Paste, etc.).
  - Ensure window state (width/height) is preserved.

### Phase 3: Packaging (macOS)
- [x] **T3.1: Configure Electron Builder**
  - Add configuration to `package.json`.
  - Set `appId`, `productName`, and macOS-specific settings (icon, category).
- [x] **T3.2: Build Process**
  - Create a script to build the Next.js app (`next build`).
  - Package the built app into a `.dmg` or `.app`.

---

## Success Criteria
- [x] The app opens as a standalone window on macOS.
- [x] No browser address bar or tabs are visible.
- [x] Data persists after closing and reopening the app (via Supabase).
- [x] The app can be launched from the Applications folder (after manual move).

## Out of Scope
- Code signing (not needed for personal local installation).
- Auto-updates.
- Multi-platform support (Windows/Linux) - focus is macOS.
- Offline mode (requires internet connection for Supabase).

## Migration Notes
- **Previous Version**: Used SQLite with Prisma ORM (local database).
- **Current Version**: Uses Supabase PostgreSQL (cloud database).
- **Benefits**: Data accessible from any device, no local database file management, automatic backups.
