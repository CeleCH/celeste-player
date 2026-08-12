import React, { useState } from 'react';
import { ListMusic, Play, Trash2, Edit3, Plus, ChevronLeft, Music, Clock, FolderHeart } from 'lucide-react';
import { useStore } from '../store/store';

export default function Playlists() {
  const playlists = useStore((state) => state.playlists);
  const createPlaylist = useStore((state) => state.createPlaylist);
  const deletePlaylist = useStore((state) => state.deletePlaylist);
  const removeTrackFromPlaylist = useStore((state) => state.removeTrackFromPlaylist);
  const renamePlaylist = useStore((state) => state.renamePlaylist);
  const playTrack = useStore((state) => state.playTrack);
  const clearQueue = useStore((state) => state.clearQueue);
  const addToQueue = useStore((state) => state.addToQueue);
  const setCurrentIndex = useStore((state) => state.setCurrentIndex);

  const [activePlaylistId, setActivePlaylistId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [renameValue, setRenameValue] = useState('');

  const activePlaylist = playlists.find((pl) => pl.id === activePlaylistId);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    createPlaylist(newPlaylistName);
    setNewPlaylistName('');
    setShowCreateModal(false);
  };

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    if (!renameValue.trim() || !activePlaylistId) return;
    renamePlaylist(activePlaylistId, renameValue);
    setRenameValue('');
    setShowRenameModal(false);
  };

  const playEntirePlaylist = () => {
    if (!activePlaylist || activePlaylist.tracks.length === 0) return;
    clearQueue();
    // Add all tracks to queue
    activePlaylist.tracks.forEach((track) => {
      addToQueue(track);
    });
    // Set active playing track index to 0
    setTimeout(() => setCurrentIndex(0), 100);
  };

  const formatDuration = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // 1. Playlist details view
  if (activePlaylistId && activePlaylist) {
    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Navigation back */}
        <button
          onClick={() => setActivePlaylistId(null)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-450 hover:text-slate-200 transition-colors uppercase tracking-wider"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a playlists
        </button>

        {/* Playlist Banner Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-emerald-500/20 to-teal-500/5 border border-emerald-500/10">
          <div className="flex items-center gap-5">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-650 text-white shadow-lg">
              <ListMusic className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
                {activePlaylist.name}
              </h2>
              <p className="text-xs text-slate-450 mt-1">
                {activePlaylist.tracks.length === 1 ? '1 canción' : `${activePlaylist.tracks.length} canciones`} • Creado el {new Date(activePlaylist.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activePlaylist.tracks.length > 0 && (
              <button
                onClick={playEntirePlaylist}
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-dark-300 font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all text-xs flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                Reproducir Todo
              </button>
            )}
            
            <button
              onClick={() => {
                setRenameValue(activePlaylist.name);
                setShowRenameModal(true);
              }}
              className="p-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-250 transition-colors"
              title="Renombrar playlist"
            >
              <Edit3 className="w-4.5 h-4.5" />
            </button>

            <button
              onClick={() => {
                if (confirm('¿Estás seguro de eliminar esta playlist?')) {
                  deletePlaylist(activePlaylist.id);
                  setActivePlaylistId(null);
                }
              }}
              className="p-2.5 rounded-xl border border-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-450 transition-colors"
              title="Eliminar playlist"
            >
              <Trash2 className="w-4.5 h-4.5" />
            </button>
          </div>
        </header>

        {/* Tracks List inside playlist */}
        {activePlaylist.tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 rounded-3xl border border-dashed border-slate-800 text-center">
            <div className="p-4 rounded-full bg-slate-800/40 text-slate-650 mb-3">
              <Music className="w-8 h-8" />
            </div>
            <p className="text-sm text-slate-450">Esta playlist está vacía.</p>
            <p className="text-xs text-slate-550 mt-1">Dirígete a la sección de búsqueda para añadir tus temas favoritos.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {activePlaylist.tracks.map((track, index) => (
              <div
                key={track.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-850/60 group transition-all"
              >
                <span className="w-5 text-center text-xs font-bold text-slate-600 group-hover:hidden">
                  {index + 1}
                </span>
                <button
                  onClick={() => playTrack(track)}
                  className="w-5 text-center text-brand-500 hidden group-hover:block"
                >
                  <Play className="w-4 h-4 fill-current mx-auto" />
                </button>

                <div className="w-11 h-11 bg-slate-800 rounded-lg overflow-hidden shrink-0 shadow-md">
                  <img
                    src={track.thumbnail || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&h=150&fit=crop'}
                    alt={track.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-slate-200 truncate group-hover:text-brand-500 transition-colors">
                    {track.title}
                  </h4>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {track.artists?.map((a) => a.name).join(', ') || 'Artista Desconocido'}
                    {track.album?.name && ` • ${track.album.name}`}
                  </p>
                </div>

                <div className="flex items-center shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity mr-2">
                  <button
                    onClick={() => removeTrackFromPlaylist(activePlaylist.id, track.id)}
                    className="p-2 rounded-lg hover:bg-slate-850 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Quitar de la playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-1 min-w-[50px] justify-end">
                  <Clock className="w-3 h-3 text-slate-650" />
                  <span>{formatDuration(track.duration)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rename Playlist modal overlay */}
        {showRenameModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <form
              onSubmit={handleRenameSubmit}
              className="bg-dark-200 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-scaleUp"
            >
              <h3 className="font-extrabold text-lg text-slate-100">Renombrar playlist</h3>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="Nombre de la playlist..."
                className="w-full bg-dark-300 border border-slate-850 focus:border-brand-500 rounded-xl px-4 py-3 text-sm text-slate-150 outline-none transition-colors"
                required
                maxLength={40}
                autoFocus
              />
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowRenameModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-350 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-dark-300 text-xs font-bold rounded-xl shadow-md transition-colors"
                >
                  Renombrar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  // 2. Playlists summary list view
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with create action */}
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Playlists Locales</h2>
          <p className="text-xs text-slate-450 mt-1">Crea y gestiona tus colecciones personalizadas sin conexión</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-dark-300 font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/10 transition-transform active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nueva Playlist
        </button>
      </header>

      {/* Grid rendering */}
      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 rounded-3xl border border-dashed border-slate-800 text-center">
          <div className="p-4 rounded-full bg-slate-800/40 text-slate-650 mb-3">
            <FolderHeart className="w-8 h-8" />
          </div>
          <p className="text-sm text-slate-400">No tienes ninguna playlist creada.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 px-4 py-2 text-xs font-bold text-brand-500 bg-brand-500/10 hover:bg-brand-500/20 rounded-xl transition-all"
          >
            Crear primera playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => setActivePlaylistId(pl.id)}
              className="group p-5 rounded-2xl glass-card text-left cursor-pointer flex flex-col justify-between h-40 relative"
            >
              {/* Folder design */}
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-slate-800 text-brand-500 group-hover:bg-brand-500 group-hover:text-dark-300 shadow transition-colors">
                  <ListMusic className="w-6 h-6" />
                </div>
                <span className="text-[10px] text-slate-550 font-bold uppercase tracking-wider">
                  Playlist
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-200 group-hover:text-brand-500 truncate transition-colors">
                  {pl.name}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {pl.tracks.length === 1 ? '1 canción' : `${pl.tracks.length} canciones`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal overlay */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="bg-dark-200 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-scaleUp"
          >
            <h3 className="font-extrabold text-lg text-slate-100">Crear playlist</h3>
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Ej. Favoritas del verano, Concentración..."
              className="w-full bg-dark-300 border border-slate-850 focus:border-brand-500 rounded-xl px-4 py-3 text-sm text-slate-150 outline-none transition-colors"
              required
              maxLength={40}
              autoFocus
            />
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-350 text-xs font-bold rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-dark-300 text-xs font-bold rounded-xl shadow-md transition-colors"
              >
                Crear playlist
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
