# Electron Integration PRD (Desktop Application)

## Overview
This document outlines the requirements and tasks to convert the Personal Stock Investment Tracker (PSIT) into a standalone desktop application using **Electron**. The goal is to provide a native-like experience on macOS without needing to run a terminal or a separate browser.

## Objectives
- Package the Next.js application into a macOS `.app` or `.dmg`.
- Ensure the SQLite database persists in a standard macOS application data directory.
- Maintain all existing functionality (Server Actions, Prisma, CSV Import/Export).
- Single-command start and build process.

---

## Technical Strategy

### 1. Architecture
- **Main Process**: Handles window creation, system menus, and lifecycle events.
- **Renderer Process**: The Next.js application.
- **Next.js Integration**: Since the app uses Server Actions and Prisma (Node.js environment), we will run a local Next.js server within the Electron main process or use a custom bridge. For personal use, running the Next.js server on a local port and pointing Electron to it is the most reliable path for compatibility with Server Actions.

### 2. Database Location
- Move the SQLite database from the project root to the user's application data directory:
  - macOS: `~/Library/Application Support/psit/dev.db`
- Use environment variables or a custom Prisma initialization to point to this path.

---

## Implementation Tasks

### Phase 1: Setup & Configuration
- [ ] **T1.1: Add Dependencies**
  - Install `electron`, `electron-builder`, and `concurrently` (to run Next.js and Electron together).
  - Install `wait-on` to ensure Electron waits for the Next.js server.
- [ ] **T1.2: Electron Entry Point**
  - Create `electron/main.js` to manage the `BrowserWindow`.
  - Configure `main.js` to load `http://localhost:3000` during development.
- [ ] **T1.3: Update `package.json`**
  - Add `main` field pointing to the electron entry point.
  - Add scripts: `electron:dev`, `electron:build`, `electron:package`.

### Phase 2: Production Readiness
- [ ] **T2.1: Production Server Handling**
  - Implement logic in `main.js` to start the Next.js production server (via `next start`) when running in packaged mode.
- [ ] **T2.2: SQLite Path Management**
  - Update `lib/prisma.ts` or use a `schema.prisma` override to ensure the database file resides in `app.getPath('userData')`.
  - Ensure migrations run automatically on app start if the database is missing or outdated.
- [ ] **T2.3: Menu & Native Features**
  - Add a basic macOS application menu (Quit, Copy/Paste, etc.).
  - Ensure window state (width/height) is preserved.

### Phase 3: Packaging (macOS)
- [ ] **T3.1: Configure Electron Builder**
  - Create `electron-builder.yml` or add configuration to `package.json`.
  - Set `appId`, `productName`, and macOS-specific settings (icon, category).
- [ ] **T3.2: Build Process**
  - Create a script to build the Next.js app (`next build`).
  - Package the built app into a `.dmg` or `.app`.

---

## Success Criteria
- [ ] The app opens as a standalone window on macOS.
- [ ] No browser address bar or tabs are visible.
- [ ] Data persists after closing and reopening the app.
- [ ] The app can be launched from the Applications folder (after manual move).

## Out of Scope
- Code signing (not needed for personal local installation).
- Auto-updates.
- Multi-platform support (Windows/Linux) - focus is macOS.
