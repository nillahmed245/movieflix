import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Movie } from '../types';
import { MovieCard } from './MovieCard';

interface MovieGridProps {
  title: string;
  subtitle?: string;
  movies: Movie[];
  icon?: React.ReactNode;
  onViewAll?: () => void;
  showRanks?: boolean;
}

export const MovieGrid: React.FC<MovieGridProps> = ({
  title,
  subtitle,
  movies,
  icon,
  onViewAll,
  showRanks = false,
}) => {
  if (movies.length === 0) return null;

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-end justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          {icon && <div className="text-rose-500">{icon}</div>}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer group"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* Movies Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5">
        {movies.map((movie, index) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            showRank={showRanks ? index + 1 : undefined}
          />
        ))}
      </div>
    </section>
  );
};
