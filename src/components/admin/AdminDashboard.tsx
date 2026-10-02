import React from 'react';
import {
  Film,
  Users,
  Bookmark,
  Heart,
  MessageSquare,
  Plus,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Star,
  Clock,
  Sparkles,
  Grid,
} from 'lucide-react';
import { useMovies } from '../../context/MovieContext';

interface AdminDashboardProps {
  onNavigateSection: (section: 'movies' | 'users' | 'comments' | 'genres' | 'settings') => void;
  onOpenAddMovie: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateSection,
  onOpenAddMovie,
}) => {
  const { allMovies, adminUsers, watchlist, likedMovieIds, comments, adminLogs } = useMovies();

  // Aggregate stats
  const totalMovies = allMovies.length;
  const totalUsers = adminUsers.length;
  const totalWatchlist = watchlist.length;
  const totalLikes = allMovies.reduce((acc, m) => acc + m.likes, 0) + likedMovieIds.length;
  const totalComments = comments.length;

  const recentMovies = allMovies.slice(0, 5);
  const recentUsers = adminUsers.slice(0, 5);
  const recentComments = comments.slice(0, 5);

  const summaryCards = [
    {
      title: 'Total Movies',
      count: totalMovies,
      icon: Film,
      color: 'from-purple-600 to-indigo-600',
      textColor: 'text-purple-400',
      action: () => onNavigateSection('movies'),
    },
    {
      title: 'Registered Users',
      count: totalUsers,
      icon: Users,
      color: 'from-blue-600 to-cyan-600',
      textColor: 'text-blue-400',
      action: () => onNavigateSection('users'),
    },
    {
      title: 'Total Watchlists',
      count: totalWatchlist,
      icon: Bookmark,
      color: 'from-rose-600 to-pink-600',
      textColor: 'text-rose-400',
      action: () => onNavigateSection('movies'),
    },
    {
      title: 'Community Likes',
      count: totalLikes,
      icon: Heart,
      color: 'from-pink-600 to-red-600',
      textColor: 'text-pink-400',
      action: () => onNavigateSection('movies'),
    },
    {
      title: 'Reviews & Discussions',
      count: totalComments,
      icon: MessageSquare,
      color: 'from-amber-600 to-orange-600',
      textColor: 'text-amber-400',
      action: () => onNavigateSection('comments'),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 border border-purple-500/30 bg-gradient-to-r from-purple-950/60 via-zinc-900 to-rose-950/40 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Administrator Command Console</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            MovieFlix Platform Overview
          </h2>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Monitor cinema metrics, publish licensed features and studio trailers, moderate discussions, and manage permissions in real-time.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenAddMovie}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 shadow-lg shadow-rose-900/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Movie</span>
            </button>

            <button
              onClick={() => onNavigateSection('movies')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 transition cursor-pointer"
            >
              <span>Manage Movies</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {summaryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={card.action}
              className="p-4 sm:p-5 rounded-2xl bg-[#09090f]/80 border border-zinc-800 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-900/20 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-400 group-hover:text-zinc-200 transition-colors">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl bg-gradient-to-br ${card.color} text-white shadow`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {card.count.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-zinc-500 mt-1">
                <span>View & manage &rarr;</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions Bar */}
      <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-sm">Quick Administrative Actions</h3>
          <p className="text-xs text-zinc-400">Direct shortcuts to frequent management modules</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenAddMovie}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition cursor-pointer shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Movie</span>
          </button>
          <button
            onClick={() => onNavigateSection('movies')}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition cursor-pointer"
          >
            Manage Movies
          </button>
          <button
            onClick={() => onNavigateSection('users')}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition cursor-pointer"
          >
            Manage Users
          </button>
          <button
            onClick={() => onNavigateSection('comments')}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition cursor-pointer"
          >
            Manage Reviews
          </button>
          <button
            onClick={() => onNavigateSection('genres')}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition cursor-pointer"
          >
            Manage Genres
          </button>
        </div>
      </div>

      {/* 3-Column Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recently Added Movies */}
        <div className="p-5 rounded-2xl bg-[#09090f]/70 border border-zinc-800/90 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Film className="w-4 h-4 text-purple-400" />
              <span>Recently Cataloged</span>
            </h3>
            <button
              onClick={() => onNavigateSection('movies')}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300"
            >
              All &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {recentMovies.map((movie) => (
              <div key={movie.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900/50 transition">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-9 h-12 rounded object-cover bg-zinc-950 flex-shrink-0"
                />
                <div className="overflow-hidden flex-1">
                  <p className="font-bold text-white text-xs truncate">{movie.title}</p>
                  <p className="text-[10px] text-zinc-400">
                    {movie.genre} • {movie.year} • ★ {movie.rating}
                  </p>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-zinc-800 text-zinc-300">
                  {movie.status || 'published'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Community Reviews */}
        <div className="p-5 rounded-2xl bg-[#09090f]/70 border border-zinc-800/90 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-pink-400" />
              <span>Recent Reviews</span>
            </h3>
            <button
              onClick={() => onNavigateSection('comments')}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300"
            >
              All &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {recentComments.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">No reviews submitted yet.</p>
            ) : (
              recentComments.map((c) => (
                <div key={c.id} className="p-2.5 rounded-xl bg-zinc-950/40 border border-zinc-800/60 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-zinc-200">{c.userName}</span>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 line-clamp-2">"{c.content}"</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Registered Users */}
        <div className="p-5 rounded-2xl bg-[#09090f]/70 border border-zinc-800/90 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Recent Members</span>
            </h3>
            <button
              onClick={() => onNavigateSection('users')}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300"
            >
              All &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {recentUsers.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">No members listed yet.</p>
            ) : (
              recentUsers.map((u) => (
                <div key={u.uid} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-zinc-900/50 transition">
                  <img
                    src={u.avatar || u.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={u.username}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-zinc-700"
                  />
                  <div className="overflow-hidden flex-1">
                    <p className="font-bold text-white text-xs truncate">{u.username || u.displayName}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{u.email}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300 uppercase">
                    {u.role || 'user'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
