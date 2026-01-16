'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

const DepositSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  depositDate: z.coerce.date(),
  note: z.string().optional(),
});

export async function addDeposit(prevState: any, formData: FormData) {
  const validatedFields = DepositSchema.safeParse({
    amount: formData.get('amount'),
    depositDate: formData.get('depositDate'),
    note: formData.get('note'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to add deposit. Please check the fields.',
    };
  }

  const { amount, depositDate, note } = validatedFields.data;

  try {
    await prisma.deposit.create({
      data: {
        amount,
        depositDate,
        note,
      },
    });

    revalidatePath('/');
    revalidatePath('/wallet');
    return { message: 'Successfully added deposit.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to add deposit.' };
  }
}

export async function deleteDeposit(prevState: any, formData: FormData) {
  const id = Number(formData.get('id'));

  try {
    await prisma.deposit.delete({
      where: { id },
    });

    revalidatePath('/');
    revalidatePath('/wallet');
    return { message: 'Deleted deposit.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to delete deposit.' };
  }
}

export async function getDeposits() {
  try {
    const deposits = await prisma.deposit.findMany({
      orderBy: {
        depositDate: 'desc',
      },
    });
    return deposits;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch deposits.');
  }
}

export async function getWalletBalance() {
  try {
    const {
      _sum: { amount: totalDeposits },
    } = await prisma.deposit.aggregate({ _sum: { amount: true } });

    const {
      _sum: { totalCost: totalBuys },
    } = await prisma.stockBuyTransaction.aggregate({ _sum: { totalCost: true } });

    const {
      _sum: { totalProceeds: totalSells },
    } = await prisma.stockSellTransaction.aggregate({ _sum: { totalProceeds: true } });

    const {
      _sum: { dividendAmount: totalDividends },
    } = await prisma.dividend.aggregate({ _sum: { dividendAmount: true } });

    const balance = new Prisma.Decimal(totalDeposits ?? 0)
      .minus(new Prisma.Decimal(totalBuys ?? 0))
      .plus(new Prisma.Decimal(totalSells ?? 0))
      .plus(new Prisma.Decimal(totalDividends ?? 0));
      
    return balance.toNumber();
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch wallet balance.');
  }
}
