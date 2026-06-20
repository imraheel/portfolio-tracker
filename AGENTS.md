# AGENTS.md - Coding Guidelines for Personal Stock Investment Tracker

## Build & Development Commands

```bash
# Development
pnpm dev                    # Start Vite development server
pnpm electron:dev          # Run Electron app in development mode

# Building
pnpm build                 # Build for production (TypeScript + Vite)
pnpm preview               # Preview production build locally
pnpm electron:build        # Build Electron app for current platform
pnpm electron:build:mac    # Build for macOS
pnpm electron:build:win    # Build for Windows

# Linting
pnpm lint                  # Run ESLint with max 0 warnings
```

**Note:** This project uses **pnpm** as the package manager. Do not use npm or yarn.

## Project Architecture

**Stack:** React 18 + Vite + TypeScript + Tailwind CSS + Firebase Firestore + Electron

**Key Directories:**
- `src/components/` - Reusable UI components (organized by investment type: stocks/, crypto/, mutualFunds/, dashboard/)
- `src/pages/` - Route components (organized by investment type: stocks/, crypto/, mutualFunds/)
- `src/hooks/` - Custom React hooks (organized by investment type: stocks/, crypto/, mutualFunds/)
- `src/services/` - Business logic and API calls (organized by investment type: stocks/, crypto/, mutualFunds/)
- `src/lib/firebase/` - Firebase client configuration
- `src/types/` - TypeScript type definitions
- `electron/` - Electron main process and preload scripts

## Code Style Guidelines

### Imports
- Use path alias `@/` for all imports from src (e.g., `import { useStocks } from '@/hooks/stocks/useStocks'`)
- Group imports: React/hooks first, then libraries, then local modules
- Use named exports for hooks and services
- Organize by investment type: import from ` '@/hooks/stocks/...'`, ` '@/hooks/crypto/...'`, ` '@/hooks/mutualFunds/...'`

### Types & Interfaces
- Define interfaces in service files (e.g., `Stock`, `StockPrice` in stocks.ts)
- Use Zod schemas for form validation (defined at top of service files)
- Enable strict TypeScript mode - all code must be type-safe
- Use `type` keyword for type aliases, `interface` for object shapes

### Naming Conventions
- **Components:** PascalCase (e.g., `StockForm`, `Dashboard`)
- **Hooks:** camelCase with `use` prefix (e.g., `useStocks`, `usePortfolio`)
- **Services:** camelCase (e.g., `addStock`, `getStocks`)
- **Types/Interfaces:** PascalCase (e.g., `Stock`, `Transaction`)
- **Files:** PascalCase for components, camelCase for hooks/services
- **Database columns:** snake_case (e.g., `company_name`, `created_at`)

### Component Patterns
- Use functional components with hooks
- Destructure props in function parameters
- Use `clsx` for conditional class names
- Form components use local state + service calls via hooks

### Error Handling
- Services return `{ success: boolean, message: string, errors?: Record<string, string[]> }`
- Use Zod for input validation with detailed error messages
- Console.error for debugging, but return user-friendly messages
- Hooks handle async errors with try/catch and set error state

### Styling (Tailwind CSS)
- Use utility classes exclusively
- Custom font: Inter (defined in tailwind.config.js)
- Common patterns:
  - Cards: `rounded-lg bg-white p-6 shadow-md`
  - Form inputs: `mt-1 block w-full rounded-md border border-gray-300 px-3 py-2`
  - Buttons: Custom `FormButton` component
- Color coding: Green for positive, Red for negative values

### State Management
- React hooks for local state
- Custom hooks for data fetching with SWR-like pattern
- Services handle all Firebase Firestore interactions
- No global state library (Redux/Zustand) - use hooks composition

### Routing
- Uses HashRouter for Electron file:// protocol compatibility
- Routes defined in App.tsx

### Currency & Formatting
- Primary currency: PKR (Pakistani Rupees)
- Format: `Rs. X,XXX.XX` using `toLocaleString('en-PK')`
- Date format: DD-MM-YYYY

## ESLint Configuration

Key rules:
- `@typescript-eslint/no-unused-vars`: Error (ignore vars starting with `_`)
- `react-refresh/only-export-components`: Warn
- React Hooks rules enabled
- Ignores: dist/, dist-electron/, node_modules/, electron/

## Environment Variables

Required in `.env`:
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
```

## Testing

No test framework is currently configured. When adding tests:
- Use Vitest (aligns with Vite)
- Place tests next to source files (e.g., `stocks.test.ts`)
- Mock Firebase client for unit tests

## Business Rules to Remember

- **FIFO Logic:** Sell transactions consume oldest buy lots first
- **Wallet Balance:** Total Deposits - Total Buy Costs + Total Sell Proceeds + Total Dividends
- **Validation:** Buy requires sufficient wallet balance; Sell requires sufficient stock quantity
- **Manual Price Updates:** Stock prices are updated manually, not fetched from API
- **Investment History:** Cumulative investment tracking by asset type (Stocks, Mutual Funds, Crypto)
