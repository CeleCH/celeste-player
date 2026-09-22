import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, ShieldAlert, CheckCircle, XCircle, Database, HelpCircle, HardDrive, RefreshCw, Radio, ExternalLink, Key } from 'lucide-react';
import { useStore } from '../store/store';
import { musicApi } from '../services/musicApi';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function Settings() {
  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking' | 'online' | 'offline'
  const [ytDlpVersion, setYtDlpVersion] = useState('');
  const [spotifyConfigured, setSpotifyConfigured] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const history = useStore((state) => state.history);
  const favorites = useStore((state) => state.favorites);
  const playlists = useStore((state) => state.playlists);

  const checkConnectivity = async () => {
    setCheckingStatus(true);
    setBackendStatus('checking');
    try {
      const response = await fetch(`${BASE_URL}/health`);
      if (response.ok) {
        const data = await response.json();
        setBackendStatus('online');
        setYtDlpVersion(data.ytdlp || 'Disponible (yt-dlp)');
        setSpotifyConfigured(Boolean(data.spotifyConfigured));
      } else {
        setBackendStatus('offline');
      }
    } catch (err) {
      setBackendStatus('offline');
      setYtDlpVersion('');
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    checkConnectivity();
  }, []);

  const handleWipeData = () => {
    if (confirm('⚠️ CUIDADO: Esto eliminará de forma permanente tus playlists, canciones favoritas e historial de reproducción. ¿Estás seguro de que deseas continuar?')) {
      localStorage.clear();
      // Wipe IndexedDB by triggering database delete
      try {
        indexedDB.deleteDatabase('nebula_player_db');
        indexedDB.deleteDatabase('celeste_player_db');
      } catch (e) {}
      alert('Datos locales borrados con éxito. La página se recargará.');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-2xl animate-fadeIn">
      {/* Title */}
      <header className="space-y-1">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">Configuración</h2>
        <p className="text-xs text-slate-400">Diagnósticos del motor cósmico, integración de Spotify y base de datos local</p>
      </header>

      {/* Spotify Hybrid Integration Status Card */}
      <section className="p-6 rounded-2xl bg-dark-200 border border-violet-500/20 space-y-4 glass-card">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-violet-300 flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            Integración Spotify Oficial (Híbrida)
          </h3>
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            spotifyConfigured 
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
              : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
          }`}>
            {spotifyConfigured ? 'Conectado a Spotify' : 'Catálogo Cósmico Alternativo'}
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {spotifyConfigured 
            ? '¡Todo listo! Nebula Player está utilizando la API oficial de Spotify para Tops Mundiales, metadatos y carátulas HD, y resolviendo el audio en streaming libre sin límites de amigos simultáneos.'
            : 'Nebula Player está funcionando en modo streaming libre. Puedes conectar tus credenciales gratuitas de Spotify Developer en cualquier momento en el archivo backend/.env para activar las playlists oficiales y Tops de Spotify.'}
        </p>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-violet-900/20 text-xs text-slate-400 space-y-2">
          <div className="flex items-center justify-between text-slate-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              ¿Cómo obtener tus credenciales gratuitas de Spotify?
            </span>
            <a 
              href="https://developer.spotify.com/dashboard" 
              target="_blank" 
              rel="noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
            >
              Abrir Spotify Dashboard <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400">
            <li>Ingresa a <strong className="text-slate-300">developer.spotify.com/dashboard</strong> e inicia sesión.</li>
            <li>Haz clic en <strong className="text-slate-300">"Create App"</strong> (Nombre: Nebula Player).</li>
            <li>En la configuración de tu app, copia el <strong className="text-slate-300">Client ID</strong> y <strong className="text-slate-300">Client Secret</strong>.</li>
            <li>Pégalos en el archivo <code className="bg-slate-800 text-cyan-300 px-1 py-0.5 rounded">backend/.env</code> en las variables correspondientes. ¡Y listo!</li>
          </ol>
        </div>
      </section>

      {/* Connection & Diagnostics Section */}
      <section className="p-6 rounded-2xl bg-dark-200 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-brand-500" />
            Estado del Servidor Backend
          </h3>
          <button
            onClick={checkConnectivity}
            disabled={checkingStatus}
            className={`p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-350 transition-colors ${checkingStatus ? 'animate-spin' : ''}`}
            title="Refrescar conexión"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Connection Indicator */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-850 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold">Servicio API Backend</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[140px]">{BASE_URL}</p>
            </div>
            {backendStatus === 'checking' && (
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                Verificando...
              </span>
            )}
            {backendStatus === 'online' && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 fill-current" />
                En Línea
              </span>
            )}
            {backendStatus === 'offline' && (
              <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 fill-current" />
                Desconectado
              </span>
            )}
          </div>

          {/* yt-dlp Status */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-850 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold">Motor de Streaming</p>
              <p className="text-xs text-slate-400 mt-0.5 max-w-[150px] truncate">
                {backendStatus === 'online' ? (ytDlpVersion || 'Cargando...') : 'No disponible'}
              </p>
            </div>
            {backendStatus === 'online' && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                Activo
              </span>
            )}
            {backendStatus === 'offline' && (
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                Inactivo
              </span>
            )}
          </div>
        </div>

        {backendStatus === 'offline' && (
          <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs text-rose-400">Servidor backend no disponible</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Por favor, asegúrate de que el backend de Nebula esté ejecutándose localmente en el puerto 3001. Puedes iniciarlo con <code className="bg-slate-900 px-1.5 py-0.5 rounded text-rose-300">npm run backend</code>.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Storage and Cleanup Section */}
      <section className="p-6 rounded-2xl bg-dark-200 border border-slate-800/80 space-y-4">
        <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Database className="w-4 h-4 text-brand-500" />
          Almacenamiento Local (IndexedDB)
        </h3>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-slate-900/35 border border-slate-850 rounded-xl">
            <span className="text-xl font-black text-cyan-400">{favorites.length}</span>
            <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Favoritos</p>
          </div>
          <div className="p-3 bg-slate-900/35 border border-slate-850 rounded-xl">
            <span className="text-xl font-black text-brand-500">{playlists.length}</span>
            <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Playlists</p>
          </div>
          <div className="p-3 bg-slate-900/35 border border-slate-850 rounded-xl">
            <span className="text-xl font-black text-pink-400">{history.length}</span>
            <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Historial</p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-xs text-slate-200">Restablecer aplicación</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Limpia toda la base de datos local y preferencias del usuario.</p>
          </div>
          <button
            onClick={handleWipeData}
            className="px-4 py-2 border border-rose-500/20 hover:bg-rose-500/10 text-rose-400 font-bold rounded-xl text-xs transition-colors shrink-0"
          >
            Borrar Todo
          </button>
        </div>
      </section>

      {/* Info & Legal Section */}
      <section className="p-6 rounded-2xl bg-dark-200 border border-slate-800/80 space-y-3">
        <h3 className="font-bold text-sm text-slate-350 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-slate-500" />
          Acerca de Nebula Player
        </h3>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Nebula Player es un reproductor de audio moderno con arquitectura híbrida de alta fidelidad. Permite explorar y consultar las listas y metadatos oficiales de Spotify mientras transmite audio libre de forma autorizada y sin límites de concurrencia, respetando la privacidad del usuario sin rastreadores ni publicidad.
        </p>
      </section>
    </div>
  );
}
