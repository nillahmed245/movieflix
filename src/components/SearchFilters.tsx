import React, { useMemo } from 'react';
import { Search, X, SlidersHorizontal, RotateCcw, Filter, Star } from 'lucide-react';
import { useMovies } from '../context/MovieContext';
import { GENRES_LIST } from '../data/movies';
import { MovieCard } from './MovieCard';
import { FilterState } from '../types';

export const SearchFilters: React.FC = () => {
  const { movies, filterState, setFilterState, resetFilters } = useMovies();

  // Filter & Sort Logic
  const filteredMovies = useMemo(() => {
    return movies
      .filter((movie) => {
        // Search query match (title, director, cast, description)
        if (filterState.searchQuery.trim()) {
          const q = filterState.searchQuery.toLowerCase();
          const matchesTitle = movie.title.toLowerCase().includes(q);
          const matchesDirector = movie.director.toLowerCase().includes(q);
          const matchesCast = movie.cast.some((c) => c.name.toLowerCase().includes(q) || c.character.toLowerCase().includes(q));
          const matchesGenre = movie.genres.some((g) => g.toLowerCase().includes(q));
          if (!matchesTitle && !matchesDirector && !matchesCast && !matchesGenre) {
            return false;
          }
        }

        // Genre match
        if (filterState.genre !== 'All') {
          if (!movie.genres.includes(filterState.genre) && movie.genre !== filterState.genre) {
            return false;
          }
        }

        // Year match
        if (filterState.year !== 'All') {
          if (movie.year.toString() !== filterState.year) {
            return false;
          }
        }

        // Rating match
        if (filterState.rating > 0) {
          if (movie.rating < filterState.rating) {
            return false;
          }
        }

        // Language match
        if (filterState.language !== 'All') {
          if (movie.language.toLowerCase() !== filterState.language.toLowerCase()) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (filterState.sortBy === 'rating') {
          return b.rating - a.rating;
        }
        if (filterState.sortBy === 'newest') {
          return b.year - a.year;
        }
        if (filterState.sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        // Popularity default
        return b.likes - a.likes;
      });
  }, [movies, filterState]);

  const hasActiveFilters =
    filterState.searchQuery !== '' ||
    filterState.genre !== 'All' ||
    filterState.year !== 'All' ||
    filterState.rating > 0 ||
    filterState.language !== 'All' ||
    filterState.sortBy !== 'popularity';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Search & Filter Bar */}
      <div className="space-y-4">
        {/* Main Search Input */}
        <div className="relative w-full max-w-3xl mx-auto">
          <input
            type="text"
            placeholder="Search by movie title, actor, director, or keyword..."
            value={filterState.searchQuery}
            onChange={(e) => setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full pl-12 pr-10 py-3.5 sm:py-4 rounded-2xl bg-zinc-900/90 text-white placeholder-zinc-500 border border-zinc-700/80 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-sm sm:text-base shadow-lg transition"
          />
          <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          {filterState.searchQuery && (
            <button
              onClick={() => setFilterState((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Genre Pill Horizontal Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2">
          {GENRES_LIST.map((genre) => {
            const isSelected = filterState.genre === genre;
            return (
              <button
                key={genre}
                onClick={() => setFilterState((prev) => ({ ...prev, genre }))}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white border-transparent shadow-md shadow-rose-900/30'
                    : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>

        {/* Detailed Filter Dropdowns Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
          <div className="flex flex-wrap items-center gap-3">
            {/* Year Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-400 font-medium">Year:</span>
              <select
                value={filterState.year}
                onChange={(e) => setFilterState((prev) => ({ ...prev, year: e.target.value }))}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-zinc-200 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="All">All Years</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>

            {/* Rating Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-400 font-medium">Rating:</span>
              <select
                value={filterState.rating}
                onChange={(e) => setFilterState((prev) => ({ ...prev, rating: parseFloat(e.target.value) }))}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-zinc-200 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="0">Any Rating</option>
                <option value="8.5">8.5+ ⭐</option>
                <option value="8.0">8.0+ ⭐</option>
                <option value="7.5">7.5+ ⭐</option>
              </select>
            </div>

            {/* Language Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-400 font-medium">Audio:</span>
              <select
                value={filterState.language}
                onChange={(e) => setFilterState((prev) => ({ ...prev, language: e.target.value }))}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-zinc-200 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="All">All Languages</option>
                <option value="English">English</option>
                <option value="French">French</option>
                <option value="Spanish">Spanish</option>
              </select>
            </div>

            {/* Sort By Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-400 font-medium">Sort by:</span>
              <select
                value={filterState.sortBy}
                onChange={(e) =>
                  setFilterState((prev) => ({
                    ...prev,
                    sortBy: e.target.value as FilterState['sortBy'],
                  }))
                }
                className="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-zinc-200 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="popularity">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Release Year</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Reset Filters CTA */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-rose-300 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>Explore Cinema</span>
          <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
            {filteredMovies.length} {filteredMovies.length === 1 ? 'Movie' : 'Movies'} found
          </span>
        </h2>
      </div>

      {/* Results Movies Grid or Empty State */}
      {filteredMovies.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-3xl bg-zinc-900/30 border border-zinc-800/80 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-zinc-800/80 flex items-center justify-center mx-auto text-zinc-500">
            <Search className="w-8 h-8 text-rose-400" />
          </div>
          <h3 className="text-xl font-bold text-white">No Results Found</h3>
          <p className="text-xs sm:text-sm text-zinc-400">
            We couldn’t find any movies matching "{filterState.searchQuery || filterState.genre}". Try broadening your filters or searching another title.
          </p>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 transition cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};
