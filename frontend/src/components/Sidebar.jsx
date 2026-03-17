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
    <div className={`relative flex flex-col bg-brand-elevated border-r border-brand-border transition-all duration-300 z-20 shrink-0 ${collapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Mobile Overlay Handle */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 bg-brand-surface border border-brand-border text-brand-muted rounded-full p-1 hover:text-brand-base hover:border-green-400 hover:text-green-500 transition-all z-30 hidden md:block shadow-lg"
      >
        {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Header - User Profile */}
      <div className={`flex items-center p-4 border-b border-brand-border bg-brand-surface ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-elevated text-green-500 shrink-0 border border-brand-border">
          <User size={20} />
        </div>
        {!collapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="font-semibold text-brand-base truncate">
              {user?.first_name || user?.username || 'User'}
            </span>
            <span className="text-xs text-green-500 uppercase tracking-wider font-medium mt-0.5">
              {role}
            </span>
          </div>
        )}
      </div>

      {/* Links */}
      <div className="flex-1 py-6 px-3 flex flex-col gap-2 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `
              flex items-center gap-3.5 px-3 py-3 rounded-xl transition-all font-medium text-sm group
              ${isActive 
                ? 'bg-green-500 text-white shadow-[0_4px_12px_rgba(34,197,94,0.2)]' 
                : 'text-brand-muted hover:bg-brand-surface hover:text-brand-base'}
              ${collapsed ? 'justify-center' : 'justify-start'}
            `}
            title={collapsed ? link.label : undefined}
          >
            {({ isActive }) => (
              <>
                <span className={`shrink-0 ${collapsed ? 'mr-0' : ''} ${isActive ? 'text-white' : 'group-hover:text-green-500 text-brand-muted'}`}>
                  {link.icon}
                </span>
                {!collapsed && <span className="truncate">{link.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-brand-border mt-auto">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl transition-all font-medium text-sm text-red-400 hover:bg-red-400/10 hover:text-red-500 group ${collapsed ? 'justify-center' : 'justify-start'}`}
          title={collapsed ? "Logout" : undefined}
        >
          <span className={`shrink-0 ${collapsed ? 'mr-0' : ''}`}>
             <LogOut size={20} />
          </span>
          {!collapsed && <span className="truncate">Logout</span>}
        </button>
      </div>
    </div>
  );
}
