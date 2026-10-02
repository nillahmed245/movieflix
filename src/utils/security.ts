/**
 * Security & Data Validation Utilities for MovieFlix
 */

/**
 * Strips dangerous HTML tags, javascript: pseudo-protocols, and malicious script sequences
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

/**
 * Validates whether a string is a well-formed HTTP/HTTPS URL
 */
export function isValidHttpUrl(stringUrl: string): boolean {
  if (!stringUrl || typeof stringUrl !== 'string') return false;
  try {
    const url = new URL(stringUrl);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates standard email address format
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates movie attributes before persisting to Firestore
 */
export interface MovieValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateMovieForm(data: {
  title: string;
  poster: string;
  backdrop?: string;
  description: string;
  genre: string;
  year: number;
  runtime: string;
  rating: number;
  language: string;
  director: string;
  trailerEmbedUrl: string;
  videoUrl?: string;
  status?: string;
}): MovieValidationResult {
  const errors: Record<string, string> = {};

  // Title
  const cleanTitle = sanitizeText(data.title);
  if (!cleanTitle) {
    errors.title = 'Movie title is required.';
  } else if (cleanTitle.length > 200) {
    errors.title = 'Title cannot exceed 200 characters.';
  }

  // Description
  const cleanDesc = sanitizeText(data.description);
  if (!cleanDesc) {
    errors.description = 'Movie description synopsis is required.';
  } else if (cleanDesc.length < 10) {
    errors.description = 'Description must be at least 10 characters long.';
  } else if (cleanDesc.length > 2000) {
    errors.description = 'Description cannot exceed 2,000 characters.';
  }

  // Poster
  if (!data.poster?.trim()) {
    errors.poster = 'Poster image URL is required.';
  } else if (!isValidHttpUrl(data.poster)) {
    errors.poster = 'Poster must be a valid HTTP or HTTPS image URL.';
  }

  // Backdrop
  if (data.backdrop?.trim() && !isValidHttpUrl(data.backdrop)) {
    errors.backdrop = 'Backdrop must be a valid HTTP or HTTPS image URL.';
  }

  // Genre
  if (!data.genre?.trim()) {
    errors.genre = 'Primary genre is required.';
  }

  // Year
  const currentYear = new Date().getFullYear();
  if (!data.year || isNaN(data.year)) {
    errors.year = 'Release year is required.';
  } else if (data.year < 1888 || data.year > currentYear + 5) {
    errors.year = `Year must be between 1888 and ${currentYear + 5}.`;
  }

  // Runtime
  if (!data.runtime?.trim()) {
    errors.runtime = 'Runtime duration is required (e.g. "1h 45m").';
  } else if (data.runtime.length > 32) {
    errors.runtime = 'Runtime description too long.';
  }

  // Rating
  if (data.rating === undefined || isNaN(data.rating)) {
    errors.rating = 'Rating is required.';
  } else if (data.rating < 0 || data.rating > 10) {
    errors.rating = 'Rating must be between 0.0 and 10.0.';
  }

  // Language
  if (!data.language?.trim()) {
    errors.language = 'Audio language is required.';
  }

  // Director
  if (!data.director?.trim()) {
    errors.director = 'Director name is required.';
  } else if (data.director.length > 128) {
    errors.director = 'Director name cannot exceed 128 characters.';
  }

  // Trailer URL
  if (!data.trailerEmbedUrl?.trim()) {
    errors.trailerEmbedUrl = 'Trailer URL is required.';
  } else if (!isValidHttpUrl(data.trailerEmbedUrl)) {
    errors.trailerEmbedUrl = 'Trailer must be a valid HTTP or HTTPS embed URL.';
  }

  // Legal Video URL
  if (data.videoUrl?.trim() && !isValidHttpUrl(data.videoUrl)) {
    errors.videoUrl = 'Legal video stream must be a valid HTTP or HTTPS URL.';
  }

  // Status
  if (data.status && data.status !== 'published' && data.status !== 'draft') {
    errors.status = 'Status must be either "published" or "draft".';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
