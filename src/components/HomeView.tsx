import React from 'react';
import { HeroBanner } from './HeroBanner';
import { MovieGrid } from './MovieGrid';
import { useMovies } from '../context/MovieContext';
import { Flame, Sparkles, TrendingUp, Compass, Award, Clapperboard } from 'lucide-react';
import { GENRE_METADATA } from '../data/movies';

export const HomeView: React.FC = () => {
  const { movies, setActiveTab, setFilterState, filterByGenre } = useMovies();

  const trendingMovies = movies.filter((m) => m.trending);
  const popularMovies = movies.filter((m) => m.popular);
  const latestMovies = movies.filter((m) => m.latest);
  const recommendedMovies = movies.filter((m) => m.rating >= 8.5);

  const handleViewAllTrending = () => {
    setFilterState((prev) => ({ ...prev, genre: 'All', sortBy: 'popularity' }));
    setActiveTab('movies');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewAllPopular = () => {
    setFilterState((prev) => ({ ...prev, genre: 'All', sortBy: 'popularity' }));
    setActiveTab('movies');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewAllLatest = () => {
    setFilterState((prev) => ({ ...prev, genre: 'All', sortBy: 'newest' }));
    setActiveTab('movies');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewAllRecommended = () => {
    setFilterState((prev) => ({ ...prev, genre: 'All', sortBy: 'rating' }));
    setActiveTab('movies');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-12 sm:space-y-16 animate-fade-in">
      {/* Cinematic Hero Spotlight */}
      <HeroBanner />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Trending Movies Section */}
        <MovieGrid
          title="Trending Today"
          subtitle="Top titles commanding attention across the globe right now"
          movies={trendingMovies}
          icon={<Flame className="w-5 h-5 text-rose-500" />}
          onViewAll={handleViewAllTrending}
        />

        {/* Quick Genre Carousel / Cards Highlight */}
        <section className="space-y-4">
          <div className="flex items-end justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <Compass className="w-5 h-5 text-purple-400" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Explore by Genre
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                  Browse by thematic style and cinematography
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveTab('genres');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xs sm:text-sm font-semibold text-purple-400 hover:text-purple-300 transition cursor-pointer"
            >
              All Genres &rarr;
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {GENRE_METADATA.slice(0, 6).map((g) => (
              <div
                key={g.name}
                onClick={() => filterByGenre(g.name)}
                className="group relative h-28 rounded-xl overflow-hidden border border-zinc-800 hover:border-purple-500/60 transition cursor-pointer shadow"
              >
                <img
                  src={g.image}
                  alt={g.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 filter brightness-70"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${g.color} opacity-80 group-hover:opacity-60 transition`} />
                <div className="absolute inset-0 flex items-center justify-center p-2 text-center">
                  <span className="font-bold text-sm text-white tracking-wide drop-shadow group-hover:text-purple-200">
                    {g.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Movies Section */}
        <MovieGrid
          title="Most Popular"
          subtitle="Celebrated fan-favorites with the highest community engagement"
          movies={popularMovies}
          icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
          onViewAll={handleViewAllPopular}
          showRanks
        />

        {/* Latest Releases Section */}
        <MovieGrid
          title="Latest Additions"
          subtitle="Fresh official trailers and recently restored cinema releases"
          movies={latestMovies}
          icon={<Sparkles className="w-5 h-5 text-amber-400" />}
          onViewAll={handleViewAllLatest}
        />

        {/* Recommended for You Section */}
        <MovieGrid
          title="Critical Acclaim (8.5+)"
          subtitle="Hand-picked cinema treasures certified by critics and viewers"
          movies={recommendedMovies}
          icon={<Award className="w-5 h-5 text-emerald-400" />}
          onViewAll={handleViewAllRecommended}
        />

        {/* Legal Streaming Feature Showcase Banner */}
        <section className="relative rounded-3xl overflow-hidden border border-purple-500/30 bg-gradient-to-r from-purple-950/70 via-zinc-900/90 to-rose-950/60 p-6 sm:p-10 shadow-2xl">
          <div className="max-w-2xl space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Open Cinema Initiative
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Stream Full-Length Masterpieces Legally
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              MovieFlix features landmark open-source productions from the Blender Foundation like <em>Tears of Steel</em>, <em>Sintel</em>, and <em>Cosmos Laundromat</em>, plus restored public-domain cinema treasures. Available to watch in full HD right now with zero piracy.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setFilterState((prev) => ({ ...prev, genre: 'Sci-Fi' }));
                  setActiveTab('movies');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-950/40 transition cursor-pointer"
              >
                Browse Open Cinema
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
