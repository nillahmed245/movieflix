import React, { useState } from 'react';
import { Users, Shield, User as UserIcon, ShieldAlert, CheckCircle, Search, Mail, Calendar, Edit3, X } from 'lucide-react';
import { useMovies } from '../../context/MovieContext';
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../../types';

export const AdminUsers: React.FC = () => {
  const { adminUsers, updateUserRole } = useMovies();
  const { user: currentAuthUser } = useAuth();

  const [search, setSearch] = useState('');
  const [roleModalUser, setRoleModalUser] = useState<UserProfile | null>(null);
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin'>('user');
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredUsers = adminUsers.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.role && u.role.toLowerCase().includes(search.toLowerCase()))
  );

  const openRoleModal = (u: UserProfile) => {
    setRoleModalUser(u);
    setSelectedRole((u.role as 'user' | 'admin') || 'user');
  };

  const handleRoleChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleModalUser) return;
    setIsUpdating(true);
    try {
      await updateUserRole(roleModalUser.uid, selectedRole);
      setRoleModalUser(null);
    } catch (err) {
      console.error('Role update error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            <span>User & Access Management</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Audit registered MovieFlix accounts and manage administrative access privileges.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-purple-950/40 border border-purple-800/60 text-xs text-purple-200 font-semibold self-start sm:self-auto">
          {adminUsers.length} Registered {adminUsers.length === 1 ? 'User' : 'Users'}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search users by email, handle, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
        />
        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-zinc-800/90 bg-[#09090f]/70 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase font-bold tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-3">Email Address</th>
                <th className="py-3.5 px-3">Role</th>
                <th className="py-3.5 px-3">Joined Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500">
                    No users found matching query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrent = currentAuthUser?.uid === u.uid;
                  return (
                    <tr key={u.uid} className="hover:bg-zinc-900/40 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar || u.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                            alt={u.username}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-zinc-700 flex-shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-xs sm:text-sm">
                                {u.username || u.displayName}
                              </span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              UID: {u.uid.substring(0, 10)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-zinc-300">
                        {u.email}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          <span>{u.role || 'user'}</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 text-zinc-400">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Recent'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openRoleModal(u)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1 ml-auto"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                          <span>Change Role</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ROLE MODAL */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm bg-[#0c0c16] border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <button
              onClick={() => setRoleModalUser(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                <span>Modify User Role</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Update account access level for <strong className="text-white">{roleModalUser.username}</strong> ({roleModalUser.email}).
              </p>
            </div>

            <form onSubmit={handleRoleChangeSubmit} className="space-y-4">
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer">
                  <input
                    type="radio"
                    name="userRole"
                    value="user"
                    checked={selectedRole === 'user'}
                    onChange={() => setSelectedRole('user')}
                    className="text-purple-600"
                  />
                  <div>
                    <span className="font-bold text-white block">Standard User</span>
                    <span className="text-zinc-500 text-[11px]">Regular viewer with personal watchlist, likes, and comment rights.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-purple-950/30 border border-purple-800/60 cursor-pointer">
                  <input
                    type="radio"
                    name="userRole"
                    value="admin"
                    checked={selectedRole === 'admin'}
                    onChange={() => setSelectedRole('admin')}
                    className="text-purple-600"
                  />
                  <div>
                    <span className="font-bold text-purple-300 block">Administrator</span>
                    <span className="text-purple-400/80 text-[11px]">Full access to Admin Panel, catalog management, and moderation.</span>
                  </div>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRoleModalUser(null)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-zinc-400 text-xs font-semibold hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-lg shadow-purple-900/40 disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Update Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
