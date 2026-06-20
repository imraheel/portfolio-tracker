/**
 * One-time script to import the backup JSON into Firestore.
 *
 * Usage:
 *   pnpm tsx src/scripts/importBackup.ts
 *
 * Requirements:
 *   - firebase_service_account.json in project root
 *   - psit_backup_2026-06-20.txt in project root
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, type WriteBatch } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const BACKUP_FILE = resolve(__dirname, '../../psit_backup_2026-06-20.txt');
const SERVICE_ACCOUNT = resolve(__dirname, '../../firebase_service_account.json');
const BATCH_SIZE = 500;

interface BackupData {
  version: string;
  exportDate: string;
  stocks: Record<string, unknown>[];
  deposits: Record<string, unknown>[];
  buyTransactions: Record<string, unknown>[];
  sellTransactions: Record<string, unknown>[];
  dividends: Record<string, unknown>[];
  stockPrices: Record<string, unknown>[];
  mutualFunds: Record<string, unknown>[];
  mutualFundPurchases: Record<string, unknown>[];
  mutualFundWithdrawals: Record<string, unknown>[];
  cryptocurrencies: Record<string, unknown>[];
  cryptoPurchases: Record<string, unknown>[];
  cryptoWithdrawals: Record<string, unknown>[];
}

const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT, 'utf-8'));

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function clearCollection(name: string) {
  const snapshot = await db.collection(name).get();
  if (snapshot.empty) return;

  const batches: WriteBatch[] = [];
  let batch = db.batch();
  let count = 0;

  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
    count++;
    if (count % BATCH_SIZE === 0) {
      batches.push(batch);
      batch = db.batch();
    }
  });

  if (count % BATCH_SIZE !== 0) {
    batches.push(batch);
  }

  for (const b of batches) {
    await b.commit();
  }

  console.log(`  Cleared ${count} docs from ${name}`);
}

async function writeWithId(collection: string, id: string, data: Record<string, unknown>) {
  await db.collection(collection).doc(id).set(data);
}

async function writeAutoId(collection: string, data: Record<string, unknown>) {
  await db.collection(collection).add(data);
}

async function importCollectionAuto(
  name: string,
  records: Record<string, unknown>[],
  fieldMap: Record<string, string>,
) {
  let count = 0;
  for (const record of records) {
    const doc: Record<string, unknown> = {};
    for (const [from, to] of Object.entries(fieldMap)) {
      const val = record[from] ?? record[to];
      if (val !== undefined) {
        doc[to] = val;
      }
    }
    await writeAutoId(name, doc);
    count++;
  }
  console.log(`  Imported ${count} docs into ${name}`);
}

async function importMasterWithSymbol(
  name: string,
  records: Record<string, unknown>[],
) {
  let count = 0;
  for (const record of records) {
    const symbol = (record.symbol as string)?.toUpperCase();
    if (!symbol) {
      console.warn(`  Skipping ${name} record without symbol:`, record);
      continue;
    }
    await writeWithId(name, symbol, record as Record<string, unknown>);
    count++;
  }
  console.log(`  Imported ${count} docs into ${name}`);
}

async function main() {
  console.log('Reading backup file...');
  const raw = readFileSync(BACKUP_FILE, 'utf-8');
  const data: BackupData = JSON.parse(raw);

  const collections = [
    'crypto_withdrawals',
    'crypto_purchases',
    'cryptocurrencies',
    'mutual_fund_withdrawals',
    'mutual_fund_purchases',
    'mutual_funds',
    'dividends',
    'stock_sell_transactions',
    'stock_buy_transactions',
    'stock_prices',
    'deposits',
    'withdrawals',
    'stocks',
  ];

  console.log('\nClearing existing data...');
  for (const name of collections) {
    await clearCollection(name);
  }
  console.log('All collections cleared.\n');

  console.log('Importing stocks...');
  await importMasterWithSymbol('stocks', data.stocks);

  console.log('Importing mutual funds...');
  await importMasterWithSymbol('mutual_funds', data.mutualFunds);

  console.log('Importing cryptocurrencies...');
  await importMasterWithSymbol('cryptocurrencies', data.cryptocurrencies);

  console.log('Importing deposits...');
  const depositMap = {
    amount: 'amount',
    deposit_date: 'deposit_date',
    note: 'note',
    created_at: 'created_at',
  };
  await importCollectionAuto('deposits', data.deposits, depositMap);

  console.log('Importing buy transactions...');
  const buyMap = {
    symbol: 'symbol',
    quantity: 'quantity',
    buy_rate: 'buy_rate',
    buyRate: 'buy_rate',
    total_cost: 'total_cost',
    totalCost: 'total_cost',
    buy_date: 'buy_date',
    buyDate: 'buy_date',
    notes: 'notes',
    created_at: 'created_at',
    createdAt: 'created_at',
  };
  await importCollectionAuto('stock_buy_transactions', data.buyTransactions, buyMap);

  console.log('Importing sell transactions...');
  const sellMap = {
    symbol: 'symbol',
    quantity: 'quantity',
    sell_rate: 'sell_rate',
    sellRate: 'sell_rate',
    total_proceeds: 'total_proceeds',
    totalProceeds: 'total_proceeds',
    realized_gain_loss: 'realized_gain_loss',
    realizedGainLoss: 'realized_gain_loss',
    sell_date: 'sell_date',
    sellDate: 'sell_date',
    notes: 'notes',
    created_at: 'created_at',
    createdAt: 'created_at',
  };
  await importCollectionAuto('stock_sell_transactions', data.sellTransactions, sellMap);

  console.log('Importing dividends...');
  const dividendMap = {
    symbol: 'symbol',
    dividend_amount: 'dividend_amount',
    dividendAmount: 'dividend_amount',
    dividend_date: 'dividend_date',
    dividendDate: 'dividend_date',
    notes: 'notes',
    created_at: 'created_at',
    createdAt: 'created_at',
  };
  await importCollectionAuto('dividends', data.dividends, dividendMap);

  console.log('Importing stock prices...');
  for (const record of data.stockPrices) {
    const symbol = (record.symbol as string)?.toUpperCase();
    if (!symbol) continue;
    await writeWithId('stock_prices', symbol, {
      symbol,
      current_price: record.current_price ?? record.currentPrice ?? 0,
      updated_at: record.updated_at ?? record.updatedAt ?? null,
    });
  }
  console.log(`  Imported ${data.stockPrices.length} docs into stock_prices`);

  console.log('Importing mutual fund purchases...');
  await importCollectionAuto('mutual_fund_purchases', data.mutualFundPurchases, {
    symbol: 'symbol',
    amount: 'amount',
    purchase_date: 'purchase_date',
    purchaseDate: 'purchase_date',
    notes: 'notes',
    created_at: 'created_at',
    createdAt: 'created_at',
  });

  console.log('Importing mutual fund withdrawals...');
  await importCollectionAuto('mutual_fund_withdrawals', data.mutualFundWithdrawals, {
    symbol: 'symbol',
    amount: 'amount',
    withdrawal_date: 'withdrawal_date',
    withdrawalDate: 'withdrawal_date',
    notes: 'notes',
    created_at: 'created_at',
    createdAt: 'created_at',
  });

  console.log('Importing crypto purchases...');
  await importCollectionAuto('crypto_purchases', data.cryptoPurchases, {
    symbol: 'symbol',
    amount_pkr: 'amount_pkr',
    amountPkr: 'amount_pkr',
    purchase_date: 'purchase_date',
    purchaseDate: 'purchase_date',
    notes: 'notes',
    created_at: 'created_at',
    createdAt: 'created_at',
  });

  console.log('Importing crypto withdrawals...');
  await importCollectionAuto('crypto_withdrawals', data.cryptoWithdrawals, {
    symbol: 'symbol',
    amount_pkr: 'amount_pkr',
    amountPkr: 'amount_pkr',
    withdrawal_date: 'withdrawal_date',
    withdrawalDate: 'withdrawal_date',
    notes: 'notes',
    created_at: 'created_at',
    createdAt: 'created_at',
  });

  console.log('\n✅ Import complete!');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Import failed:', err);
  process.exit(1);
});
