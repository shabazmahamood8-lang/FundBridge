import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FolderKanban,
  Wallet,
  Receipt,
  Compass,
  HeartHandshake,
  Coins,
  Users,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role-specific navigation items
  const creatorLinks = [
    { name: 'Overview', to: '/dashboard', icon: LayoutDashboard, end: true },
    { name: 'Add Campaign', to: '/dashboard/add-campaign', icon: PlusCircle },
    { name: 'My Campaigns', to: '/dashboard/my-campaigns', icon: FolderKanban },
    { name: 'Withdrawals', to: '/dashboard/withdrawals', icon: Wallet },
    { name: 'Payment History', to: '/dashboard/payment-history', icon: Receipt },
  ];

  const supporterLinks = [
    { name: 'Overview', to: '/dashboard', icon: LayoutDashboard, end: true },
    { name: 'Explore Campaigns', to: '/dashboard/explore', icon: Compass },
    { name: 'My Contributions', to: '/dashboard/my-contributions', icon: HeartHandshake },
    { name: 'Purchase Credits', to: '/dashboard/purchase-credit', icon: Coins },
    { name: 'Payment History', to: '/dashboard/payment-history', icon: Receipt },
  ];

  const adminLinks = [
    { name: 'Platform Overview', to: '/dashboard', icon: LayoutDashboard, end: true },
    { name: 'Manage Users', to: '/dashboard/manage-users', icon: Users },
    { name: 'Manage Campaigns', to: '/dashboard/manage-campaigns', icon: FolderKanban },
    { name: 'Withdrawal Requests', to: '/dashboard/withdrawal-requests', icon: Wallet },
    { name: 'Campaign Reports', to: '/dashboard/reports', icon: ShieldAlert },
  ];

  const navLinks =
    user.role === 'admin'
      ? adminLinks
      : user.role === 'creator'
      ? creatorLinks
      : supporterLinks;

  const roleColors: Record<string, { badge: string; text: string }> = {
    admin: { badge: 'bg-purple-100 text-purple-800 border-purple-200', text: 'Platform Administrator' },
    creator: { badge: 'bg-teal-100 text-teal-800 border-teal-200', text: 'Project Creator' },
    supporter: { badge: 'bg-amber-100 text-amber-800 border-amber-200', text: 'Impact Backer' },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Mobile Top Sub-Header */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Open navigation drawer"
          >
            {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            {user.role} Dashboard
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-600" />
            {user.credits}
          </span>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar (Desktop) */}
        <aside className="hidden lg:block lg:col-span-3 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs sticky top-24 space-y-6">
          {/* User Profile Card */}
          <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={user.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D9488&color=fff`}
                alt={user.name}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-teal-500/20"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
              <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] border ${roleColors[user.role]?.badge}`}>
                {user.role}
              </span>
              <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                {user.credits} Credits
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Menu Navigation
            </p>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom Logout */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileDrawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex">
            <div className="w-72 bg-white h-full p-5 space-y-6 shadow-2xl flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="font-extrabold text-sm text-slate-900">Dashboard Menu</span>
                  <button
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                  <p className="text-xs font-bold text-slate-900">{user.name}</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${roleColors[user.role]?.badge}`}>
                    {user.role}
                  </span>
                </div>

                <nav className="space-y-1">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.end}
                        onClick={() => setMobileDrawerOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                            isActive
                              ? 'bg-teal-600 text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4" />
                        <span>{link.name}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>

              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
            <div className="flex-1" onClick={() => setMobileDrawerOpen(false)} />
          </div>
        )}

        {/* Main Workspace Area */}
        <main className="lg:col-span-9 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
