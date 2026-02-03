# Next.js to React.js Migration Plan

## Overview

This document outlines the comprehensive plan to migrate the Personal Stock Investment Tracker from Next.js 16 to a simple React.js application using Vite as the build tool. This migration removes the Next.js server dependency, making the application truly client-side only and simplifying the Electron integration.

## Current Architecture Analysis

### Next.js Features Currently Used:
1. **App Router** (`app/` directory structure)
2. **Server Actions** (`'use server'` directives in action files)
3. **Server Components** (async page components)
4. **Next.js Link** (`next/link`)
5. **Next.js Font** (`next/font/google`)
6. **Next.js Image** (not currently used but available)
7. **Next.js Metadata API**
8. **Server-side Supabase** (with cookie-based auth)
9. **Middleware** (`lib/supabase/middleware.ts`)
10. **useActionState** hook (React 19 feature, needs polyfill/shim)
11. **useFormStatus** hook (React 19 feature, needs polyfill/shim)
12. **Tailwind CSS v4** with Next.js integration

## Migration Steps

### Phase 1: Project Structure & Configuration

#### 1.1 Update package.json
**Files to modify:** `package.json`

**Changes:**
- Remove Next.js dependencies (`next`, `eslint-config-next`)
- Add Vite and related dependencies:
  - `vite` (build tool)
  - `@vitejs/plugin-react` (React plugin for Vite)
  - `react-router-dom` (routing)
  - `vite-plugin-electron` (Electron integration)
- Update scripts:
  - Replace `next dev` with `vite`
  - Replace `next build` with `vite build`
  - Update Electron scripts to work with Vite dev server

#### 1.2 Create Vite Configuration
**New file:** `vite.config.ts`

**Requirements:**
- Configure React plugin
- Set up path aliases (`@/*` -> `./*`)
- Configure Electron plugin for development
- Set up build output directory
- Configure environment variable handling

#### 1.3 Update TypeScript Configuration
**Files to modify:** `tsconfig.json`

**Changes:**
- Remove Next.js plugin reference
- Update module resolution for Vite
- Keep path aliases for `@/*`
- Remove Next.js-specific types

#### 1.4 Create HTML Entry Point
**New file:** `index.html`

**Requirements:**
- Standard HTML5 structure
- Root div for React mounting
- Script tag pointing to Vite entry
- Meta tags (replace Next.js metadata)
- Google Fonts link (replace next/font)

#### 1.5 Update .gitignore
**Files to modify:** `.gitignore`

**Changes:**
- Remove `.next/` references
- Add `dist/` (Vite build output)
- Add `.vite/`

### Phase 2: Core Application Structure

#### 2.1 Create React Entry Point
**New file:** `src/main.tsx`

**Requirements:**
- Import React and ReactDOM
- Import BrowserRouter from react-router-dom
- Import global styles
- Mount App component to root element
- Set up StrictMode

#### 2.2 Create App Router Component
**New file:** `src/App.tsx`

**Requirements:**
- Set up Routes using react-router-dom
- Define all routes:
  - `/` -> Dashboard
  - `/wallet` -> Wallet
  - `/transactions` -> Transactions
  - `/stocks` -> Stocks
  - `/reports` -> Reports
  - `/settings` -> Settings
- Wrap with Layout component

#### 2.3 Create Layout Component
**New file:** `src/components/Layout.tsx`

**Requirements:**
- Combine Header and Sidebar
- Use Outlet from react-router-dom for page content
- Apply global styles and structure
- Replace `layout.tsx` functionality

#### 2.4 Migrate Global Styles
**Files to modify:** `src/globals.css` (move from `app/`)

**Changes:**
- Keep Tailwind imports
- Add Google Fonts import (Inter font)
- Remove Next.js-specific CSS variables if any

### Phase 3: Data Layer Migration

#### 3.1 Create Unified Supabase Client
**New file:** `src/lib/supabase/client.ts`

**Requirements:**
- Create a simple Supabase client using `@supabase/supabase-js`
- Remove server-side cookie handling
- Use environment variables directly
- Export singleton client instance

