'use client';

export default function Header() {
  const today = new Date().toLocaleDateString('en-PK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="fixed top-0 z-40 w-full border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-gray-900">
          Personal Stock Investment Tracker
        </h1>
        <div className="hidden text-sm font-medium text-gray-500 sm:block">
          {today}
        </div>
      </div>
    </header>
  );
}
