import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, Users, FileText, CheckSquare, XSquare, BarChart, Settings, LogOut, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

import { NotificationBell } from '../components/notifications/NotificationBell';

export const AdminLayout = () => {
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { to: "/admin/dashboard", icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard Home" },
    { to: "/admin/applications", icon: <FileText className="h-5 w-5" />, label: "Application Queue" },
    { to: "/admin/pending", icon: <CheckSquare className="h-5 w-5" />, label: "Pending Apps" },
    { to: "/admin/verification", icon: <CheckSquare className="h-5 w-5" />, label: "Verification Queue" },
    { to: "/admin/approvals", icon: <CheckCircle className="h-5 w-5" />, label: "Approvals" },
    { to: "/admin/rejections", icon: <XSquare className="h-5 w-5" />, label: "Rejections" },
    { to: "/admin/reports", icon: <BarChart className="h-5 w-5" />, label: "Reports & Analytics" },
    { to: "/admin/schemes", icon: <Settings className="h-5 w-5" />, label: "Scheme Management" },
    { to: "/admin/search", icon: <Users className="h-5 w-5" />, label: "Citizen Search" },
    { to: "/admin/profile", icon: <Users className="h-5 w-5" />, label: "Profile Management" },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 bg-card border-r flex flex-col shadow-sm">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-primary">GramAI Officer</h2>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {links.map(link => {
            const isActive = location.pathname.startsWith(link.to);
            return (
              <Link 
                key={link.to} 
                to={link.to} 
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {link.icon}
                {link.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t">
          <button 
            onClick={() => { logout(); navigate('/login'); }} 
            className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="border-b bg-card/80 backdrop-blur-md px-8 py-3.5 flex items-center justify-between shrink-0 z-30">
          <div className="text-sm font-medium text-muted-foreground">
            Telangana GovOps Workspace
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
          </div>
        </header>
        <div className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
