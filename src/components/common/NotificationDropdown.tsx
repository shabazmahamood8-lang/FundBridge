import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markNotificationAsRead, markAllNotificationsRead } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = async (notif: any) => {
    if (!notif.read) {
      await markNotificationAsRead(notif._id);
    }
    setIsOpen(false);
    if (notif.actionRoute) {
      navigate(notif.actionRoute);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-teal-600 rounded-full ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          id="notification-panel"
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-150 py-3 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-800">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[11px] font-semibold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                <p className="text-xs font-medium">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`px-4 py-3 cursor-pointer transition-colors flex items-start justify-between gap-3 ${
                    !notif.read ? 'bg-teal-50/50 hover:bg-teal-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs leading-relaxed ${
                        !notif.read ? 'font-semibold text-slate-900' : 'font-normal text-slate-600'
                      }`}
                    >
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 inline-block">
                      {new Date(notif.time || notif.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {!notif.read ? (
                    <span className="w-2 h-2 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                  ) : (
                    <ExternalLink className="w-3 h-3 text-slate-300 mt-1.5 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
