import { useState, useTransition } from 'react';
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
    toast.success('Logged out successfully');
    navigate('/');
    setDropdownOpen(false);
  };
  const { t, i18n } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
<<<<<<< HEAD
=======

>>>>>>> ba413a2f13f05691a83bc08c0c170ec1730b6eb6
  const navLinks = [
    { label: t('nav.dealers'), to: '/dealers' },
    { label: t('nav.products'), to: '/products' },
    { label: t('nav.report'), to: '/report' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-brand-bg/85 backdrop-blur-lg border-b border-brand-subtle">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">

        {/* Brand */}
        <Link to="/" id="nav-brand" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-glow">
            <Leaf size={18}/>
          </div>
          <span className="font-display font-bold text-xl gradient-text">AgriVerify</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-2 flex-wrap flex-1 justify-center px-4">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-brand-muted hover:text-brand-base hover:bg-brand-elevated transition-all">
              {l.label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link to="/admin"
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-amber-400 hover:bg-brand-elevated transition-all flex items-center gap-1">
              <Shield size={13} /> {t('nav.admin')}
            </Link>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          {user ? (
            <div className="relative">
              <button id="user-menu-btn"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-elevated border border-brand-border text-sm font-medium text-brand-base hover:border-green-400 transition-all"
                onClick={() => setDropdownOpen(o => !o)}>
                <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold">
                  {user.username[0].toUpperCase()}
                </div>
                <span className="hidden sm:inline">{user.username}</span>
                <ChevronDown size={13} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] bg-brand-elevated border border-brand-border rounded-xl p-2 min-w-40 shadow-2xl animate-fade-down">
                  <div className="px-2 py-1 text-[11px] uppercase tracking-widest text-brand-muted border-b border-brand-subtle mb-1">
                    {user.role}
                  </div>
                  <Link 
                    to={`/${user.role}`}
                    className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-100 hover:bg-[hsl(220,12%,18%)] transition-all mb-1"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User size={13} /> Dashboard
                  </Link>
                  <button id="logout-btn"
<<<<<<< HEAD
                    className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-[hsl(220,12%,18%)] transition-all"
=======
                    className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-sm text-brand-muted hover:text-brand-base hover:bg-brand-card transition-all"
>>>>>>> ba413a2f13f05691a83bc08c0c170ec1730b6eb6
                    onClick={handleLogout}>
                    <LogOut size={13} /> {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button id="nav-login-btn"
              onClick={onLoginClick}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-elevated border border-brand-border text-sm text-brand-muted hover:text-brand-base hover:border-green-400 transition-all">
              <User size={13} /> {t('nav.login')}
            </button>
          )}

          <button className="md:hidden text-brand-muted p-1.5 rounded-lg hover:bg-brand-elevated transition-all"
            id="mobile-menu-btn" onClick={() => setMobileOpen(o => !o)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-brand-surface border-t border-brand-subtle px-4 pb-4 pt-2 flex flex-col gap-1">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to}
              className="px-3 py-2.5 rounded-lg text-sm text-brand-muted hover:text-brand-base hover:bg-brand-elevated transition-all"
              onClick={() => setMobileOpen(false)}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}