**Delete:** 
- `lib/supabase/server.ts` (no longer needed)
- `lib/supabase/middleware.ts` (no longer needed)
- `lib/supabase/client.ts` (old version)

#### 3.2 Convert Server Actions to Service Functions
**Directory:** `src/services/`

**New files to create:**

1. **`src/services/wallet.ts`**
   - Convert from `app/actions/wallet.ts`
   - Remove `'use server'` directive
   - Remove `revalidatePath` calls
   - Convert async functions to regular async functions
   - Return data directly instead of using FormData
   - Use direct Supabase client calls

2. **`src/services/stocks.ts`**
   - Convert from `app/actions/stocks.ts`
   - Same conversion pattern as wallet.ts

3. **`src/services/transactions.ts`**
   - Convert from `app/actions/transactions.ts`
   - Same conversion pattern

4. **`src/services/portfolio.ts`**
   - Convert from `app/actions/portfolio.ts`
   - Same conversion pattern

5. **`src/services/data.ts`**
   - Convert from `app/actions/data.ts`
   - Same conversion pattern

**Key changes for all service files:**
- Remove server-side validation with Zod (move to client-side or keep for safety)
- Remove FormData handling - accept regular parameters
- Remove `revalidatePath` - not needed in client-side app
- Export functions as regular async functions
- Add error handling with try/catch

#### 3.3 Create Custom Hooks for Data Fetching
**Directory:** `src/hooks/`

**New files:**

1. **`src/hooks/useWallet.ts`**
   - Hook for wallet data and operations
   - useState for deposits and balance
   - useEffect for initial fetch
   - Functions for add/delete operations

2. **`src/hooks/useStocks.ts`**
   - Hook for stocks data
   - Fetch and manage stock list
   - Price update functionality

3. **`src/hooks/useTransactions.ts`**
   - Hook for buy/sell/dividend transactions
   - Separate state for each transaction type
   - CRUD operations

4. **`src/hooks/usePortfolio.ts`**
   - Hook for portfolio metrics
   - Real-time calculations

5. **`src/hooks/useDataExport.ts`**
   - Hook for import/export functionality

### Phase 4: Component Migration

#### 4.1 Update Navigation Components
**Files to modify:**

1. **`src/components/Sidebar.tsx`** (move from `app/components/`)
   - Replace `next/link` with `react-router-dom`'s `Link`
   - Replace `usePathname` with `useLocation`
   - Update active state logic

2. **`src/components/Header.tsx`** (move from `app/components/`)
   - No major changes needed (already client component)
   - Keep as-is

#### 4.2 Create React 19 Hooks Polyfills/Shims
**New file:** `src/hooks/useActionState.ts`

**Requirements:**
- Shim for React 19's `useActionState`
- Accept action function and initial state
- Return state and dispatch function
- Handle pending state
- Integrate with toast notifications

**New file:** `src/hooks/useFormStatus.ts`

**Requirements:**
- Shim for React 19's `useFormStatus`
- Track form submission state
- Return pending boolean

#### 4.3 Update Form Components
**Files to modify:**

1. **`src/components/wallet/DepositForm.tsx`**
   - Replace `useActionState` with custom hook or useState
   - Replace form action with onSubmit handler
   - Call wallet service directly
   - Add loading state
   - Show toast on success/error

2. **`src/components/wallet/DeleteDepositButton.tsx`**
   - Same pattern as DepositForm
   - Use onClick handler instead of form action

3. **`src/components/stocks/StockForm.tsx`**
   - Same conversion pattern
   - Call stocks service

4. **`src/components/stocks/UpdatePriceForm.tsx`**
   - Same conversion pattern
   - Call stocks service

5. **`src/components/transactions/BuyForm.tsx`**
   - Same conversion pattern
   - Call transactions service
   - Keep local state for calculations

6. **`src/components/transactions/SellForm.tsx`**
   - Same conversion pattern
   - Call transactions service

