import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar />
      <main className="ml-64 flex-1 p-6 lg:p-8 min-h-screen overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
