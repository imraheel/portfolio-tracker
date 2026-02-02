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

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Validation:** [Zod](https://zod.dev/)
- **Icons:** [Lucide React](https://lucide.dev/)

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
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Database Setup:**
   - Go to your Supabase project dashboard
   - Open the SQL Editor
   - Run the SQL migration from `supabase_migration.sql`

5. **Run the development server:**
   ```bash
   pnpm run dev
   ```

6. **Access the application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Business Rules

- **Currency:** Primary currency is PKR (`Rs.`).
- **Date Format:** `DD-MM-YYYY`.
- **Wallet Balance:** `Total Deposits - Total Buy Costs + Total Sell Proceeds + Total Dividends`.
- **Validation:** "Buy" transactions require sufficient wallet balance; "Sell" transactions require sufficient stock quantity.
- **FIFO Logic:** Sell transactions consume the oldest buy lots first.

## Project Structure

- `app/actions/`: Server Actions containing the core business logic.
- `app/components/`: Reusable UI components.
- `lib/supabase/`: Supabase client configurations.
- `types/`: TypeScript type definitions.

## Backup and Restore

The application includes a settings page where you can export all your data to a JSON-based backup file and import it back to restore your state. Note that importing data replaces all existing records in the database.

## Migration from SQLite

If you were previously using the SQLite version, you can migrate your data:
1. Export your data from the old SQLite version using the Settings page
2. Set up Supabase database (follow steps above)
3. Import your backup file in the new version

## License

This project is for personal use.
