import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User,
  db,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { UserProfile, AuthModalMode } from '../types';
import { sanitizeText } from '../utils/security';

export const PRESET_AVATARS = [
  { id: 'av-1', label: 'Cinephile Critic', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
  { id: 'av-2', label: 'Film Director', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
  { id: 'av-3', label: 'Screenwriter', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80' },
  { id: 'av-4', label: 'Sci-Fi Explorer', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
  { id: 'av-5', label: 'Cinema Historian', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80' },
  { id: 'av-6', label: 'Art Director', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80' },
];

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: AuthModalMode;
  authNotice: string | null;
  openAuthModal: (mode?: AuthModalMode, notice?: string) => void;
  closeAuthModal: () => void;
  signInWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  registerWithEmail: (username: string, email: string, password: string, avatar?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: { username?: string; avatar?: string }) => Promise<void>;
  logOut: () => Promise<void>;
  requireAuth: (callback: () => void, notice?: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isAdmin: false,
  loading: true,
  isAuthModalOpen: false,
  authModalMode: 'login',
  authNotice: null,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  signInWithGoogle: async () => {},
  loginWithEmail: async () => {},
  registerWithEmail: async () => {},
  resetPassword: async () => {},
  updateUserProfile: async () => {},
  logOut: async () => {},
  requireAuth: () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth modal control
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login');
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  const openAuthModal = useCallback((mode: AuthModalMode = 'login', notice?: string) => {
    setAuthModalMode(mode);
    setAuthNotice(notice || null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthNotice(null);
  }, []);

  const requireAuth = useCallback(
    (callback: () => void, notice: string = 'Please log in to continue.'): boolean => {
      if (user) {
        callback();
        return true;
      }
      openAuthModal('login', notice);
      return false;
    },
    [user, openAuthModal]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const isRootAdmin = currentUser.email === 'md3048284@gmail.com';
        const userDocRef = doc(db, 'users', currentUser.uid);
        try {
          const snapshot = await getDoc(userDocRef);
          if (snapshot.exists()) {
            const data = snapshot.data();
            const assignedRole = isRootAdmin ? 'admin' : (data.role || 'user');
            const loadedProfile: UserProfile = {
              uid: currentUser.uid,
              id: currentUser.uid,
              email: currentUser.email || data.email || '',
              username: data.username || data.displayName || currentUser.displayName || 'cinephile',
              displayName: data.displayName || data.username || currentUser.displayName || 'Cinema Enthusiast',
              avatar: data.avatar || data.photoURL || currentUser.photoURL || PRESET_AVATARS[0].url,
              photoURL: data.avatar || data.photoURL || currentUser.photoURL || undefined,
              role: assignedRole,
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString(),
            };

            // If root admin is logged in but Firestore role was previously 'user', elevate in Firestore
            if (isRootAdmin && data.role !== 'admin') {
              try {
                await updateDoc(userDocRef, { role: 'admin' });
              } catch (e) {
                // Ignore if security rules require specific condition
              }
            }

            setProfile(loadedProfile);
          } else {
            // New user registration / first Google login profile creation
            const assignedRole = isRootAdmin ? 'admin' : 'user';
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              id: currentUser.uid,
              email: currentUser.email || '',
              username: currentUser.displayName?.replace(/\s+/g, '_').toLowerCase() || 'cinephile',
              displayName: currentUser.displayName || 'Cinema Enthusiast',
              avatar: currentUser.photoURL || PRESET_AVATARS[0].url,
              photoURL: currentUser.photoURL || undefined,
              role: assignedRole,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
          // Optimistic fallback in case of transient offline state
          setProfile({
            uid: currentUser.uid,
            id: currentUser.uid,
            email: currentUser.email || '',
            username: currentUser.displayName?.replace(/\s+/g, '_').toLowerCase() || 'cinephile',
            displayName: currentUser.displayName || 'Cinema Enthusiast',
            avatar: currentUser.photoURL || PRESET_AVATARS[0].url,
            role: isRootAdmin ? 'admin' : 'user',
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      closeAuthModal();
    } catch (error: any) {
      if (error?.code !== 'auth/popup-closed-by-user') {
        console.error('Google Sign-in failed:', error);
        throw error;
      }
    }
  };

  const loginWithEmail = async (email: string, password: string, rememberMe?: boolean) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      closeAuthModal();
    } catch (error: any) {
      console.error('Login error:', error);
      let message = 'Unable to sign in. Please verify your credentials.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        message = 'Invalid email or password. Please check your credentials.';
      } else if (error.code === 'auth/user-not-found') {
        message = 'No MovieFlix account found with this email.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Access temporarily disabled due to multiple failed login attempts. Try resetting your password.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Please provide a valid email address.';
      }
      throw new Error(message);
    }
  };

  const registerWithEmail = async (
    username: string,
    email: string,
    password: string,
    avatar: string = PRESET_AVATARS[0].url
  ) => {
    try {
      const cleanUsername = sanitizeText(username) || 'cinephile';
      const cleanEmail = email.trim();
      const res = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      // Update Firebase Auth user display info
      await updateProfile(res.user, {
        displayName: cleanUsername,
        photoURL: avatar,
      });

      // Create Firestore User Document
      const now = new Date().toISOString();
      const newProfile: UserProfile = {
        uid: res.user.uid,
        id: res.user.uid,
        username: cleanUsername,
        displayName: cleanUsername,
        email: cleanEmail,
        avatar,
        photoURL: avatar,
        role: 'user', // STRICTLY user, preventing privilege escalation
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(doc(db, 'users', res.user.uid), newProfile);
      setProfile(newProfile);
      closeAuthModal();
    } catch (error: any) {
      console.error('Registration error:', error);
      let message = 'Could not create account. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists. Please log in instead.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password is too weak. Please use at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Please provide a valid email address.';
      }
      throw new Error(message);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      let message = 'Failed to send password reset email.';
      if (error.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email.';
      }
      throw new Error(message);
    }
  };

  const updateUserProfile = async (updates: { username?: string; avatar?: string }) => {
    if (!user || !profile) return;

    const trimmedUsername = updates.username ? sanitizeText(updates.username) : undefined;
    const newAvatar = updates.avatar || profile.avatar;

    const updatedProfile: UserProfile = {
      ...profile,
      username: trimmedUsername || profile.username,
      displayName: trimmedUsername || profile.displayName,
      avatar: newAvatar,
      photoURL: newAvatar,
      updatedAt: new Date().toISOString(),
    };

    // Update Firebase Auth
    await updateProfile(user, {
      displayName: updatedProfile.displayName,
      photoURL: updatedProfile.avatar,
    });

    // Update Firestore Document - strictly allowlist only username, displayName, avatar, photoURL, updatedAt
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userDocRef, {
        username: updatedProfile.username,
        displayName: updatedProfile.displayName,
        avatar: updatedProfile.avatar,
        photoURL: updatedProfile.photoURL,
        updatedAt: updatedProfile.updatedAt,
      });
      setProfile(updatedProfile);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      throw err;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Sign-out failed:', error);
    }
  };

  const isAdmin = Boolean(user && (user.email === 'md3048284@gmail.com' || profile?.role === 'admin'));

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        loading,
        isAuthModalOpen,
        authModalMode,
        authNotice,
        openAuthModal,
        closeAuthModal,
        signInWithGoogle,
        loginWithEmail,
        registerWithEmail,
        resetPassword,
        updateUserProfile,
        logOut,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
