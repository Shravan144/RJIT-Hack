import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { sidebarConfig } from '../config/sidebarConfig';
import { Menu, ChevronLeft, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ role }) {
  const [collapsed, setCollapsed] = useState(false);
  const links = sidebarConfig[role] || [];
  const { user } = useAuth();

  if (!role) return null;

  return (
    <div className={`relative flex flex-col bg-[#111] border-r border-[#1a1a1a] transition-all duration-300 z-20 shrink-0 ${collapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Mobile Overlay Handle */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 bg-[#1a1a1a] border border-[#222] text-slate-300 rounded-full p-1 hover:text-white hover:border-[#22c55e] hover:text-[#22c55e] transition-all z-30 hidden md:block shadow-lg"
      >
        {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Header - User Profile */}
      <div className={`flex items-center p-6 border-b border-[#1a1a1a] ${collapsed ? 'justify-center' : 'gap-4'}`}>
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1a1a1a] text-[#22c55e] shrink-0 outline outline-1 outline-offset-2 outline-[#1a1a1a]">
          <User size={20} />
        </div>
        {!collapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="font-semibold text-slate-100 truncate">
              {user?.first_name || user?.username || 'User'}
            </span>
            <span className="text-xs text-[#22c55e] uppercase tracking-wider font-medium mt-0.5">
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
                ? 'bg-[#22c55e] text-[#111] shadow-[0_4px_12px_rgba(34,197,94,0.2)]' 
                : 'text-slate-400 hover:bg-[#1a1a1a] hover:text-slate-200'}
              ${collapsed ? 'justify-center' : 'justify-start'}
            `}
            title={collapsed ? link.label : undefined}
          >
            {({ isActive }) => (
              <>
                <span className={`shrink-0 ${collapsed ? 'mr-0' : ''} ${isActive ? 'text-[#111]' : 'group-hover:text-[#22c55e] text-slate-400'}`}>
                  {link.icon}
                </span>
                {!collapsed && <span className="truncate">{link.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
