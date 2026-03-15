import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import LanguageToggle from './LanguageToggle';

export default function DashboardLayout({ allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen bg-[hsl(220,16%,10%)] flex items-center justify-center text-slate-400">Loading...</div>;
  }

  // Determine user role logic. Assuming it is stored in the context under user.role
  const userRole = user?.role || 'user';

  if (!user || !allowedRoles.includes(userRole)) {
    // If not logged in, or not allowed, redirect to root
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return (
    <div className="flex flex-col h-screen bg-[hsl(220,16%,10%)] overflow-hidden">
      <Navbar />
      <div className="flex justify-end px-6 py-1.5 bg-[hsl(220,16%,12%)] border-b border-[hsl(220,14%,20%)]">
        <LanguageToggle />
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar role={userRole} />
        
        <main className="flex-1 overflow-y-auto bg-[hsl(220,14%,14%)] relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
