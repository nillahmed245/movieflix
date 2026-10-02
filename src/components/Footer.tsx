import React from 'react';
import { Clapperboard, ShieldCheck, Heart, Film } from 'lucide-react';
import { useMovies } from '../context/MovieContext';

export const Footer: React.FC = () => {
  const { setActiveTab, filterByGenre } = useMovies();

  return (
    <footer className="w-full bg-[#040407] border-t border-zinc-800/80 pt-12 pb-24 md:pb-12 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 via-rose-600 to-amber-500 p-[1px] flex items-center justify-center">
                <div className="w-full h-full bg-[#08080f] rounded-[7px] flex items-center justify-center">
                  <Clapperboard className="w-4 h-4 text-rose-400" />
                </div>
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Movie<span className="bg-gradient-to-r from-purple-400 via-rose-400 to-amber-400 bg-clip-text text-transparent">Flix</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-md">
              A modern, cinematic movie discovery platform for film enthusiasts. Explore trending trailers, discover cinema by genre, and stream legally licensed and public-domain open cinema without subscription paywalls.
            </p>

            <div className="flex items-center gap-2 text-emerald-400 pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[11px] font-semibold">100% Legal & DMCA-Compliant Certified</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">Navigation</h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => {
                    setActiveTab('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-purple-300 transition cursor-pointer"
                >
                  Featured Premiere
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('movies');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-purple-300 transition cursor-pointer"
                >
                  Explore Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('genres');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-purple-300 transition cursor-pointer"
                >
                  Browse Genres
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('watchlist');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-purple-300 transition cursor-pointer"
                >
                  My Saved Watchlist
                </button>
              </li>
            </ul>
          </div>

          {/* Featured Genres */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">Top Genres</h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => filterByGenre('Sci-Fi')}
                  className="hover:text-purple-300 transition cursor-pointer"
                >
                  Sci-Fi & Cyberpunk
                </button>
              </li>
              <li>
                <button
                  onClick={() => filterByGenre('Action')}
                  className="hover:text-purple-300 transition cursor-pointer"
                >
                  High-Octane Action
                </button>
              </li>
              <li>
                <button
                  onClick={() => filterByGenre('Thriller')}
                  className="hover:text-purple-300 transition cursor-pointer"
                >
                  Psychological Thriller
                </button>
              </li>
              <li>
                <button
                  onClick={() => filterByGenre('Animation')}
                  className="hover:text-purple-300 transition cursor-pointer"
                >
                  Animation Spectacles
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-2 text-[11px] text-zinc-500 leading-relaxed">
          <p className="font-semibold text-zinc-400">Legal Compliance & Content Distribution Notice:</p>
          <p>
            MovieFlix does not host, upload, or distribute unauthorized copyrighted movies or pirated video files. All promotional trailers displayed are officially hosted by film studios and distributors via embeddable media APIs. Full-length motion pictures featured in MovieFlix are strictly restricted to verified Public Domain works and Creative Commons (CC-BY) Open Movie projects (such as the Blender Foundation Open Movie Initiative and public cinema archives).
          </p>
        </div>

        {/* Bottom Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-zinc-800/60 pt-6 gap-2 text-zinc-500 text-[11px]">
          <p>&copy; {new Date().getFullYear()} MovieFlix. All cinematic trademarks and poster artwork belong to their respective studios.</p>
          <div className="flex items-center gap-1">
            <span>Crafted for Cinephiles</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
};
