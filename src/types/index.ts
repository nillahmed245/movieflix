export interface CastMember {
  name: string;
  character: string;
  avatar: string;
}

export interface Movie {
  id: string;
  title: string;
  tagline?: string;
  poster: string;
  backdrop: string;
  description: string;
  fullDescription: string;
  genre: string;
  genres: string[];
  year: number;
  runtime: string;
  runtimeMinutes: number;
  rating: number;
  certification: string;
  language: string;
  director: string;
  cast: CastMember[];
  trailerEmbedUrl: string;
  videoUrl?: string; // Direct legal streaming URL for public domain / open source films
  isLegalFullStream?: boolean;
  streamSourceLabel?: string;
  likes: number;
  views: string;
  trending?: boolean;
  popular?: boolean;
  featured?: boolean;
  latest?: boolean;
  status?: 'published' | 'draft';
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string;
  photoURL?: string;
  role: 'user' | 'admin' | string;
  createdAt: string;
  updatedAt?: string;
}

export type AuthModalMode = 'login' | 'register' | 'forgot_password';

export interface GenreItem {
  id: string;
  name: string;
  description: string;
  image: string;
  color: string;
  createdAt?: string;
}

export interface AdminLog {
  id: string;
  action: string;
  adminUid: string;
  adminEmail: string;
  targetId: string;
  targetType: 'movie' | 'user' | 'comment' | 'genre' | 'system';
  details?: string;
  createdAt: string;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  movieId: string;
  movieTitle: string;
  moviePoster?: string;
  movieYear?: number;
  movieRating?: number;
  movieGenre?: string;
  createdAt: string;
}

export interface MovieComment {
  id: string;
  movieId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  reportCount?: number;
  createdAt: string;
}

export interface FilterState {
  searchQuery: string;
  genre: string;
  year: string;
  rating: number;
  language: string;
  sortBy: 'popularity' | 'rating' | 'newest' | 'title';
}

export type AppTab = 'home' | 'movies' | 'genres' | 'watchlist' | 'details' | 'admin';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'info' | 'error' | 'warning';
}
