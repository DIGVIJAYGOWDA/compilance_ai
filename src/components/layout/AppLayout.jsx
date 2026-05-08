import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

export default function AppLayout({ score }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Desktop Sidebar */}
      <Sidebar isOpen={sidebarOpen} close={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 relative pb-16 lg:pb-0">
        <Navbar toggleSidebar={() => setSidebarOpen(true)} score={score} />
        
        <main className="flex-1 overflow-y-auto w-full p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
