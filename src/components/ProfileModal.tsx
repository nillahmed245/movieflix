import React, { useState, useEffect } from 'react';
import {
  X,
  LogOut,
  LogIn,
  Bookmark,
  Heart,
  MessageSquare,
  Shield,
  CheckCircle,
  Edit3,
  Save,
  RotateCcw,
  Calendar,
  Mail,
  User as UserIcon,
  Check,
  Sparkles,
} from 'lucide-react';
import { useAuth, PRESET_AVATARS } from '../context/AuthContext';
import { useMovies } from '../context/MovieContext';
import { useToast } from '../context/ToastContext';

export const ProfileModal: React.FC = () => {
  const { user, profile, isAdmin, logOut, updateUserProfile, openAuthModal } = useAuth();
  const { isProfileOpen, setIsProfileOpen, watchlist, likedMovieIds, comments, setActiveTab } = useMovies();
  const { showToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Synchronize editing state whenever profile loads or edit mode opens
  useEffect(() => {
    if (profile) {
      setEditUsername(profile.username || profile.displayName || '');
      setEditAvatar(profile.avatar || profile.photoURL || PRESET_AVATARS[0].url);
    }
    setIsEditing(false);
    setErrorMsg(null);
  }, [profile, isProfileOpen]);

  if (!isProfileOpen) return null;

  const userComments = comments.filter((c) => user && c.userId === user.uid);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmed = editUsername.trim();
    if (!trimmed) {
      setErrorMsg('Username cannot be empty.');
      return;
    }
    if (trimmed.length < 3) {
      setErrorMsg('Username must be at least 3 characters.');
      return;
    }
    if (trimmed.length > 30) {
      setErrorMsg('Username cannot exceed 30 characters.');
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile({
        username: trimmed,
        avatar: editAvatar,
      });
      showToast('Profile Updated', 'Your changes have been saved to MovieFlix.', 'success');
      setIsEditing(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setEditUsername(profile.username || profile.displayName || '');
      setEditAvatar(profile.avatar || profile.photoURL || PRESET_AVATARS[0].url);
    }
    setIsEditing(false);
    setErrorMsg(null);
  };

  const formattedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0b0b13] border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/40 space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setIsProfileOpen(false)}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800/80 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {user && profile ? (
          <>
            {/* VIEW MODE */}
            {!isEditing ? (
              <div className="space-y-6">
                {/* User Header */}
                <div className="flex flex-col items-center text-center space-y-2 pt-1">
                  <div className="relative">
                    <img
                      src={profile.avatar || profile.photoURL || PRESET_AVATARS[0].url}
                      alt={profile.username}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-purple-600/40 shadow-xl"
                    />
                    <span className="absolute bottom-0 right-1 w-6 h-6 rounded-full bg-emerald-500 ring-2 ring-[#0b0b13] flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      {profile.username || profile.displayName}
                    </h3>
                    <p className="text-xs text-zinc-400 flex items-center justify-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-zinc-500" />
                      <span>{profile.email}</span>
                    </p>
                  </div>

                  {/* Status / Role Badge */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[11px] font-semibold">
                      <Shield className="w-3 h-3 text-purple-400" />
                      <span className="capitalize">{profile.role || 'Member'}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500">
                      <Calendar className="w-3 h-3" />
                      <span>Member since {formattedDate}</span>
                    </span>
                  </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-3 gap-2.5 py-2">
                  <div className="text-center p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                    <Bookmark className="w-4 h-4 text-rose-400 mx-auto mb-1" />
                    <span className="block text-lg sm:text-xl font-black text-white">{watchlist.length}</span>
                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Watchlist</span>
                  </div>

                  <div className="text-center p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                    <Heart className="w-4 h-4 text-pink-400 mx-auto mb-1" />
                    <span className="block text-lg sm:text-xl font-black text-white">{likedMovieIds.length}</span>
                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Liked</span>
                  </div>

                  <div className="text-center p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                    <MessageSquare className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                    <span className="block text-lg sm:text-xl font-black text-white">{userComments.length}</span>
                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Reviews</span>
                  </div>
                </div>

                {/* Account Details Box */}
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-zinc-800/80">
                    <span className="text-zinc-500">Account ID</span>
                    <span className="font-mono text-zinc-400 text-[11px] truncate max-w-[200px]">
                      {user.uid}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-800/80">
                    <span className="text-zinc-500">Security Provider</span>
                    <span className="text-zinc-300">
                      {user.providerData[0]?.providerId === 'google.com' ? 'Google OAuth' : 'Email & Password'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-500">Account Status</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active Verified
                    </span>
                  </div>
                </div>

                {/* Admin Access Shortcut if Admin */}
                {isAdmin && (
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setActiveTab('admin');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-purple-200 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-600/50 shadow-md transition cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-rose-400" />
                    <span>Open Admin Command Console</span>
                  </button>
                )}

                {/* Primary Actions */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 shadow-md shadow-purple-900/30 transition cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    onClick={async () => {
                      await logOut();
                      setIsProfileOpen(false);
                      showToast('Logged Out', 'You have been signed out.', 'info');
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              /* EDIT PROFILE MODE */
              <form onSubmit={handleSaveProfile} className="space-y-5 animate-fade-in">
                <div className="border-b border-zinc-800 pb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-purple-400" />
                    <span>Edit Profile</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Update your public screen handle and cinematic avatar image.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-200">
                    {errorMsg}
                  </div>
                )}

                {/* Username Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 block">Username</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      minLength={3}
                      maxLength={30}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 text-sm text-white placeholder-zinc-500 border border-zinc-700/80 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition"
                    />
                    <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <span className="text-[10px] text-zinc-500 block">
                    Between 3 and 30 characters.
                  </span>
                </div>

                {/* Avatar Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300 block">Select Avatar</label>
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_AVATARS.map((av) => {
                      const isSelected = editAvatar === av.url;
                      return (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setEditAvatar(av.url)}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-purple-500 ring-2 ring-purple-500/50 scale-105'
                              : 'border-zinc-800 opacity-60 hover:opacity-100'
                          }`}
                          title={av.label}
                        >
                          <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-purple-600/30 flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Read-Only Non-Editable Fields */}
                <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Email (Protected)</span>
                    <span className="text-zinc-400 font-medium">{profile.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Account Role</span>
                    <span className="text-zinc-400 font-medium capitalize">{profile.role || 'user'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Member Since</span>
                    <span className="text-zinc-400">{formattedDate}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-900/30 transition cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          /* GUEST STATE */
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center mx-auto">
              <LogIn className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Join MovieFlix</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                Sign in or register to sync your watchlist, track your favorite movies, and leave reviews across all devices.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  openAuthModal('login');
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-purple-600 via-rose-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-900/30 transition cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  openAuthModal('register');
                }}
                className="w-full py-2.5 rounded-xl font-semibold text-xs text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 transition cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
