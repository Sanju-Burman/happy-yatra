import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MapPin, Users, BarChart2, LogOut, ChevronLeft } from 'lucide-react';
import { logout } from '@/api.jsx';

const sidebarLinks = [
  { to: '/admin',              label: 'Overview',     icon: LayoutDashboard, end: true },
  { to: '/admin/destinations', label: 'Destinations', icon: MapPin },
  { to: '/admin/users',        label: 'Users',        icon: Users },
  { to: '/admin/analytics',    label: 'Analytics',    icon: BarChart2 },
];

export default function AdminDashboard({ setUser }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate('/');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r bg-muted/20 px-4 py-8 shadow-sm">
        <div className="px-4 mb-8 flex items-center justify-between">
          <p className="text-xl font-bold tracking-tight text-foreground">Admin Panel</p>
          <button 
            onClick={() => navigate('/')}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
            title="Back to site"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
        
        <nav className="flex flex-1 flex-col gap-2">
          {sidebarLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
                 ${isActive ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:translate-x-1'}`
              }
            >
              <Icon size={18} />{label}
            </NavLink>
          ))}
        </nav>
        
        <div className="mt-auto border-t pt-6">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium
                       text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto bg-background p-8 lg:p-12">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