7. **`src/components/transactions/DividendForm.tsx`**
   - Same conversion pattern
   - Call transactions service

8. **`src/components/FormButton.tsx`**
   - Replace `useFormStatus` with custom hook or props
   - Accept `isPending` prop from parent

#### 4.4 Update Page Components
**Files to modify:**

**Pattern for all pages:**
- Convert from async server components to regular React components
- Use useEffect for data fetching on mount
- Use useState for data storage
- Use custom hooks for data operations
- Remove `export const dynamic = 'force-dynamic'`

1. **`src/pages/Dashboard.tsx`** (from `app/page.tsx`)
   - Use `usePortfolio` hook
   - Use `useWallet` hook
   - Fetch data in useEffect
   - Display loading state
   - Render DashboardSummary and HoldingsTable

2. **`src/pages/Wallet.tsx`** (from `app/wallet/page.tsx`)
   - Use `useWallet` hook
   - Display balance and deposits
   - Include DepositForm component

3. **`src/pages/Stocks.tsx`** (from `app/stocks/page.tsx`)
   - Use `useStocks` hook
   - Display stocks table
   - Include StockForm and UpdatePriceForm

4. **`src/pages/Transactions.tsx`** (from `app/transactions/page.tsx`)
   - Use `useTransactions` hook
   - Use `usePortfolio` hook for holdings
   - Use `useWallet` hook for balance
   - Handle tab switching with state
   - Include BuyForm, SellForm, DividendForm
   - Display transaction tables

5. **`src/pages/Reports.tsx`** (from `app/reports/page.tsx`)
   - Use `useWallet` hook
   - Use `useTransactions` hook
   - Handle tab switching
   - Display history tables

6. **`src/pages/Settings.tsx`** (from `app/settings/page.tsx`)
   - Use `useDataExport` hook
   - Keep existing functionality
   - Update import/export functions

### Phase 5: Electron Integration Updates

#### 5.1 Update Electron Main Process
**Files to modify:** `electron/main.js`

**Major changes:**
- Remove Next.js server startup logic
- Remove `startNextServer()` function
- Load Vite dev server URL in development (`http://localhost:5173`)
- Load built index.html in production
- Simplify window creation
- Remove waitForServer logic for Next.js

#### 5.2 Update Electron Build Configuration
**Files to modify:** `package.json` build section

**Changes:**
- Update files array to include Vite build output
- Remove `.next/` references
- Add `dist/` (Vite output)
- Update electron-builder config

#### 5.3 Create Production Build Setup
**New file:** `electron/preload.js` (optional, for secure IPC)

**Requirements:**
- Expose safe APIs to renderer if needed
- Keep contextIsolation: true

### Phase 6: Environment & Configuration

#### 6.1 Update Environment Variables
**Files to modify:** `.env` and `.env.example`

**Changes:**
- Keep Supabase variables
- Remove Next.js specific variables
- Add Vite-specific prefixes if needed (`VITE_`)

#### 6.2 Update ESLint Configuration
**Files to modify:** `eslint.config.mjs`

**Changes:**
- Remove `eslint-config-next`
- Add standard React ESLint config
- Add Vite ESLint plugin if desired

### Phase 7: Testing & Validation

#### 7.1 Test All Features
- [ ] Dashboard loads with portfolio data
- [ ] Wallet deposits add correctly
- [ ] Wallet deposits delete correctly
- [ ] Stocks add correctly
- [ ] Stock prices update correctly
- [ ] Buy transactions record correctly
- [ ] Sell transactions record correctly (with FIFO calculation)
- [ ] Dividends record correctly
- [ ] Reports show all transaction history
- [ ] Data export works
- [ ] Data import works
- [ ] Navigation works between all pages
- [ ] Electron app builds and runs

#### 7.2 Test Electron Integration
- [ ] Dev mode: `npm run electron:dev`
- [ ] Build: `npm run electron:build`
- [ ] DMG creation on macOS
- [ ] App runs without Next.js server

### Phase 8: Cleanup

