import React, { useState } from 'react';
import {
  LayoutDashboard,
  Film,
  Users,
  MessageSquare,
  Grid,
  Settings,
  ArrowLeft,
  LogOut,
  Shield,
  ShieldAlert,
  Lock,
  Menu,
  X,
  Clapperboard,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMovies } from '../../context/MovieContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminMovies } from './AdminMovies';
import { AdminUsers } from './AdminUsers';
import { AdminComments } from './AdminComments';
import { AdminGenres } from './AdminGenres';
import { AdminSettings } from './AdminSettings';

type AdminSection = 'dashboard' | 'movies' | 'users' | 'comments' | 'genres' | 'settings';

export const AdminPanel: React.FC = () => {
  const { user, profile, isAdmin, loading, openAuthModal, logOut } = useAuth();
  const { setActiveTab } = useMovies();

  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070a] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-zinc-400">Verifying administrative security credentials...</p>
        </div>
      </div>
    );
  }

  // 2. Logged Out State
  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 animate-fade-in">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#0c0c16] border border-zinc-800 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-purple-950/60 border border-purple-800/80 flex items-center justify-center mx-auto text-purple-400">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Admin Access Guard
            </span>
            <h2 className="text-2xl font-black text-white">Administrator Login Required</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              The MovieFlix Administrative Console requires an authorized administrator session. Please sign in with an administrative account.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => openAuthModal('login', 'Sign in with administrator credentials.')}
              className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-purple-600 via-rose-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-900/30 transition cursor-pointer"
            >
              Sign In to Continue
            </button>

            <button
              onClick={() => setActiveTab('home')}
              className="w-full py-2.5 rounded-xl font-semibold text-xs text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition cursor-pointer"
            >
              Return to Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Logged In but Not Admin -> Access Denied
  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 animate-fade-in">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#0c0c16] border border-rose-900/40 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800/80 flex items-center justify-center mx-auto text-rose-400">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
              Access Denied
            </span>
            <h2 className="text-2xl font-black text-white">Unauthorized Access</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your account (<strong className="text-zinc-200">{user.email}</strong>) does not have administrator privileges. Only verified administrators can access the command console.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-[11px] text-zinc-400 text-left space-y-1">
            <span className="text-zinc-500 font-semibold block">Security Audit Note:</span>
            <p>Access attempts to /admin are logged and verified cryptographically through Firebase Security Rules.</p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setActiveTab('home')}
              className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-zinc-800 hover:bg-zinc-700 transition cursor-pointer"
            >
              Return to MovieFlix Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authenticated Administrator -> Full Admin Console
  const navItems: { id: AdminSection; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'movies', label: 'Movies Catalog', icon: Film },
    { id: 'users', label: 'Users & Roles', icon: Users },
    { id: 'comments', label: 'Comments Moderation', icon: MessageSquare },
    { id: 'genres', label: 'Genres & Categories', icon: Grid },
    { id: 'settings', label: 'Admin Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#06060a] text-zinc-100 flex flex-col pb-16 md:pb-0">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-30 w-full bg-[#08080f]/95 backdrop-blur-xl border-b border-zinc-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
              className="md:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white"
            >
              {isMobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setActiveSection('dashboard')}
              className="flex items-center gap-2 text-left cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 via-rose-600 to-amber-500 p-[1px] flex items-center justify-center">
                <div className="w-full h-full bg-[#0a0a12] rounded-[7px] flex items-center justify-center">
                  <Clapperboard className="w-4 h-4 text-rose-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-white text-base sm:text-lg tracking-tight">
                    Cine<span className="text-purple-400">Vault</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    ADMIN
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Right Header Admin Session Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Website</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-zinc-800 text-xs">
              <img
                src={profile?.avatar || user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt="Admin"
                className="w-7 h-7 rounded-full object-cover ring-2 ring-purple-500"
              />
              <span className="font-semibold text-zinc-200 truncate max-w-[120px]">
                {profile?.username || 'Admin'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Body with Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 flex-shrink-0 space-y-6">
          <div className="p-4 rounded-2xl bg-[#09090f]/70 border border-zinc-800/90 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-3 block mb-2">
              Console Menu
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-[#09090f]/70 border border-zinc-800/90 space-y-2 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
              Quick Shortcuts
            </span>
            <button
              onClick={() => setActiveTab('home')}
              className="w-full flex items-center gap-2 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-zinc-500" />
              <span>MovieFlix Home</span>
            </button>
            <button
              onClick={async () => {
                await logOut();
                setActiveTab('home');
              }}
              className="w-full flex items-center gap-2 p-2 rounded-lg text-rose-400 hover:bg-rose-950/30 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out Session</span>
            </button>
          </div>
        </aside>

        {/* Mobile Slide-Out Drawer */}
        {isMobileDrawerOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-md">
            <div className="w-72 h-full bg-[#0b0b13] border-r border-zinc-800 p-6 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <span className="font-black text-white text-base">Admin Navigation</span>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        setIsMobileDrawerOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold ${
                        isActive
                          ? 'bg-purple-600 text-white'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-zinc-800 space-y-2 text-xs">
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    setActiveTab('home');
                  }}
                  className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900 text-zinc-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Website</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {activeSection === 'dashboard' && (
            <AdminDashboard
              onNavigateSection={(sec) => setActiveSection(sec)}
              onOpenAddMovie={() => setActiveSection('movies')}
            />
          )}

          {activeSection === 'movies' && <AdminMovies />}

          {activeSection === 'users' && <AdminUsers />}

          {activeSection === 'comments' && <AdminComments />}

          {activeSection === 'genres' && <AdminGenres />}

          {activeSection === 'settings' && (
            <AdminSettings onBackToSite={() => setActiveTab('home')} />
          )}
        </main>
      </div>
    </div>
  );
};
