import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import api from '../services/api.js';
import { User, NotificationItem } from '../types/index.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role: string; photoUrl?: string }) => Promise<void>;
  googleLogin: (payload: { credential?: string; code?: string; role?: string; email?: string; name?: string; photoUrl?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateCredits: (newCredits: number) => void;
  notifications: NotificationItem[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('fundbridge_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchNotifications = useCallback(async () => {
    if (!localStorage.getItem('fundbridge_token')) return;
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      // ignore silently if not logged in
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const savedToken = localStorage.getItem('fundbridge_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/users/me');
      if (res.data.success) {
        setUser(res.data.user);
        await fetchNotifications();
      } else {
        localStorage.removeItem('fundbridge_token');
        setUser(null);
      }
    } catch (error) {
      console.warn('Failed to verify session:', error);
      localStorage.removeItem('fundbridge_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [fetchNotifications]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('fundbridge_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      await fetchNotifications();
    }
  };

  const register = async (data: { name: string; email: string; password: string; role: string; photoUrl?: string }) => {
    const res = await api.post('/auth/register', data);
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('fundbridge_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      await fetchNotifications();
    }
  };

  const googleLogin = async (payload: { credential?: string; code?: string; role?: string; email?: string; name?: string; photoUrl?: string }) => {
    const res = await api.post('/auth/google', payload);
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('fundbridge_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      await fetchNotifications();
    }
  };

  const logout = () => {
    localStorage.removeItem('fundbridge_token');
    setToken(null);
    setUser(null);
    setNotifications([]);
  };

  const updateCredits = (newCredits: number) => {
    if (user) {
      setUser({ ...user, credits: newCredits });
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        googleLogin,
        logout,
        refreshUser,
        updateCredits,
        notifications,
        unreadCount,
        fetchNotifications,
        markNotificationAsRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
