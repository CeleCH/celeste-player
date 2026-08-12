import React from 'react';
import { History as HistoryIcon, Play, Trash2, Clock, Music } from 'lucide-react';
import { useStore } from '../store/store';

export default function History() {
  const history = useStore((state) => state.history);
  const playTrack = useStore((state) => state.playTrack);
  const clearHistory = useStore((state) => state.clearHistory);

  const formatDuration = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const formatTimePlayed = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <header className="flex items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-violet-500/20 to-indigo-500/5 border border-violet-500/10">
        <div className="flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-650 text-white shadow-lg">
            <HistoryIcon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100">Historial</h2>
            <p className="text-xs md:text-sm text-slate-450 mt-1">
              Registro local de tus reproducciones musicales recientes
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => {
              if (confirm('¿Deseas limpiar tu historial de reproducción?')) {
                clearHistory();
              }
            }}
            className="px-4 py-2 border border-slate-800 hover:bg-rose-500/10 text-slate-450 hover:text-rose-400 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            Limpiar Historial
          </button>
        )}
      </header>

      {/* History Items list */}
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 rounded-3xl border border-dashed border-slate-800 text-center">
          <div className="p-4 rounded-full bg-slate-800/40 text-slate-650 mb-3">
            <HistoryIcon className="w-8 h-8" />
          </div>
          <p className="text-sm text-slate-450">El historial está vacío.</p>
          <p className="text-xs text-slate-550 mt-1">Cuando comiences a reproducir canciones, aparecerán en este registro.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {history.map((track, index) => (
            <div
              key={`${track.id}-${index}`}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-850/60 group transition-all"
            >
              {/* Index / Play */}
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

              {/* Played Timestamp */}
              <div className="text-[10px] text-slate-550 font-semibold uppercase tracking-wider shrink-0 mr-4">
                {formatTimePlayed(track.playedAt)}
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
