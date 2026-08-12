import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Play, Plus, Heart, Trash2, Clock, Music, ListPlus } from 'lucide-react';
import { useStore } from '../store/store';
import { musicApi } from '../services/musicApi';

export default function Search() {
  const [inputVal, setInputVal] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'songs' | 'artists' | 'albums'
  const [errorMsg, setErrorMsg] = useState('');
  
  // Playlist selection state
  const [selectedTrackForPlaylist, setSelectedTrackForPlaylist] = useState(null);
  
  const searchResults = useStore((state) => state.searchResults);
  const setSearchResults = useStore((state) => state.setSearchResults);
  const searchHistory = useStore((state) => state.searchHistory);
  const addSearchHistory = useStore((state) => state.addSearchHistory);
  const clearSearchHistory = useStore((state) => state.clearSearchHistory);
  
  const playTrack = useStore((state) => state.playTrack);
  const addToQueue = useStore((state) => state.addToQueue);
  const favorites = useStore((state) => state.favorites);
  const toggleFavorite = useStore((state) => state.toggleFavorite);
  const playlists = useStore((state) => state.playlists);
  const addTrackToPlaylist = useStore((state) => state.addTrackToPlaylist);

  // Debouncing effect
  useEffect(() => {
    if (!inputVal.trim()) {
      setSearchResults({ tracks: [], artists: [], albums: [], playlists: [] });
      setIsSearching(false);
      setErrorMsg('');
      return;
    }

    setIsSearching(true);
    setErrorMsg('');
    const delayDebounce = setTimeout(async () => {
      try {
        const data = await musicApi.search(inputVal);
        setSearchResults(data.results || { tracks: [], artists: [], albums: [], playlists: [] });
        addSearchHistory(inputVal);
      } catch (err) {
        setErrorMsg('No se pudieron obtener resultados de la búsqueda.');
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounce);
  }, [inputVal, setSearchResults, addSearchHistory]);

  const formatDuration = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isFav = (trackId) => favorites.some((t) => t.id === trackId);

  return (
    <div className="space-y-6 animate-fadeIn relative">
      {/* Search Input Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
          <SearchIcon className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Buscar canciones, artistas, álbumes..."
          className="w-full bg-dark-200 border border-slate-800 focus:border-brand-500 rounded-2xl pl-12 pr-10 py-3.5 text-sm placeholder-slate-500 text-slate-100 outline-none transition-all focus:ring-2 focus:ring-brand-500/10"
        />
        {inputVal && (
          <button
            onClick={() => setInputVal('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-200"
          >
            ×
          </button>
        )}
      </div>

      {/* History and Error messages */}
      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm">
          {errorMsg}
        </div>
      )}

      {/* Search History (when no search input is provided) */}
      {!inputVal && searchHistory.length > 0 && (
        <div className="space-y-3 px-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-500">Búsquedas Recientes</h4>
            <button
              onClick={clearSearchHistory}
              className="text-xs text-rose-400/80 hover:text-rose-400 flex items-center gap-1 font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Limpiar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((query, index) => (
              <button
                key={index}
                onClick={() => setInputVal(query)}
                className="px-3.5 py-1.5 rounded-full bg-slate-850 hover:bg-slate-800 text-xs text-slate-350 transition-all hover:text-slate-100"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Display */}
      {inputVal && (
        <div className="space-y-6">
          {/* Tab Selection */}
          <div className="flex border-b border-slate-800/80 overflow-x-auto pb-px">
            {['all', 'songs', 'artists', 'albums'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 border-b-2 font-semibold text-sm capitalize whitespace-nowrap transition-colors -mb-px ${
                  activeTab === tab
                    ? 'border-brand-500 text-brand-500'
                    : 'border-transparent text-slate-450 hover:text-slate-200'
                }`}
              >
                {tab === 'all' ? 'Todo' : tab === 'songs' ? 'Canciones' : tab === 'artists' ? 'Artistas' : 'Álbumes'}
              </button>
            ))}
          </div>

          {/* Loaders */}
          {isSearching ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-slate-900/30 animate-pulse">
                  <div className="w-12 h-12 bg-slate-800 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="h-4 bg-slate-800 rounded w-1/3" />
                    <div className="h-3 bg-slate-800 rounded w-1/4" />
                  </div>
                  <div className="w-12 h-4 bg-slate-800 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Songs List */}
              {(activeTab === 'all' || activeTab === 'songs') && searchResults.tracks?.length > 0 && (
                <section className="space-y-3">
                  <h3 className="text-md font-bold tracking-tight text-slate-400">Canciones</h3>
                  <div className="space-y-1">
                    {searchResults.tracks.map((track, idx) => (
                      <div
                        key={track.id}
                        className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-slate-850/60 group transition-all"
                      >
                        {/* Play button/Image wrapper */}
                        <div className="relative w-11 h-11 bg-slate-800 rounded-lg overflow-hidden shrink-0 shadow-md">
                          <img
                            src={track.thumbnail || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&h=150&fit=crop'}
                            alt={track.title}
                            className="w-full h-full object-cover group-hover:opacity-40 transition-opacity"
                          />
                          <button
                            onClick={() => playTrack(track)}
                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-brand-500"
                          >
                            <Play className="w-5 h-5 fill-current" />
                          </button>
                        </div>

                        {/* Title and artist */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-slate-200 truncate group-hover:text-brand-500 transition-colors">
                            {track.title}
                          </h4>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {track.artists?.map((a) => a.name).join(', ') || 'Artista Desconocido'}
                            {track.album?.name && ` • ${track.album.name}`}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                          {/* Favorite toggle */}
                          <button
                            onClick={() => toggleFavorite(track)}
                            className={`p-2 rounded-lg hover:bg-slate-800 transition-colors ${
                              isFav(track.id) ? 'text-rose-500' : 'text-slate-400 hover:text-slate-200'
                            }`}
                            title={isFav(track.id) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                          >
                            <Heart className={`w-4 h-4 ${isFav(track.id) ? 'fill-current' : ''}`} />
                          </button>
                          
                          {/* Add to Playlist button */}
                          <button
                            onClick={() => setSelectedTrackForPlaylist(track)}
                            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                            title="Añadir a playlist"
                          >
                            <ListPlus className="w-4 h-4" />
                          </button>

                          {/* Add to Queue */}
                          <button
                            onClick={() => addToQueue(track)}
                            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                            title="Agregar a la cola"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Duration */}
                        <div className="text-xs text-slate-500 flex items-center gap-1 px-2 min-w-[50px] justify-end">
                          <Clock className="w-3 h-3 text-slate-650" />
                          <span>{formatDuration(track.duration)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Artists Grid */}
              {(activeTab === 'all' || activeTab === 'artists') && searchResults.artists?.length > 0 && (
                <section className="space-y-3">
                  <h3 className="text-md font-bold tracking-tight text-slate-400">Artistas</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {searchResults.artists.map((artist) => (
                      <div
                        key={artist.id}
                        className="group p-4 rounded-2xl glass-card flex flex-col items-center text-center relative"
                      >
                        <div className="relative aspect-square w-24 rounded-full overflow-hidden bg-slate-800 mb-3 shadow-md">
                          <img
                            src={artist.thumbnail || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&h=150&fit=crop'}
                            alt={artist.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h4 className="font-bold text-sm text-slate-200 truncate w-full">
                          {artist.name}
                        </h4>
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">Artista</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Albums Grid */}
              {(activeTab === 'all' || activeTab === 'albums') && searchResults.albums?.length > 0 && (
                <section className="space-y-3">
                  <h3 className="text-md font-bold tracking-tight text-slate-400">Álbumes</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {searchResults.albums.map((album) => (
                      <div
                        key={album.id}
                        className="group p-4 rounded-2xl glass-card flex flex-col h-full relative"
                      >
                        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-800 mb-3 shadow-md">
                          <img
                            src={album.thumbnail || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&h=150&fit=crop'}
                            alt={album.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h4 className="font-bold text-sm text-slate-200 truncate">
                          {album.name}
                        </h4>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {album.artist?.name || 'Artista'}
                        </p>
                        <span className="text-[10px] uppercase tracking-wider text-slate-600 font-bold mt-2">Álbum</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Empty state check */}
              {((activeTab === 'all' && !searchResults.tracks?.length && !searchResults.artists?.length && !searchResults.albums?.length) ||
                (activeTab === 'songs' && !searchResults.tracks?.length) ||
                (activeTab === 'artists' && !searchResults.artists?.length) ||
                (activeTab === 'albums' && !searchResults.albums?.length)) && (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="p-4 rounded-full bg-slate-800/40 text-slate-600 mb-3">
                    <Music className="w-8 h-8" />
                  </div>
                  <p className="text-sm text-slate-400">No encontramos resultados para "{inputVal}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Playlist Selector Modal */}
      {selectedTrackForPlaylist && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-200 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-slate-150">Añadir a playlist</h3>
              <button
                onClick={() => setSelectedTrackForPlaylist(null)}
                className="text-slate-450 hover:text-slate-200 text-xl font-bold"
              >
                ×
              </button>
            </div>
            
            <p className="text-xs text-slate-450 truncate">
              Selecciona una lista para <strong>{selectedTrackForPlaylist.title}</strong>
            </p>

            <div className="max-h-48 overflow-y-auto space-y-1">
              {playlists.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">No tienes ninguna playlist creada.</p>
              ) : (
                playlists.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => {
                      addTrackToPlaylist(pl.id, selectedTrackForPlaylist);
                      setSelectedTrackForPlaylist(null);
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-slate-850 flex items-center justify-between group transition-colors"
                  >
                    <span className="font-semibold text-sm text-slate-200 group-hover:text-brand-500">{pl.name}</span>
                    <span className="text-[10px] text-slate-500">{pl.tracks.length} temas</span>
                  </button>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex justify-end">
              <button
                onClick={() => setSelectedTrackForPlaylist(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
