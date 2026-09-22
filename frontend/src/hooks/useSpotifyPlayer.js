import { useEffect, useState, useRef, useCallback } from 'react';
import { useStore, useCurrentTrack } from '../store/store';
import { spotifyAuth } from '../services/spotifyAuth';

let globalPlayer = null;

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

  const playerRef = useRef(null);
  const progressTimerRef = useRef(null);
  const lastTrackUriRef = useRef(null);

  // Initialize Spotify Web Playback SDK
  useEffect(() => {
    const token = spotifyAuth.isAuthenticated();
    if (!token) {
      setIsPlayerReady(false);
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
          if (!state) {
            return;
          }

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
          setPlaybackError(`Error al inicializar reproductor: ${message}`);
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
  }, [setSpotifyDeviceId, volume, setIsPlaying, playNext, spotifyDeviceId]);

  // Volume synchronization
  useEffect(() => {
    if (globalPlayer) {
      globalPlayer.setVolume(volume).catch((e) => console.warn('Error setting volume:', e));
    }
  }, [volume]);

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

  // Play a track via Spotify Web API when currentTrack changes in store
  const playTrackViaSpotify = useCallback(async (track) => {
    if (!track) return;

    const token = await spotifyAuth.getValidToken();
    if (!token) {
      setPlaybackError('Conecta tu cuenta de Spotify para reproducir.');
      return;
    }

    const deviceId = spotifyDeviceId || useStore.getState().spotifyDeviceId;
    if (!deviceId) {
      setPlaybackError('Inicializando reproductor Spotify... Por favor espera un momento.');
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
        if (msg.includes('PREMIUM_REQUIRED') || response.status === 403) {
          throw new Error('Se requiere una cuenta Spotify Premium para reproducir.');
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
  }, [spotifyDeviceId, setIsPlaying, isPlaying]);

  // Trigger playback when currentTrack changes
  useEffect(() => {
    if (currentTrack) {
      playTrackViaSpotify(currentTrack);
    }
  }, [currentTrack?.id, playTrackViaSpotify]);

  // Control Functions
  const togglePlay = async () => {
    if (!globalPlayer) return;
    try {
      await globalPlayer.togglePlay();
    } catch (e) {
      console.warn('Toggle play error:', e);
    }
  };

  const seek = async (seconds) => {
    if (!globalPlayer) return;
    try {
      await globalPlayer.seek(seconds * 1000);
      setCurrentTime(seconds);
    } catch (e) {
      console.warn('Seek error:', e);
    }
  };

  const next = async () => {
    if (globalPlayer) {
      try {
        await globalPlayer.nextTrack();
      } catch {
        playNext();
      }
    } else {
      playNext();
    }
  };

  const previous = async () => {
    if (globalPlayer) {
      try {
        await globalPlayer.previousTrack();
      } catch {
        playPrevious();
      }
    } else {
      playPrevious();
    }
  };

  return {
    currentTime,
    duration,
    loading,
    playbackError,
    isPlayerReady,
    togglePlay,
    seek,
    next,
    previous,
    spotifyUser,
  };
}
