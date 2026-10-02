import React, { useState } from 'react';
import { Film, Search, Bookmark, User as UserIcon, Sparkles, X, Clapperboard, LogIn, Shield } from 'lucide-react';
import { useMovies } from '../context/MovieContext';
import { useAuth } from '../context/AuthContext';
import { AppTab } from '../types';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, filterState, setFilterState, watchlist, setIsProfileOpen } = useMovies();
  const { user, profile, isAdmin, openAuthModal } = useAuth();
  const [localSearch, setLocalSearch] = useState(filterState.searchQuery);
  const [isSearchOpenMobile, setIsSearchOpenMobile] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilterState((prev) => ({ ...prev, searchQuery: localSearch }));
    setActiveTab('movies');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    setFilterState((prev) => ({ ...prev, searchQuery: val }));
    if (val && activeTab !== 'movies' && activeTab !== 'details') {
      setActiveTab('movies');
    }
  };

  const clearSearch = () => {
    setLocalSearch('');
    setFilterState((prev) => ({ ...prev, searchQuery: '' }));
  };

  const navLinks: { id: AppTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'movies', label: 'Movies' },
    { id: 'genres', label: 'Genres' },
    { id: 'watchlist', label: 'Watchlist' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#08080db3] backdrop-blur-xl border-b border-zinc-800/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo */}
          <button
            onClick={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-rose-600 to-amber-500 p-[1.5px] shadow-lg shadow-purple-600/20 group-hover:shadow-rose-600/30 transition-all duration-300">
              <div className="w-full h-full bg-[#0b0b12] rounded-[10px] flex items-center justify-center">
                <Clapperboard className="w-5 h-5 text-rose-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-['Plus_Jakarta_Sans']">
                  Movie<span className="bg-gradient-to-r from-purple-400 via-rose-400 to-amber-400 bg-clip-text text-transparent">Flix</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 tracking-wider uppercase font-medium -mt-1 hidden sm:block">
                Cinematic Discovery
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveTab(link.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'text-white bg-zinc-800/90 shadow-sm border border-zinc-700/60'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/40'
                  }`}
                >
                  {link.label}
                  {link.id === 'watchlist' && watchlist.length > 0 && (
                    <span className="px-1.5 py-0.2 text-[11px] font-bold rounded-full bg-rose-600 text-white">
                      {watchlist.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Search Bar (Desktop) */}
          <div className="hidden sm:flex items-center flex-1 max-w-xs lg:max-w-md mx-2">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search movies, cast, directors..."
                value={localSearch}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-8 py-2 rounded-full text-xs lg:text-sm bg-zinc-900/90 text-zinc-100 placeholder-zinc-500 border border-zinc-700/70 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {localSearch && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsSearchOpenMobile(!isSearchOpenMobile)}
              className="sm:hidden p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/60 focus:outline-none"
              aria-label="Toggle Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Quick Watchlist Shortcut on Tablet/Desktop */}
            <button
              onClick={() => {
                setActiveTab('watchlist');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/60 transition cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5 text-rose-400" />
              <span>Watchlist</span>
              {watchlist.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                  {watchlist.length}
                </span>
              )}
            </button>

            {/* User Profile or Sign In / Register Buttons */}
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {isAdmin && (
                  <button
                    onClick={() => {
                      setActiveTab('admin');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition shadow-sm cursor-pointer border ${
                      activeTab === 'admin'
                        ? 'bg-purple-600 text-white border-purple-500 shadow-purple-900/40'
                        : 'bg-purple-950/70 hover:bg-purple-900/80 border-purple-500/50 text-purple-200'
                    }`}
                    title="Access Admin Console"
                  >
                    <Shield className="w-3.5 h-3.5 text-rose-400" />
                    <span className="hidden sm:inline">Admin</span>
                  </button>
                )}

                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-purple-500/40 hover:border-purple-500 text-xs text-zinc-200 transition-all cursor-pointer group"
                  title="Open Profile"
                >
                  <img
                    src={profile?.avatar || user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={profile?.username || user.displayName || 'User'}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-purple-500/50 group-hover:ring-rose-500"
                  />
                  <span className="hidden sm:inline font-medium max-w-[110px] truncate text-zinc-200">
                    {profile?.username || profile?.displayName || user.displayName?.split(' ')[0] || 'Member'}
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 via-rose-600 to-red-600 hover:from-purple-500 hover:to-red-500 text-white shadow-md shadow-purple-600/25 hover:shadow-rose-600/35 transition-all duration-200 cursor-pointer active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => openAuthModal('register')}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 transition cursor-pointer"
                >
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar Dropdown */}
        {isSearchOpenMobile && (
          <div className="sm:hidden pb-3 pt-1">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search movies, cast, genres..."
                value={localSearch}
                onChange={handleSearchChange}
                autoFocus
                className="w-full pl-9 pr-8 py-2 rounded-xl text-sm bg-zinc-900 text-zinc-100 placeholder-zinc-500 border border-zinc-700 focus:outline-none focus:border-purple-500"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {localSearch && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>
        )}
      </div>
    </header>
  );
};
