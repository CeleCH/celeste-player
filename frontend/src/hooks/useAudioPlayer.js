import { useEffect, useState, useRef } from 'react';
import { useStore, useCurrentTrack } from '../store/store';
import { musicApi } from '../services/musicApi';

// Singleton Audio instance to persist playback across page navigation
const audio = new Audio();

export default function useAudioPlayer() {
  const currentTrack = useCurrentTrack();
  const isPlaying = useStore((state) => state.isPlaying);
  const setIsPlaying = useStore((state) => state.setIsPlaying);
  const volume = useStore((state) => state.volume);
  const playNext = useStore((state) => state.playNext);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [playbackError, setPlaybackError] = useState('');

  // Track reference to avoid duplicate URL fetches for the same song
  const lastLoadedTrackIdRef = useRef(null);

  // Synchronize play/pause state from global store
  useEffect(() => {
    if (!audio.src) return;

    if (isPlaying) {
      audio.play().catch((err) => {
        console.error('Audio play error:', err);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, setIsPlaying]);

  // Synchronize volume configuration from global store
  useEffect(() => {
    audio.volume = volume;
  }, [volume]);

  // Load new track when currentTrack changes
  useEffect(() => {
    if (!currentTrack) {
      audio.src = '';
      lastLoadedTrackIdRef.current = null;
      setCurrentTime(0);
      setDuration(0);
      setPlaybackError('');
      return;
    }

    if (lastLoadedTrackIdRef.current === currentTrack.id) {
      return; // Already loaded/loading this track
    }

    const loadTrackStream = async () => {
      setLoading(true);
      setPlaybackError('');
      lastLoadedTrackIdRef.current = currentTrack.id;

      try {
        // Fetch direct audio stream URL from backend API
        const data = await musicApi.getPlaybackStream(currentTrack.id);
        
        if (!data || !data.url) {
          throw new Error('Formato de stream inválido.');
        }

        audio.src = data.url;
        audio.load();
        
        if (isPlaying) {
          audio.play().catch((err) => {
            console.error('Playback trigger error:', err);
            setIsPlaying(false);
          });
        }
      } catch (err) {
        console.error('Error loading audio stream URL:', err);
        setPlaybackError('No se pudo reproducir esta canción. Intenta nuevamente.');
        setIsPlaying(false);
        lastLoadedTrackIdRef.current = null;
      } finally {
        setLoading(false);
      }
    };

    loadTrackStream();
  }, [currentTrack, isPlaying, setIsPlaying]);

  // Attach audio event listeners
  useEffect(() => {
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      playNext();
    };

    const handleAudioError = (e) => {
      console.error('HTML5 Audio playback error event:', e);
      // Only set error if there is actually a track loaded
      if (currentTrack) {
        setPlaybackError('Error de reproducción en el recurso de audio.');
        setIsPlaying(false);
      }
    };

    // Attach listeners
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleAudioError);

    // Initial state check in case audio properties loaded early
    if (audio.duration) {
      setDuration(audio.duration);
    }

    return () => {
      // Remove listeners
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleAudioError);
    };
  }, [playNext, currentTrack, setIsPlaying]);

  // Controls exposed to component
  const togglePlay = () => {
    if (!currentTrack) return;
    setIsPlaying(!isPlaying);
  };

  const seek = (seconds) => {
    if (!audio.src) return;
    audio.currentTime = seconds;
    setCurrentTime(seconds);
  };

  return {
    currentTime,
    duration,
    loading,
    playbackError,
    togglePlay,
    seek,
  };
}