#### 8.1 Remove Next.js Files
**Delete:**
- `next.config.ts`
- `next-env.d.ts`
- `.next/` directory (build output)
- `app/` directory (after migration)
- `lib/supabase/server.ts`
- `lib/supabase/middleware.ts`

#### 8.2 Update Documentation
**Files to modify:**
- `README.md` - Update setup instructions
- Remove Next.js references
- Add Vite development instructions

## File Structure After Migration

```
/Users/raheel/code/personal-investment-tracker/
├── electron/
│   └── main.js              # Updated Electron main process
├── public/                  # Static assets
├── src/
│   ├── components/
│   │   ├── Layout.tsx       # Main layout with Header + Sidebar
│   │   ├── Header.tsx       # App header
│   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   ├── FormButton.tsx   # Reusable form button
│   │   ├── wallet/
│   │   │   ├── DepositForm.tsx
│   │   │   └── DeleteDepositButton.tsx
│   │   ├── stocks/
│   │   │   ├── StockForm.tsx
│   │   │   └── UpdatePriceForm.tsx
│   │   └── transactions/
│   │       ├── BuyForm.tsx
│   │       ├── SellForm.tsx
│   │       └── DividendForm.tsx
│   ├── hooks/
│   │   ├── useWallet.ts
│   │   ├── useStocks.ts
│   │   ├── useTransactions.ts
│   │   ├── usePortfolio.ts
│   │   ├── useDataExport.ts
│   │   ├── useActionState.ts    # React 19 shim
│   │   └── useFormStatus.ts     # React 19 shim
│   ├── lib/
│   │   └── supabase/
│   │       └── client.ts    # Simplified Supabase client
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Wallet.tsx
│   │   ├── Stocks.tsx
│   │   ├── Transactions.tsx
│   │   ├── Reports.tsx
│   │   └── Settings.tsx
│   ├── services/
│   │   ├── wallet.ts        # Former server actions
│   │   ├── stocks.ts
│   │   ├── transactions.ts
│   │   ├── portfolio.ts
│   │   └── data.ts
│   ├── App.tsx              # React Router setup
│   ├── main.tsx             # React entry point
│   └── globals.css          # Global styles
├── types/
│   └── supabase.ts          # Supabase types
├── index.html               # HTML entry point
├── package.json             # Updated dependencies
├── tsconfig.json            # Updated TypeScript config
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind config (if needed)
├── eslint.config.mjs        # Updated ESLint config
├── .env                     # Environment variables
├── .env.example
├── .gitignore
└── README.md
```

## Key Technical Decisions

### 1. State Management
- Use React hooks (useState, useEffect) for local state
- Custom hooks for data fetching and operations
- No need for Redux/Zustand - app is small enough

### 2. Routing
- React Router v6 for client-side routing
- HashRouter could be considered for Electron file:// protocol support

### 3. Data Fetching
- Direct Supabase client calls from browser
- No API layer needed (Supabase handles auth/RLS)
- useEffect for initial data load
- Optimistic updates for better UX

### 4. Form Handling
- Replace useActionState with useState + onSubmit handlers
- Manual form validation (or keep Zod on client)
- Toast notifications for feedback

### 5. Build Tool
- Vite for fast development and building
- Native ESM support
- Excellent Electron integration

### 6. Electron Strategy
- Load Vite dev server in development
- Load built files in production
- No separate server process needed

## Risk Mitigation

### 1. Data Safety
- Backup database before migration testing
- Test import/export thoroughly
- Ensure data integrity during transition

### 2. Feature Parity
- All existing features must work identically
- FIFO calculation must remain accurate
- Real-time updates must work

### 3. Performance
- Monitor bundle size with Vite
- Ensure lazy loading if needed
- Check Supabase query performance

### 4. Electron Compatibility
- Test file:// protocol handling
- Ensure deep linking works
- Verify auto-updater if implemented

## Migration Timeline Estimate

