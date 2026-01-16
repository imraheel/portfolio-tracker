import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Personal Stock Investment Tracker',
  description: 'A simple, offline-first, personal-use investment tracking system.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <Toaster position="top-right" richColors />
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="ml-64 mt-14 w-full p-6 lg:p-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}