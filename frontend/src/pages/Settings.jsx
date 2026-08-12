import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, ShieldAlert, CheckCircle, XCircle, Database, HelpCircle, HardDrive, RefreshCw } from 'lucide-react';
import { useStore } from '../store/store';

export default function Settings() {
  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking' | 'online' | 'offline'
  const [ytDlpVersion, setYtDlpVersion] = useState('');
  const [checkingStatus, setCheckingStatus] = useState(false);

  const history = useStore((state) => state.history);
  const favorites = useStore((state) => state.favorites);
  const playlists = useStore((state) => state.playlists);
  const clearHistory = useStore((state) => state.clearHistory);

  const checkConnectivity = async () => {
    setCheckingStatus(true);
    setBackendStatus('checking');
    try {
      const response = await fetch('http://localhost:3001/api/health');
      if (response.ok) {
        const data = await response.json();
        setBackendStatus('online');
        // Check if backend returned additional info (e.g. yt-dlp presence)
        if (data.ytdlp) {
          setYtDlpVersion(data.ytdlp);
        } else {
          setYtDlpVersion('Disponible (Versión no reportada)');
        }
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
      const req = indexedDB.deleteDatabase('celeste_player_db');
      req.onsuccess = () => {
        alert('Datos locales borrados con éxito. La página se recargará.');
        window.location.reload();
      };
      req.onerror = () => {
        alert('Error al borrar la base de datos local. Por favor, vacía la caché de tu navegador.');
      };
    }
  };

  return (
    <div className="space-y-6 max-w-2xl animate-fadeIn">
      {/* Title */}
      <header className="space-y-1">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Configuración</h2>
        <p className="text-xs text-slate-450">Parámetros del reproductor local y diagnósticos de conexión</p>
      </header>

      {/* Connection & Diagnostics Section */}
      <section className="p-6 rounded-2xl bg-dark-200 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-450 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-brand-500" />
            Estado del Servidor Local
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
              <p className="text-xs text-slate-400 mt-0.5">http://localhost:3001</p>
            </div>
            {backendStatus === 'checking' && (
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                Verificando...
              </span>
            )}
            {backendStatus === 'online' && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 fill-current" />
                En Línea
              </span>
            )}
            {backendStatus === 'offline' && (
              <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 fill-current" />
                Desconectado
              </span>
            )}
          </div>

          {/* yt-dlp Status */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-850 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold">Motor yt-dlp</p>
              <p className="text-xs text-slate-450 mt-0.5 max-w-[150px] truncate">
                {backendStatus === 'online' ? (ytDlpVersion || 'Cargando...') : 'No disponible'}
              </p>
            </div>
            {backendStatus === 'online' && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
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
            <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs text-rose-400">Servidor backend no disponible</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Por favor, asegúrate de que el proceso backend esté ejecutándose localmente en el puerto 3001. Puedes iniciarlo ejecutando <code className="bg-slate-900 px-1.5 py-0.5 rounded text-rose-350">npm run backend</code> en la raíz del proyecto.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Storage and Cleanup Section */}
      <section className="p-6 rounded-2xl bg-dark-200 border border-slate-800/80 space-y-4">
        <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-450 flex items-center gap-2">
          <Database className="w-4 h-4 text-brand-500" />
          Almacenamiento Local (IndexedDB)
        </h3>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-slate-900/35 border border-slate-850 rounded-xl">
            <span className="text-xl font-black text-brand-500">{favorites.length}</span>
            <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Favoritos</p>
          </div>
          <div className="p-3 bg-slate-900/35 border border-slate-850 rounded-xl">
            <span className="text-xl font-black text-brand-500">{playlists.length}</span>
            <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Playlists</p>
          </div>
          <div className="p-3 bg-slate-900/35 border border-slate-850 rounded-xl">
            <span className="text-xl font-black text-brand-500">{history.length}</span>
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
            className="px-4 py-2 border border-rose-500/10 hover:bg-rose-500/10 text-rose-400 font-bold rounded-xl text-xs transition-colors shrink-0"
          >
            Borrar Todo
          </button>
        </div>
      </section>

      {/* Info & Legal Section */}
      <section className="p-6 rounded-2xl bg-dark-200 border border-slate-800/80 space-y-3">
        <h3 className="font-bold text-sm text-slate-350 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-slate-500" />
          Acerca de Celeste Player
        </h3>
        <p className="text-[11px] text-slate-550 leading-relaxed">
          Celeste Player es un reproductor de audio local y personal desarrollado de forma independiente. Este software no descarga ni distribuye archivos protegidos. Únicamente reproduce streams autorizados en formato local/personal y no implementa ningún bypass de DRM, eliminación de publicidad ni violación de términos de servicio.
        </p>
      </section>
    </div>
  );
}
