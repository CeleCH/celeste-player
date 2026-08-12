import React, { useState } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, 
  Volume2, VolumeX, Loader2, Heart, ListMusic, AlertTriangle 
} from 'lucide-react';
import { useStore, useCurrentTrack } from '../store/store';
import useAudioPlayer from '../hooks/useAudioPlayer';

export default function AudioPlayer() {
  const currentTrack = useCurrentTrack();
  const queue = useStore((state) => state.queue);
  const isPlaying = useStore((state) => state.isPlaying);
  const volume = useStore((state) => state.volume);
  const shuffle = useStore((state) => state.shuffle);
  const repeat = useStore((state) => state.repeat);
  
  const setVolume = useStore((state) => state.setVolume);
  const setShuffle = useStore((state) => state.setShuffle);
  const setRepeat = useStore((state) => state.setRepeat);
  const playNext = useStore((state) => state.playNext);
  const playPrevious = useStore((state) => state.playPrevious);
  const favorites = useStore((state) => state.favorites);
  const toggleFavorite = useStore((state) => state.toggleFavorite);

  const { currentTime, duration, loading, playbackError, togglePlay, seek } = useAudioPlayer();
  const [prevVolume, setPrevVolume] = useState(0.8);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  if (!currentTrack) return null;

  const isFav = favorites.some(t => t.id === currentTrack.id);

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSeekChange = (e) => {
    seek(parseFloat(e.target.value));
  };

  const handleVolumeToggle = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
    } else {
      setVolume(prevVolume);
    }
  };

  const cycleRepeat = () => {
    if (repeat === 'none') setRepeat('all');
    else if (repeat === 'all') setRepeat('one');
    else setRepeat('none');
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="glass-panel border-t border-slate-800/80 shadow-2xl relative">
      
      {/* Playback error toast indicator */}
      {playbackError && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full bg-rose-950 border border-rose-500/30 text-rose-350 text-xs px-4 py-2.5 rounded-t-xl flex items-center gap-2 shadow-lg animate-bounce">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span>{playbackError}</span>
        </div>
      )}

      {/* 1. Desktop Layout */}
      <div className="hidden md:grid grid-cols-3 items-center px-6 py-4 h-24 max-w-7xl mx-auto w-full">
        
        {/* Left Side: Track Meta */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 bg-slate-800 rounded-xl overflow-hidden shadow-md shrink-0 border border-slate-850">
            <img
              src={currentTrack.thumbnail || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&h=150&fit=crop'}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-slate-100 truncate">
              {currentTrack.title}
            </h4>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {currentTrack.artists?.map(a => a.name).join(', ') || 'Artista Desconocido'}
            </p>
          </div>
          <button
            onClick={() => toggleFavorite(currentTrack)}
            className={`p-2 rounded-lg hover:bg-slate-800 transition-colors ${
              isFav ? 'text-rose-500' : 'text-slate-500 hover:text-slate-350'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Center Side: Controls & TimeSeeker */}
        <div className="flex flex-col items-center gap-2">
          {/* Button Row */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => setShuffle(!shuffle)}
              className={`p-1.5 rounded-lg transition-colors ${
                shuffle ? 'text-brand-500' : 'text-slate-550 hover:text-slate-300'
              }`}
              title="Aleatorio"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={playPrevious}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 transition-colors"
              title="Anterior"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              disabled={loading}
              className="p-3 bg-brand-500 text-dark-300 hover:scale-105 active:scale-95 rounded-full shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 glow-hover transition-all shrink-0"
              title={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={playNext}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 transition-colors"
              title="Siguiente"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={cycleRepeat}
              className={`p-1.5 rounded-lg relative transition-colors ${
                repeat !== 'none' ? 'text-brand-500' : 'text-slate-550 hover:text-slate-300'
              }`}
              title="Repetir"
            >
              <Repeat className="w-4 h-4" />
              {repeat === 'one' && (
                <span className="absolute -top-1 -right-1 text-[8px] bg-brand-500 text-dark-300 px-0.5 rounded font-black leading-none">
                  1
                </span>
              )}
            </button>
          </div>

          {/* Time Slider Seeker Row */}
          <div className="flex items-center gap-3 w-full">
            <span className="text-[10px] font-bold text-slate-500 min-w-[30px] text-right">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 relative flex items-center">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeekChange}
                className="w-full slider-seeker cursor-pointer"
              />
              {/* Highlight active progress track */}
              <div 
                className="absolute left-0 bg-brand-500 h-1 rounded-l-full pointer-events-none" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
            <span className="text-[10px] font-bold text-slate-500 min-w-[30px]">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right Side: Volume Controls */}
        <div className="flex items-center justify-end gap-3 pr-2">
          <button
            onClick={handleVolumeToggle}
            className="text-slate-400 hover:text-slate-150 transition-colors"
          >
            {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <div className="relative w-24 flex items-center">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full slider-seeker cursor-pointer"
            />
            <div 
              className="absolute left-0 bg-brand-500 h-1 rounded-l-full pointer-events-none" 
              style={{ width: `${volume * 100}%` }} 
            />
          </div>
        </div>
      </div>

      {/* 2. Mobile Floating Mini-Player Layout */}
      <div className="md:hidden flex flex-col w-full bg-dark-200/90 backdrop-blur-md border-t border-slate-850">
        
        {/* Small top track seeker line (minimalistic) */}
        <div className="relative w-full h-[3px] bg-slate-800">
          <div 
            className="bg-brand-500 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          {/* Mini Meta Info */}
          <div 
            className="flex items-center gap-3 min-w-0 flex-1"
            onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          >
            <div className="w-10 h-10 bg-slate-800 rounded-lg overflow-hidden shrink-0 shadow">
              <img
                src={currentTrack.thumbnail || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&h=150&fit=crop'}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-xs text-slate-150 truncate">
                {currentTrack.title}
              </h4>
              <p className="text-[10px] text-slate-550 truncate mt-0.5">
                {currentTrack.artists?.map(a => a.name).join(', ') || 'Artista Desconocido'}
              </p>
            </div>
          </div>

          {/* Quick Playback controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(currentTrack)}
              className={`p-2 rounded-lg transition-colors ${
                isFav ? 'text-rose-500' : 'text-slate-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={togglePlay}
              disabled={loading}
              className="p-2.5 bg-brand-500 text-dark-300 rounded-full shrink-0 active:scale-90 transition-transform"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={playNext}
              className="p-2 text-slate-400 hover:text-slate-100 shrink-0"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>

        {/* Mobile Seeker Drawer when tapped */}
        {isMobileExpanded && (
          <div className="fixed inset-0 bg-dark-300 z-50 flex flex-col p-6 animate-slideIn">
            {/* Header close button */}
            <div className="flex items-center justify-between pb-4">
              <button 
                onClick={() => setIsMobileExpanded(false)}
                className="text-xs text-slate-500 font-bold uppercase tracking-wider bg-slate-850 px-3 py-1.5 rounded-lg"
              >
                Cerrar
              </button>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Reproduciendo
              </span>
              <div className="w-12" /> {/* spacing spacer */}
            </div>

            {/* Heavy Artwork Display */}
            <div className="flex-1 flex flex-col items-center justify-center py-6">
              <div className="w-64 h-64 bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-850">
                <img
                  src={currentTrack.thumbnail || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&h=150&fit=crop'}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title & Artist */}
              <div className="text-center mt-6 max-w-sm">
                <h3 className="font-extrabold text-lg text-slate-100 line-clamp-1">{currentTrack.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                  {currentTrack.artists?.map(a => a.name).join(', ') || 'Artista Desconocido'}
                </p>
              </div>
            </div>

            {/* Seeker slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 px-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeekChange}
                  className="w-full slider-seeker cursor-pointer"
                />
                <div 
                  className="absolute left-0 bg-brand-500 h-1 rounded-l-full pointer-events-none" 
                  style={{ width: `${progressPercent}%` }} 
                />
              </div>
            </div>

            {/* Interactive Control Buttons */}
            <div className="flex flex-col items-center gap-6 py-6 border-t border-slate-800/80 mt-4">
              <div className="flex items-center justify-around w-full max-w-xs">
                <button
                  onClick={() => setShuffle(!shuffle)}
                  className={`p-2 rounded-lg ${shuffle ? 'text-brand-500' : 'text-slate-500'}`}
                >
                  <Shuffle className="w-5 h-5" />
                </button>

                <button
                  onClick={playPrevious}
                  className="p-2 text-slate-350"
                >
                  <SkipBack className="w-6 h-6 fill-current" />
                </button>

                <button
                  onClick={togglePlay}
                  disabled={loading}
                  className="p-4 bg-brand-500 text-dark-300 rounded-full shadow-lg shadow-emerald-500/10"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  onClick={playNext}
                  className="p-2 text-slate-350"
                >
                  <SkipForward className="w-6 h-6 fill-current" />
                </button>

                <button
                  onClick={cycleRepeat}
                  className={`p-2 rounded-lg relative ${repeat !== 'none' ? 'text-brand-500' : 'text-slate-500'}`}
                >
                  <Repeat className="w-5 h-5" />
                  {repeat === 'one' && (
                    <span className="absolute top-1.5 right-1 text-[8px] bg-brand-500 text-dark-300 px-0.5 rounded font-black leading-none">
                      1
                    </span>
                  )}
                </button>
              </div>

              {/* Volume Seeker in Expanded view */}
              <div className="flex items-center gap-3 w-full max-w-xs px-2">
                <button
                  onClick={handleVolumeToggle}
                  className="text-slate-500"
                >
                  {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <div className="relative flex-1 flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full slider-seeker cursor-pointer"
                  />
                  <div 
                    className="absolute left-0 bg-brand-500 h-1 rounded-l-full pointer-events-none" 
                    style={{ width: `${volume * 100}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
