import React, { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { MovieProvider, useMovies } from './context/MovieContext';
import { Navbar } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { HomeView } from './components/HomeView';
import { SearchFilters } from './components/SearchFilters';
import { GenresView } from './components/GenresView';
import { WatchlistView } from './components/WatchlistView';
import { MovieDetails } from './components/MovieDetails';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { ToastContainer } from './components/ToastContainer';
import { Footer } from './components/Footer';
import { AdminPanel } from './components/admin/AdminPanel';
import { ErrorBoundary } from './components/ErrorBoundary';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, selectedMovie } = useMovies();

  // Listen to manual URL navigation or browser history
  useEffect(() => {
    const handleUrlCheck = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path.startsWith('/admin') || hash === '#/admin' || hash === '#admin') {
        setActiveTab('admin');
      }
    };

    handleUrlCheck();
    window.addEventListener('popstate', handleUrlCheck);
    return () => window.removeEventListener('popstate', handleUrlCheck);
  }, [setActiveTab]);

  // Synchronize history state when activeTab changes
  useEffect(() => {
    if (activeTab === 'admin') {
      if (!window.location.pathname.startsWith('/admin')) {
        window.history.pushState(null, '', '/admin');
      }
    } else {
      if (window.location.pathname.startsWith('/admin')) {
        window.history.pushState(null, '', '/');
      }
    }
  }, [activeTab]);

  // Dynamic SEO Page Titles & Canonical URL Resolution
  useEffect(() => {
    switch (activeTab) {
      case 'details':
        if (selectedMovie) {
          document.title = `${selectedMovie.title} (${selectedMovie.year}) – Watch Trailer on MovieFlix`;
        } else {
          document.title = 'Movie Details – MovieFlix';
        }
        break;
      case 'admin':
        document.title = 'MovieFlix – Admin Management Console';
        break;
      case 'watchlist':
        document.title = 'My Watchlist – MovieFlix';
        break;
      case 'movies':
        document.title = 'Explore & Filter Movies – MovieFlix';
        break;
      case 'genres':
        document.title = 'Browse Movie Genres – MovieFlix';
        break;
      case 'home':
      default:
        document.title = 'MovieFlix - Premium Movies & Trailers';
        break;
    }
  }, [activeTab, selectedMovie]);

  // If in admin mode, show the full admin panel view
  if (activeTab === 'admin') {
    return (
      <div className="min-h-screen flex flex-col bg-[#06060a] text-zinc-100 font-['Plus_Jakarta_Sans',sans-serif]">
        <AdminPanel />
        <VideoPlayerModal />
        <ProfileModal />
        <AuthModal />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#07070a] text-zinc-100 selection:bg-rose-600 selection:text-white font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Sticky Top Navigation */}
      <Navbar />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'home' && <HomeView />}
        {activeTab === 'movies' && <SearchFilters />}
        {activeTab === 'genres' && <GenresView />}
        {activeTab === 'watchlist' && <WatchlistView />}
        {activeTab === 'details' && <MovieDetails />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Video & Trailer Modal */}
      <VideoPlayerModal />

      {/* User Profile Modal */}
      <ProfileModal />

      {/* Authentication Modal (Login / Register / Forgot Password) */}
      <AuthModal />

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <MovieProvider>
            <MainContent />
          </MovieProvider>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
