import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ListMusic, History, Play, Music, Sparkles, Disc, Radio, ArrowRight, X } from 'lucide-react';
import { useStore, useCurrentTrack } from '../store/store';
import { musicApi } from '../services/musicApi';

export default function Home() {
  const navigate = useNavigate();
  const history = useStore((state) => state.history);
  const favorites = useStore((state) => state.favorites);
  const playlists = useStore((state) => state.playlists);
  const playTrack = useStore((state) => state.playTrack);
  const isPlaying = useStore((state) => state.isPlaying);
  const currentTrack = useCurrentTrack();

  const [featuredPlaylists, setFeaturedPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [spotifyConfigured, setSpotifyConfigured] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingPlaylists(true);
        const [featData, statusData] = await Promise.all([
          musicApi.getSpotifyFeatured(),
          musicApi.getSpotifyStatus()
        ]);
        if (featData && featData.playlists) {
          setFeaturedPlaylists(featData.playlists);
        }
        if (statusData) {
          setSpotifyConfigured(statusData.configured);
        }
      } catch (err) {
        console.error('Error loading featured data:', err);
      } finally {
        setLoadingPlaylists(false);
      }
    }
    loadData();
  }, []);

  const handleOpenPlaylist = async (playlist) => {
    setSelectedPlaylist(playlist);
    setLoadingTracks(true);
    try {
      if (playlist.source === 'spotify') {
        const data = await musicApi.getSpotifyPlaylist(playlist.id);
        setPlaylistTracks(data.tracks || []);
      } else {
        // Fallback curated search for this genre
        const searchResults = await musicApi.search(playlist.name);
        setPlaylistTracks(searchResults.results?.tracks || []);
      }
    } catch (err) {
      console.error('Error fetching playlist tracks:', err);
      setPlaylistTracks([]);
    } finally {
      setLoadingTracks(false);
    }
  };

  const handlePlayPlaylistAll = () => {
    if (playlistTracks.length > 0) {
      playTrack(playlistTracks[0]);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const quickShortcuts = [
    {
      label: 'Favoritos',
      count: `${favorites.length} canciones`,
      icon: Heart,
      color: 'from-pink-500 via-rose-500 to-fuchsia-600',
      action: () => navigate('/favorites'),
    },
    {
      label: 'Playlists locales',
      count: `${playlists.length} colecciones`,
      icon: ListMusic,
      color: 'from-cyan-500 via-teal-500 to-emerald-500',
      action: () => navigate('/playlists'),
    },
    {
      label: 'Historial estelar',
      count: `${history.length} reproducidas`,
      icon: History,
      color: 'from-violet-600 via-purple-600 to-indigo-650',
      action: () => navigate('/history'),
    },
  ];

  return (
    <div className="space-y-10 animate-fadeIn relative">
      {/* Cosmic Welcome Banner */}
      <header className="relative p-6 md:p-10 rounded-3xl overflow-hidden bg-gradient-to-r from-dark-200 via-dark-100 to-violet-950/40 border border-violet-500/20 shadow-2xl">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-violet-600/15 via-cyan-500/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-pink-500/10 blur-2xl rounded-full pointer-events-none" />
        
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 text-violet-300 border border-brand-500/30 text-xs font-semibold glow-nebula">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Nebula Player v2.0</span>
            </div>
            
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              spotifyConfigured 
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
            }`}>
              <Radio className="w-3 h-3" />
              <span>{spotifyConfigured ? 'Spotify API Conectada' : 'Modo Streaming Libre'}</span>
            </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            ¡{getGreeting()}!
          </h2>
          <p className="text-slate-350 text-sm md:text-base max-w-xl leading-relaxed">
            Explora el universo musical sin restricciones. Disfruta de tops globales, carátulas en Ultra HD y streaming de audio libre para ti y tus amigos.
          </p>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => navigate('/search')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-500 hover:from-brand-600 hover:to-cyan-600 text-white font-bold text-xs shadow-lg shadow-brand-500/25 glow-hover transition-all flex items-center gap-2"
            >
              <Music className="w-4 h-4" />
              Explorar Catálogo
            </button>
            <button
              onClick={() => navigate('/favorites')}
              className="px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/50 font-bold text-xs transition-colors"
            >
              Mis Favoritos
            </button>
          </div>
        </div>
      </header>

      {/* Featured Tops & Playlists (Spotify / Cosmic Curated) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Disc className="w-6 h-6 text-brand-500" />
              Tops y Playlists Destacadas
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Listas de éxitos mundiales preparadas para reproducirse en un clic
            </p>
          </div>
        </div>

        {loadingPlaylists ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="p-4 rounded-2xl glass-card animate-pulse space-y-3">
                <div className="aspect-square bg-slate-800/60 rounded-xl" />
                <div className="h-4 bg-slate-800/80 rounded w-3/4" />
                <div className="h-3 bg-slate-800/40 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredPlaylists.map((pl) => (
              <div
                key={pl.id}
                onClick={() => handleOpenPlaylist(pl)}
                className="group p-4 rounded-2xl glass-card flex flex-col h-full cursor-pointer relative transition-all duration-300 hover:border-violet-500/40"
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-900 mb-3.5 shadow-lg">
                  <img
                    src={pl.thumbnail || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&fit=crop'}
                    alt={pl.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Neon Glow Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-300/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3.5">
                    <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
                      Ver canciones
                    </span>
                    <div className="bg-gradient-to-r from-brand-500 to-cyan-500 text-white p-3 rounded-full shadow-xl glow-nebula transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <Play className="w-5 h-5 fill-current" />
                    </div>
                  </div>
                </div>

                <div className="min-w-0 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-base text-slate-100 group-hover:text-cyan-400 transition-colors truncate">
                      {pl.name}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-snug">
                      {pl.description}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-violet-400 font-semibold">
                    <span>{pl.tracksCount ? `${pl.tracksCount} temas` : 'Top Colección'}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Library Shortcuts */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold tracking-tight px-1 text-white">Biblioteca Rápida</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickShortcuts.map((card, idx) => {
            const Icon = card.icon;
            return (
              <button
                key={idx}
                onClick={card.action}
                className="flex items-center gap-4 p-5 rounded-2xl glass-card text-left focus:outline-none w-full group relative overflow-hidden"
              >
                <div className={`p-3.5 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-lg shadow-violet-900/20 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                    {card.label}
                  </h4>
                  <p className="text-xs text-slate-400">{card.count}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Recently Played Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold tracking-tight px-1 text-white">Escuchado Recientemente</h3>
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed border-violet-900/30 text-center bg-dark-200/40">
            <div className="p-4 rounded-full bg-violet-950/40 text-violet-400 mb-3">
              <Music className="w-8 h-8" />
            </div>
            <p className="text-sm text-slate-400">Aún no has reproducido ninguna canción.</p>
            <button
              onClick={() => navigate('/search')}
              className="mt-4 px-5 py-2 text-xs font-semibold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl transition-all"
            >
              Buscar en Nebula
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {history.slice(0, 6).map((track, index) => {
              const isCurrent = currentTrack && currentTrack.id === track.id;
              return (
                <div
                  key={`${track.id}-${index}`}
                  className={`group p-4 rounded-2xl glass-card flex flex-col h-full cursor-pointer relative transition-all ${
                    isCurrent ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/10' : ''
                  }`}
                  onClick={() => playTrack(track)}
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-900 mb-3 shadow-md">
                    <img
                      src={track.thumbnail || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&fit=crop'}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {/* Active playing indicator or hover play */}
                    {isCurrent && isPlaying ? (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-1">
                        <span className="w-1 bg-cyan-400 soundwave-bar rounded-full"></span>
                        <span className="w-1 bg-brand-500 soundwave-bar rounded-full"></span>
                        <span className="w-1 bg-pink-400 soundwave-bar rounded-full"></span>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-brand-500 text-white p-3 rounded-full shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 glow-nebula">
                          <Play className="w-5 h-5 fill-current" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className={`font-bold text-sm truncate transition-colors ${
                      isCurrent ? 'text-cyan-400' : 'text-slate-200 group-hover:text-cyan-400'
                    }`}>
                      {track.title}
                    </h4>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {track.artists?.map(a => a.name).join(', ') || 'Artista'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Playlist Tracks Slide-Over Drawer Modal */}
      {selectedPlaylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-dark-200 border border-violet-500/30 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden glass-panel">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800/80 flex items-start gap-4 justify-between bg-dark-100/50">
              <div className="flex items-center gap-4">
                <img
                  src={selectedPlaylist.thumbnail}
                  alt={selectedPlaylist.name}
                  className="w-20 h-20 rounded-2xl object-cover shadow-lg border border-violet-500/20"
                />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                    Playlist Cósmica
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">
                    {selectedPlaylist.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                    {selectedPlaylist.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlaylist(null)}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-3 bg-dark-200/90 border-b border-slate-800/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">
                {playlistTracks.length} canciones encontradas
              </span>
              <button
                onClick={handlePlayPlaylistAll}
                disabled={playlistTracks.length === 0}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-500 hover:from-brand-600 hover:to-cyan-600 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-brand-500/20 disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                Reproducir Todo
              </button>
            </div>

            {/* Modal Tracklist */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {loadingTracks ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">Cargando pistas de la playlist...</p>
                </div>
              ) : playlistTracks.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No se pudieron cargar las pistas de esta lista.
                </div>
              ) : (
                playlistTracks.map((track, i) => (
                  <div
                    key={`${track.id}-${i}`}
                    onClick={() => playTrack(track)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/60 cursor-pointer group transition-colors"
                  >
                    <span className="w-6 text-center text-xs font-bold text-slate-500 group-hover:text-cyan-400">
                      {i + 1}
                    </span>
                    <img
                      src={track.thumbnail || selectedPlaylist.thumbnail}
                      alt={track.title}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-slate-200 group-hover:text-cyan-400 truncate">
                        {track.title}
                      </h4>
                      <p className="text-xs text-slate-400 truncate">
                        {track.artists?.map(a => a.name).join(', ') || 'Artista'}
                      </p>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 p-2 rounded-full bg-brand-500 text-white transition-opacity">
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
