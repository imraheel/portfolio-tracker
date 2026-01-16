/*
  Warnings:

  - Added the required column `realizedGainLoss` to the `stock_sell_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_stock_sell_transactions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "stockId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "sellRate" DECIMAL NOT NULL,
    "totalProceeds" DECIMAL NOT NULL,
    "realizedGainLoss" DECIMAL NOT NULL,
    "sellDate" DATETIME NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "stock_sell_transactions_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "stocks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_stock_sell_transactions" ("createdAt", "id", "notes", "quantity", "sellDate", "sellRate", "stockId", "totalProceeds") SELECT "createdAt", "id", "notes", "quantity", "sellDate", "sellRate", "stockId", "totalProceeds" FROM "stock_sell_transactions";
DROP TABLE "stock_sell_transactions";
ALTER TABLE "new_stock_sell_transactions" RENAME TO "stock_sell_transactions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
