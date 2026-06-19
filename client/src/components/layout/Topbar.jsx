import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Clock, ChevronDown, LogOut, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const SEARCH_PLACEHOLDERS = {
  '/resumes': 'Search resumes...',
  '/jobs': 'Search job descriptions...',
  '/analyze': 'Search analyses...',
  '/match-report': 'Search reports...',
  '/discover': 'Search opportunities...',
};

// Fake recent activity — replace with real data when backend ready
const RECENT_ITEMS = [
  { label: 'Analyzed: Senior Frontend Engineer', time: '2h ago', type: 'analyze' },
  { label: 'Uploaded: Vishnu_Resume_2025.pdf', time: '3h ago', type: 'upload' },
  { label: 'Saved: Staff ML Engineer @ Anthropic', time: 'Yesterday', type: 'job' },
];

const Topbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const profileRef = useRef(null);
  const historyRef = useRef(null);

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const placeholder = SEARCH_PLACEHOLDERS[pathname] ?? 'Search...';

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (historyRef.current && !historyRef.current.contains(e.target)) setHistoryOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 border-b h-14 border-border bg-surface/80 backdrop-blur-sm shrink-0">
      <h1 className="text-base font-semibold text-text-primary">Resume Intelligence</h1>

      {/* Search */}
      <div className="relative w-72">
        <Search size={14} className="absolute -translate-y-1/2 pointer-events-none left-3 top-1/2 text-text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full h-8 pl-8 pr-3 text-sm transition-colors border rounded-lg bg-elevated border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Notifications — static for now */}
        <button className="relative flex items-center justify-center w-8 h-8 transition-colors rounded-lg text-text-secondary hover:text-text-primary hover:bg-elevated">
          <Bell size={16} />
          {/* Uncomment when notification system is ready:
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
          */}
        </button>

        {/* Recent history dropdown */}
        <div className="relative" ref={historyRef}>
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors
              ${historyOpen ? 'bg-elevated text-text-primary' : 'text-text-secondary hover:text-text-primary hover:bg-elevated'}`}
          >
            <Clock size={16} />
          </button>

          {historyOpen && (
            <div className="absolute right-0 z-50 py-2 border shadow-xl top-10 w-72 bg-elevated border-border rounded-xl animate-fade-in">
              <p className="px-4 py-2 font-mono tracking-widest uppercase text-2xs text-text-muted">
                Recent Activity
              </p>
              {RECENT_ITEMS.map((item, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-2.5 hover:bg-hover transition-colors cursor-default">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs text-text-primary">{item.label}</p>
                    <p className="text-2xs text-text-muted mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
              <div className="px-3 pt-1 mt-1 border-t border-border">
                <p className="py-1 text-center text-2xs text-text-muted">
                  Full history coming soon
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className={`flex items-center gap-2 h-8 pl-1 pr-2 rounded-lg transition-colors
              ${profileOpen ? 'bg-elevated' : 'hover:bg-elevated'}`}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
            ) : (
              <div className="flex items-center justify-center w-6 h-6 font-bold border rounded-full bg-accent/20 border-accent/30 text-2xs text-accent">
                {initials}
              </div>
            )}
            <ChevronDown size={12} className={`text-text-muted transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 z-50 py-2 border shadow-xl top-10 w-52 bg-elevated border-border rounded-xl animate-fade-in">
              {/* User info */}
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium truncate text-text-primary">{user?.name ?? 'User'}</p>
                <p className="text-2xs text-text-muted truncate mt-0.5">{user?.email ?? ''}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => { navigate('/settings'); setProfileOpen(false); }}
                  className="flex items-center w-full gap-3 px-4 py-2 text-sm transition-colors text-text-secondary hover:text-text-primary hover:bg-hover"
                >
                  <Settings size={14} />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full gap-3 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;