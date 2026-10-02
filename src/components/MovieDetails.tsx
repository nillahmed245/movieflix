import React, { useState } from 'react';
import {
  ArrowLeft,
  Play,
  Bookmark,
  Heart,
  Share2,
  Star,
  Clock,
  Calendar,
  Globe,
  Film,
  Check,
  MessageSquare,
  Trash2,
  Flag,
  User as UserIcon,
  ShieldCheck,
  Send,
  Sparkles,
  LogIn,
} from 'lucide-react';
import { useMovies } from '../context/MovieContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MovieCard } from './MovieCard';

export const MovieDetails: React.FC = () => {
  const {
    selectedMovie: movie,
    setActiveTab,
    openTrailerPlayer,
    openStreamPlayer,
    toggleWatchlist,
    isInWatchlist,
    toggleLike,
    isLiked,
    getLikesCount,
    comments,
    addComment,
    deleteComment,
    reportComment,
    movies,
  } = useMovies();

  const { user, profile, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [activeTabSection, setActiveTabSection] = useState<'synopsis' | 'cast'>('synopsis');

  if (!movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-zinc-400">No movie selected.</p>
        <button
          onClick={() => setActiveTab('home')}
          className="mt-4 px-4 py-2 rounded-lg bg-zinc-800 text-white text-sm"
        >
          Return Home
        </button>
      </div>
    );
  }

  const inWatchlist = isInWatchlist(movie.id);
  const liked = isLiked(movie.id);
  const likesCount = getLikesCount(movie);

  // Filter comments for this movie
  const movieComments = comments
    .filter((c) => c.movieId === movie.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Related movies (same genre, excluding current movie)
  const relatedMovies = movies
    .filter((m) => m.id !== movie.id && (m.genre === movie.genre || m.genres.some((g) => movie.genres.includes(g))))
    .slice(0, 6);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${movie.title} - MovieFlix`,
          text: `Check out ${movie.title} on MovieFlix!`,
          url,
        });
        showToast('Shared Successfully', `Shared "${movie.title}".`, 'success');
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(url);
    showToast('Link Copied!', 'Movie link copied to clipboard.', 'success');
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    setIsSubmittingComment(true);
    await addComment(movie.id, commentInput);
    setCommentInput('');
    setIsSubmittingComment(false);
  };

  return (
    <div className="w-full pb-20 animate-fade-in">
      {/* Top Backdrop Hero Container */}
      <div className="relative w-full min-h-[420px] sm:min-h-[500px] lg:min-h-[580px] bg-[#07070a] overflow-hidden">
        {/* Backdrop Image */}
        <img
          src={movie.backdrop || movie.poster}
          alt={movie.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=85';
          }}
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.65] scale-105"
        />

        {/* Cinematic Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-[#07070a]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07070a] via-[#07070a]/80 to-transparent max-w-4xl" />

        {/* Back Button */}
        <div className="absolute top-4 left-4 sm:left-8 z-20">
          <button
            onClick={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/90 text-zinc-300 hover:text-white border border-zinc-700/60 backdrop-blur-md text-xs sm:text-sm font-semibold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Browse</span>
          </button>
        </div>

        {/* Main Content Info Overlay */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-8 flex flex-col md:flex-row gap-6 sm:gap-8 items-start sm:items-end">
          {/* Movie Poster */}
          <div className="w-36 sm:w-52 lg:w-64 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl shadow-purple-950/50 border-2 border-zinc-700/70 bg-zinc-950 aspect-[2/3] group relative">
            <img
              src={movie.poster}
              alt={movie.title}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80';
              }}
              className="w-full h-full object-cover"
            />
            {movie.isLegalFullStream && (
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-600/90 text-white font-bold text-[10px] uppercase shadow">
                Full Movie
              </span>
            )}
          </div>

          {/* Details Metadata */}
          <div className="flex-1 space-y-3 sm:space-y-4">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {movie.rating.toFixed(1)} / 10
              </span>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-semibold border border-zinc-700">
                {movie.year}
              </span>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-semibold border border-zinc-700">
                {movie.certification}
              </span>
              <span className="flex items-center gap-1 text-zinc-400">
                <Clock className="w-3.5 h-3.5" />
                {movie.runtime}
              </span>
              <span className="flex items-center gap-1 text-zinc-400">
                <Globe className="w-3.5 h-3.5" />
                {movie.language}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              {movie.title}
            </h1>

            {/* Tagline */}
            {movie.tagline && (
              <p className="text-sm sm:text-lg text-purple-300 font-medium italic">
                "{movie.tagline}"
              </p>
            )}

            {/* Genres */}
            <div className="flex flex-wrap gap-2 pt-1">
              {movie.genres.map((g) => (
                <span
                  key={g}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-900/80 text-zinc-300 border border-zinc-700/60"
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              {/* Watch Trailer */}
              <button
                onClick={() => openTrailerPlayer(movie)}
                className="flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 shadow-lg shadow-rose-900/30 hover:scale-[1.02] active:scale-95 transition cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Watch Trailer</span>
              </button>

              {/* Watch Full Feature if available */}
              {movie.isLegalFullStream && (
                <button
                  onClick={() => openStreamPlayer(movie)}
                  className="flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/30 hover:scale-[1.02] active:scale-95 transition cursor-pointer"
                >
                  <Film className="w-4 h-4" />
                  <span>Stream Movie</span>
                </button>
              )}

              {/* Watchlist Toggle */}
              <button
                onClick={() => toggleWatchlist(movie)}
                className={`flex items-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition cursor-pointer border backdrop-blur-md ${
                  inWatchlist
                    ? 'bg-purple-950/80 text-purple-200 border-purple-500 shadow'
                    : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border-zinc-700'
                }`}
              >
                {inWatchlist ? <Check className="w-4 h-4 text-purple-400" /> : <Bookmark className="w-4 h-4 text-rose-400" />}
                <span>{inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </button>

              {/* Like Button */}
              <button
                onClick={() => toggleLike(movie)}
                className={`flex items-center gap-2 px-3.5 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm border transition cursor-pointer ${
                  liked
                    ? 'bg-rose-950/60 border-rose-500/70 text-rose-300'
                    : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
                }`}
                title="Like movie"
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{likesCount.toLocaleString()}</span>
              </button>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="p-2.5 sm:p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 transition cursor-pointer"
                title="Share Movie"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body Details Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Synopsis, Director, Cast, Comments */}
        <div className="lg:col-span-2 space-y-8">
          {/* Synopsis Section */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <button
                onClick={() => setActiveTabSection('synopsis')}
                className={`text-sm sm:text-base font-bold transition pb-1 ${
                  activeTabSection === 'synopsis'
                    ? 'text-white border-b-2 border-rose-500'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Storyline Overview
              </button>
              <button
                onClick={() => setActiveTabSection('cast')}
                className={`text-sm sm:text-base font-bold transition pb-1 ${
                  activeTabSection === 'cast'
                    ? 'text-white border-b-2 border-rose-500'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Full Cast & Characters
              </button>
            </div>

            {activeTabSection === 'synopsis' ? (
              <div className="space-y-4">
                <p className="text-zinc-200 text-sm sm:text-base leading-relaxed">
                  {movie.fullDescription}
                </p>

                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <span className="text-zinc-500 block text-xs">Director</span>
                    <span className="font-semibold text-zinc-200">{movie.director}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <span className="text-zinc-500 block text-xs">Original Audio</span>
                    <span className="font-semibold text-zinc-200">{movie.language} • 5.1 Surround</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Cast Grid */
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {movie.cast.map((actor, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800"
                  >
                    <img
                      src={actor.avatar}
                      alt={actor.name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-zinc-700"
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-white truncate">{actor.name}</p>
                      <p className="text-[11px] text-zinc-400 truncate">{actor.character}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cast Preview if Synopsis was selected */}
          {activeTabSection === 'synopsis' && (
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm space-y-4">
              <h3 className="font-bold text-white text-base">Key Cast & Crew</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {movie.cast.map((actor, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center text-center p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/80"
                  >
                    <img
                      src={actor.avatar}
                      alt={actor.name}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-purple-500/30 mb-2"
                    />
                    <p className="text-xs font-bold text-white line-clamp-1">{actor.name}</p>
                    <p className="text-[10px] text-zinc-400 line-clamp-1">{actor.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Community Reviews & Comments Section */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-base sm:text-lg">
                  Community Reviews & Discussions
                </h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                {movieComments.length} {movieComments.length === 1 ? 'Review' : 'Reviews'}
              </span>
            </div>

            {/* Comment Submission Form or Log in prompt */}
            {!user ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800 text-center space-y-3">
                <p className="text-xs sm:text-sm text-zinc-300">
                  Please log in to continue and share your review for <span className="text-white font-semibold">{movie.title}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => openAuthModal('login', `Log in to share a review for ${movie.title}.`)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 shadow-md shadow-purple-900/30 active:scale-95 transition cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In to Comment</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleCommentSubmit} className="space-y-3">
                <div className="relative">
                  <textarea
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder={`Share your thoughts on ${movie.title}... (Min 2 chars)`}
                    rows={3}
                    maxLength={500}
                    className="w-full p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-700/80 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 resize-none transition"
                  />
                  <span className="absolute bottom-2.5 right-3 text-[11px] text-zinc-500">
                    {commentInput.length}/500
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <img
                      src={profile?.avatar || user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt="User avatar"
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span>Posting as {profile?.username || profile?.displayName || user.displayName || 'Cinema Critic'}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingComment || commentInput.trim().length < 2}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed shadow transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingComment ? 'Posting...' : 'Post Review'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Comments List */}
            <div className="space-y-3.5 pt-2">
              {movieComments.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-sm">
                  Be the first to share a review for {movie.title}!
                </div>
              ) : (
                movieComments.map((comment) => {
                  const isOwn = user && comment.userId === user.uid;
                  return (
                    <div
                      key={comment.id}
                      className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-2 hover:border-zinc-700/80 transition"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <img
                            src={comment.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                            alt={comment.userName}
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-zinc-700"
                          />
                          <div>
                            <span className="font-bold text-zinc-200">{comment.userName}</span>
                            <span className="text-[10px] text-zinc-500 ml-2">
                              {new Date(comment.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Comment Actions: Delete if own, Report if other */}
                        <div className="flex items-center gap-1">
                          {isOwn ? (
                            <button
                              onClick={() => deleteComment(comment.id)}
                              className="p-1 text-zinc-500 hover:text-rose-400 transition cursor-pointer"
                              title="Delete your comment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => reportComment(comment.id)}
                              className="p-1 text-zinc-500 hover:text-amber-400 transition cursor-pointer"
                              title="Report inappropriate comment"
                            >
                              <Flag className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed pl-9">
                        {comment.content}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Legal Compliance Card & Quick Metadata */}
        <div className="space-y-6">
          {/* Legal Compliance Guarantee */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-900/90 to-purple-950/30 border border-purple-900/40 space-y-3">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>MovieFlix Legal Standards</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              All trailers are official studio releases presented under Fair Use promotional guidelines. Full-length features are licensed Creative Commons, public domain, or open cinema projects. No illegal downloads, unauthorized streams, or torrents.
            </p>
            {movie.streamSourceLabel && (
              <div className="pt-2 border-t border-purple-900/30">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Source Archive</span>
                <span className="text-xs text-emerald-300 font-medium">{movie.streamSourceLabel}</span>
              </div>
            )}
          </div>

          {/* Quick Specifications */}
          <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3 text-xs">
            <h4 className="font-bold text-white text-sm">Specifications</h4>
            <div className="space-y-2 text-zinc-300">
              <div className="flex justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-500">Release Year</span>
                <span>{movie.year}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-500">Age Rating</span>
                <span>{movie.certification}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-500">Runtime</span>
                <span>{movie.runtime}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-500">Community Likes</span>
                <span className="text-rose-400 font-semibold">{likesCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Views</span>
                <span>{movie.views}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Movies Section */}
      {relatedMovies.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="border-b border-zinc-800 pb-3 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Recommended & Related Movies
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              More titles in <span className="text-purple-400 font-semibold">{movie.genre}</span> you might enjoy
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {relatedMovies.map((relMovie) => (
              <MovieCard key={relMovie.id} movie={relMovie} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
