import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, LogOut, Sparkles, Github, Linkedin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SOCIAL_LINKS = {
  github: 'https://github.com/ExplorerAditya',
  linkedin: 'https://www.linkedin.com/in/aditya-singh-explorer/',
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = (user?.name || '?')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="relative min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-border bg-paper-soft/50 backdrop-blur-sm flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-ink text-paper grid place-items-center font-display text-lg font-semibold">
              T
            </div>
            <div>
              <div className="font-display text-lg font-semibold leading-none">Tessera</div>
              <div className="text-[10px] text-ink-muted uppercase tracking-widest mt-1">
                Task Manager
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" end />
          <NavItem to="/projects" icon={FolderKanban} label="Projects" />
        </nav>

        <div className="p-4 border-t border-border space-y-3">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-9 h-9 rounded-full bg-ink text-paper grid place-items-center text-sm font-semibold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.name}</div>
              <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                {user?.role === 'Admin' && (
                  <Sparkles className="w-3 h-3 text-accent" />
                )}
                <span>{user?.role}</span>
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-ghost w-full justify-start">
            <LogOut className="w-4 h-4" />
            Sign out
          </button>

          {/* Social links */}
          <div className="flex items-center gap-1 px-2 pt-1">
            <a
              href={SOCIAL_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md text-ink-muted hover:text-ink hover:bg-paper-card transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href={SOCIAL_LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md text-ink-muted hover:text-ink hover:bg-paper-card transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <span className="text-[10px] text-ink-muted/50 ml-1 uppercase tracking-widest">
              Built by Aditya
            </span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 relative z-10 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ to, icon: Icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive
            ? 'bg-ink text-paper shadow-soft'
            : 'text-ink-muted hover:text-ink hover:bg-paper-card'
        }`
      }
    >
      <Icon className="w-4 h-4" />
      {label}
    </NavLink>
  );
}
