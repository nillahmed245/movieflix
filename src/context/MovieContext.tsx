import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Movie, WatchlistItem, MovieComment, FilterState, AppTab, GenreItem, AdminLog, UserProfile } from '../types';
import { INITIAL_MOVIES, GENRE_METADATA } from '../data/movies';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { sanitizeText } from '../utils/security';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  updateDoc,
  increment,
  orderBy,
  limit,
} from 'firebase/firestore';

interface MovieContextType {
  movies: Movie[];
  allMovies: Movie[];
  genres: GenreItem[];
  adminUsers: UserProfile[];
  adminLogs: AdminLog[];
  selectedMovie: Movie | null;
  activeTab: AppTab;
  filterState: FilterState;
  videoModal: {
    isOpen: boolean;
    movie: Movie | null;
    mode: 'trailer' | 'stream';
  };
  watchlist: WatchlistItem[];
  likedMovieIds: string[];
  comments: MovieComment[];
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  setActiveTab: (tab: AppTab) => void;
  setSelectedMovie: (movie: Movie | null) => void;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  openMovieDetails: (movie: Movie) => void;
  openTrailerPlayer: (movie: Movie) => void;
  openStreamPlayer: (movie: Movie) => void;
  closeVideoModal: () => void;
  filterByGenre: (genre: string) => void;
  toggleWatchlist: (movie: Movie) => Promise<void>;
  isInWatchlist: (movieId: string) => boolean;
  toggleLike: (movie: Movie) => Promise<void>;
  isLiked: (movieId: string) => boolean;
  getLikesCount: (movie: Movie) => number;
  addComment: (movieId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  reportComment: (commentId: string) => Promise<void>;

  // Admin Methods
  addMovie: (movieData: Omit<Movie, 'id' | 'createdAt' | 'likes' | 'views'>) => Promise<string>;
  updateMovie: (movieId: string, updates: Partial<Movie>) => Promise<void>;
  deleteMovie: (movieId: string) => Promise<void>;
  addGenre: (genreData: Omit<GenreItem, 'id' | 'createdAt'>) => Promise<void>;
  updateGenre: (genreId: string, updates: Partial<GenreItem>) => Promise<void>;
  deleteGenre: (genreId: string) => Promise<void>;
  updateUserRole: (userId: string, newRole: 'user' | 'admin') => Promise<void>;
  deleteCommentAsAdmin: (commentId: string) => Promise<void>;
  logAdminAction: (action: string, targetId: string, targetType: AdminLog['targetType'], details?: string) => Promise<void>;
}

const defaultFilterState: FilterState = {
  searchQuery: '',
  genre: 'All',
  year: 'All',
  rating: 0,
  language: 'All',
  sortBy: 'popularity',
};

const INITIAL_GENRES: GenreItem[] = GENRE_METADATA.map((g) => ({
  id: g.name.toLowerCase(),
  name: g.name,
  description: g.description,
  image: g.image,
  color: g.color,
  createdAt: '2026-01-01T00:00:00Z',
}));

const MovieContext = createContext<MovieContextType | null>(null);

// Initial curated comments
const INITIAL_DEMO_COMMENTS: MovieComment[] = [
  {
    id: 'demo-c1',
    movieId: 'cine-01',
    userId: 'demo-user-1',
    userName: 'Kaelen R.',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    content: 'The practical lighting and VFX integration inside the old Amsterdam church is phenomenal! Ian Hubert is a master.',
    createdAt: '2026-09-20T10:14:00Z',
    reportCount: 0,
  },
  {
    id: 'demo-c2',
    movieId: 'cine-01',
    userId: 'demo-user-2',
    userName: 'Maya Sterling',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    content: 'Love that this entire production is open-source and legally streamable in full 4K. MovieFlix’s playback is super crisp.',
    createdAt: '2026-09-22T14:30:00Z',
    reportCount: 0,
  },
  {
    id: 'demo-c3',
    movieId: 'cine-03',
    userId: 'demo-user-3',
    userName: 'Arjun Sen',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    content: 'The ending of Sintel tears my heart out every time. A true classic of computer animation.',
    createdAt: '2026-08-11T19:05:00Z',
    reportCount: 0,
  },
  {
    id: 'demo-c4',
    movieId: 'cine-04',
    userId: 'demo-user-4',
    userName: 'Chloe Vance',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    content: 'The synthwave soundtrack combined with the rain-soaked visuals hits all the right neo-noir cyber notes.',
    createdAt: '2026-09-28T08:45:00Z',
    reportCount: 0,
  },
];

export const MovieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, isAdmin, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [rawMovies, setRawMovies] = useState<Movie[]>(() => {
    try {
      const saved = localStorage.getItem('cinevault_custom_movies');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with initial
        const map = new Map<string, Movie>();
        INITIAL_MOVIES.forEach((m) => map.set(m.id, m));
        parsed.forEach((m: Movie) => map.set(m.id, m));
        return Array.from(map.values());
      }
      return INITIAL_MOVIES;
    } catch {
      return INITIAL_MOVIES;
    }
  });

  const [genres, setGenres] = useState<GenreItem[]>(() => {
    try {
      const saved = localStorage.getItem('cinevault_genres');
      return saved ? JSON.parse(saved) : INITIAL_GENRES;
    } catch {
      return INITIAL_GENRES;
    }
  });

  const [adminUsers, setAdminUsers] = useState<UserProfile[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>(() => {
    if (typeof window !== 'undefined' && (window.location.pathname.startsWith('/admin') || window.location.hash === '#/admin')) {
      return 'admin';
    }
    return 'home';
  });
  const [filterState, setFilterState] = useState<FilterState>(defaultFilterState);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [videoModal, setVideoModal] = useState<{
    isOpen: boolean;
    movie: Movie | null;
    mode: 'trailer' | 'stream';
  }>({
    isOpen: false,
    movie: null,
    mode: 'trailer',
  });

  // Watchlist state
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    try {
      const saved = localStorage.getItem('cinevault_guest_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Likes state
  const [likedMovieIds, setLikedMovieIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cinevault_guest_likes');
      return saved ? JSON.parse(saved) : ['cine-01', 'cine-03'];
    } catch {
      return ['cine-01', 'cine-03'];
    }
  });

  // Extra like counters delta
  const [likeDeltas, setLikeDeltas] = useState<Record<string, number>>({});

  // Comments state
  const [comments, setComments] = useState<MovieComment[]>(() => {
    try {
      const local = localStorage.getItem('cinevault_local_comments');
      return local ? JSON.parse(local) : INITIAL_DEMO_COMMENTS;
    } catch {
      return INITIAL_DEMO_COMMENTS;
    }
  });

  // Listen to movies in Firestore
  useEffect(() => {
    const q = query(collection(db, 'movies'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const fetched: Movie[] = [];
          snapshot.forEach((d) => {
            fetched.push({ id: d.id, ...d.data() } as Movie);
          });
          // Merge with initial movies
          const map = new Map<string, Movie>();
          INITIAL_MOVIES.forEach((m) => map.set(m.id, m));
          fetched.forEach((m) => map.set(m.id, m));
          setRawMovies(Array.from(map.values()));
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'movies');
      }
    );

    return () => unsubscribe();
  }, []);

  // Listen to genres in Firestore
  useEffect(() => {
    const q = query(collection(db, 'genres'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const fetched: GenreItem[] = [];
          snapshot.forEach((d) => {
            fetched.push({ id: d.id, ...d.data() } as GenreItem);
          });
          setGenres(fetched);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'genres');
      }
    );

    return () => unsubscribe();
  }, []);

  // Sync Watchlist with Firestore when user is authenticated
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'watchlist'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: WatchlistItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as WatchlistItem);
        });
        setWatchlist(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'watchlist');
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Sync Likes with Firestore for current user
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'likes'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const likedIds: string[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.movieId) likedIds.push(data.movieId);
        });
        setLikedMovieIds(likedIds);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'likes');
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Sync Comments from Firestore
  useEffect(() => {
    const q = query(collection(db, 'comments'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const fetched: MovieComment[] = [];
          snapshot.forEach((docSnap) => {
            fetched.push(docSnap.data() as MovieComment);
          });
          // Merge with initial demo comments
          const allComments = [...fetched];
          INITIAL_DEMO_COMMENTS.forEach((demo) => {
            if (!allComments.some((c) => c.id === demo.id)) {
              allComments.push(demo);
            }
          });
          setComments(allComments);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'comments');
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch admin logs and all users when user is Admin
  useEffect(() => {
    if (!isAdmin) {
      setAdminUsers([]);
      setAdminLogs([]);
      return;
    }

    // Load users
    const usersQ = query(collection(db, 'users'));
    const unsubUsers = onSnapshot(
      usersQ,
      (snapshot) => {
        const usersList: UserProfile[] = [];
        snapshot.forEach((d) => {
          usersList.push(d.data() as UserProfile);
        });
        setAdminUsers(usersList);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'users');
      }
    );

    // Load logs
    const logsQ = query(collection(db, 'adminLogs'));
    const unsubLogs = onSnapshot(
      logsQ,
      (snapshot) => {
        const logsList: AdminLog[] = [];
        snapshot.forEach((d) => {
          logsList.push({ id: d.id, ...d.data() } as AdminLog);
        });
        logsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAdminLogs(logsList);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'adminLogs');
      }
    );

    return () => {
      unsubUsers();
      unsubLogs();
    };
  }, [isAdmin]);

  // Public movies (filters out drafts for non-admins)
  const publicMovies = rawMovies.filter((m) => isAdmin || m.status !== 'draft');

  const resetFilters = useCallback(() => {
    setFilterState(defaultFilterState);
  }, []);

  const openMovieDetails = useCallback((movie: Movie) => {
    setSelectedMovie(movie);
    setActiveTab('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openTrailerPlayer = useCallback((movie: Movie) => {
    setVideoModal({
      isOpen: true,
      movie,
      mode: 'trailer',
    });
  }, []);

  const openStreamPlayer = useCallback((movie: Movie) => {
    setVideoModal({
      isOpen: true,
      movie,
      mode: 'stream',
    });
  }, []);

  const closeVideoModal = useCallback(() => {
    setVideoModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const filterByGenre = useCallback((genre: string) => {
    setFilterState((prev) => ({
      ...prev,
      genre,
    }));
    setActiveTab('movies');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const isInWatchlist = useCallback(
    (movieId: string) => {
      return watchlist.some((item) => item.movieId === movieId);
    },
    [watchlist]
  );

  const toggleWatchlist = useCallback(
    async (movie: Movie) => {
      if (!user) {
        openAuthModal('login', 'Please log in to add movies to your Watchlist.');
        return;
      }

      const inList = watchlist.some((w) => w.movieId === movie.id);

      if (inList) {
        const existingItem = watchlist.find((w) => w.movieId === movie.id);
        const newWatchlist = watchlist.filter((w) => w.movieId !== movie.id);
        setWatchlist(newWatchlist);
        localStorage.setItem('cinevault_guest_watchlist', JSON.stringify(newWatchlist));

        if (existingItem) {
          try {
            await deleteDoc(doc(db, 'watchlist', existingItem.id));
          } catch (err) {
            handleFirestoreError(err, OperationType.DELETE, `watchlist/${existingItem.id}`);
          }
        }
        showToast('Removed from Watchlist', `"${movie.title}" removed.`, 'info');
      } else {
        const newItemId = `${user.uid}_${movie.id}`;
        const newItem: WatchlistItem = {
          id: newItemId,
          userId: user.uid,
          movieId: movie.id,
          movieTitle: movie.title,
          moviePoster: movie.poster,
          movieYear: movie.year,
          movieRating: movie.rating,
          movieGenre: movie.genre,
          createdAt: new Date().toISOString(),
        };

        const updated = [newItem, ...watchlist];
        setWatchlist(updated);
        localStorage.setItem('cinevault_guest_watchlist', JSON.stringify(updated));

        try {
          await setDoc(doc(db, 'watchlist', newItemId), newItem);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `watchlist/${newItemId}`);
        }
        showToast('Added to Watchlist', `"${movie.title}" saved to your list!`, 'success');
      }
    },
    [watchlist, user, openAuthModal, showToast]
  );

  const isLiked = useCallback(
    (movieId: string) => {
      return likedMovieIds.includes(movieId);
    },
    [likedMovieIds]
  );

  const getLikesCount = useCallback(
    (movie: Movie) => {
      const delta = likeDeltas[movie.id] || 0;
      return movie.likes + delta;
    },
    [likeDeltas]
  );

  const toggleLike = useCallback(
    async (movie: Movie) => {
      if (!user) {
        openAuthModal('login', 'Please log in to like this movie.');
        return;
      }

      const alreadyLiked = likedMovieIds.includes(movie.id);
      const likeId = `${user.uid}_${movie.id}`;

      if (alreadyLiked) {
        setLikedMovieIds((prev) => prev.filter((id) => id !== movie.id));
        setLikeDeltas((prev) => ({ ...prev, [movie.id]: (prev[movie.id] || 0) - 1 }));

        const updatedLocal = likedMovieIds.filter((id) => id !== movie.id);
        localStorage.setItem('cinevault_guest_likes', JSON.stringify(updatedLocal));

        try {
          await deleteDoc(doc(db, 'likes', likeId));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `likes/${likeId}`);
        }
        showToast('Like Removed', `Unliked "${movie.title}".`, 'info');
      } else {
        setLikedMovieIds((prev) => [...prev, movie.id]);
        setLikeDeltas((prev) => ({ ...prev, [movie.id]: (prev[movie.id] || 0) + 1 }));

        const updatedLocal = [...likedMovieIds, movie.id];
        localStorage.setItem('cinevault_guest_likes', JSON.stringify(updatedLocal));

        try {
          await setDoc(doc(db, 'likes', likeId), {
            userId: user.uid,
            movieId: movie.id,
            createdAt: new Date().toISOString(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `likes/${likeId}`);
        }
        showToast('Liked!', `You liked "${movie.title}".`, 'success');
      }
    },
    [likedMovieIds, user, openAuthModal, showToast]
  );

  const addComment = useCallback(
    async (movieId: string, content: string) => {
      if (!user) {
        openAuthModal('login', 'Please log in to post your review.');
        return;
      }

      const trimmed = sanitizeText(content.trim());
      if (!trimmed || trimmed.length < 2) {
        showToast('Invalid Comment', 'Comment must be at least 2 characters long.', 'warning');
        return;
      }
      if (trimmed.length > 500) {
        showToast('Too Long', 'Comment cannot exceed 500 characters.', 'warning');
        return;
      }

      const commentId = `cm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newComment: MovieComment = {
        id: commentId,
        movieId,
        userId: user.uid,
        userName: profile?.username || profile?.displayName || user.displayName || 'Cinema Critic',
        userAvatar: profile?.avatar || profile?.photoURL || user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        content: trimmed,
        reportCount: 0,
        createdAt: new Date().toISOString(),
      };

      const updated = [newComment, ...comments];
      setComments(updated);
      localStorage.setItem('cinevault_local_comments', JSON.stringify(updated));

      try {
        await setDoc(doc(db, 'comments', commentId), newComment);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `comments/${commentId}`);
      }
      showToast('Comment Posted', 'Your review has been shared with the community.', 'success');
    },
    [comments, user, profile, openAuthModal, showToast]
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      const updated = comments.filter((c) => c.id !== commentId);
      setComments(updated);
      localStorage.setItem('cinevault_local_comments', JSON.stringify(updated));

      if (user) {
        try {
          await deleteDoc(doc(db, 'comments', commentId));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `comments/${commentId}`);
        }
      }
      showToast('Comment Deleted', 'Your comment was removed.', 'info');
    },
    [comments, user, showToast]
  );

  const reportComment = useCallback(
    async (commentId: string) => {
      const updated = comments.map((c) =>
        c.id === commentId ? { ...c, reportCount: (c.reportCount || 0) + 1 } : c
      );
      setComments(updated);

      if (user) {
        try {
          await updateDoc(doc(db, 'comments', commentId), {
            reportCount: increment(1),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `comments/${commentId}`);
        }
      }
      showToast('Report Received', 'Thank you. Our moderation team has flagged this review.', 'warning');
    },
    [comments, user, showToast]
  );

  // ============================================
  // ADMIN METHODS
  // ============================================

  const logAdminAction = useCallback(
    async (action: string, targetId: string, targetType: AdminLog['targetType'], details?: string) => {
      if (!user) return;
      const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newLog: AdminLog = {
        id: logId,
        action,
        adminUid: user.uid,
        adminEmail: user.email || 'admin@movieflix.io',
        targetId,
        targetType,
        details,
        createdAt: new Date().toISOString(),
      };
      setAdminLogs((prev) => [newLog, ...prev]);

      try {
        await setDoc(doc(db, 'adminLogs', logId), newLog);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `adminLogs/${logId}`);
      }
    },
    [user]
  );

  const addMovie = useCallback(
    async (movieData: Omit<Movie, 'id' | 'createdAt' | 'likes' | 'views'>): Promise<string> => {
      const movieId = `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();
      const newMovie: Movie = {
        ...movieData,
        id: movieId,
        likes: 0,
        views: '1',
        createdAt: now,
      };

      const updated = [newMovie, ...rawMovies];
      setRawMovies(updated);
      localStorage.setItem('cinevault_custom_movies', JSON.stringify(updated));

      try {
        await setDoc(doc(db, 'movies', movieId), newMovie);
        await logAdminAction('movie_created', movieId, 'movie', `Added title "${newMovie.title}"`);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `movies/${movieId}`);
      }

      showToast('Movie Created', `"${newMovie.title}" published to catalog.`, 'success');
      return movieId;
    },
    [rawMovies, logAdminAction, showToast]
  );

  const updateMovie = useCallback(
    async (movieId: string, updates: Partial<Movie>) => {
      const updated = rawMovies.map((m) => (m.id === movieId ? { ...m, ...updates } : m));
      setRawMovies(updated);
      localStorage.setItem('cinevault_custom_movies', JSON.stringify(updated));

      try {
        await setDoc(doc(db, 'movies', movieId), updates, { merge: true });
        await logAdminAction('movie_updated', movieId, 'movie', `Updated attributes for "${updates.title || movieId}"`);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `movies/${movieId}`);
      }

      showToast('Movie Updated', 'Changes saved successfully.', 'success');
    },
    [rawMovies, logAdminAction, showToast]
  );

  const deleteMovie = useCallback(
    async (movieId: string) => {
      const target = rawMovies.find((m) => m.id === movieId);
      const updated = rawMovies.filter((m) => m.id !== movieId);
      setRawMovies(updated);
      localStorage.setItem('cinevault_custom_movies', JSON.stringify(updated));

      try {
        await deleteDoc(doc(db, 'movies', movieId));
        await logAdminAction('movie_deleted', movieId, 'movie', `Deleted title "${target?.title || movieId}"`);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `movies/${movieId}`);
      }

      showToast('Movie Deleted', `"${target?.title || 'Movie'}" removed from catalog.`, 'info');
    },
    [rawMovies, logAdminAction, showToast]
  );

  const addGenre = useCallback(
    async (genreData: Omit<GenreItem, 'id' | 'createdAt'>) => {
      const genreId = genreData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const now = new Date().toISOString();
      const newGenre: GenreItem = {
        ...genreData,
        id: genreId,
        createdAt: now,
      };

      const updated = [...genres, newGenre];
      setGenres(updated);
      localStorage.setItem('cinevault_genres', JSON.stringify(updated));

      try {
        await setDoc(doc(db, 'genres', genreId), newGenre);
        await logAdminAction('genre_created', genreId, 'genre', `Created genre "${newGenre.name}"`);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `genres/${genreId}`);
      }

      showToast('Genre Added', `Category "${newGenre.name}" created.`, 'success');
    },
    [genres, logAdminAction, showToast]
  );

  const updateGenre = useCallback(
    async (genreId: string, updates: Partial<GenreItem>) => {
      const updated = genres.map((g) => (g.id === genreId ? { ...g, ...updates } : g));
      setGenres(updated);
      localStorage.setItem('cinevault_genres', JSON.stringify(updated));

      try {
        await setDoc(doc(db, 'genres', genreId), updates, { merge: true });
        await logAdminAction('genre_updated', genreId, 'genre', `Updated genre "${genreId}"`);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `genres/${genreId}`);
      }

      showToast('Genre Updated', 'Category updated successfully.', 'success');
    },
    [genres, logAdminAction, showToast]
  );

  const deleteGenre = useCallback(
    async (genreId: string) => {
      const updated = genres.filter((g) => g.id !== genreId);
      setGenres(updated);
      localStorage.setItem('cinevault_genres', JSON.stringify(updated));

      try {
        await deleteDoc(doc(db, 'genres', genreId));
        await logAdminAction('genre_deleted', genreId, 'genre', `Removed genre "${genreId}"`);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `genres/${genreId}`);
      }

      showToast('Genre Deleted', 'Category removed.', 'info');
    },
    [genres, logAdminAction, showToast]
  );

  const updateUserRole = useCallback(
    async (userId: string, newRole: 'user' | 'admin') => {
      const updated = adminUsers.map((u) => (u.uid === userId ? { ...u, role: newRole } : u));
      setAdminUsers(updated);

      try {
        await updateDoc(doc(db, 'users', userId), {
          role: newRole,
          updatedAt: new Date().toISOString(),
        });
        await logAdminAction('user_role_changed', userId, 'user', `Assigned role "${newRole}" to user`);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
        throw err;
      }

      showToast('User Role Updated', `Role updated to ${newRole}.`, 'success');
    },
    [adminUsers, logAdminAction, showToast]
  );

  const deleteCommentAsAdmin = useCallback(
    async (commentId: string) => {
      const updated = comments.filter((c) => c.id !== commentId);
      setComments(updated);
      localStorage.setItem('cinevault_local_comments', JSON.stringify(updated));

      try {
        await deleteDoc(doc(db, 'comments', commentId));
        await logAdminAction('comment_deleted', commentId, 'comment', `Deleted comment "${commentId}"`);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `comments/${commentId}`);
      }

      showToast('Comment Removed', 'Comment moderated and removed by administrator.', 'info');
    },
    [comments, logAdminAction, showToast]
  );

  return (
    <MovieContext.Provider
      value={{
        movies: publicMovies,
        allMovies: rawMovies,
        genres,
        adminUsers,
        adminLogs,
        selectedMovie,
        activeTab,
        filterState,
        videoModal,
        watchlist,
        likedMovieIds,
        comments,
        isProfileOpen,
        setIsProfileOpen,
        setActiveTab,
        setSelectedMovie,
        setFilterState,
        resetFilters,
        openMovieDetails,
        openTrailerPlayer,
        openStreamPlayer,
        closeVideoModal,
        filterByGenre,
        toggleWatchlist,
        isInWatchlist,
        toggleLike,
        isLiked,
        getLikesCount,
        addComment,
        deleteComment,
        reportComment,
        addMovie,
        updateMovie,
        deleteMovie,
        addGenre,
        updateGenre,
        deleteGenre,
        updateUserRole,
        deleteCommentAsAdmin,
        logAdminAction,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};

export const useMovies = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error('useMovies must be used within a MovieProvider');
  }
  return context;
};
