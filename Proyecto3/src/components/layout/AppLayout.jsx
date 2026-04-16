import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import './layout.css';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        {/* Mobile Header */}
        <header className="app-header">
          <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
          <span className="app-header__title">🍝 PastaERP</span>
        </header>
        {/* Page Content */}
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
