import React, { useState } from 'react';
import { MessageSquare, Trash2, Flag, CheckCircle, Search, Film, AlertTriangle } from 'lucide-react';
import { useMovies } from '../../context/MovieContext';

export const AdminComments: React.FC = () => {
  const { comments, deleteCommentAsAdmin, allMovies } = useMovies();
  const [search, setSearch] = useState('');
  const [filterReported, setFilterReported] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const getMovieTitle = (movieId: string) => {
    const found = allMovies.find((m) => m.id === movieId);
    return found?.title || movieId;
  };

  const filteredComments = comments.filter((c) => {
    const movieTitle = getMovieTitle(c.movieId).toLowerCase();
    const matchesSearch =
      c.content.toLowerCase().includes(search.toLowerCase()) ||
      c.userName.toLowerCase().includes(search.toLowerCase()) ||
      movieTitle.includes(search.toLowerCase());

    const matchesReport = filterReported ? (c.reportCount || 0) > 0 : true;

    return matchesSearch && matchesReport;
  });

  const handleDelete = async (id: string) => {
    await deleteCommentAsAdmin(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-purple-400" />
            <span>Community Reviews & Discussions Moderation</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Audit user comments, handle community flags, and remove inappropriate content.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterReported(!filterReported)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
              filterReported
                ? 'bg-rose-950/60 text-rose-300 border-rose-600/80 shadow'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Reported Only</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search by comment text, author, or movie..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
        />
        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      {/* Comments Table */}
      <div className="rounded-2xl border border-zinc-800/90 bg-[#09090f]/70 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase font-bold tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Author</th>
                <th className="py-3.5 px-3">Movie</th>
                <th className="py-3.5 px-3">Review Comment</th>
                <th className="py-3.5 px-3">Date</th>
                <th className="py-3.5 px-3">Reports</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredComments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    No community reviews found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredComments.map((comment) => (
                  <tr key={comment.id} className="hover:bg-zinc-900/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={comment.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                          alt={comment.userName}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-zinc-700 flex-shrink-0"
                        />
                        <span className="font-bold text-white text-xs truncate max-w-[120px]">
                          {comment.userName}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-semibold text-purple-300 text-xs truncate max-w-[140px] block">
                        {getMovieTitle(comment.movieId)}
                      </span>
                    </td>

                    <td className="py-3 px-3 max-w-sm">
                      <p className="text-zinc-200 line-clamp-2 text-xs">
                        "{comment.content}"
                      </p>
                    </td>

                    <td className="py-3 px-3 text-zinc-400 whitespace-nowrap">
                      {new Date(comment.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-3 px-3">
                      {(comment.reportCount || 0) > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px] border border-rose-500/40 flex items-center gap-1 w-fit">
                          <Flag className="w-3 h-3 text-rose-400" />
                          <span>{comment.reportCount} flags</span>
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-[11px]">Clean</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setDeleteConfirmId(comment.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                        title="Delete comment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm bg-[#0c0c16] border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Moderate Review?</h3>
              <p className="text-xs text-zinc-400">
                Are you sure you want to permanently delete this comment from the community discussion?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-900/40"
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
