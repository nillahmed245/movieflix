import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  AlertCircle,
  ShieldCheck,
  Film,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useMovies } from '../context/MovieContext';

export const VideoPlayerModal: React.FC = () => {
  const { videoModal, closeVideoModal } = useMovies();
  const { isOpen, movie, mode } = videoModal;

  const [currentMode, setCurrentMode] = useState<'trailer' | 'stream'>('trailer');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // HTML5 Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Sync mode with trigger
  useEffect(() => {
    if (movie) {
      if (mode === 'stream' && movie.isLegalFullStream && movie.videoUrl) {
        setCurrentMode('stream');
      } else {
        setCurrentMode('trailer');
      }
      setIsPlaying(false);
      setCurrentTime(0);
      setHasError(false);
      setIsLoading(true);
    }
  }, [movie, mode]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeVideoModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeVideoModal]);

  if (!isOpen || !movie) return null;

  // Formatting helpers
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => setHasError(true));
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    setIsLoading(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      videoRef.current.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error('Fullscreen request error:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const retryPlayback = () => {
    setHasError(false);
    setIsLoading(true);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => setHasError(true));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div
        ref={containerRef}
        className="relative w-full max-w-5xl bg-[#09090e] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-zinc-900/90 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-600/20 text-rose-400">
              <Film className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm sm:text-base line-clamp-1">
                  {movie.title}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {currentMode === 'trailer' ? 'Official Studio Trailer' : 'Licensed Full Feature'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 line-clamp-1">
                {currentMode === 'trailer'
                  ? 'Official promotional studio trailer embed'
                  : movie.streamSourceLabel || 'Authorized Public Domain / Creative Commons Video'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Stream Mode Switcher if Full Movie is available */}
            {movie.isLegalFullStream && movie.videoUrl && (
              <div className="hidden sm:flex items-center p-1 bg-zinc-950 rounded-lg border border-zinc-800">
                <button
                  onClick={() => setCurrentMode('trailer')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                    currentMode === 'trailer'
                      ? 'bg-rose-600 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Trailer
                </button>
                <button
                  onClick={() => setCurrentMode('stream')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                    currentMode === 'stream'
                      ? 'bg-emerald-600 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Full Feature (HD)
                </button>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={closeVideoModal}
              className="p-1.5 sm:p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              aria-label="Close Player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Display Area (16:9 ratio) */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          {currentMode === 'trailer' ? (
            /* Official Studio Trailer Iframe Player */
            <iframe
              src={`${movie.trailerEmbedUrl}?autoplay=1&rel=0&modestbranding=1`}
              title={`${movie.title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            /* HTML5 Video Player for Legal Full Feature Stream */
            <div
              className="relative w-full h-full flex items-center justify-center"
              onMouseEnter={() => setShowControls(true)}
              onMouseLeave={() => isPlaying && setShowControls(false)}
            >
              {hasError ? (
                /* Error State */
                <div className="text-center p-6 space-y-3">
                  <AlertCircle className="w-12 h-12 text-rose-500 mx-auto animate-pulse" />
                  <h4 className="text-lg font-bold text-white">Video Stream Unavailable</h4>
                  <p className="text-xs text-zinc-400 max-w-sm">
                    The external licensed stream could not be loaded at this moment. You can still watch the official studio trailer.
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={retryPlayback}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Retry Stream
                    </button>
                    <button
                      onClick={() => setCurrentMode('trailer')}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white transition"
                    >
                      Switch to Trailer
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    src={movie.videoUrl}
                    poster={movie.backdrop || movie.poster}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onWaiting={() => setIsLoading(true)}
                    onPlaying={() => setIsLoading(false)}
                    onError={() => {
                      setIsLoading(false);
                      setHasError(true);
                    }}
                    onClick={handlePlayPause}
                    className="w-full h-full object-contain cursor-pointer"
                  />

                  {/* Loading Spinner */}
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                      <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}

                  {/* Play Overlay when paused */}
                  {!isPlaying && !isLoading && (
                    <button
                      onClick={handlePlayPause}
                      className="absolute w-16 h-16 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                      aria-label="Play video"
                    >
                      <Play className="w-8 h-8 fill-white ml-1" />
                    </button>
                  )}

                  {/* Custom Controls Bar */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 ${
                      showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {/* Progress Bar */}
                    <div className="relative flex items-center mb-2.5">
                      <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1.5 bg-zinc-700/80 rounded-lg appearance-none cursor-pointer accent-rose-500"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handlePlayPause}
                          className="p-1.5 rounded-full hover:bg-white/10 text-white transition cursor-pointer"
                          aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                          {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={toggleMute}
                            className="p-1 text-zinc-300 hover:text-white transition cursor-pointer"
                            aria-label={isMuted ? 'Unmute' : 'Mute'}
                          >
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-16 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-rose-500 hidden sm:block"
                          />
                        </div>

                        <span className="text-zinc-300 text-xs font-mono">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-zinc-400 hidden md:inline">
                          {movie.certification} • 1080p WebStream
                        </span>
                        <button
                          onClick={toggleFullscreen}
                          className="p-1.5 rounded hover:bg-white/10 text-zinc-300 hover:text-white transition cursor-pointer"
                          aria-label="Fullscreen"
                        >
                          <Maximize className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Legal Notice Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-zinc-950/90 border-t border-zinc-800/60 flex flex-wrap items-center justify-between text-[11px] text-zinc-400 gap-2">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              {currentMode === 'trailer'
                ? 'Official studio teaser embedded under fair promotional use.'
                : movie.streamSourceLabel || 'Licensed open-source / public domain cinema.'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400 font-medium">No piracy • Certified legal content</span>
          </div>
        </div>
      </div>
    </div>
  );
};
