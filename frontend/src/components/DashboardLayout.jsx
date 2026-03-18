import { Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import LanguageToggle from './LanguageToggle';
import ThemeToggle from './ThemeToggle';

export default function DashboardLayout({ allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center text-brand-muted gap-4">
        <div className="w-8 h-8 rounded-full border-4 border-brand-border border-t-emerald-500 animate-spin" />
        <span className="text-sm font-bold tracking-widest uppercase">Loading System...</span>
      </div>
    );
  }

  const userRole = user?.role || 'user';
  const roleBadgeText = userRole === 'inspector' ? 'Inspector Desk' : 'Admin Central';

  if (!user || !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return (
    <div className="flex flex-col h-screen bg-brand-bg overflow-hidden text-brand-base">
      <div className="flex items-center justify-between px-6 py-3 bg-brand-surface border-b border-brand-border shrink-0 shadow-sm z-50">
        <Link to={`/${userRole}`} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md group-hover:bg-emerald-700 transition-colors">
            <Leaf size={18} strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
             <span className="font-display font-bold text-xl text-brand-base tracking-tight">AgriVerify</span>
             <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-emerald-600 mt-0.5">{roleBadgeText}</p>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="h-6 w-px bg-brand-border"></div>
          <LanguageToggle />
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar role={userRole} />
        
        <main className="flex-1 overflow-y-auto bg-brand-bg relative p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
