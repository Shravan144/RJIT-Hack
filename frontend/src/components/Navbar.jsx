import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Menu, X, User, LogOut, Shield, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ onLoginClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully', { duration: 2000, position: 'top-right' });
    navigate('/');
    setDropdownOpen(false);
  };
  const { t, i18n } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const navLinks = [
    { label: t('nav.dealers'), to: '/dealers' },
    { label: t('nav.products'), to: '/products' },
    { label: t('nav.report'), to: '/report' },
  ];

  return (
    <nav className="sticky top-0 z-[9999] bg-brand-surface/80 backdrop-blur-xl border-b border-brand-border shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-5 md:px-6 h-[74px]">

        {/* Brand */}
        <Link to={user ? `/${user.role}` : "/"} id="nav-brand" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md group-hover:bg-emerald-700 transition-colors">
            <Leaf size={18} strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <span className="font-display font-bold text-[1.2rem] text-brand-base tracking-tight">AgriVerify</span>
            <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-emerald-600">Trust Ledger</p>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-1.5 flex-wrap flex-1 justify-center px-4">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to}
              className="px-4 py-2 rounded-full text-sm font-semibold text-brand-muted hover:text-brand-base hover:bg-brand-bg transition-all">
              {l.label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link to="/admin"
              className="px-4 py-2 rounded-full text-sm font-semibold text-amber-600 hover:bg-brand-bg transition-all flex items-center gap-1.5">
              <Shield size={14} /> {t('nav.admin')}
            </Link>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <div className="relative">
              <button id="user-menu-btn"
                className="flex items-center gap-2 px-2 py-1.5 pr-3 rounded-full bg-brand-surface border border-brand-border text-sm font-semibold text-brand-base hover:border-emerald-300 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                onClick={() => setDropdownOpen(o => !o)}>
                <div className="w-8 h-8 rounded-full bg-emerald-100/30 flex items-center justify-center text-emerald-600 text-xs font-bold shrink-0">
                  {user.username[0].toUpperCase()}
                </div>
                <span className="hidden sm:inline line-clamp-1 max-w-[120px]">{user.username}</span>
                <ChevronDown size={14} className="text-brand-muted" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-[9999] bg-brand-surface border border-brand-border rounded-xl p-2 min-w-48 shadow-lg animate-fadeIn origin-top-right">
                  <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-brand-muted border-b border-brand-subtle mb-1">
                    {user.role} Account
                  </div>
                  <Link 
                    to={`/${user.role}`}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-brand-muted hover:text-brand-base hover:bg-brand-bg transition-all mb-1"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User size={14} /> Dashboard
                  </Link>
                  <button id="logout-btn"
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all"
                    onClick={handleLogout}>
                    <LogOut size={14} /> {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button id="nav-login-btn"
              onClick={onLoginClick}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 border border-transparent text-sm font-bold text-white hover:bg-emerald-700 shadow-sm transition-all">
              <User size={14} /> {t('nav.login')}
            </button>
          )}

          <button className="lg:hidden text-brand-muted p-2 rounded-xl hover:bg-brand-bg transition-all"
            id="mobile-menu-btn" onClick={() => setMobileOpen(o => !o)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-brand-surface border-t border-brand-border px-4 pb-4 pt-2 flex flex-col gap-1 shadow-inner">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to}
              className="px-4 py-3 rounded-xl text-sm font-semibold text-brand-base hover:text-emerald-600 hover:bg-emerald-500/10 transition-all"
              onClick={() => setMobileOpen(false)}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}