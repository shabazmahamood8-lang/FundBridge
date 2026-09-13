import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Coins,
  LogOut,
  LayoutDashboard,
  Compass,
  Menu,
  X,
  Code2,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import NotificationDropdown from './NotificationDropdown.js';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setUserDropdownOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group cursor-pointer"
            id="brand-logo"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
              Fund<span className="text-teal-600">Bridge</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/campaigns"
              className={`text-sm font-medium transition-colors hover:text-teal-600 flex items-center gap-1.5 ${
                isActive('/campaigns') ? 'text-teal-600 font-semibold' : 'text-slate-600'
              }`}
            >
              <Compass className="w-4 h-4" />
              Explore Campaigns
            </Link>

            <a
              href="https://github.com/fundbridge/fundbridge-client"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5"
            >
              <Code2 className="w-4 h-4 text-slate-400" />
              Join as Developer
            </a>
          </nav>

          {/* User Controls */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {/* Available Credits Pill */}
                <Link
                  to={user.role === 'creator' ? '/dashboard/withdrawals' : '/dashboard/purchase-credit'}
                  className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-50/80 hover:bg-amber-100 border border-amber-200/60 rounded-full transition-all group"
                  title="View wallet & credits"
                >
                  <Coins className="w-4 h-4 text-amber-600 group-hover:rotate-12 transition-transform" />
                  <span className="text-xs font-bold text-amber-900">
                    {user.credits} <span className="font-medium text-amber-700">Credits</span>
                  </span>
                </Link>

                {/* Notifications */}
                <NotificationDropdown />

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 p-1 pl-2 pr-3 rounded-full hover:bg-slate-100 border border-slate-200/80 transition-all cursor-pointer"
                  >
                    <img
                      src={user.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D9488&color=fff`}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <span className="text-xs font-semibold text-slate-800 max-w-[110px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
                          {user.role}
                        </span>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-600 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-teal-600 px-3 py-2 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-xl shadow-sm shadow-teal-600/20 transition-all hover:shadow"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 md:hidden">
            {user && (
              <Link
                to={user.role === 'creator' ? '/dashboard/withdrawals' : '/dashboard/purchase-credit'}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-800"
              >
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                {user.credits}
              </Link>
            )}

            {user && <NotificationDropdown />}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/campaigns"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 py-2.5 text-sm font-medium text-slate-700 hover:text-teal-600"
          >
            <Compass className="w-4 h-4" />
            Explore Campaigns
          </Link>

          <a
            href="https://github.com/fundbridge/fundbridge-client"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 py-2.5 text-sm font-medium text-slate-700 hover:text-teal-600"
          >
            <Code2 className="w-4 h-4" />
            Join as Developer
          </a>

          {user ? (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-3 py-2">
                <img
                  src={user.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D9488&color=fff`}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-bold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                </div>
              </div>

              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 py-2 text-sm font-semibold text-teal-600"
              >
                <LayoutDashboard className="w-4 h-4" />
                Go to Dashboard
              </Link>

              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 py-2 text-sm font-semibold text-rose-600 text-left"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 text-sm font-semibold text-white bg-teal-600 rounded-xl"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
