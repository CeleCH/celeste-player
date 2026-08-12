import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ListMusic, History, Play, Music, Sparkles } from 'lucide-react';
import { useStore } from '../store/store';

export default function Home() {
  const navigate = useNavigate();
  const history = useStore((state) => state.history);
  const favorites = useStore((state) => state.favorites);
  const playlists = useStore((state) => state.playlists);
  const playTrack = useStore((state) => state.playTrack);

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
      color: 'from-rose-500 to-pink-600',
      action: () => navigate('/favorites'),
    },
    {
      label: 'Playlists locales',
      count: `${playlists.length} listas`,
      icon: ListMusic,
      color: 'from-emerald-500 to-teal-600',
      action: () => navigate('/playlists'),
    },
    {
      label: 'Historial reciente',
      count: `${history.length} reproducidas`,
      icon: History,
      color: 'from-violet-500 to-indigo-650',
      action: () => navigate('/history'),
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <header className="relative p-6 md:p-8 rounded-3xl overflow-hidden bg-gradient-to-r from-dark-200/90 to-brand-700/10 border border-slate-800/80">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-emerald-500/10 to-transparent blur-3xl rounded-full" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 border border-brand-500/20 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Celeste Player v1.0</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            ¡{getGreeting()}!
          </h2>
          <p className="text-slate-400 text-sm max-w-md">
            Tu reproductor musical local y privado. Busca tus canciones favoritas para empezar a armar tu biblioteca.
          </p>
        </div>
      </header>

      {/* Quick Library Shortcuts */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold tracking-tight px-1">Biblioteca Rápida</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickShortcuts.map((card, idx) => {
            const Icon = card.icon;
            return (
              <button
                key={idx}
                onClick={card.action}
                className="flex items-center gap-4 p-5 rounded-2xl glass-card text-left focus:outline-none w-full group relative overflow-hidden"
              >
                <div className={`p-3.5 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-250 group-hover:text-brand-500 transition-colors">
                    {card.label}
                  </h4>
                  <p className="text-xs text-slate-500">{card.count}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Recently Played Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold tracking-tight px-1">Escuchado Recientemente</h3>
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed border-slate-800/80 text-center">
            <div className="p-4 rounded-full bg-slate-800/40 text-slate-600 mb-3">
              <Music className="w-8 h-8" />
            </div>
            <p className="text-sm text-slate-500">Aún no has reproducido ninguna canción.</p>
            <button
              onClick={() => navigate('/search')}
              className="mt-4 px-5 py-2 text-xs font-semibold text-brand-500 bg-brand-500/10 hover:bg-brand-500/20 rounded-xl transition-all"
            >
              Buscar música
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {history.slice(0, 6).map((track, index) => (
              <div
                key={`${track.id}-${index}`}
                className="group p-4 rounded-2xl glass-card flex flex-col h-full cursor-pointer relative"
                onClick={() => playTrack(track)}
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-800 mb-3 shadow-md">
                  <img
                    src={track.thumbnail || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&h=150&fit=crop'}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {/* Play Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-brand-500 text-dark-300 p-3 rounded-full shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 glow-hover">
                      <Play className="w-5 h-5 fill-current" />
                    </div>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm truncate text-slate-200 group-hover:text-brand-500 transition-colors">
                    {track.title}
                  </h4>
                  <p className="text-xs text-slate-500 truncate">
                    {track.artists?.map(a => a.name).join(', ') || 'Artista Desconocido'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
