import React from 'react';
import { Home, Film, Grid, Bookmark, User, LogIn } from 'lucide-react';
import { useMovies } from '../context/MovieContext';
import { useAuth } from '../context/AuthContext';
import { AppTab } from '../types';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, watchlist, setIsProfileOpen } = useMovies();
  const { user, profile, openAuthModal } = useAuth();

  const navItems: { id: AppTab; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'movies', label: 'Explore', icon: Film },
    { id: 'genres', label: 'Genres', icon: Grid },
    { id: 'watchlist', label: 'Watchlist', icon: Bookmark },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09090fc2] backdrop-blur-xl border-t border-zinc-800/90 py-1.5 px-3">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-rose-400' : ''}`} />
                {item.id === 'watchlist' && watchlist.length > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-rose-600 text-[10px] font-bold text-white flex items-center justify-center">
                    {watchlist.length > 9 ? '9+' : watchlist.length}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-white font-semibold' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 w-4 h-0.5 rounded-full bg-gradient-to-r from-purple-500 to-rose-500" />
              )}
            </button>
          );
        })}

        {/* Profile or Sign-In button on Mobile Nav */}
        <button
          onClick={() => {
            if (user) {
              setIsProfileOpen(true);
            } else {
              openAuthModal('login');
            }
          }}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-zinc-400 hover:text-zinc-200"
        >
          {user ? (
            <img
              src={profile?.avatar || user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={profile?.username || 'User'}
              className="w-5 h-5 rounded-full object-cover ring-1 ring-purple-400"
            />
          ) : (
            <LogIn className="w-5 h-5 text-zinc-400" />
          )}
          <span className="text-[10px] mt-1 font-medium">
            {user ? 'Profile' : 'Sign In'}
          </span>
        </button>
      </div>
    </nav>
  );
};
