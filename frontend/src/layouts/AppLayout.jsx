import React, { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, Search, Library, Heart, ListMusic, History, Settings, Music, Sparkles } from 'lucide-react';
import { useStore } from '../store/store';
import AudioPlayer from '../components/AudioPlayer';

export default function AppLayout() {
  const initStore = useStore((state) => state.initStore);
  const location = useLocation();

  useEffect(() => {
    // Initialize store values from IndexedDB on startup
    initStore();
  }, [initStore]);

  const navItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/search', label: 'Buscar', icon: Search },
    { path: '/favorites', label: 'Favoritos', icon: Heart },
    { path: '/playlists', label: 'Playlists', icon: ListMusic },
    { path: '/history', label: 'Historial', icon: History },
    { path: '/settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-screen w-screen bg-dark-300 text-slate-100 overflow-hidden">
      {/* Upper Area: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Sidebar (Desktop Only) */}
        <aside className="hidden md:flex flex-col w-64 bg-dark-200 border-r border-violet-900/20 p-5 shrink-0 glass-panel">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="bg-gradient-to-br from-brand-500 to-cyan-500 p-2.5 rounded-2xl text-white glow-nebula animate-pulse-slow shadow-lg shadow-brand-500/25">
              <Sparkles className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-wider bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                Nebula
              </h1>
              <p className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase -mt-1">Player</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-2 mb-2">Menú Cósmico</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-600 text-white font-semibold shadow-lg shadow-brand-500/20 glow-nebula'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 hover:border-l-2 hover:border-cyan-400'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Sidebar Footer info */}
          <div className="pt-4 border-t border-slate-800/60 text-center">
            <span className="text-[10px] text-violet-400/80 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              Audio HD Libre & Spotify
            </span>
          </div>
        </aside>

        {/* Center / Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gradient-to-b from-dark-100 to-dark-300">
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-36 md:pb-28">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating Bottom Audio Player & Navigation Container */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex flex-col">
        {/* Playback Progress and Controls */}
        <AudioPlayer />

        {/* Mobile Navigation Bar (Mobile Only) */}
        <nav className="md:hidden flex justify-around items-center bg-dark-200/95 backdrop-blur-lg border-t border-slate-850 p-2 pb-5">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive ? 'text-brand-500' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{item.label}</span>
              </NavLink>
            );
          })}
          {/* Include settings icon separately for spacing if needed */}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium transition-colors ${
                isActive ? 'text-brand-500' : 'text-slate-400'
              }`
            }
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px]">Ajustes</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
}
