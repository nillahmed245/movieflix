import React, { useState } from 'react';
import { Grid, Plus, Edit2, Trash2, X, AlertTriangle, Clapperboard, Check } from 'lucide-react';
import { useMovies } from '../../context/MovieContext';
import { GenreItem } from '../../types';
import { sanitizeText, isValidHttpUrl } from '../../utils/security';

export const AdminGenres: React.FC = () => {
  const { genres, addGenre, updateGenre, deleteGenre, allMovies } = useMovies();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<GenreItem | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [color, setColor] = useState('from-purple-600/80 to-indigo-950/90');
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingGenre(null);
    setName('');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80');
    setColor('from-purple-600/80 to-indigo-950/90');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (g: GenreItem) => {
    setEditingGenre(g);
    setName(g.name);
    setDescription(g.description || '');
    setImage(g.image || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80');
    setColor(g.color || 'from-purple-600/80 to-indigo-950/90');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = sanitizeText(name);
    if (!cleanName || cleanName.length < 2) {
      setFormError('Genre name must be at least 2 characters long.');
      return;
    }
    if (cleanName.length > 64) {
      setFormError('Genre name cannot exceed 64 characters.');
      return;
    }

    if (image.trim() && !isValidHttpUrl(image.trim())) {
      setFormError('Genre cover must be a valid HTTP or HTTPS image URL.');
      return;
    }

    // Check duplicate
    const duplicate = genres.find(
      (g) => g.name.toLowerCase() === cleanName.toLowerCase() && (!editingGenre || g.id !== editingGenre.id)
    );
    if (duplicate) {
      setFormError(`A genre named "${cleanName}" already exists.`);
      return;
    }

    try {
      if (editingGenre) {
        await updateGenre(editingGenre.id, {
          name: cleanName,
          description: sanitizeText(description),
          image: image.trim(),
          color: color.trim(),
        });
      } else {
        await addGenre({
          name: cleanName,
          description: sanitizeText(description),
          image: image.trim(),
          color: color.trim(),
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save genre.');
    }
  };

  const handleDelete = async (id: string) => {
    await deleteGenre(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Grid className="w-6 h-6 text-purple-400" />
            <span>Genre & Category Management</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Organize movies into thematic genres and configure promotional imagery.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 shadow-md shadow-rose-900/30 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Genre</span>
        </button>
      </div>

      {/* Genres Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {genres.map((g) => {
          const count = allMovies.filter(
            (m) => m.genre === g.name || m.genres?.includes(g.name)
          ).length;

          return (
            <div
              key={g.id || g.name}
              className="group relative h-48 rounded-2xl overflow-hidden border border-zinc-800 bg-[#09090f] shadow-lg flex flex-col justify-between p-4"
            >
              {/* Background cover image */}
              <img
                src={g.image || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'}
                alt={g.name}
                className="absolute inset-0 w-full h-full object-cover filter brightness-[0.4] group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              <div className="relative z-10 flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-zinc-300 border border-white/10">
                  {count} {count === 1 ? 'Movie' : 'Movies'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(g)}
                    className="p-1.5 rounded-lg bg-black/60 hover:bg-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer"
                    title="Edit genre"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(g.id)}
                    className="p-1.5 rounded-lg bg-black/60 hover:bg-rose-950 text-zinc-300 hover:text-rose-400 transition cursor-pointer"
                    title="Delete genre"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="relative z-10">
                <h3 className="text-lg font-black text-white">{g.name}</h3>
                <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5 leading-snug">
                  {g.description || 'Cinema category'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0c0c16] border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Grid className="w-5 h-5 text-purple-400" />
                <span>{editingGenre ? 'Edit Genre' : 'Create Genre'}</span>
              </h3>
              <p className="text-xs text-zinc-400">Configure genre name and display card properties.</p>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Genre Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cyberpunk"
                  required
                  className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Atmospheric styling and motifs..."
                  className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Cover Artwork URL</label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500"
                >
                  {editingGenre ? 'Save Changes' : 'Create Genre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm bg-[#0c0c16] border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Delete Genre?</h3>
              <p className="text-xs text-zinc-400">
                Are you sure you want to remove this category? Movies tagged with this genre will remain in the catalog.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-zinc-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
