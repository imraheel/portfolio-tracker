# Portfolio Tracker

Portfolio Tracker is a simple, cloud-based, personal-use investment tracking system for managing **Stocks (PSX)**, **Mutual Funds**, and **Cryptocurrency** investments in **Pakistani Rupees (PKR)**. It prioritizes simplicity, accuracy, and full manual control over real-time market integration.

## Key Features

- **Multi-Asset Support:** Track Stocks (PSX), Mutual Funds, and Cryptocurrency investments.
- **Wallet Management:** Track deposits and maintain an accurate available balance across all investments.
- **Stock Transactions:** Record Buy and Sell transactions with FIFO cost basis.
- **Mutual Funds:** Track purchases, withdrawals, and market value updates.
- **Cryptocurrency:** Track crypto holdings, purchases, and withdrawals in PKR.
- **Dividend Tracking:** Log dividend income per stock to see total returns.
- **Manual Price Updates:** Update current prices manually to calculate unrealized gains/losses.
- **Portfolio Analytics:** Real-time calculation of invested amount, current value, and P/L (Realized & Unrealized).
- **Investment History Chart:** Visualize cumulative investments over time for Stocks, Mutual Funds, and Crypto.
- **Data Management:** Export and Import functionality for all investment types.
- **Cloud-Based:** All data is stored in Firebase Firestore database (accessible from any device).
- **Desktop App:** Available as a standalone Electron application for macOS and Windows.

## Tech Stack

- **Framework:** [React.js](https://reactjs.org/) 18 with [Vite](https://vitejs.dev/)
- **Routing:** [React Router](https://reactrouter.com/) (HashRouter for Electron compatibility)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database:** [Firebase Firestore](https://firebase.google.com/products/firestore)
- **Validation:** [Zod](https://zod.dev/)
- **Data Fetching:** [TanStack React Query](https://tanstack.com/query)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Notifications:** [Sonner](https://sonner.emilkowal.ski/)
- **Desktop:** [Electron](https://www.electronjs.org/) with [electron-builder](https://www.electron.build/)

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- pnpm (recommended) or npm
- Firebase account (free tier works fine)

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd portfolio-tracker
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory with your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   ```

4. **Database Setup:**
   - Go to your [Firebase Console](https://console.firebase.google.com)
   - Enable **Cloud Firestore**
   - Set Firestore security rules to allow read/write:
     ```
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /{document=**} {
           allow read, write: if true;
         }
       }
     }
     ```

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
- **macOS:** `dist-electron/mac/Portfolio Tracker.app` and `.dmg` installer
- **Windows:** `dist-electron/win-unpacked/` and `.exe` installer

### Environment Variables in Production

The `.env` file is automatically bundled with the Electron app. Make sure it contains your Firebase credentials before building.

## Business Rules

- **Currency:** Primary currency is PKR (`Rs.`).
- **Date Format:** `DD-MM-YYYY`.
- **Wallet Balance:** `Total Deposits - Total Buy Costs + Total Sell Proceeds + Total Dividends`.
- **Validation:** "Buy" transactions require sufficient wallet balance; "Sell" transactions require sufficient stock quantity.
- **FIFO Logic:** Sell transactions consume the oldest buy lots first.

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

## Data Import

To import the initial backup into Firestore:

```bash
pnpm tsx src/scripts/importBackup.ts
```

Requires `firebase_service_account.json` (service account key) in the project root.

## Architecture Notes

- **TanStack React Query:** All data fetching uses `useQuery` in page components and `useMutation` in form components. Query keys are centralized in `src/lib/queryKeys.ts`. No custom data-fetching hooks.
- **Client-Side Only:** This is a pure React.js application with no server-side rendering
- **HashRouter:** Uses hash-based routing for compatibility with Electron's `file://` protocol
- **Relative Paths:** All assets use relative paths (`./`) for Electron compatibility
- **Firestore Client:** Direct browser client connection to Firestore (no server middleware)

## Troubleshooting

### White Screen in Electron Build
If the Electron app shows a white screen after building:
1. Check that `dist/assets/` folder exists with JS/CSS files
2. Open DevTools (View → Toggle Developer Tools) to see console errors
3. Ensure `.env` file is present with correct Firebase credentials

### Build Errors
If you encounter build errors:
1. Clear build directories: `rm -rf dist dist-electron`
2. Rebuild: `pnpm build && pnpm electron:build`

## License

This project is for personal use.
