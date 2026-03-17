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
    return <div className="min-h-screen bg-brand-bg flex items-center justify-center text-brand-muted">Loading...</div>;
  }

  // Determine user role logic. Assuming it is stored in the context under user.role
  const userRole = user?.role || 'user';

  if (!user || !allowedRoles.includes(userRole)) {
    // If not logged in, or not allowed, redirect to root
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return (
    <div className="flex flex-col h-screen bg-brand-bg overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 bg-brand-elevated border-b border-brand-border shrink-0">
        <Link to={`/${userRole}`} className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-glow">
            <Leaf size={18}/>
          </div>
          <span className="font-display font-bold text-xl gradient-text">AgriVerify</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="h-5 w-[1px] bg-brand-subtle"></div>
          <LanguageToggle />
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar role={userRole} />
        
        <main className="flex-1 overflow-y-auto bg-brand-surface relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
