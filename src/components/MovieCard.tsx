import React from 'react';
import { Star, Play, Bookmark, Heart, Check, Info } from 'lucide-react';
import { Movie } from '../types';
import { useMovies } from '../context/MovieContext';

interface MovieCardProps {
  movie: Movie;
  showRank?: number;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, showRank }) => {
  const { openMovieDetails, openTrailerPlayer, toggleWatchlist, isInWatchlist, toggleLike, isLiked, getLikesCount } = useMovies();

  const inWatchlist = isInWatchlist(movie.id);
  const liked = isLiked(movie.id);
  const likesCount = getLikesCount(movie);

  return (
    <div className="group relative flex flex-col rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-900/20 transition-all duration-300 overflow-hidden">
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950">
        <img
          src={movie.poster}
          alt={movie.title}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80';
          }}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 filter brightness-95 group-hover:brightness-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/40 opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {/* Rating Pill */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-950/80 backdrop-blur-md border border-zinc-700/60 text-amber-400 text-xs font-bold">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>{movie.rating.toFixed(1)}</span>
          </div>

          {/* Quality or Stream Pill */}
          <div className="flex items-center gap-1">
            {movie.isLegalFullStream && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-600/90 text-white font-bold text-[10px] tracking-wide uppercase shadow">
                Full Movie
              </span>
            )}
            <span className="px-1.5 py-0.5 rounded bg-zinc-950/70 border border-zinc-700/60 text-zinc-300 font-semibold text-[10px] uppercase">
              HD
            </span>
          </div>
        </div>

        {/* Big Rank Number if requested (e.g. Top 10) */}
        {showRank && (
          <div className="absolute -bottom-3 -left-1 font-black text-6xl text-white/20 select-none pointer-events-none drop-shadow">
            #{showRank}
          </div>
        )}

        {/* Hover / Touch Quick Action Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
          <button
            onClick={() => openTrailerPlayer(movie)}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-rose-600 to-purple-600 text-white shadow-lg shadow-rose-900/50 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
            title="Watch Trailer"
            aria-label={`Watch trailer for ${movie.title}`}
          >
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </button>

          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => toggleWatchlist(movie)}
              className={`p-2 rounded-full backdrop-blur-md border transition cursor-pointer ${
                inWatchlist
                  ? 'bg-purple-600/80 border-purple-400 text-white'
                  : 'bg-zinc-900/80 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              {inWatchlist ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>

            <button
              onClick={() => openMovieDetails(movie)}
              className="p-2 rounded-full bg-zinc-900/80 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 backdrop-blur-md transition cursor-pointer"
              title="View Details"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Card Details Body */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4 justify-between bg-zinc-900/30">
        <div>
          <div className="flex items-start justify-between gap-1">
            <button
              onClick={() => openMovieDetails(movie)}
              className="text-left font-bold text-sm sm:text-base text-zinc-100 hover:text-purple-300 transition-colors line-clamp-1 cursor-pointer"
              title={movie.title}
            >
              {movie.title}
            </button>
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
            <span>{movie.year}</span>
            <span>•</span>
            <span className="text-zinc-300">{movie.genre}</span>
            <span>•</span>
            <span>{movie.runtime}</span>
          </div>
        </div>

        {/* Card Footer: Likes Counter & Quick Details Link */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-800/60 text-xs">
          <button
            onClick={() => toggleLike(movie)}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
              liked ? 'text-rose-400 font-medium' : 'text-zinc-400 hover:text-rose-400'
            }`}
            title="Like this movie"
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{likesCount.toLocaleString()}</span>
          </button>

          <button
            onClick={() => openMovieDetails(movie)}
            className="text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
          >
            Details &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