- **Phase 1 (Configuration):** 1-2 hours
- **Phase 2 (Core Structure):** 2-3 hours
- **Phase 3 (Data Layer):** 3-4 hours
- **Phase 4 (Components):** 4-6 hours
- **Phase 5 (Electron):** 2-3 hours
- **Phase 6 (Config):** 1 hour
- **Phase 7 (Testing):** 2-3 hours
- **Phase 8 (Cleanup):** 1 hour

**Total estimated time:** 16-23 hours

## Post-Migration Benefits

1. **Simpler Architecture:** No server-side code, all client-side
2. **Better Electron Integration:** No server process to manage
3. **Faster Development:** Vite HMR is faster than Next.js
4. **Smaller Bundle:** No Next.js runtime overhead
5. **Easier Deployment:** Static files only
6. **Reduced Complexity:** No server actions, no middleware, no routing confusion
7. **Better Offline Support:** True offline-first with local Supabase

## Detailed Electron Build Configuration

### Updated package.json Configuration

**Complete `package.json` after migration:**

```json
{
  "name": "personal-stock-investment-tracker",
  "version": "0.1.0",
  "private": true,
  "main": "electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "electron:build": "npm run build && electron-builder",
    "electron:build:mac": "npm run build && electron-builder --mac",
    "electron:build:win": "npm run build && electron-builder --win",
    "postinstall": "electron-builder install-app-deps"
  },
  "build": {
    "appId": "com.raheel.psit",
    "productName": "Personal Stock Tracker",
    "directories": {
      "output": "dist-electron"
    },
    "files": [
      "electron/**/*",
      "dist/**/*",
      "node_modules/**/*",
      "package.json",
      "!.env",
      "!**/*.map"
    ],
    "mac": {
      "category": "public.app-category.finance",
      "target": [
        {
          "target": "dmg",
          "arch": ["x64", "arm64"]
        }
      ],
      "identity": null,
      "asar": false,
      "hardenedRuntime": false,
      "gatekeeperAssess": false
    },
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        }
      ]
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    },
    "extraResources": [
      {
        "from": ".env",
        "to": ".env"
      }
    ]
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.93.3",
    "clsx": "^2.1.1",
    "lucide-react": "^0.562.0",
    "papaparse": "^5.5.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.4.0",
    "zod": "^4.3.5"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/papaparse": "^5.5.2",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.19",
    "concurrently": "^9.2.1",
    "electron": "^40.0.0",
    "electron-builder": "^26.4.0",
    "eslint": "^8",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "typescript": "^5",
    "vite": "^5.3.0",
    "vite-plugin-electron": "^0.28.7",
    "wait-on": "^9.0.3"
  }
}
```

### New electron/main.js (Complete)

```javascript
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Environment detection
const isDev = !app.isPackaged;
const isMac = process.platform === 'darwin';

let mainWindow;

// Load environment variables in production
if (!isDev) {
  const envPath = path.join(process.resourcesPath, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value && !process.env[key]) {
        process.env[key.trim()] = value.trim();
      }
    });
  }
}

function createMenu() {
  const template = [
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      role: 'window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ];

  if (isMac) {
    template.unshift({
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'Personal Stock Investment Tracker',
    show: false,
    titleBarStyle: isMac ? 'hiddenInset' : 'default'
  });

  // Load the app
  if (isDev) {
    // Development: Load Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
    mainWindow.show();
  } else {
    // Production: Load built files
    const indexPath = path.join(__dirname, '../dist/index.html');
    mainWindow.loadFile(indexPath);
    mainWindow.show();
  }

  // Handle window events
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });
}

// App event handlers
app.on('ready', () => {
  createMenu();
  createWindow();
});

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });
});
```

### New electron/preload.js (Security Bridge)

```javascript
const { contextBridge, ipcRenderer } = require('electron');

// Expose safe APIs to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Platform info
  platform: process.platform,
  
  // App version
  appVersion: process.env.npm_package_version,
  
  // Check if in development
  isDev: process.env.NODE_ENV === 'development'
});
```

