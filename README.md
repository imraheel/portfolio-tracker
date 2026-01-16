# Personal Stock Investment Tracker (PSIT)

PSIT is a simple, offline-first, personal-use investment tracking system specifically designed for managing stock investments in **Pakistani Rupees (PKR)**. It prioritizes simplicity, accuracy, and full manual control over real-time market integration.

## Key Features

- **Wallet Management:** Track deposits and maintain an accurate available balance.
- **Stock Transactions:** Record Buy and Sell transactions.
- **FIFO Cost Basis:** Mandatory First-In-First-Out logic for accurate realized gain/loss calculation.
- **Dividend Tracking:** Log dividend income per stock to see total returns.
- **Manual Price Updates:** Update current stock prices manually to calculate unrealized gains/losses.
- **Portfolio Analytics:** Real-time calculation of invested amount, current value, and P/L (Realized & Unrealized).
- **Data Management:** Export and Import functionality for local backups.
- **Offline-First:** All data is stored locally in a SQLite database.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database:** [SQLite](https://www.sqlite.org/) via [Prisma ORM](https://www.prisma.io/)
- **Validation:** [Zod](https://zod.dev/)
- **Icons:** [Lucide React](https://lucide.dev/)

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm, yarn, or pnpm

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd personal-stock-investment-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Database Migration:**
   Initialize your local SQLite database:
   ```bash
   npx prisma migrate dev
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
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
- `prisma/`: Database schema and migrations.
- `lib/`: Shared utility functions and Prisma client instance.

## Backup and Restore

The application includes a settings page where you can export all your data to a JSON-based backup file and import it back to restore your state. Note that importing data replaces all existing records in the database.

## License

This project is for personal use.