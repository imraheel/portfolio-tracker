import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="ml-64 mt-14 w-full p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