### Vite Configuration for Electron (vite.config.ts)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  // Path aliases (same as Next.js)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-ui': ['lucide-react', 'clsx', 'tailwind-merge', 'sonner']
        }
      }
    }
  },
  
  // Development server
  server: {
    port: 5173,
    strictPort: true,
    host: true
  },
  
  // Environment variable prefix
  envPrefix: 'VITE_',
  
  // CSS configuration
  css: {
    devSourcemap: true
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'zod',
      'sonner',
      'lucide-react'
    ]
  }
});
```

### Environment Variable Strategy

**Development (`.env`):**
```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
VITE_APP_NAME=Personal Stock Investment Tracker
VITE_APP_VERSION=0.1.0
```

**Production Environment Handling:**

1. **Build Time:** Vite replaces `import.meta.env.VITE_*` variables at build time
2. **Runtime (Electron):** Main process loads `.env` from `extraResources` in production
3. **Security:** Service role key only used in main process for data import operations

### Build Process Flow

1. **Development:**
   ```
   npm run electron:dev
   ├── Vite dev server starts (localhost:5173)
   ├── Electron starts and loads localhost:5173
   └── Hot reload works for both renderer and main process
   ```

2. **Production Build:**
   ```
   npm run electron:build
   ├── vite build (creates dist/ folder)
   ├── electron-builder packages app
   ├── Creates: dist-electron/
   │   ├── mac/Personal Stock Tracker.app
   │   └── Personal Stock Tracker-0.1.0.dmg
   └── .env copied to app resources
   ```

### File Loading Strategy

**Development Mode:**
- Renderer: `http://localhost:5173` (Vite dev server)
- Main Process: `electron/main.js` (Node.js)
- Communication: IPC via `electronAPI`

**Production Mode:**
- Renderer: `file:///<app-path>/dist/index.html` (static files)
- Main Process: Packaged in `app.asar` or unpacked
- Environment: Loaded from `resources/.env`

### macOS-Specific Build Configuration

**Key Settings:**
- `asar: false` - Unpack app for easier debugging and file access
- `identity: null` - Skip code signing for local builds
- `hardenedRuntime: false` - Disable for unsigned apps
- `gatekeeperAssess: false` - Bypass Gatekeeper for unsigned apps

**For Signed Builds (Future):**
```json
{
  "mac": {
    "identity": "Developer ID Application: Your Name",
    "hardenedRuntime": true,
    "gatekeeperAssess": true,
    "entitlements": "build/entitlements.mac.plist",
    "entitlementsInherit": "build/entitlements.mac.plist"
  }
}
```

### Post-Build Verification Checklist

After running `npm run electron:build`, verify:

- [ ] DMG file created in `dist-electron/`
- [ ] App bundle opens without errors
- [ ] All pages load correctly (Dashboard, Wallet, etc.)
- [ ] Supabase connection works (check network tab)
- [ ] Forms submit correctly (add deposit, buy stock, etc.)
- [ ] Data import/export functions work
- [ ] Environment variables loaded correctly
- [ ] No console errors in production build
- [ ] App menu works on macOS
- [ ] Window can be minimized/maximized/closed
- [ ] App quits properly (no zombie processes)

### Troubleshooting Common Build Issues

1. **White Screen After Build:**
   - Check that `dist/index.html` exists
   - Verify all assets are included in `build.files`
   - Check console for 404 errors

2. **Environment Variables Not Loading:**
   - Verify `.env` is in `extraResources`
   - Check main process logs
   - Ensure variables use `VITE_` prefix for renderer

3. **Supabase Connection Fails:**
   - Check network permissions in Electron
   - Verify Supabase URL and key are correct
   - Test with dev tools network tab

4. **Icons/Images Missing:**
   - Move assets to `public/` folder
   - Use relative paths in code
   - Check `build.files` includes `public/**/*`

## Notes

- Keep React 18 (not 19) for better compatibility with Vite ecosystem
- Maintain TypeScript for type safety
- Keep Tailwind CSS for styling
- Preserve all existing UI/UX behavior
- Ensure FIFO calculation logic remains unchanged
- Test thoroughly with real data before production release
- Always backup database before testing import/export functionality
