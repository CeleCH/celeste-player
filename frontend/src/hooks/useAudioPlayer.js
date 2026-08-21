import { useEffect, useState, useRef } from 'react';
import { useStore, useCurrentTrack } from '../store/store';
import { musicApi } from '../services/musicApi';

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

  const lastLoadedTrackIdRef = useRef(null);
  const loadingTrackIdRef = useRef(null);
  const objectUrlRef = useRef(null);

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

  useEffect(() => {
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!currentTrack) {
      audio.src = '';
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      lastLoadedTrackIdRef.current = null;
      setCurrentTime(0);
      setDuration(0);
      setPlaybackError('');
      return;
    }

    if (lastLoadedTrackIdRef.current === currentTrack.id) {
      return;
    }

    let aborted = false;

    const loadTrack = async () => {
      setLoading(true);
      setPlaybackError('');
      lastLoadedTrackIdRef.current = currentTrack.id;
      loadingTrackIdRef.current = currentTrack.id;

      try {
        const streamUrl = musicApi.getStreamUrl(currentTrack.id);

        const response = await fetch(streamUrl);

        if (aborted || loadingTrackIdRef.current !== currentTrack.id) {
          response.body?.cancel?.();
          return;
        }

        if (!response.ok) {
          let errorMsg = 'No se pudo reproducir esta canción.';
          try {
            const errData = await response.json();
            if (errData.error) errorMsg = errData.error;
          } catch {}
          throw new Error(errorMsg);
        }

        const blob = await response.blob();

        if (aborted || loadingTrackIdRef.current !== currentTrack.id) {
          return;
        }

        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
        }

        const objectUrl = URL.createObjectURL(blob);
        objectUrlRef.current = objectUrl;

        audio.src = objectUrl;
        audio.load();
      } catch (err) {
        if (aborted || loadingTrackIdRef.current !== currentTrack.id) {
          return;
        }
        console.error('Error loading track:', err);
        setPlaybackError(err.message || 'No se pudo reproducir esta canción. Intenta nuevamente.');
        setIsPlaying(false);
        setLoading(false);
        lastLoadedTrackIdRef.current = null;
        loadingTrackIdRef.current = null;
      }
    };

    loadTrack();

    return () => { aborted = true; };
  }, [currentTrack, isPlaying, setIsPlaying]);

  useEffect(() => {
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => playNext();
    const handleCanPlay = () => {
      setLoading(false);
      if (isPlaying) {
        audio.play().catch(() => {});
      }
    };
    const handleWaiting = () => setLoading(true);
    const handlePlay = () => setLoading(false);

    const handleAudioError = () => {
      if (currentTrack) {
        const err = audio.error;
        const code = err ? err.code : 'unknown';
        const msg = err ? err.message : 'unknown';
        console.error(`MediaError code: ${code}, message: ${msg}`);
        setPlaybackError('Error de reproducción en el recurso de audio.');
        setIsPlaying(false);
        setLoading(false);
        lastLoadedTrackIdRef.current = null;
        loadingTrackIdRef.current = null;
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('error', handleAudioError);

    if (audio.duration) setDuration(audio.duration);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('error', handleAudioError);
    };
  }, [playNext, currentTrack, setIsPlaying, isPlaying]);

  const togglePlay = () => {
    if (!currentTrack) return;
    setIsPlaying(!isPlaying);
  };

  const seek = (seconds) => {
    if (!audio.src) return;
    audio.currentTime = seconds;
    setCurrentTime(seconds);
  };

  return { currentTime, duration, loading, playbackError, togglePlay, seek };
}
