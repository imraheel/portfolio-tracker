# Personal Stock Investment Tracker (PSIT)

PSIT is a simple, cloud-based, personal-use investment tracking system specifically designed for managing stock investments in **Pakistani Rupees (PKR)**. It prioritizes simplicity, accuracy, and full manual control over real-time market integration.

## Key Features

- **Wallet Management:** Track deposits and maintain an accurate available balance.
- **Stock Transactions:** Record Buy and Sell transactions.
- **FIFO Cost Basis:** Mandatory First-In-First-Out logic for accurate realized gain/loss calculation.
- **Dividend Tracking:** Log dividend income per stock to see total returns.
- **Manual Price Updates:** Update current stock prices manually to calculate unrealized gains/losses.
- **Portfolio Analytics:** Real-time calculation of invested amount, current value, and P/L (Realized & Unrealized).
- **Data Management:** Export and Import functionality for backups.
- **Cloud-Based:** All data is stored in Supabase PostgreSQL database (accessible from any device).
- **Desktop App:** Available as a standalone Electron application for macOS and Windows.

## Tech Stack

- **Framework:** [React.js](https://reactjs.org/) 18 with [Vite](https://vitejs.dev/)
- **Routing:** [React Router](https://reactrouter.com/) (HashRouter for Electron compatibility)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Validation:** [Zod](https://zod.dev/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Notifications:** [Sonner](https://sonner.emilkowal.ski/)
- **Desktop:** [Electron](https://www.electronjs.org/) with [electron-builder](https://www.electron.build/)

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- pnpm (recommended) or npm
- Supabase account (free tier works fine)

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd personal-stock-investment-tracker
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup:**
   - Go to your Supabase project dashboard
   - Open the SQL Editor
   - Run the SQL migration from `supabase_migration.sql`

5. **Run the development server:**
   ```bash
   pnpm dev
   ```

6. **Access the application:**
   Open [http://localhost:5173](http://localhost:5173) in your browser.

## Desktop App (Electron)

### Development Mode

Run the app in Electron with hot reload:

```bash
pnpm electron:dev
```

### Building the Desktop App

Build for your current platform:

```bash
# Build for macOS
pnpm electron:build:mac

# Build for Windows
pnpm electron:build:win

# Build for current platform
pnpm electron:build
```

The built application will be available in the `dist-electron/` directory:
- **macOS:** `dist-electron/mac/Personal Stock Tracker.app` and `.dmg` installer
- **Windows:** `dist-electron/win-unpacked/` and `.exe` installer

### Environment Variables in Production

The `.env` file is automatically bundled with the Electron app. Make sure it contains your Supabase credentials before building.

## Business Rules

- **Currency:** Primary currency is PKR (`Rs.`).
- **Date Format:** `DD-MM-YYYY`.
- **Wallet Balance:** `Total Deposits - Total Buy Costs + Total Sell Proceeds + Total Dividends`.
- **Validation:** "Buy" transactions require sufficient wallet balance; "Sell" transactions require sufficient stock quantity.
- **FIFO Logic:** Sell transactions consume the oldest buy lots first.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── wallet/         # Wallet-related forms
│   ├── stocks/         # Stock-related forms
│   └── transactions/   # Transaction forms
├── pages/              # Route components
│   ├── Dashboard.tsx
│   ├── Wallet.tsx
│   ├── Stocks.tsx
│   ├── Transactions.tsx
│   ├── Reports.tsx
│   └── Settings.tsx
├── hooks/              # Custom React hooks
│   ├── useWallet.ts
│   ├── useStocks.ts
│   ├── useTransactions.ts
│   ├── usePortfolio.ts
│   └── useDataExport.ts
├── services/           # Business logic (API calls)
│   ├── wallet.ts
│   ├── stocks.ts
│   ├── transactions.ts
│   ├── portfolio.ts
│   └── data.ts
├── lib/supabase/       # Supabase client configuration
│   └── client.ts
├── types/              # TypeScript type definitions
│   └── supabase.ts
├── App.tsx             # React Router setup
├── main.tsx            # Application entry point
└── globals.css         # Tailwind CSS styles

electron/
├── main.js             # Electron main process
└── preload.js          # Security preload script
```

## Available Scripts

- `pnpm dev` - Start Vite development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint
- `pnpm electron:dev` - Run Electron in development mode
- `pnpm electron:build` - Build Electron app for current platform
- `pnpm electron:build:mac` - Build for macOS
- `pnpm electron:build:win` - Build for Windows

## Backup and Restore

The application includes a settings page where you can export all your data to a JSON-based backup file and import it back to restore your state. Note that importing data replaces all existing records in the database.

### Export Data
1. Go to Settings page
2. Click "Download Master Backup (.txt)"
3. Save the backup file securely

### Import Data
1. Go to Settings page
2. Select your backup file
3. Click "Restore from Backup"
4. **Warning:** This will replace all current data

## Migration from SQLite

If you were previously using the SQLite version, you can migrate your data:
1. Export your data from the old SQLite version using the Settings page
2. Set up Supabase database (follow steps above)
3. Import your backup file in the new version

## Architecture Notes

- **Client-Side Only:** This is a pure React.js application with no server-side rendering
- **HashRouter:** Uses hash-based routing for compatibility with Electron's `file://` protocol
- **Relative Paths:** All assets use relative paths (`./`) for Electron compatibility
- **Supabase Client:** Direct browser client connection to Supabase (no server middleware)

## Troubleshooting

### White Screen in Electron Build
If the Electron app shows a white screen after building:
1. Check that `dist/assets/` folder exists with JS/CSS files
2. Open DevTools (View → Toggle Developer Tools) to see console errors
3. Ensure `.env` file is present with correct Supabase credentials

### Build Errors
If you encounter build errors:
1. Clear build directories: `rm -rf dist dist-electron`
2. Rebuild: `pnpm build && pnpm electron:build`

## License

This project is for personal use.
