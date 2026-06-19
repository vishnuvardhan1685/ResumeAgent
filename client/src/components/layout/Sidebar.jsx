import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FileText, Briefcase, BarChart2, ClipboardList,
  Compass, Settings, HelpCircle, Plus, Bot,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const NAV_ITEMS = [
  { to: '/resumes',      icon: FileText,      label: 'Resumes' },
  { to: '/jobs',         icon: Briefcase,     label: 'Jobs' },
  { to: '/analyze',      icon: BarChart2,     label: 'Analyze' },
  { to: '/match-report', icon: ClipboardList, label: 'Match Report' },
  { to: '/discover',     icon: Compass,       label: 'Job Discovery' },
];

const BOTTOM_ITEMS = [
  { to: '/settings', icon: Settings,    label: 'Settings' },
  { to: '/support',  icon: HelpCircle,  label: 'Support' },
];

const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-100 mb-0.5 group border
      ${isActive
        ? 'bg-accent/15 text-text-primary border-accent/20'
        : 'text-text-secondary hover:bg-elevated hover:text-text-primary border-transparent'
      }`
    }
  >
    {({ isActive }) => (
      <>
        <Icon size={16} className={isActive ? 'text-accent' : 'text-text-muted group-hover:text-text-secondary'} />
        {label}
      </>
    )}
  </NavLink>
);

const Sidebar = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  return (
    <aside className="w-[220px] shrink-0 h-screen flex flex-col bg-surface border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <div className="flex items-center justify-center border w-9 h-9 rounded-xl bg-accent/20 border-accent/30">
          <Bot size={18} className="text-accent" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight text-text-primary">AgenticAI</p>
          <p className="font-mono tracking-widest uppercase text-2xs text-text-muted">
            Resume Analysis v2.4
          </p>
        </div>
      </div>

      {/* New Analysis CTA */}
      <div className="px-3 pt-4 pb-2">
        <button
          onClick={() => navigate('/analyze')}
          className="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg shadow-lg bg-accent hover:bg-accent-hover shadow-accent/20"
        >
          <Plus size={15} />
          New Analysis
        </button>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => <NavItem key={item.to} {...item} />)}
      </nav>

      {/* Bottom: settings + support + user strip */}
      <div className="px-2 py-2 border-t border-border">
        {BOTTOM_ITEMS.map((item) => <NavItem key={item.to} {...item} />)}

        {user && (
          <div className="flex items-center gap-3 px-3 py-2.5 mt-1">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="rounded-full w-7 h-7 shrink-0" />
            ) : (
              <div className="flex items-center justify-center text-xs font-bold border rounded-full w-7 h-7 bg-accent/20 border-accent/30 text-accent shrink-0">
                {user.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-xs font-medium truncate text-text-primary">{user.name}</p>
              <p className="truncate text-2xs text-text-muted">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;