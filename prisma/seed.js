const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // 1. Create Stocks
  const stocks = [
    { symbol: 'PSO', companyName: 'Pakistan State Oil', sector: 'Oil & Gas' },
    { symbol: 'ENGRO', companyName: 'Engro Corporation', sector: 'Chemicals' },
    { symbol: 'SYS', companyName: 'Systems Limited', sector: 'Technology' },
    { symbol: 'MEBL', companyName: 'Meezan Bank', sector: 'Banking' },
  ];

  for (const stock of stocks) {
    await prisma.stock.upsert({
      where: { symbol: stock.symbol },
      update: {},
      create: stock,
    });
  }

  const dbStocks = await prisma.stock.findMany();
  const stockMap = Object.fromEntries(dbStocks.map(s => [s.symbol, s.id]));

  // 2. Add initial prices
  const prices = [
    { symbol: 'PSO', price: 180.50 },
    { symbol: 'ENGRO', price: 250.00 },
    { symbol: 'SYS', price: 450.75 },
    { symbol: 'MEBL', price: 120.00 },
  ];

  for (const p of prices) {
    await prisma.stockPrice.upsert({
      where: { stockId: stockMap[p.symbol] },
      update: { currentPrice: p.price },
      create: { stockId: stockMap[p.symbol], currentPrice: p.price },
    });
  }

  // 3. Add initial deposits
  const deposits = [
    { amount: 100000, depositDate: new Date('2025-01-01'), note: 'Initial investment' },
    { amount: 50000, depositDate: new Date('2025-06-01'), note: 'Bonus deposit' },
  ];

  for (const d of deposits) {
    await prisma.deposit.create({ data: d });
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
