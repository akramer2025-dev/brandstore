"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface VendorNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  orderId?: string;
}

interface CustomerNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  orderId?: string;
}

type Notification = (VendorNotification | CustomerNotification) & {
  source: 'vendor' | 'customer';
};

export function NotificationsDropdown({ role }: { role?: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // ADMIN و DEVELOPER لا يحتاجون إشعارات
    if (role === 'ADMIN' || role === 'DEVELOPER') {
      return;
    }
    
    fetchNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [role]);

  const fetchNotifications = async () => {
    if (!role || role === 'ADMIN' || role === 'DEVELOPER') return;
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/notifications');
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.notifications?.filter((n: Notification) => !n.isRead).length || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string, source: 'vendor' | 'customer') => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true, source }),
      });
      
      // Update UI
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // ADMIN و DEVELOPER لا يحتاجون عرض الإشعارات
  if (role === 'ADMIN' || role === 'DEVELOPER') {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-gray-300 hover:text-yellow-400 hover:bg-yellow-900/30 hover:scale-110 transition-all duration-300 w-8 h-8 sm:w-10 sm:h-10"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          {unreadCount > 0 && (
            <>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-80 sm:w-96 bg-gray-800 border-teal-500/20 max-h-[500px] overflow-y-auto"
      >
        <div className="px-4 py-3 border-b border-teal-500/20">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold">الإشعارات</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                تعليم الكل كمقروء
              </button>
            )}
          </div>
          {unreadCount > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              {unreadCount} إشعار غير مقروء
            </p>
          )}
        </div>
        
        {isLoading ? (
          <div className="px-4 py-8 text-center text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
            <p className="mt-2 text-sm">جاري التحميل...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-400">
            <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">لا توجد إشعارات</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => {
                  if (!notification.isRead) {
                    markAsRead(notification.id, notification.source);
                  }
                  if (notification.orderId) {
                    window.location.href = role === 'VENDOR' 
                      ? `/vendor/orders/${notification.orderId}`
                      : `/orders/${notification.orderId}`;
                  }
                }}
                className={`px-4 py-3 cursor-pointer transition-colors ${
                  notification.isRead 
                    ? 'text-gray-400 hover:bg-gray-700/50' 
                    : 'text-white bg-teal-900/20 hover:bg-teal-900/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                    notification.isRead ? 'bg-gray-600' : 'bg-orange-500 animate-pulse'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${
                      notification.isRead ? 'text-gray-300' : 'text-white'
                    }`}>
                      {notification.title}
                    </p>
                    <p className={`text-xs mt-1 line-clamp-2 ${
                      notification.isRead ? 'text-gray-500' : 'text-gray-300'
                    }`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { 
                        addSuffix: true, 
                        locale: ar 
                      })}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-teal-500/20" />
            <div className="px-4 py-2 text-center">
              <button className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                عرض جميع الإشعارات
              </button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
