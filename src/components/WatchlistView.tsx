import React, { useState } from 'react';
import { Bookmark, Sparkles, Film, LogIn, Lock, ArrowRight } from 'lucide-react';
import { useMovies } from '../context/MovieContext';
import { useAuth } from '../context/AuthContext';
import { MovieCard } from './MovieCard';

export const WatchlistView: React.FC = () => {
  const { watchlist, movies, setActiveTab } = useMovies();
  const { user, openAuthModal } = useAuth();
  const [genreFilter, setGenreFilter] = useState('All');

  // If user is not logged in, display the friendly protected feature message
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
        <div className="text-center py-16 px-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/90 shadow-2xl max-w-lg mx-auto space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-600/20 to-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto text-rose-400">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-300 border border-rose-500/20">
              Protected Feature
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Please log in to continue
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Your MovieFlix Watchlist is securely saved to your account. Sign in to view and curate your private cinema queue.
            </p>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => openAuthModal('login', 'Sign in to access your saved Watchlist.')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 shadow-lg shadow-rose-900/30 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In</span>
            </button>

            <button
              onClick={() => openAuthModal('register', 'Create an account to start bookmarking movies.')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700 transition cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Match items from movies list
  const watchlistMovies = movies.filter((m) =>
    watchlist.some((w) => w.movieId === m.id)
  );

  const filteredMovies = genreFilter === 'All'
    ? watchlistMovies
    : watchlistMovies.filter((m) => m.genre === genreFilter || m.genres.includes(genreFilter));

  const availableGenres = ['All', ...new Set(watchlistMovies.map((m) => m.genre))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-zinc-800 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Bookmark className="w-4 h-4" />
            <span>Personal Collection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            My Watchlist
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            {watchlist.length} {watchlist.length === 1 ? 'title' : 'titles'} saved to your cinematic vault.
          </p>
        </div>

        {/* Sync Status Banner */}
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs">
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Synced to cloud account ({user.email})</span>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {watchlist.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-3xl bg-zinc-900/30 border border-zinc-800/80 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-purple-950/50 border border-purple-800/60 flex items-center justify-center mx-auto text-purple-400">
            <Bookmark className="w-8 h-8 text-rose-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">Your Watchlist is Empty</h3>
          <p className="text-xs sm:text-sm text-zinc-400">
            You haven’t bookmarked any movies yet. Explore trending features, classic cinema, and trailers to build your personal queue!
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setActiveTab('movies');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 shadow-lg shadow-rose-900/30 transition cursor-pointer"
            >
              Discover Movies
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Genre Filter Pills if more than 1 genre in list */}
          {availableGenres.length > 2 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {availableGenres.map((g) => (
                <button
                  key={g}
                  onClick={() => setGenreFilter(g)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
                    genreFilter === g
                      ? 'bg-rose-600 text-white border-rose-500'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}

          {/* Watchlist Movie Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
