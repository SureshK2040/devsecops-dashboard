import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  FolderGit2,
  CheckSquare,
  GitPullRequest,
  Rocket,
  ShieldAlert,
  History,
  Bell,
  Sun,
  Moon,
  LogOut,
  Search,
  Menu,
  X,
  User as UserIcon
} from 'lucide-react';
import api from '../api/client';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderGit2 },
    { name: 'Tasks (Kanban)', path: '/tasks', icon: CheckSquare },
    { name: 'Pipelines', path: '/pipelines', icon: GitPullRequest },
    { name: 'Deployments', path: '/deployments', icon: Rocket },
    { name: 'DevSecOps Security', path: '/security', icon: ShieldAlert },
    { name: 'Audit Logs', path: '/audit', icon: History },
    { name: 'Notifications', path: '/notifications', icon: Bell },
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const res = await api.get(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.data);
      setSearchOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg text-slate-800 dark:text-slate-100 flex transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-dark-card border-r border-slate-200 dark:border-dark-border flex flex-col transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 font-bold text-lg">
              🛡️
            </div>
            <div>
              <span className="font-bold text-base bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent">
                DevSecOps
              </span>
              <span className="text-xs block text-slate-400 dark:text-slate-400 -mt-1 font-mono">Platform v1.0</span>
            </div>
          </div>
          <button
            className="lg:hidden text-slate-400 hover:text-slate-200"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-hover hover:text-slate-900 dark:hover:text-slate-200'
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                {user?.username?.substring(0, 2).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate leading-tight">{user?.username}</p>
                <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-500 font-mono">
                  {user?.role}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-dark-card border-b border-slate-200 dark:border-dark-border px-4 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-hover rounded-lg"
            >
              <Menu size={20} />
            </button>

            {/* Global Search Bar */}
            <form onSubmit={handleSearch} className="relative w-full">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects, tasks, pipelines, users... (Press Enter)"
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-dark-bg border border-slate-200 dark:border-dark-border text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </form>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-hover transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications shortcut */}
            <button
              onClick={() => navigate('/notifications')}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-hover relative transition-colors"
              title="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-dark-card"></span>
            </button>
          </div>
        </header>

        {/* Search Results Modal */}
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
              <div className="p-4 border-b border-slate-200 dark:border-dark-border flex items-center justify-between">
                <h3 className="font-bold text-sm">Search Results for "{searchQuery}"</h3>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-4 overflow-y-auto space-y-4 text-xs">
                {searchResults?.projects?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-400 uppercase tracking-wider mb-2">Projects</h4>
                    <div className="space-y-1">
                      {searchResults.projects.map((p: any) => (
                        <div
                          key={p.id}
                          onClick={() => { setSearchOpen(false); navigate('/projects'); }}
                          className="p-2 rounded hover:bg-slate-100 dark:hover:bg-dark-hover cursor-pointer flex justify-between"
                        >
                          <span className="font-medium text-brand-500">{p.name}</span>
                          <span className="text-slate-400">{p.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {searchResults?.tasks?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-400 uppercase tracking-wider mb-2">Tasks</h4>
                    <div className="space-y-1">
                      {searchResults.tasks.map((t: any) => (
                        <div
                          key={t.id}
                          onClick={() => { setSearchOpen(false); navigate('/tasks'); }}
                          className="p-2 rounded hover:bg-slate-100 dark:hover:bg-dark-hover cursor-pointer flex justify-between"
                        >
                          <span>{t.title}</span>
                          <span className="px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 text-[10px]">{t.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {searchResults?.pipelines?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-400 uppercase tracking-wider mb-2">Pipelines</h4>
                    <div className="space-y-1">
                      {searchResults.pipelines.map((pip: any) => (
                        <div
                          key={pip.id}
                          onClick={() => { setSearchOpen(false); navigate('/pipelines'); }}
                          className="p-2 rounded hover:bg-slate-100 dark:hover:bg-dark-hover cursor-pointer flex justify-between"
                        >
                          <span>{pip.pipelineName} ({pip.branch})</span>
                          <span className="text-emerald-400 font-mono">{pip.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(!searchResults || (searchResults.projects?.length === 0 && searchResults.tasks?.length === 0 && searchResults.pipelines?.length === 0)) && (
                  <p className="text-center text-slate-400 py-6">No matching records found.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Page Content Body */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

