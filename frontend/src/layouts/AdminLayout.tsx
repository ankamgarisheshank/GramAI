import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, Users, FileText, CheckSquare, XSquare, 
  BarChart, Settings, LogOut, CheckCircle, Menu, X, Shield 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { NotificationBell } from '../components/notifications/NotificationBell';

export const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const links = [
    { to: "/admin/dashboard", icon: <LayoutDashboard className="h-4 w-4" />, label: "Dashboard Home" },
    { to: "/admin/applications", icon: <FileText className="h-4 w-4" />, label: "Application Queue" },
    { to: "/admin/pending", icon: <CheckSquare className="h-4 w-4" />, label: "Pending Apps" },
    { to: "/admin/verification", icon: <CheckSquare className="h-4 w-4" />, label: "Verification Queue" },
    { to: "/admin/approvals", icon: <CheckCircle className="h-4 w-4" />, label: "Approvals" },
    { to: "/admin/rejections", icon: <XSquare className="h-4 w-4" />, label: "Rejections" },
    { to: "/admin/reports", icon: <BarChart className="h-4 w-4" />, label: "Reports & Analytics" },
    { to: "/admin/schemes", icon: <Settings className="h-4 w-4" />, label: "Scheme Management" },
    { to: "/admin/search", icon: <Users className="h-4 w-4" />, label: "Citizen Search" },
    { to: "/admin/profile", icon: <Users className="h-4 w-4" />, label: "Profile" },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navContent = (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground tracking-tight">GramAI Ops</h2>
            <p className="text-[11px] text-muted-foreground uppercase font-medium">GovOps Console</p>
          </div>
        </div>
        <button 
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-md hover:bg-muted text-muted-foreground"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(link => {
          const isActive = location.pathname === link.to || (link.to !== "/admin/dashboard" && location.pathname.startsWith(link.to));
          return (
            <Link 
              key={link.to} 
              to={link.to} 
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border mt-auto">
        <div className="px-3 py-2 mb-2 rounded-lg bg-muted/50 border border-border/50 text-xs">
          <p className="font-medium text-foreground truncate">{user?.email || 'Officer'}</p>
          <p className="text-muted-foreground text-[11px]">{user?.role_name || 'Administrator'}</p>
        </div>
        <button 
          onClick={handleLogout} 
          className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border flex-col shrink-0 shadow-sm">
        {navContent}
      </aside>

      {/* Mobile Slide-over Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-card border-r border-border shadow-xl z-50 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="border-b border-border bg-card/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-md hover:bg-muted text-foreground"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className="hidden sm:inline">Telangana GovOps Workspace</span>
              <span className="h-1 w-1 rounded-full bg-emerald-500"></span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">LIVE CONNECTED</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
