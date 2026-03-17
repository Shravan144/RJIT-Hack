import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { sidebarConfig } from '../config/sidebarConfig';
import { Menu, ChevronLeft, User, LogOut, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Sidebar({ role }) {
  const [collapsed, setCollapsed] = useState(false);
  const links = sidebarConfig[role] || [];
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully', { duration: 1500, position: 'top-right' });
    navigate('/');
  };

  if (!role) return null;

  return (
    <div className={`relative flex flex-col bg-brand-surface border-r border-brand-border transition-all duration-300 z-20 shrink-0 ${collapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Mobile Overlay Handle */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 bg-brand-surface border border-brand-border text-brand-muted rounded-full p-1.5 hover:text-emerald-600 hover:border-emerald-500 hover:bg-emerald-50 transition-all z-30 hidden md:block shadow-sm"
      >
        {collapsed ? <Menu size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Header - User Profile */}
      <div className={`flex items-center p-5 border-b border-brand-subtle bg-brand-bg/50 ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100/50 text-emerald-600 shrink-0 border border-emerald-200/50">
          <User size={20} className="stroke-2" />
        </div>
        {!collapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold text-brand-base truncate">
              {user?.first_name || user?.username || 'User'}
            </span>
            <span className="text-[10px] text-emerald-600 uppercase tracking-widest font-bold mt-0.5">
              {role}
            </span>
          </div>
        )}
      </div>

      {/* Links */}
      <div className="flex-1 py-6 px-4 flex flex-col gap-2 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `
              flex items-center gap-3.5 px-3 py-3 rounded-xl transition-all font-bold text-sm group
              ${isActive 
                ? 'bg-emerald-50/50 text-emerald-700 shadow-sm border border-emerald-100/50' 
                : 'text-brand-muted hover:bg-brand-bg hover:text-brand-base border border-transparent'}
              ${collapsed ? 'justify-center' : 'justify-start'}
            `}
            title={collapsed ? link.label : undefined}
          >
            {({ isActive }) => (
              <>
                <span className={`shrink-0 ${collapsed ? 'mr-0' : ''} ${isActive ? 'text-emerald-600' : 'group-hover:text-emerald-500 text-brand-muted'}`}>
                  {link.icon}
                </span>
                {!collapsed && <span className="truncate">{link.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-brand-subtle mt-auto bg-brand-bg/50">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl transition-all font-bold text-sm text-red-500 hover:bg-red-500/10 hover:text-red-600 hover:shadow-sm border border-transparent hover:border-red-500/20 group ${collapsed ? 'justify-center' : 'justify-start'}`}
          title={collapsed ? "Logout" : undefined}
        >
          <span className={`shrink-0 ${collapsed ? 'mr-0' : ''}`}>
             <LogOut size={18} className="stroke-2" />
          </span>
          {!collapsed && <span className="truncate">Logout</span>}
        </button>
      </div>
    </div>
  );
}
