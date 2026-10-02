import React from 'react';
import { GENRE_METADATA } from '../data/movies';
import { useMovies } from '../context/MovieContext';
import { ArrowRight, Clapperboard, Sparkles } from 'lucide-react';

export const GenresView: React.FC = () => {
  const { movies, filterByGenre } = useMovies();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Curated Categories</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Explore by Genre
        </h1>
        <p className="text-zinc-400 text-sm mt-1 max-w-xl">
          Dive deep into our cinematic archives. From mind-bending sci-fi epics to edge-of-seat thrillers, select a genre to uncover masterworks.
        </p>
      </div>

      {/* Genres Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {GENRE_METADATA.map((genre) => {
          const count = movies.filter(
            (m) => m.genre === genre.name || m.genres.includes(genre.name)
          ).length;

          return (
            <div
              key={genre.name}
              onClick={() => filterByGenre(genre.name)}
              className="group relative h-48 sm:h-56 rounded-2xl overflow-hidden border border-zinc-800/80 hover:border-purple-500/60 hover:shadow-xl hover:shadow-purple-900/20 transition-all duration-300 cursor-pointer"
            >
              {/* Genre Backdrop Image */}
              <img
                src={genre.image}
                alt={genre.name}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 filter brightness-75 group-hover:brightness-90"
              />

              {/* Gradient tint */}
              <div className={`absolute inset-0 bg-gradient-to-t ${genre.color} opacity-85 group-hover:opacity-75 transition-opacity`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

              {/* Genre Card Content */}
              <div className="relative z-10 h-full p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white">
                    <Clapperboard className="w-4 h-4 text-purple-300" />
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-zinc-200 border border-white/10">
                    {count} {count === 1 ? 'Movie' : 'Movies'}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-black text-white tracking-tight group-hover:text-purple-200 transition-colors">
                    {genre.name}
                  </h3>
                  <p className="text-xs text-zinc-300 line-clamp-2 mt-1 leading-snug">
                    {genre.description}
                  </p>
                  <div className="flex items-center gap-1 text-xs font-semibold text-rose-300 mt-3 group-hover:translate-x-1 transition-transform">
                    <span>Explore Collection</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
