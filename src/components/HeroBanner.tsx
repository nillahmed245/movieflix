import React, { useState, useEffect } from 'react';
import { Play, Bookmark, Info, ChevronRight, ChevronLeft, Star, Clock, Film, Sparkles, Check } from 'lucide-react';
import { useMovies } from '../context/MovieContext';

export const HeroBanner: React.FC = () => {
  const { movies, openMovieDetails, openTrailerPlayer, openStreamPlayer, toggleWatchlist, isInWatchlist, setActiveTab } = useMovies();

  const featuredMovies = movies.filter((m) => m.featured || m.trending).slice(0, 4);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto cycle banner every 7 seconds
  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  if (featuredMovies.length === 0) return null;

  const currentMovie = featuredMovies[currentIndex];
  const inWatchlist = isInWatchlist(currentMovie.id);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? featuredMovies.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
  };

  return (
    <section className="relative w-full min-h-[520px] sm:min-h-[580px] lg:min-h-[660px] flex items-end overflow-hidden bg-[#050508]">
      {/* Background Backdrop with Crossfade Animation */}
      <div className="absolute inset-0">
        <img
          key={currentMovie.id}
          src={currentMovie.backdrop}
          alt={currentMovie.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=85';
          }}
          className="w-full h-full object-cover object-center filter brightness-[0.78] transition-all duration-700 scale-105 animate-fade-in"
        />

        {/* Cinematic Vignettes and Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-[#07070a]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07070a] via-[#07070a]/80 to-transparent max-w-4xl" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#07070a]/40 to-[#07070a]/90" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 pt-24 sm:pt-28">
        <div className="max-w-2xl lg:max-w-3xl space-y-4 sm:space-y-5">
          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-rose-600/90 to-purple-600/90 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-900/30">
              <Sparkles className="w-3.5 h-3.5" /> Featured Spotlight
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-900/80 text-zinc-300 font-semibold border border-zinc-700/60 text-xs">
              4K Ultra HD
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-900/80 text-amber-400 font-bold border border-amber-500/30 flex items-center gap-1 text-xs">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              {currentMovie.rating.toFixed(1)}
            </span>
            <span className="text-zinc-400 font-medium text-xs sm:text-sm">
              {currentMovie.year}
            </span>
            <span className="text-zinc-500">•</span>
            <span className="flex items-center gap-1 text-zinc-400 text-xs sm:text-sm">
              <Clock className="w-3.5 h-3.5" />
              {currentMovie.runtime}
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
              {currentMovie.certification}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-md">
            {currentMovie.title}
          </h1>

          {/* Tagline */}
          {currentMovie.tagline && (
            <p className="text-sm sm:text-base lg:text-lg text-purple-300 font-medium italic drop-shadow">
              "{currentMovie.tagline}"
            </p>
          )}

          {/* Description */}
          <p className="text-sm sm:text-base text-zinc-300 line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow max-w-2xl">
            {currentMovie.description}
          </p>

          {/* Genre Pills */}
          <div className="flex flex-wrap gap-2 pt-1">
            {currentMovie.genres.map((g) => (
              <span
                key={g}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/50 backdrop-blur-sm transition"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            {/* Watch Trailer Button */}
            <button
              onClick={() => openTrailerPlayer(currentMovie)}
              className="flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 shadow-lg shadow-rose-900/30 hover:shadow-purple-900/40 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
              <span>Watch Trailer</span>
            </button>

            {/* Watch Full Feature if available */}
            {currentMovie.isLegalFullStream && (
              <button
                onClick={() => openStreamPlayer(currentMovie)}
                className="flex items-center gap-2 px-4 sm:px-5 py-3 rounded-xl font-semibold text-sm sm:text-base text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <Film className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Stream Feature</span>
              </button>
            )}

            {/* Watchlist Toggle Button */}
            <button
              onClick={() => toggleWatchlist(currentMovie)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 cursor-pointer border backdrop-blur-md active:scale-95 ${
                inWatchlist
                  ? 'bg-purple-950/80 text-purple-200 border-purple-500/80 shadow-md shadow-purple-900/30'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border-zinc-700/80'
              }`}
            >
              {inWatchlist ? (
                <>
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                  <span>In Watchlist</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
                  <span>Watchlist</span>
                </>
              )}
            </button>

            {/* Movie Details Button */}
            <button
              onClick={() => openMovieDetails(currentMovie)}
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl font-semibold text-sm sm:text-base text-zinc-300 hover:text-white bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-700/60 backdrop-blur-md transition cursor-pointer"
            >
              <Info className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Details</span>
            </button>
          </div>
        </div>

        {/* Carousel Bottom Bar & Slide Controls */}
        <div className="flex items-center justify-between pt-8 sm:pt-10 border-t border-zinc-800/40 mt-6">
          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-2">
            {featuredMovies.map((m, idx) => (
              <button
                key={m.id}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === currentIndex
                    ? 'w-8 h-2 bg-gradient-to-r from-rose-500 to-purple-500'
                    : 'w-2 h-2 bg-zinc-600 hover:bg-zinc-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-zinc-900/70 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 hover:text-white transition cursor-pointer"
              aria-label="Previous Featured Movie"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-zinc-900/70 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 hover:text-white transition cursor-pointer"
              aria-label="Next Featured Movie"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
