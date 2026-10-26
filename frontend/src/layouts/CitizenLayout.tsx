import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, FileText, User, LogOut, Leaf, 
  ChevronLeft, ChevronRight, Bell, Settings
} from 'lucide-react';

import { NotificationBell } from '../components/notifications/NotificationBell';

const sidebarLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Schemes', path: '/dashboard/schemes', icon: FileText },
  { name: 'My Applications', path: '/dashboard/applications', icon: FileText },
  { name: 'Profile', path: '/dashboard/profile', icon: User },
];

export const CitizenLayout = () => {
  const logout = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background dark flex flex-col md:flex-row font-sans text-foreground">
      {/* Premium Sidebar */}
      <aside className={`hidden md:flex flex-col ${collapsed ? 'w-20' : 'w-64'} bg-card border-r border-border/50 transition-all duration-300 relative`}>
        {/* Logo */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} p-5 border-b border-border/50`}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shrink-0">
            <Leaf className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold font-heading tracking-tight text-foreground leading-tight">
                Gram<span className="text-primary">AI</span>
              </span>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Telangana Gov</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 p-3 mt-2">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.path || 
              (link.path !== '/dashboard' && location.pathname.startsWith(link.path));
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary/15 text-primary shadow-sm border border-primary/20'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
                title={collapsed ? link.name : undefined}
              >
                <link.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'} transition-colors`} />
                {!collapsed && <span>{link.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Info + Logout */}
        <div className="p-3 border-t border-border/50 space-y-2">
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{user?.email?.split('@')[0] || 'Citizen'}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user?.email || ''}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all w-full`}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-card border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground shadow-sm transition-colors z-10"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Leaf className="h-4 w-4" />
          </div>
          <span className="text-base font-bold font-heading text-foreground">Gram<span className="text-primary">AI</span></span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Desktop Top Bar */}
        <div className="hidden md:flex sticky top-0 z-30 bg-card/85 backdrop-blur-md border-b border-border/50 px-8 py-3 items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            Digital Telangana Citizen Portal
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
          </div>
        </div>
        <div className="p-4 md:p-8 flex-1">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border/50 px-2 py-2 flex items-center justify-around">
        {sidebarLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground'
              }`}
            >
              <link.icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
              <span>{link.name}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-xs font-medium text-destructive"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
};
