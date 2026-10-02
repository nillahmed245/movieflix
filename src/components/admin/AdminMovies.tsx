import React, { useState } from 'react';
import {
  Film,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  AlertTriangle,
  X,
  ExternalLink,
  ShieldCheck,
  Star,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useMovies } from '../../context/MovieContext';
import { Movie } from '../../types';
import { GENRES_LIST } from '../../data/movies';
import { validateMovieForm, sanitizeText } from '../../utils/security';

export const AdminMovies: React.FC = () => {
  const { allMovies, addMovie, updateMovie, deleteMovie, openMovieDetails } = useMovies();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form fields
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [poster, setPoster] = useState('');
  const [backdrop, setBackdrop] = useState('');
  const [description, setDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [genre, setGenre] = useState('Sci-Fi');
  const [year, setYear] = useState(2026);
  const [runtime, setRuntime] = useState('1h 45m');
  const [rating, setRating] = useState(8.5);
  const [certification, setCertification] = useState('PG-13');
  const [language, setLanguage] = useState('English');
  const [director, setDirector] = useState('');
  const [castString, setCastString] = useState('John Doe as Lead, Jane Smith as Co-Lead');
  const [trailerEmbedUrl, setTrailerEmbedUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isLegalFullStream, setIsLegalFullStream] = useState(false);
  const [streamSourceLabel, setStreamSourceLabel] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');

  const clearFieldError = (fieldName: string) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const openAddModal = () => {
    setEditingMovie(null);
    setTitle('');
    setTagline('');
    setPoster('https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=700&q=80');
    setBackdrop('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=85');
    setDescription('');
    setFullDescription('');
    setGenre('Sci-Fi');
    setYear(2026);
    setRuntime('1h 50m');
    setRating(8.5);
    setCertification('PG-13');
    setLanguage('English');
    setDirector('');
    setCastString('Lead Actor as Hero, Co-Star as Partner');
    setTrailerEmbedUrl('https://www.youtube-nocookie.com/embed/R6MlUcmOul8');
    setVideoUrl('');
    setIsLegalFullStream(false);
    setStreamSourceLabel('');
    setStatus('published');
    setFormError(null);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (movie: Movie) => {
    setEditingMovie(movie);
    setTitle(movie.title);
    setTagline(movie.tagline || '');
    setPoster(movie.poster);
    setBackdrop(movie.backdrop);
    setDescription(movie.description);
    setFullDescription(movie.fullDescription || movie.description);
    setGenre(movie.genre);
    setYear(movie.year);
    setRuntime(movie.runtime);
    setRating(movie.rating);
    setCertification(movie.certification);
    setLanguage(movie.language);
    setDirector(movie.director);
    setCastString(
      movie.cast?.map((c) => `${c.name} as ${c.character}`).join(', ') || 'Lead as Hero'
    );
    setTrailerEmbedUrl(movie.trailerEmbedUrl);
    setVideoUrl(movie.videoUrl || '');
    setIsLegalFullStream(Boolean(movie.isLegalFullStream));
    setStreamSourceLabel(movie.streamSourceLabel || '');
    setStatus(movie.status || 'published');
    setFormError(null);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate using robust validation helper
    const validationResult = validateMovieForm({
      title,
      poster,
      backdrop,
      description: description || fullDescription,
      genre,
      year: Number(year),
      runtime,
      rating: Number(rating),
      language,
      director: director || 'Unknown Director',
      trailerEmbedUrl,
      videoUrl,
      status,
    });

    if (!validationResult.isValid) {
      setFieldErrors(validationResult.errors);
      setFormError('Please resolve the highlighted validation issues before saving.');
      return;
    }

    // Parse cast list
    const parsedCast = castString.split(',').map((entry, idx) => {
      const parts = entry.split(' as ');
      return {
        name: sanitizeText(parts[0]?.trim() || `Actor ${idx + 1}`),
        character: sanitizeText(parts[1]?.trim() || 'Role'),
        avatar: `https://images.unsplash.com/photo-${1500000000000 + (idx * 10000)}?auto=format&fit=crop&w=200&q=80`,
      };
    });

    setIsSubmitting(true);
    try {
      const moviePayload = {
        title: sanitizeText(title),
        tagline: tagline.trim() ? sanitizeText(tagline) : undefined,
        poster: poster.trim(),
        backdrop: backdrop.trim() || poster.trim(),
        description: sanitizeText(description.trim() || fullDescription.trim()),
        fullDescription: sanitizeText(fullDescription.trim() || description.trim()),
        genre,
        genres: [genre, 'Action'],
        year: Number(year),
        runtime: runtime.trim(),
        runtimeMinutes: 110,
        rating: Number(rating),
        certification,
        language: sanitizeText(language),
        director: sanitizeText(director.trim() || 'Unknown Director'),
        cast: parsedCast.length > 0 ? parsedCast : [{ name: 'Lead Actor', character: 'Hero', avatar: '' }],
        trailerEmbedUrl: trailerEmbedUrl.trim(),
        videoUrl: videoUrl.trim() || undefined,
        isLegalFullStream: Boolean(videoUrl.trim()),
        streamSourceLabel: streamSourceLabel.trim() ? sanitizeText(streamSourceLabel) : undefined,
        status,
      };

      if (editingMovie) {
        await updateMovie(editingMovie.id, moviePayload);
      } else {
        await addMovie(moviePayload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save movie.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMovie(id);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Filter movies
  const filtered = allMovies.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.director.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genre.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'draft'
        ? m.status === 'draft'
        : m.status !== 'draft';

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Film className="w-6 h-6 text-purple-400" />
            <span>Movie Catalog Management</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Add, edit, or archive movies, official studio trailers, and verified public domain cinema.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 shadow-md shadow-rose-900/30 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Movie</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search catalog by title, director, or genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-400">Status:</span>
          {(['all', 'published', 'draft'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl font-semibold capitalize border transition cursor-pointer ${
                statusFilter === s
                  ? 'bg-purple-600 text-white border-purple-500'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Movies Table */}
      <div className="rounded-2xl border border-zinc-800/90 bg-[#09090f]/70 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase font-bold tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Poster & Title</th>
                <th className="py-3.5 px-3">Genre</th>
                <th className="py-3.5 px-3">Year</th>
                <th className="py-3.5 px-3">Rating</th>
                <th className="py-3.5 px-3">Playback</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    No movies found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((movie) => (
                  <tr key={movie.id} className="hover:bg-zinc-900/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="w-10 h-14 rounded-lg object-cover ring-1 ring-zinc-800 flex-shrink-0"
                          loading="lazy"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-white text-xs sm:text-sm truncate">
                            {movie.title}
                          </p>
                          <p className="text-[11px] text-zinc-400 truncate">
                            {movie.director} • {movie.runtime}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[11px] bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {movie.genre}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-zinc-300 font-medium">
                      {movie.year}
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 font-bold text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{movie.rating.toFixed(1)}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      {movie.isLegalFullStream ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Full Stream</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
                          <Film className="w-3.5 h-3.5" />
                          <span>Trailer Only</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          movie.status === 'draft'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {movie.status || 'published'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openMovieDetails(movie)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                          title="View on site"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => openEditModal(movie)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-purple-300 hover:bg-purple-950/40 transition cursor-pointer"
                          title="Edit movie"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmId(movie.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                          title="Delete movie"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MOVIE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[#0c0c16] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-zinc-800 pb-3">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-purple-400" />
                <span>{editingMovie ? 'Edit Movie Information' : 'Add New Movie Title'}</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Configure metadata, legal stream sources, and official studio trailer embeds with validated schemas.
              </p>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-zinc-300">Movie Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      clearFieldError('title');
                    }}
                    placeholder="e.g. Neon Odyssey"
                    className={`w-full p-2.5 rounded-xl bg-zinc-950 border text-white focus:outline-none ${
                      fieldErrors.title ? 'border-rose-500' : 'border-zinc-700 focus:border-purple-500'
                    }`}
                  />
                  {fieldErrors.title && (
                    <span className="text-[11px] text-rose-400 font-medium block">{fieldErrors.title}</span>
                  )}
                </div>

                {/* Tagline */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-zinc-300">Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. When memory replaces reality..."
                    className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Genre */}
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Primary Genre *</label>
                  <select
                    value={genre}
                    onChange={(e) => {
                      setGenre(e.target.value);
                      clearFieldError('genre');
                    }}
                    className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white focus:outline-none focus:border-purple-500"
                  >
                    {GENRES_LIST.filter((g) => g !== 'All').map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Release Year *</label>
                  <input
                    type="number"
                    min={1888}
                    max={2035}
                    value={year}
                    onChange={(e) => {
                      setYear(Number(e.target.value));
                      clearFieldError('year');
                    }}
                    className={`w-full p-2.5 rounded-xl bg-zinc-950 border text-white focus:outline-none ${
                      fieldErrors.year ? 'border-rose-500' : 'border-zinc-700 focus:border-purple-500'
                    }`}
                  />
                  {fieldErrors.year && (
                    <span className="text-[11px] text-rose-400 font-medium block">{fieldErrors.year}</span>
                  )}
                </div>

                {/* Rating */}
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">IMDb / Critic Rating (0.0 - 10.0) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={rating}
                    onChange={(e) => {
                      setRating(Number(e.target.value));
                      clearFieldError('rating');
                    }}
                    className={`w-full p-2.5 rounded-xl bg-zinc-950 border text-white focus:outline-none ${
                      fieldErrors.rating ? 'border-rose-500' : 'border-zinc-700 focus:border-purple-500'
                    }`}
                  />
                  {fieldErrors.rating && (
                    <span className="text-[11px] text-rose-400 font-medium block">{fieldErrors.rating}</span>
                  )}
                </div>

                {/* Runtime */}
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Runtime *</label>
                  <input
                    type="text"
                    value={runtime}
                    onChange={(e) => {
                      setRuntime(e.target.value);
                      clearFieldError('runtime');
                    }}
                    placeholder="e.g. 1h 48m"
                    className={`w-full p-2.5 rounded-xl bg-zinc-950 border text-white focus:outline-none ${
                      fieldErrors.runtime ? 'border-rose-500' : 'border-zinc-700 focus:border-purple-500'
                    }`}
                  />
                  {fieldErrors.runtime && (
                    <span className="text-[11px] text-rose-400 font-medium block">{fieldErrors.runtime}</span>
                  )}
                </div>

                {/* Language */}
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Audio Language *</label>
                  <input
                    type="text"
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value);
                      clearFieldError('language');
                    }}
                    placeholder="English"
                    className={`w-full p-2.5 rounded-xl bg-zinc-950 border text-white focus:outline-none ${
                      fieldErrors.language ? 'border-rose-500' : 'border-zinc-700 focus:border-purple-500'
                    }`}
                  />
                  {fieldErrors.language && (
                    <span className="text-[11px] text-rose-400 font-medium block">{fieldErrors.language}</span>
                  )}
                </div>

                {/* Director */}
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Director</label>
                  <input
                    type="text"
                    value={director}
                    onChange={(e) => {
                      setDirector(e.target.value);
                      clearFieldError('director');
                    }}
                    placeholder="e.g. Christopher Nolan"
                    className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white focus:outline-none focus:border-purple-500"
                  />
                  {fieldErrors.director && (
                    <span className="text-[11px] text-rose-400 font-medium block">{fieldErrors.director}</span>
                  )}
                </div>

                {/* Poster URL */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-zinc-300">Poster Image URL *</label>
                  <input
                    type="url"
                    value={poster}
                    onChange={(e) => {
                      setPoster(e.target.value);
                      clearFieldError('poster');
                    }}
                    placeholder="https://..."
                    className={`w-full p-2.5 rounded-xl bg-zinc-950 border text-white focus:outline-none ${
                      fieldErrors.poster ? 'border-rose-500' : 'border-zinc-700 focus:border-purple-500'
                    }`}
                  />
                  {fieldErrors.poster && (
                    <span className="text-[11px] text-rose-400 font-medium block">{fieldErrors.poster}</span>
                  )}
                </div>

                {/* Backdrop URL */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-zinc-300">Cinematic Backdrop URL (16:9)</label>
                  <input
                    type="url"
                    value={backdrop}
                    onChange={(e) => {
                      setBackdrop(e.target.value);
                      clearFieldError('backdrop');
                    }}
                    placeholder="https://..."
                    className={`w-full p-2.5 rounded-xl bg-zinc-950 border text-white focus:outline-none ${
                      fieldErrors.backdrop ? 'border-rose-500' : 'border-zinc-700 focus:border-purple-500'
                    }`}
                  />
                  {fieldErrors.backdrop && (
                    <span className="text-[11px] text-rose-400 font-medium block">{fieldErrors.backdrop}</span>
                  )}
                </div>

                {/* Short Description */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-zinc-300">Short Synopsis *</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      clearFieldError('description');
                    }}
                    placeholder="Brief 1-2 sentence hook..."
                    className={`w-full p-2.5 rounded-xl bg-zinc-950 border text-white focus:outline-none ${
                      fieldErrors.description ? 'border-rose-500' : 'border-zinc-700 focus:border-purple-500'
                    }`}
                  />
                  {fieldErrors.description && (
                    <span className="text-[11px] text-rose-400 font-medium block">{fieldErrors.description}</span>
                  )}
                </div>

                {/* Full Description */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-zinc-300">Full Description</label>
                  <textarea
                    rows={3}
                    value={fullDescription}
                    onChange={(e) => setFullDescription(e.target.value)}
                    placeholder="Comprehensive plot storyline..."
                    className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Cast */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-zinc-300">Key Cast (Format: Actor as Role, ...)</label>
                  <input
                    type="text"
                    value={castString}
                    onChange={(e) => setCastString(e.target.value)}
                    placeholder="Derek de Lint as Thom, Sergio Hasselbaink as Barley"
                    className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Official Studio Trailer URL */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-zinc-300">Official Trailer Embed URL *</label>
                  <input
                    type="url"
                    value={trailerEmbedUrl}
                    onChange={(e) => {
                      setTrailerEmbedUrl(e.target.value);
                      clearFieldError('trailerEmbedUrl');
                    }}
                    placeholder="https://www.youtube-nocookie.com/embed/..."
                    className={`w-full p-2.5 rounded-xl bg-zinc-950 border text-white focus:outline-none ${
                      fieldErrors.trailerEmbedUrl ? 'border-rose-500' : 'border-zinc-700 focus:border-purple-500'
                    }`}
                  />
                  {fieldErrors.trailerEmbedUrl ? (
                    <span className="text-[11px] text-rose-400 font-medium block">{fieldErrors.trailerEmbedUrl}</span>
                  ) : (
                    <span className="text-[10px] text-zinc-500 block">
                      Use embed format: https://www.youtube-nocookie.com/embed/VIDEO_ID
                    </span>
                  )}
                </div>

                {/* Legal Video Stream URL (Open Source / Public Domain) */}
                <div className="space-y-1 sm:col-span-2">
                  <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Legal Full-Feature Video Stream (Optional)</span>
                  </div>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => {
                      setVideoUrl(e.target.value);
                      clearFieldError('videoUrl');
                    }}
                    placeholder="https://commondatastorage.googleapis.com/.../movie.mp4"
                    className={`w-full p-2.5 rounded-xl bg-zinc-950 border text-white focus:outline-none ${
                      fieldErrors.videoUrl ? 'border-rose-500' : 'border-zinc-700 focus:border-purple-500'
                    }`}
                  />
                  {fieldErrors.videoUrl ? (
                    <span className="text-[11px] text-rose-400 font-medium block">{fieldErrors.videoUrl}</span>
                  ) : (
                    <span className="text-[10px] text-zinc-500 block">
                      Strictly authorized public-domain or Creative Commons (CC-BY) MP4 streams. No pirated/copyrighted links.
                    </span>
                  )}
                </div>

                {/* Stream Source Label */}
                {videoUrl && (
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-semibold text-zinc-300">License / Source Archive Attribution</label>
                    <input
                      type="text"
                      value={streamSourceLabel}
                      onChange={(e) => setStreamSourceLabel(e.target.value)}
                      placeholder="e.g. Creative Commons 3.0 • Blender Foundation Open Project"
                      className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                )}

                {/* Status Toggle */}
                <div className="space-y-1 sm:col-span-2 pt-2">
                  <label className="font-semibold text-zinc-300 block">Publication State</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="movieStatus"
                        value="published"
                        checked={status === 'published'}
                        onChange={() => setStatus('published')}
                        className="text-purple-600"
                      />
                      <span className="text-zinc-200">Published (Visible to all viewers)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="movieStatus"
                        value="draft"
                        checked={status === 'draft'}
                        onChange={() => setStatus('draft')}
                        className="text-purple-600"
                      />
                      <span className="text-zinc-400">Draft (Admin eyes only)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white bg-zinc-900 transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 transition cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingMovie ? 'Save Changes' : 'Publish Movie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm bg-[#0c0c16] border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Delete Movie?</h3>
              <p className="text-xs text-zinc-400">
                Are you sure you want to permanently delete this movie from MovieFlix? This will remove it from the catalog.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-rose-900/40"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
