import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Clapperboard,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useAuth, PRESET_AVATARS } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    authNotice,
    openAuthModal,
    closeAuthModal,
    loginWithEmail,
    registerWithEmail,
    signInWithGoogle,
    resetPassword,
  } = useAuth();

  const { showToast } = useToast();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0].url);
  const [rememberMe, setRememberMe] = useState(true);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Reset errors and fields on mode switch or modal open
  useEffect(() => {
    setErrorMsg(null);
    setResetSuccess(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  // Validation helpers
  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: '', color: 'bg-zinc-700', width: '0%' };
    if (pass.length < 6) return { label: 'Too short', color: 'bg-rose-500', width: '25%' };
    const hasNum = /\d/.test(pass);
    const hasLetter = /[a-zA-Z]/.test(pass);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pass);

    if (pass.length >= 8 && hasNum && hasLetter && hasSpecial) {
      return { label: 'Strong', color: 'bg-emerald-500', width: '100%' };
    }
    if (pass.length >= 6 && hasLetter && hasNum) {
      return { label: 'Medium', color: 'bg-amber-500', width: '60%' };
    }
    return { label: 'Weak', color: 'bg-yellow-500', width: '40%' };
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!isValidEmail(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await loginWithEmail(email.trim(), password, rememberMe);
      showToast('Welcome Back!', 'Signed into MovieFlix successfully.', 'success');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedUser = username.trim();
    if (!trimmedUser) {
      setErrorMsg('Username is required.');
      return;
    }
    if (trimmedUser.length < 3) {
      setErrorMsg('Username must be at least 3 characters.');
      return;
    }
    if (trimmedUser.length > 30) {
      setErrorMsg('Username cannot exceed 30 characters.');
      return;
    }
    if (!isValidEmail(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await registerWithEmail(trimmedUser, email.trim(), password, selectedAvatar);
      showToast('Account Created!', `Welcome to MovieFlix, ${trimmedUser}!`, 'success');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setUsername('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !isValidEmail(email)) {
      setErrorMsg('Please enter a valid email address to send the reset link.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim());
      setResetSuccess(true);
      showToast('Reset Link Sent', 'Check your email inbox for password reset instructions.', 'info');
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not send reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      showToast('Google Sign-In', 'Signed in successfully with your Google account.', 'success');
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMsg('Google Sign-In was cancelled or failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0b0b13] border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/40 space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Close Modal Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 via-rose-600 to-amber-500 p-[1.5px] mx-auto shadow-lg shadow-purple-900/30 flex items-center justify-center">
            <div className="w-full h-full bg-[#0a0a12] rounded-[14px] flex items-center justify-center">
              <Clapperboard className="w-6 h-6 text-rose-400" />
            </div>
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            {authModalMode === 'login' && 'Sign In to MovieFlix'}
            {authModalMode === 'register' && 'Create Your MovieFlix Account'}
            {authModalMode === 'forgot_password' && 'Reset Your Password'}
          </h2>

          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            {authModalMode === 'login' && 'Access your personalized watchlist, stream full features, and share film reviews.'}
            {authModalMode === 'register' && 'Join the premier cinema platform with personalized queues and community discussions.'}
            {authModalMode === 'forgot_password' && 'Enter your registered email address and we will send you a secure password reset link.'}
          </p>
        </div>

        {/* Notice Banner (e.g. from protected feature click) */}
        {authNotice && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-950/50 border border-purple-800/60 text-xs text-purple-200">
            <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>{authNotice}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-xs text-rose-200 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span className="flex-1">{errorMsg}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {authModalMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 block">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 text-sm text-white placeholder-zinc-500 border border-zinc-700/80 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300">Password</label>
                <button
                  type="button"
                  onClick={() => openAuthModal('forgot_password')}
                  className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900/90 text-sm text-white placeholder-zinc-500 border border-zinc-700/80 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-purple-600 focus:ring-purple-500/40"
                />
                <span>Remember me on this browser</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 shadow-lg shadow-rose-900/30 active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Google Divider */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#0b0b13] px-2 text-zinc-500">Or continue with</span>
              </div>
            </div>

            {/* Google Sign-in */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-zinc-200 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 transition cursor-pointer flex items-center justify-center gap-2.5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Footer link to Register */}
            <div className="text-center pt-2 text-xs text-zinc-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => openAuthModal('register')}
                className="font-bold text-rose-400 hover:text-rose-300 transition cursor-pointer"
              >
                Create one now
              </button>
            </div>
          </form>
        )}

        {/* REGISTER FORM */}
        {authModalMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 block">Username</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. cinema_buff"
                  minLength={3}
                  maxLength={30}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 text-sm text-white placeholder-zinc-500 border border-zinc-700/80 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition"
                />
                <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 block">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 text-sm text-white placeholder-zinc-500 border border-zinc-700/80 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Avatar Selection Picker */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-zinc-300 block">Choose Avatar</label>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_AVATARS.map((av) => {
                  const isSelected = selectedAvatar === av.url;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setSelectedAvatar(av.url)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-purple-500 ring-2 ring-purple-500/40 scale-105'
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

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900/90 text-sm text-white placeholder-zinc-500 border border-zinc-700/80 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength bar */}
              {password && (
                <div className="space-y-1 pt-1">
                  <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-400">
                    Strength: <span className="font-semibold text-zinc-300">{strength.label}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 block">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900/90 text-sm text-white placeholder-zinc-500 border border-zinc-700/80 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-rose-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 shadow-lg shadow-purple-900/30 active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Google Divider */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#0b0b13] px-2 text-zinc-500">Or sign up with</span>
              </div>
            </div>

            {/* Google Sign-in */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-zinc-200 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 transition cursor-pointer flex items-center justify-center gap-2.5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Footer link to Login */}
            <div className="text-center pt-2 text-xs text-zinc-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="font-bold text-rose-400 hover:text-rose-300 transition cursor-pointer"
              >
                Log in here
              </button>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {authModalMode === 'forgot_password' && (
          <div className="space-y-4">
            {resetSuccess ? (
              <div className="text-center space-y-4 py-4 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Reset Link Dispatched</h3>
                  <p className="text-xs text-zinc-400">
                    If an account is associated with <span className="text-white font-medium">{email}</span>, we have sent instructions to reset your password.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-zinc-800 hover:bg-zinc-700 transition cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 block">Registered Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      autoComplete="email"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 text-sm text-white placeholder-zinc-500 border border-zinc-700/80 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition"
                    />
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 shadow-lg shadow-purple-900/30 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Send Reset Email</span>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="text-xs font-semibold text-zinc-400 hover:text-white transition cursor-pointer"
                  >
                    &larr; Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
