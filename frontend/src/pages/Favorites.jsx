import React from 'react';
import { Heart, Play, Trash2, Clock, Music } from 'lucide-react';
import { useStore } from '../store/store';

export default function Favorites() {
  const favorites = useStore((state) => state.favorites);
  const playTrack = useStore((state) => state.playTrack);
  const toggleFavorite = useStore((state) => state.toggleFavorite);

  const formatDuration = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <header className="flex items-center gap-5 p-6 rounded-3xl bg-gradient-to-r from-rose-500/20 to-pink-500/5 border border-rose-500/10">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-650 text-white shadow-lg glow-rose">
          <Heart className="w-8 h-8 fill-current" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100">Mis Favoritos</h2>
          <p className="text-xs md:text-sm text-slate-450 mt-1">
            {favorites.length === 1 ? '1 canción guardada' : `${favorites.length} canciones guardadas`} en tu biblioteca local
          </p>
        </div>
      </header>

      {/* Main List */}
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 rounded-3xl border border-dashed border-slate-800 text-center">
          <div className="p-4 rounded-full bg-slate-800/40 text-slate-650 mb-3">
            <Heart className="w-8 h-8" />
          </div>
          <p className="text-sm text-slate-400">Aún no has agregado canciones a favoritos.</p>
          <p className="text-xs text-slate-550 mt-1">Busca temas y marca el ícono del corazón ❤️ para verlos aquí.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {favorites.map((track, index) => (
            <div
              key={track.id}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-850/60 group transition-all"
            >
              {/* Row index or play indicator */}
              <span className="w-5 text-center text-xs font-bold text-slate-600 group-hover:hidden">
                {index + 1}
              </span>
              <button
                onClick={() => playTrack(track)}
                className="w-5 text-center text-brand-500 hidden group-hover:block"
              >
                <Play className="w-4 h-4 fill-current mx-auto" />
              </button>

              {/* Artwork */}
              <div className="w-11 h-11 bg-slate-800 rounded-lg overflow-hidden shrink-0 shadow-md">
                <img
                  src={track.thumbnail || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&h=150&fit=crop'}
                  alt={track.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
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
              <div className="flex items-center shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity mr-2">
                <button
                  onClick={() => toggleFavorite(track)}
                  className="p-2 rounded-lg hover:bg-slate-800 text-rose-500 hover:text-rose-450 transition-colors"
                  title="Eliminar de favoritos"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Duration */}
              <div className="text-xs text-slate-500 flex items-center gap-1 min-w-[50px] justify-end">
                <Clock className="w-3 h-3 text-slate-650" />
                <span>{formatDuration(track.duration)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
