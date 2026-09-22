import React, { useState } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, 
  Volume2, VolumeX, Loader2, Heart, AlertTriangle, Music,
  Smartphone, Laptop, Radio, ExternalLink, RefreshCw, Check, X, Info
} from 'lucide-react';
import { useStore, useCurrentTrack } from '../store/store';
import useSpotifyPlayer from '../hooks/useSpotifyPlayer';
import { spotifyAuth } from '../services/spotifyAuth';

export default function AudioPlayer() {
  const currentTrack = useCurrentTrack();
  const queue = useStore((state) => state.queue);
  const isPlaying = useStore((state) => state.isPlaying);
  const volume = useStore((state) => state.volume);
  const shuffle = useStore((state) => state.shuffle);
  const repeat = useStore((state) => state.repeat);
  const spotifyUser = useStore((state) => state.spotifyUser);
  
  const setVolume = useStore((state) => state.setVolume);
  const setShuffle = useStore((state) => state.setShuffle);
  const setRepeat = useStore((state) => state.setRepeat);
  const favorites = useStore((state) => state.favorites);
  const toggleFavorite = useStore((state) => state.toggleFavorite);

  const { 
    currentTime, 
    duration, 
    loading, 
    playbackError, 
    setPlaybackError,
    isPlayerReady, 
    isIOS,
    availableDevices,
    selectedDevice,
    isFetchingDevices,
    fetchAvailableDevices,
    selectDevice,
    openInSpotify,
    togglePlay, 
    seek, 
    next, 
    previous 
  } = useSpotifyPlayer();

  const [prevVolume, setPrevVolume] = useState(0.8);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);

  if (!currentTrack) return null;

  const isFav = favorites.some((t) => t.id === currentTrack.id);

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

  // Helper to get device icon
  const getDeviceIcon = (type) => {
    const t = (type || '').toLowerCase();
    if (t === 'smartphone') return <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />;
    if (t === 'computer') return <Laptop className="w-4 h-4 text-cyan-400 shrink-0" />;
    return <Radio className="w-4 h-4 text-violet-400 shrink-0" />;
  };

  return (
    <div className="glass-panel border-t border-slate-800/80 shadow-2xl relative">
      
      {/* Playback Error / Status Toast */}
      {playbackError && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full bg-slate-900/95 border border-rose-500/40 text-rose-200 text-xs px-4 py-2.5 rounded-t-xl flex flex-wrap items-center justify-between gap-3 shadow-2xl z-50 max-w-lg w-[95%]">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="truncate">{playbackError}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick button to open directly in Spotify */}
            <button
              onClick={() => openInSpotify(currentTrack)}
              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-dark-300 font-bold rounded-lg text-[10px] uppercase flex items-center gap-1 shadow-md transition-transform active:scale-95"
            >
              <ExternalLink className="w-3 h-3 stroke-[2.5]" />
              Abrir en Spotify
            </button>

            {/* Devices button */}
            {spotifyUser && (
              <button
                onClick={() => { setIsDeviceModalOpen(true); fetchAvailableDevices(); }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-[10px] uppercase flex items-center gap-1 border border-slate-700 transition-colors"
              >
                <Smartphone className="w-3 h-3" />
                Dispositivos
              </button>
            )}

            {/* Close button */}
            <button
              onClick={() => setPlaybackError('')}
              className="p-1 text-slate-400 hover:text-white rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Spotify Connect banner if not logged in */}
      {!spotifyUser && (
        <div className="bg-gradient-to-r from-emerald-950/80 via-dark-200 to-emerald-950/80 border-b border-emerald-500/20 px-4 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <Music className="w-3.5 h-3.5 animate-pulse" />
            <span>Conecta Spotify para escuchar las pistas completas en alta fidelidad.</span>
          </div>
          <button
            onClick={() => spotifyAuth.login()}
            className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-dark-300 font-black rounded-lg text-[11px] uppercase tracking-wider transition-transform hover:scale-105 shrink-0"
          >
            Conectar
          </button>
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
              {currentTrack.artists?.map((a) => a.name).join(', ') || 'Artista Desconocido'}
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
                shuffle ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Aleatorio"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={previous}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 transition-colors"
              title="Anterior"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              disabled={loading}
              className="p-3 bg-gradient-to-r from-brand-500 to-cyan-500 text-white hover:scale-105 active:scale-95 rounded-full shadow-lg shadow-brand-500/30 glow-nebula transition-all shrink-0"
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
              onClick={next}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 transition-colors"
              title="Siguiente"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={cycleRepeat}
              className={`p-1.5 rounded-lg relative transition-colors ${
                repeat !== 'none' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Repetir"
            >
              <Repeat className="w-4 h-4" />
              {repeat === 'one' && (
                <span className="absolute -top-1 -right-1 text-[8px] bg-cyan-400 text-dark-300 px-0.5 rounded font-black leading-none">
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
              <div 
                className="absolute left-0 bg-gradient-to-r from-brand-500 to-cyan-400 h-1 rounded-l-full pointer-events-none" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
            <span className="text-[10px] font-bold text-slate-500 min-w-[30px]">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right Side: Volume, Devices & Spotify Open */}
        <div className="flex items-center justify-end gap-3 pr-2">
          {/* Quick Open in Spotify */}
          <button
            onClick={() => openInSpotify(currentTrack)}
            title="Abrir en Spotify"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all hover:scale-105 active:scale-95"
          >
            <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden xl:inline">Spotify</span>
          </button>

          {/* Devices selector trigger */}
          {spotifyUser && (
            <button
              onClick={() => { setIsDeviceModalOpen(true); fetchAvailableDevices(); }}
              title="Dispositivos Spotify Connect"
              className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-medium ${
                selectedDevice
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                  : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {selectedDevice ? getDeviceIcon(selectedDevice.type) : <Laptop className="w-4 h-4" />}
              <span className="max-w-[80px] truncate text-[11px] hidden lg:inline">
                {selectedDevice?.name || (isPlayerReady ? 'Web Player' : 'Conectar')}
              </span>
            </button>
          )}

          {/* Volume Slider */}
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
              className="absolute left-0 bg-gradient-to-r from-brand-500 to-cyan-400 h-1 rounded-l-full pointer-events-none" 
              style={{ width: `${volume * 100}%` }} 
            />
          </div>
        </div>
      </div>

      {/* 2. Mobile Floating Mini-Player Layout */}
      <div className="md:hidden flex flex-col w-full bg-dark-200/90 backdrop-blur-md border-t border-slate-850">
        
        {/* Small top track seeker line */}
        <div className="relative w-full h-[3px] bg-slate-800">
          <div 
            className="bg-gradient-to-r from-brand-500 to-cyan-400 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between px-4 py-2.5">
          {/* Mini Meta Info */}
          <div 
            className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
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
                {currentTrack.artists?.map((a) => a.name).join(', ') || 'Artista Desconocido'}
              </p>
            </div>
          </div>

          {/* Quick Playback & Action controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Direct Open in Spotify button for Mobile */}
            <button
              onClick={() => openInSpotify(currentTrack)}
              className="p-2 text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg transition-colors active:scale-95"
              title="Abrir en Spotify"
            >
              <ExternalLink className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Favorite button */}
            <button
              onClick={() => toggleFavorite(currentTrack)}
              className={`p-2 rounded-lg transition-colors ${
                isFav ? 'text-rose-500' : 'text-slate-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              disabled={loading}
              className="p-2.5 bg-gradient-to-r from-brand-500 to-cyan-500 text-white rounded-full shrink-0 active:scale-90 transition-transform shadow-md glow-nebula"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={next}
              className="p-2 text-slate-400 hover:text-slate-100 shrink-0"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>

        {/* Mobile Fullscreen Drawer when tapped */}
        {isMobileExpanded && (
          <div className="fixed inset-0 bg-dark-300 z-50 flex flex-col p-6 animate-slideIn overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4">
              <button 
                onClick={() => setIsMobileExpanded(false)}
                className="text-xs text-slate-400 font-bold uppercase tracking-wider bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/50"
              >
                Cerrar
              </button>

              <button
                onClick={() => { setIsDeviceModalOpen(true); fetchAvailableDevices(); }}
                className="text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{selectedDevice?.name || 'Dispositivos'}</span>
              </button>
            </div>

            {/* Heavy Artwork Display */}
            <div className="flex-1 flex flex-col items-center justify-center py-4">
              <div className="w-64 h-64 bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-violet-500/20 relative">
                <img
                  src={currentTrack.thumbnail || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop'}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title & Artist */}
              <div className="text-center mt-6 max-w-sm">
                <h3 className="font-extrabold text-xl text-white line-clamp-1">{currentTrack.title}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                  {currentTrack.artists?.map((a) => a.name).join(', ') || 'Artista Desconocido'}
                </p>
              </div>

              {/* Highlight Action: Open in Spotify (Ideal for iPhone & Free users) */}
              <div className="mt-4 w-full max-w-xs">
                <button
                  onClick={() => openInSpotify(currentTrack)}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-dark-300 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
                >
                  <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                  Abrir en la App de Spotify
                </button>
                {isIOS && (
                  <p className="text-[10px] text-slate-400 text-center mt-1.5">
                    Recomendado en iPhone para reproducción oficial sin cortes.
                  </p>
                )}
              </div>
            </div>

            {/* Seeker slider */}
            <div className="space-y-2 mt-2">
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
                  className="absolute left-0 bg-gradient-to-r from-brand-500 to-cyan-400 h-1 rounded-l-full pointer-events-none" 
                  style={{ width: `${progressPercent}%` }} 
                />
              </div>
            </div>

            {/* Interactive Control Buttons */}
            <div className="flex flex-col items-center gap-4 py-4 border-t border-slate-800/80 mt-4">
              <div className="flex items-center justify-around w-full max-w-xs">
                <button
                  onClick={() => setShuffle(!shuffle)}
                  className={`p-2 rounded-lg ${shuffle ? 'text-cyan-400' : 'text-slate-500'}`}
                >
                  <Shuffle className="w-5 h-5" />
                </button>

                <button
                  onClick={previous}
                  className="p-2 text-slate-350"
                >
                  <SkipBack className="w-6 h-6 fill-current" />
                </button>

                <button
                  onClick={togglePlay}
                  disabled={loading}
                  className="p-4 bg-gradient-to-r from-brand-500 to-cyan-500 text-white rounded-full shadow-xl shadow-brand-500/30 glow-nebula"
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
                  onClick={next}
                  className="p-2 text-slate-350"
                >
                  <SkipForward className="w-6 h-6 fill-current" />
                </button>

                <button
                  onClick={cycleRepeat}
                  className={`p-2 rounded-lg relative ${repeat !== 'none' ? 'text-cyan-400' : 'text-slate-500'}`}
                >
                  <Repeat className="w-5 h-5" />
                  {repeat === 'one' && (
                    <span className="absolute top-1.5 right-1 text-[8px] bg-cyan-400 text-dark-300 px-0.5 rounded font-black leading-none">
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
                    className="absolute left-0 bg-gradient-to-r from-brand-500 to-cyan-400 h-1 rounded-l-full pointer-events-none" 
                    style={{ width: `${volume * 100}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Spotify Connect Devices Modal */}
      {isDeviceModalOpen && (
        <div className="fixed inset-0 bg-dark-300/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-white text-base">Dispositivos Spotify</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchAvailableDevices}
                  disabled={isFetchingDevices}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  title="Refrescar dispositivos"
                >
                  <RefreshCw className={`w-4 h-4 ${isFetchingDevices ? 'animate-spin text-cyan-400' : ''}`} />
                </button>
                <button
                  onClick={() => setIsDeviceModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* iOS Informative Notice */}
            {isIOS && (
              <div className="my-4 p-3 rounded-2xl bg-violet-950/40 border border-violet-500/30 text-violet-200 text-xs flex gap-2.5">
                <Info className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Aviso para iPhone (iOS):</p>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Apple restringe la reproducción directa en la web. Abre la aplicación oficial de Spotify en tu iPhone para escuchar vía Spotify Connect o pulsa el botón directo.
                  </p>
                </div>
              </div>
            )}

            {/* Free Account Notice */}
            {spotifyUser && spotifyUser.product !== 'premium' && (
              <div className="my-3 p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Cuenta Spotify Free</p>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Spotify requiere una cuenta Premium para el control remoto. Puedes usar el botón "Abrir en Spotify" para escuchar en tu app de Spotify gratis.
                  </p>
                </div>
              </div>
            )}

            {/* Devices List */}
            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
              {availableDevices.length > 0 ? (
                availableDevices.map((device) => {
                  const isCurrent = device.id === selectedDevice?.id || device.is_active;
                  return (
                    <button
                      key={device.id}
                      onClick={() => {
                        selectDevice(device);
                        setIsDeviceModalOpen(false);
                      }}
                      className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-left transition-all ${
                        isCurrent
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-md'
                          : 'bg-slate-850/50 border-slate-800 hover:border-slate-700 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {getDeviceIcon(device.type)}
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate">{device.name}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                            {device.type || 'Dispositivo'}
                          </p>
                        </div>
                      </div>
                      {isCurrent && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                          <Check className="w-3.5 h-3.5" />
                          <span>Activo</span>
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-6 px-4 bg-slate-850/40 rounded-2xl border border-slate-800/60">
                  <Smartphone className="w-8 h-8 text-slate-500 mx-auto mb-2 animate-bounce" />
                  <p className="text-sm font-bold text-slate-300">No hay dispositivos activos</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Abre la aplicación de Spotify en tu iPhone o computadora para que aparezca aquí automáticamente.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Action Button */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col gap-2">
              <button
                onClick={() => {
                  openInSpotify(currentTrack);
                  setIsDeviceModalOpen(false);
                }}
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-dark-300 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                Abrir canción en la App de Spotify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
