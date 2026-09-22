import { useEffect, useState, useRef, useCallback } from 'react';
import { useStore, useCurrentTrack } from '../store/store';
import { spotifyAuth } from '../services/spotifyAuth';

let globalPlayer = null;

// Helper to detect iOS devices (iPhone, iPad, iPod)
const detectIsIOS = () => {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
};

export default function useSpotifyPlayer() {
  const currentTrack = useCurrentTrack();
  const isPlaying = useStore((state) => state.isPlaying);
  const setIsPlaying = useStore((state) => state.setIsPlaying);
  const volume = useStore((state) => state.volume);
  const playNext = useStore((state) => state.playNext);
  const playPrevious = useStore((state) => state.playPrevious);
  
  const spotifyUser = useStore((state) => state.spotifyUser);
  const spotifyDeviceId = useStore((state) => state.spotifyDeviceId);
  const setSpotifyDeviceId = useStore((state) => state.setSpotifyDeviceId);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [playbackError, setPlaybackError] = useState('');
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  // Spotify Connect & Remote Devices State
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isFetchingDevices, setIsFetchingDevices] = useState(false);
  const isIOS = detectIsIOS();

  const playerRef = useRef(null);
  const progressTimerRef = useRef(null);
  const lastTrackUriRef = useRef(null);

  /**
   * Fetch user's available Spotify Connect devices
   */
  const fetchAvailableDevices = useCallback(async () => {
    const token = await spotifyAuth.getValidToken();
    if (!token) return [];

    setIsFetchingDevices(true);
    try {
      const res = await fetch('https://api.spotify.com/v1/me/player/devices', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setIsFetchingDevices(false);
        return [];
      }

      const data = await res.json();
      const devices = data.devices || [];
      setAvailableDevices(devices);

      // Find active device or pick an available one
      const active = devices.find((d) => d.is_active);
      if (active) {
        setSelectedDevice(active);
        if (!spotifyDeviceId || isIOS) {
          setSpotifyDeviceId(active.id);
        }
      } else if (devices.length > 0 && (!spotifyDeviceId || isIOS)) {
        // Prioritize smartphone if on mobile, or take the first device
        const preferred = devices.find((d) => d.type?.toLowerCase() === 'smartphone') || devices[0];
        setSelectedDevice(preferred);
        setSpotifyDeviceId(preferred.id);
      }

      setIsFetchingDevices(false);
      return devices;
    } catch (err) {
      console.warn('Error al consultar dispositivos Spotify:', err);
      setIsFetchingDevices(false);
      return [];
    }
  }, [spotifyDeviceId, setSpotifyDeviceId, isIOS]);

  /**
   * Select a specific Spotify Connect device and transfer playback
   */
  const selectDevice = useCallback(async (device) => {
    if (!device) return;
    setSelectedDevice(device);
    setSpotifyDeviceId(device.id);

    const token = await spotifyAuth.getValidToken();
    if (token) {
      try {
        await fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            device_ids: [device.id],
            play: isPlaying,
          }),
        });
        setPlaybackError('');
      } catch (e) {
        console.warn('Error al transferir reproducción a dispositivo:', e);
      }
    }
  }, [setSpotifyDeviceId, isPlaying]);

  /**
   * Helper to open track directly in the native Spotify app or web player
   */
  const openInSpotify = useCallback((trackToOpen) => {
    const t = trackToOpen || currentTrack;
    if (!t) return;
    let id = t.originalSpotifyId || t.id || '';
    if (id.startsWith('sp_')) id = id.replace(/^sp_/, '');

    const appUri = `spotify:track:${id}`;
    const webUrl = `https://open.spotify.com/track/${id}`;

    // Try opening Spotify app via protocol handler
    window.location.href = appUri;

    // Fallback opening Web link in new tab after slight delay
    setTimeout(() => {
      window.open(webUrl, '_blank', 'noopener,noreferrer');
    }, 1000);
  }, [currentTrack]);

  // Query devices initially on mount
  useEffect(() => {
    if (spotifyAuth.isAuthenticated()) {
      fetchAvailableDevices();
    }
  }, [fetchAvailableDevices]);

  // Initialize Spotify Web Playback SDK (Desktop / compatible browsers)
  useEffect(() => {
    const token = spotifyAuth.isAuthenticated();
    if (!token) {
      setIsPlayerReady(false);
      return;
    }

    // On iOS Safari / WebKit, Web Playback SDK is not supported (no Widevine DRM)
    if (isIOS) {
      console.log('📱 [Nebula Player] Dispositivo iOS detectado. Usando Spotify Connect y deep links.');
      fetchAvailableDevices();
      return;
    }

    const initPlayer = () => {
      if (window.Spotify && !globalPlayer) {
        const player = new window.Spotify.Player({
          name: 'Nebula Player Cosmic Web',
          getOAuthToken: async (cb) => {
            const validToken = await spotifyAuth.getValidToken();
            cb(validToken || '');
          },
          volume: volume,
        });

        player.addListener('ready', ({ device_id }) => {
          console.log('🌌 [Nebula Player] Dispositivo Spotify listo con ID:', device_id);
          setSpotifyDeviceId(device_id);
          setIsPlayerReady(true);
          setPlaybackError('');
        });

        player.addListener('not_ready', ({ device_id }) => {
          console.warn('🌌 [Nebula Player] Dispositivo desconectado:', device_id);
          setIsPlayerReady(false);
        });

        player.addListener('player_state_changed', (state) => {
          if (!state) return;

          setIsPlaying(!state.paused);
          setCurrentTime(Math.round(state.position / 1000));
          setDuration(Math.round(state.duration / 1000));
          setLoading(false);

          // Track finished naturally
          if (state.position === 0 && state.paused && state.restrictions?.cannot_resume) {
            playNext();
          }
        });

        player.addListener('initialization_error', ({ message }) => {
          console.error('Spotify Init Error:', message);
          if (isIOS) {
            setPlaybackError('En iPhone, abre la app de Spotify o pulsa "Abrir en Spotify".');
          } else {
            setPlaybackError(`Error al inicializar reproductor: ${message}`);
          }
        });

        player.addListener('authentication_error', async ({ message }) => {
          console.error('Spotify Auth Error:', message);
          const newToken = await spotifyAuth.refreshAccessToken();
          if (!newToken) {
            setPlaybackError('Sesión de Spotify expirada. Por favor, conéctate nuevamente.');
            setIsPlayerReady(false);
          }
        });

        player.addListener('account_error', ({ message }) => {
          console.error('Spotify Account Error:', message);
          setPlaybackError('Se requiere una cuenta de Spotify Premium para reproducir música con el Web SDK.');
        });

        player.addListener('playback_error', ({ message }) => {
          console.error('Spotify Playback Error:', message);
          setPlaybackError(`Error de reproducción: ${message}`);
          setLoading(false);
        });

        player.connect().then((success) => {
          if (success) {
            console.log('🌌 [Nebula Player] Conectado exitosamente al Web Playback SDK');
          }
        });

        globalPlayer = player;
        playerRef.current = player;
      } else if (globalPlayer) {
        playerRef.current = globalPlayer;
        if (spotifyDeviceId) {
          setIsPlayerReady(true);
        }
      }
    };

    if (!window.Spotify) {
      window.onSpotifyWebPlaybackSDKReady = initPlayer;
      // Inject SDK script dynamically if not present in index.html
      if (!document.getElementById('spotify-sdk-script')) {
        const script = document.createElement('script');
        script.id = 'spotify-sdk-script';
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        document.body.appendChild(script);
      }
    } else {
      initPlayer();
    }
  }, [setSpotifyDeviceId, volume, setIsPlaying, playNext, spotifyDeviceId, isIOS, fetchAvailableDevices]);

  // Volume synchronization
  useEffect(() => {
    if (globalPlayer && !isIOS) {
      globalPlayer.setVolume(volume).catch((e) => console.warn('Error setting volume:', e));
    }
  }, [volume, isIOS]);

  // Real-time progress timer when playing
  useEffect(() => {
    if (isPlaying) {
      progressTimerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (duration > 0 && prev >= duration) {
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    }

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, [isPlaying, duration]);

  // Play a track via Spotify Web API / Spotify Connect
  const playTrackViaSpotify = useCallback(async (track) => {
    if (!track) return;

    const token = await spotifyAuth.getValidToken();
    if (!token) {
      setPlaybackError('Conecta tu cuenta de Spotify para reproducir.');
      return;
    }

    let deviceId = spotifyDeviceId || useStore.getState().spotifyDeviceId;

    // If no device ID yet, attempt to fetch available Spotify Connect devices
    if (!deviceId) {
      const devices = await fetchAvailableDevices();
      const activeOrPreferred = devices.find((d) => d.is_active) || devices[0];
      if (activeOrPreferred) {
        deviceId = activeOrPreferred.id;
        setSpotifyDeviceId(deviceId);
        setSelectedDevice(activeOrPreferred);
      }
    }

    if (!deviceId) {
      setLoading(false);
      if (isIOS) {
        setPlaybackError('En iPhone, abre tu app de Spotify o pulsa "Abrir en Spotify" para escuchar.');
      } else {
        setPlaybackError('Inicializando reproductor... Abre Spotify en tu teléfono o PC si no inicia automáticamente.');
      }
      return;
    }

    // Clean track ID to get Spotify 22-char ID
    let spotifyId = track.originalSpotifyId || track.id;
    if (spotifyId.startsWith('sp_')) {
      spotifyId = spotifyId.replace(/^sp_/, '');
    }

    const trackUri = `spotify:track:${spotifyId}`;
    if (lastTrackUriRef.current === trackUri && isPlaying) {
      return;
    }

    lastTrackUriRef.current = trackUri;
    setLoading(true);
    setPlaybackError('');

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          uris: [trackUri],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.error?.message || 'Error al iniciar reproducción en Spotify.';
        const reason = errorData.error?.reason || '';

        if (msg.includes('PREMIUM_REQUIRED') || response.status === 403 || reason === 'PREMIUM_REQUIRED') {
          throw new Error('Se requiere Spotify Premium para reproducir por control remoto. Pulsa "Abrir en Spotify" para escuchar en tu app.');
        }
        if (msg.includes('NO_ACTIVE_DEVICE') || response.status === 404 || reason === 'NO_ACTIVE_DEVICE') {
          throw new Error('No se detectó la app de Spotify activa. Abre tu app de Spotify en el iPhone o PC.');
        }
        throw new Error(msg);
      }

      setIsPlaying(true);
      setLoading(false);
    } catch (err) {
      console.error('Error starting Spotify playback:', err);
      setPlaybackError(err.message || 'Error al iniciar la canción.');
      setIsPlaying(false);
      setLoading(false);
    }
  }, [spotifyDeviceId, setIsPlaying, isPlaying, fetchAvailableDevices, isIOS, setSpotifyDeviceId]);

  // Trigger playback when currentTrack changes
  useEffect(() => {
    if (currentTrack) {
      if (currentTrack.duration && duration === 0) {
        setDuration(currentTrack.duration);
      }
      playTrackViaSpotify(currentTrack);
    }
  }, [currentTrack?.id, playTrackViaSpotify]);

  // Control Functions
  const togglePlay = async () => {
    if (globalPlayer && !isIOS) {
      try {
        await globalPlayer.togglePlay();
        return;
      } catch (e) {
        console.warn('Local togglePlay failed, attempting remote API:', e);
      }
    }

    // Remote Spotify Connect play/pause toggle
    const token = await spotifyAuth.getValidToken();
    const deviceId = spotifyDeviceId || useStore.getState().spotifyDeviceId;
    if (!token) return;

    try {
      const endpoint = isPlaying
        ? `https://api.spotify.com/v1/me/player/pause${deviceId ? `?device_id=${deviceId}` : ''}`
        : `https://api.spotify.com/v1/me/player/play${deviceId ? `?device_id=${deviceId}` : ''}`;

      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok || res.status === 204) {
        setIsPlaying(!isPlaying);
      } else if (res.status === 403) {
        setPlaybackError('Se requiere Spotify Premium para control remoto. Pulsa "Abrir en Spotify".');
      } else if (res.status === 404) {
        setPlaybackError('No hay dispositivo activo. Abre tu app de Spotify.');
      }
    } catch (err) {
      console.warn('Error toggling remote playback:', err);
    }
  };

  const seek = async (seconds) => {
    if (globalPlayer && !isIOS) {
      try {
        await globalPlayer.seek(seconds * 1000);
        setCurrentTime(seconds);
        return;
      } catch (e) {
        console.warn('Local seek failed, attempting remote API:', e);
      }
    }

    const token = await spotifyAuth.getValidToken();
    const deviceId = spotifyDeviceId || useStore.getState().spotifyDeviceId;
    if (token) {
      try {
        await fetch(`https://api.spotify.com/v1/me/player/seek?position_ms=${Math.round(seconds * 1000)}${deviceId ? `&device_id=${deviceId}` : ''}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentTime(seconds);
      } catch (e) {
        console.warn('Seek error:', e);
      }
    }
  };

  const next = async () => {
    if (globalPlayer && !isIOS) {
      try {
        await globalPlayer.nextTrack();
        return;
      } catch {
        // Fallback below
      }
    }

    const token = await spotifyAuth.getValidToken();
    const deviceId = spotifyDeviceId || useStore.getState().spotifyDeviceId;
    if (token && deviceId) {
      try {
        await fetch(`https://api.spotify.com/v1/me/player/next?device_id=${deviceId}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        console.warn('Remote next error:', e);
      }
    }
    playNext();
  };

  const previous = async () => {
    if (globalPlayer && !isIOS) {
      try {
        await globalPlayer.previousTrack();
        return;
      } catch {
        // Fallback below
      }
    }

    const token = await spotifyAuth.getValidToken();
    const deviceId = spotifyDeviceId || useStore.getState().spotifyDeviceId;
    if (token && deviceId) {
      try {
        await fetch(`https://api.spotify.com/v1/me/player/previous?device_id=${deviceId}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        console.warn('Remote previous error:', e);
      }
    }
    playPrevious();
  };

  return {
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
    previous,
    spotifyUser,
  };
}
