import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Check, X, Clock, ArrowRight, AlertCircle, FileText, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { 
  useNotifications, 
  useUnreadNotificationCount, 
  useMarkNotificationRead 
} from '../../hooks/useNotifications';
import { useAuthStore } from '../../store/authStore';
import { Skeleton } from '../ui/Skeleton';
import type { NotificationItem } from '../../lib/api';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const user = useAuthStore(state => state.user);
  const { data: notifications, isLoading, isError } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const markReadMutation = useMarkNotificationRead();

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.is_read) {
      markReadMutation.mutate(item.id);
    }
    setIsOpen(false);

    // Navigate to appropriate applications view
    const isOfficer = user && [1, 2, 3, 5].includes(user.role_id);
    if (isOfficer) {
      navigate('/admin/applications');
    } else {
      navigate('/dashboard/applications');
    }
  };

  const handleMarkAsReadOnly = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    markReadMutation.mutate(id);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return dateStr;
    }
  };

  const getNotificationIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('approved')) return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
    if (t.includes('reject') || t.includes('update')) return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
    if (t.includes('review')) return <Clock className="w-4 h-4 text-indigo-500 shrink-0" />;
    return <FileText className="w-4 h-4 text-blue-500 shrink-0" />;
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-card animate-in zoom-in duration-200">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-border/70 bg-card/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden text-card-foreground animate-in fade-in zoom-in-95 duration-150 origin-top-right"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[11px] font-semibold bg-primary/15 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-border/40">
            {isLoading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>
            ) : isError ? (
              <div className="p-6 text-center text-sm text-destructive flex flex-col items-center gap-2">
                <AlertCircle className="w-6 h-6 text-destructive/80" />
                <span>Failed to load notifications. Please try again.</span>
              </div>
            ) : !notifications || notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center mb-3">
                  <Bell className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-semibold text-foreground">No notifications</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">
                  Updates on your scheme applications will appear here in real time.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors group ${
                    !item.is_read 
                      ? 'bg-primary/5 hover:bg-primary/10 border-l-2 border-l-primary' 
                      : 'hover:bg-muted/40'
                  }`}
                >
                  <div className="mt-0.5">
                    {getNotificationIcon(item.title)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <p className={`text-xs font-semibold truncate ${!item.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {item.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-1">
                      <span className="inline-flex items-center text-[11px] font-medium text-primary group-hover:underline">
                        View Details <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                      {!item.is_read && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsReadOnly(e, item.id)}
                          className="text-[10px] font-medium text-muted-foreground hover:text-foreground px-2 py-0.5 rounded hover:bg-muted transition-colors flex items-center gap-1"
                          title="Mark as read"
                        >
                          <Check className="w-3 h-3" /> Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications && notifications.length > 0 && (
            <div className="p-2 border-t border-border/50 bg-muted/20 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  const isOfficer = user && [1, 2, 3, 5].includes(user.role_id);
                  navigate(isOfficer ? '/admin/applications' : '/dashboard/applications');
                }}
                className="text-xs font-medium text-primary hover:underline py-1 w-full"
              >
                Go to Applications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
