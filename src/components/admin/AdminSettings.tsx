import React from 'react';
import {
  Shield,
  User as UserIcon,
  Mail,
  Calendar,
  LogOut,
  ArrowLeft,
  Activity,
  CheckCircle,
  Database,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMovies } from '../../context/MovieContext';

interface AdminSettingsProps {
  onBackToSite: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ onBackToSite }) => {
  const { user, profile, logOut } = useAuth();
  const { adminLogs } = useMovies();

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Shield className="w-6 h-6 text-purple-400" />
          <span>Admin Account & Platform Settings</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
          View your administrative credentials, session tokens, and security activity audit logs.
        </p>
      </div>

      {/* Account Info Card */}
      <div className="p-6 rounded-2xl bg-[#09090f]/70 border border-zinc-800/90 space-y-5">
        <h3 className="font-bold text-white text-base">Administrator Credentials</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
            <span className="text-zinc-500 font-medium">Administrator Email</span>
            <p className="text-white font-semibold text-sm">{user?.email || 'N/A'}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
            <span className="text-zinc-500 font-medium">Admin Screen Handle</span>
            <p className="text-white font-semibold text-sm">{profile?.username || user?.displayName || 'Admin'}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
            <span className="text-zinc-500 font-medium">Platform Role</span>
            <p className="text-purple-300 font-semibold text-sm flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>Full Administrator Privileges</span>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
            <span className="text-zinc-500 font-medium">Security Guard</span>
            <p className="text-emerald-400 font-semibold text-sm flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              <span>Cryptographically Enforced Rules</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={onBackToSite}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-zinc-200 bg-zinc-800 hover:bg-zinc-700 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to MovieFlix Website</span>
          </button>

          <button
            onClick={async () => {
              await logOut();
              onBackToSite();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Admin Session</span>
          </button>
        </div>
      </div>

      {/* Security Audit Activity Log */}
      <div className="p-6 rounded-2xl bg-[#09090f]/70 border border-zinc-800/90 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <span>Administrative Audit Log</span>
          </h3>
          <span className="text-xs text-zinc-500">{adminLogs.length} Logged Operations</span>
        </div>

        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {adminLogs.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">
              No logged administrative operations yet. Actions like adding movies or moderating reviews are recorded here.
            </p>
          ) : (
            adminLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {log.action}
                    </span>
                    <span className="text-zinc-300 font-medium">{log.details || log.targetId}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    By: {log.adminEmail} • Target: {log.targetType} ({log.targetId})
                  </p>
                </div>

                <span className="text-[10px] text-zinc-500 whitespace-nowrap ml-3">
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                  {new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
