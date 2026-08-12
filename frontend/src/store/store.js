import { create } from 'zustand';
import { 
  initDB, 
  saveToDB, 
  deleteFromDB, 
  clearStore, 
  getAllFromDB, 
  saveSetting, 
  getSetting 
} from '../utils/db.js';

// Simple LocalStorage fallbacks for immediate sync, backed up by async IndexedDB
const loadFromLocalStorage = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {}
};

export const useStore = create((set, get) => ({
  // Playback state
  isPlaying: false,
  volume: 0.8,
  shuffle: false,
  repeat: 'none', // 'none' | 'one' | 'all'
  
  // Queue state
  queue: [],
  currentIndex: -1,
  
  // Library States
  favorites: [],
  history: [],
  playlists: [],
  
  // Search state
  searchQuery: '',
  searchResults: { tracks: [], artists: [], albums: [], playlists: [] },
  searchHistory: [],

  // Bootstraps state from IndexedDB
  initStore: async () => {
    try {
      await initDB();
      
      const favorites = await getAllFromDB('favorites');
      const history = await getAllFromDB('history');
      const playlists = await getAllFromDB('playlists');
      
      const volume = await getSetting('volume', 0.8);
      const shuffle = await getSetting('shuffle', false);
      const repeat = await getSetting('repeat', 'none');
      const searchHistory = await getSetting('searchHistory', []);
      
      // Load current playlist queue from localStorage for convenience/speed
      const queue = loadFromLocalStorage('celeste_queue', []);
      const currentIndex = loadFromLocalStorage('celeste_currentIndex', -1);

      set({
        favorites,
        history: history.sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt)), // sort by timestamp descending
        playlists,
        volume,
        shuffle,
        repeat,
        searchHistory,
        queue,
        currentIndex
      });
    } catch (e) {
      console.error("Failed to initialize IndexedDB store:", e);
      // Fallback to localStorage
      set({
        favorites: loadFromLocalStorage('celeste_favorites', []),
        history: loadFromLocalStorage('celeste_history', []),
        playlists: loadFromLocalStorage('celeste_playlists', []),
        volume: loadFromLocalStorage('celeste_volume', 0.8),
        shuffle: loadFromLocalStorage('celeste_shuffle', false),
        repeat: loadFromLocalStorage('celeste_repeat', 'none'),
        searchHistory: loadFromLocalStorage('celeste_searchHistory', [])
      });
    }
  },

  // General controls
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  
  setVolume: async (volume) => {
    set({ volume });
    saveToLocalStorage('celeste_volume', volume);
    await saveSetting('volume', volume);
  },
  
  setShuffle: async (shuffle) => {
    set({ shuffle });
    saveToLocalStorage('celeste_shuffle', shuffle);
    await saveSetting('shuffle', shuffle);
  },
  
  setRepeat: async (repeat) => {
    set({ repeat });
    saveToLocalStorage('celeste_repeat', repeat);
    await saveSetting('repeat', repeat);
  },
  
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSearchResults: (searchResults) => set({ searchResults }),

  addSearchHistory: async (query) => {
    if (!query || !query.trim()) return;
    const trimmed = query.trim();
    const current = get().searchHistory;
    const filtered = current.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...filtered].slice(0, 10);
    set({ searchHistory: updated });
    saveToLocalStorage('celeste_searchHistory', updated);
    await saveSetting('searchHistory', updated);
  },

  clearSearchHistory: async () => {
    set({ searchHistory: [] });
    saveToLocalStorage('celeste_searchHistory', []);
    await saveSetting('searchHistory', []);
  },

  // Queue Actions
  playTrack: (track) => {
    const { queue } = get();
    const existingIndex = queue.findIndex(t => t.id === track.id);
    
    let newQueue = [...queue];
    let newIndex = existingIndex;
    
    if (existingIndex === -1) {
      const insertAt = get().currentIndex + 1;
      newQueue.splice(insertAt, 0, track);
      newIndex = insertAt;
    } else {
      newIndex = existingIndex;
    }
    
    set({
      queue: newQueue,
      currentIndex: newIndex,
      isPlaying: true
    });
    saveToLocalStorage('celeste_queue', newQueue);
    saveToLocalStorage('celeste_currentIndex', newIndex);
    get().addToHistory(track);
  },

  addToQueue: (track) => {
    const { queue } = get();
    if (queue.some(t => t.id === track.id)) return;
    
    const newQueue = [...queue, track];
    set({ queue: newQueue });
    
    if (get().currentIndex === -1) {
      set({ currentIndex: 0 });
      saveToLocalStorage('celeste_currentIndex', 0);
    }
    
    saveToLocalStorage('celeste_queue', newQueue);
  },

  removeFromQueue: (trackId) => {
    const { queue, currentIndex } = get();
    const targetIndex = queue.findIndex(t => t.id === trackId);
    if (targetIndex === -1) return;
    
    const newQueue = queue.filter(t => t.id !== trackId);
    let newIndex = currentIndex;
    
    if (currentIndex === targetIndex) {
      newIndex = newQueue.length > 0 ? Math.min(currentIndex, newQueue.length - 1) : -1;
    } else if (currentIndex > targetIndex) {
      newIndex = currentIndex - 1;
    }
    
    set({
      queue: newQueue,
      currentIndex: newIndex,
      isPlaying: newIndex !== -1 ? get().isPlaying : false
    });
    saveToLocalStorage('celeste_queue', newQueue);
    saveToLocalStorage('celeste_currentIndex', newIndex);
  },

  clearQueue: () => {
    set({
      queue: [],
      currentIndex: -1,
      isPlaying: false
    });
    saveToLocalStorage('celeste_queue', []);
    saveToLocalStorage('celeste_currentIndex', -1);
  },

  setCurrentIndex: (index) => {
    const { queue } = get();
    if (index >= 0 && index < queue.length) {
      set({ currentIndex: index, isPlaying: true });
      saveToLocalStorage('celeste_currentIndex', index);
      get().addToHistory(queue[index]);
    }
  },

  playNext: () => {
    const { queue, currentIndex, repeat, shuffle } = get();
    if (queue.length === 0) return;

    if (repeat === 'one') {
      set({ isPlaying: false });
      setTimeout(() => set({ isPlaying: true }), 50);
      return;
    }

    if (shuffle) {
      const randomIndex = Math.floor(Math.random() * queue.length);
      set({ currentIndex: randomIndex, isPlaying: true });
      saveToLocalStorage('celeste_currentIndex', randomIndex);
      get().addToHistory(queue[randomIndex]);
      return;
    }

    let nextIndex = currentIndex + 1;
    if (nextIndex >= queue.length) {
      if (repeat === 'all') {
        nextIndex = 0;
      } else {
        set({ isPlaying: false });
        return;
      }
    }
    
    set({ currentIndex: nextIndex, isPlaying: true });
    saveToLocalStorage('celeste_currentIndex', nextIndex);
    get().addToHistory(queue[nextIndex]);
  },

  playPrevious: () => {
    const { queue, currentIndex, repeat, shuffle } = get();
    if (queue.length === 0) return;

    if (shuffle) {
      const randomIndex = Math.floor(Math.random() * queue.length);
      set({ currentIndex: randomIndex, isPlaying: true });
      saveToLocalStorage('celeste_currentIndex', randomIndex);
      get().addToHistory(queue[randomIndex]);
      return;
    }

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      if (repeat === 'all') {
        prevIndex = queue.length - 1;
      } else {
        prevIndex = 0;
      }
    }

    set({ currentIndex: prevIndex, isPlaying: true });
    saveToLocalStorage('celeste_currentIndex', prevIndex);
    get().addToHistory(queue[prevIndex]);
  },

  // Library / Favorites / History Actions
  toggleFavorite: async (track) => {
    const { favorites } = get();
    const isFav = favorites.some(t => t.id === track.id);
    let newFavorites;
    
    if (isFav) {
      newFavorites = favorites.filter(t => t.id !== track.id);
      await deleteFromDB('favorites', track.id);
    } else {
      newFavorites = [...favorites, track];
      await saveToDB('favorites', track);
    }
    
    set({ favorites: newFavorites });
    saveToLocalStorage('celeste_favorites', newFavorites);
  },

  addToHistory: async (track) => {
    if (!track) return;
    const { history } = get();
    const historyItem = { ...track, playedAt: new Date().toISOString() };
    
    const filtered = history.filter(t => t.id !== track.id);
    const newHistory = [historyItem, ...filtered].slice(0, 50);
    
    set({ history: newHistory });
    saveToLocalStorage('celeste_history', newHistory);
    
    // Save to IndexedDB
    await saveToDB('history', historyItem);
  },

  clearHistory: async () => {
    set({ history: [] });
    saveToLocalStorage('celeste_history', []);
    await clearStore('history');
  },

  // Playlists Actions
  createPlaylist: async (name) => {
    if (!name || !name.trim()) return;
    const { playlists } = get();
    const newPlaylist = {
      id: `pl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      tracks: [],
      createdAt: new Date().toISOString()
    };
    const updated = [...playlists, newPlaylist];
    set({ playlists: updated });
    saveToLocalStorage('celeste_playlists', updated);
    
    await saveToDB('playlists', newPlaylist);
  },

  deletePlaylist: async (playlistId) => {
    const { playlists } = get();
    const updated = playlists.filter(pl => pl.id !== playlistId);
    set({ playlists: updated });
    saveToLocalStorage('celeste_playlists', updated);
    
    await deleteFromDB('playlists', playlistId);
  },

  addTrackToPlaylist: async (playlistId, track) => {
    const { playlists } = get();
    let targetPlaylist = null;
    
    const updated = playlists.map(pl => {
      if (pl.id === playlistId) {
        if (pl.tracks.some(t => t.id === track.id)) {
          targetPlaylist = pl;
          return pl;
        }
        targetPlaylist = { ...pl, tracks: [...pl.tracks, track] };
        return targetPlaylist;
      }
      return pl;
    });
    
    if (targetPlaylist) {
      set({ playlists: updated });
      saveToLocalStorage('celeste_playlists', updated);
      await saveToDB('playlists', targetPlaylist);
    }
  },

  removeTrackFromPlaylist: async (playlistId, trackId) => {
    const { playlists } = get();
    let targetPlaylist = null;
    
    const updated = playlists.map(pl => {
      if (pl.id === playlistId) {
        targetPlaylist = { ...pl, tracks: pl.tracks.filter(t => t.id !== trackId) };
        return targetPlaylist;
      }
      return pl;
    });
    
    if (targetPlaylist) {
      set({ playlists: updated });
      saveToLocalStorage('celeste_playlists', updated);
      await saveToDB('playlists', targetPlaylist);
    }
  },

  renamePlaylist: async (playlistId, newName) => {
    if (!newName || !newName.trim()) return;
    const { playlists } = get();
    let targetPlaylist = null;
    
    const updated = playlists.map(pl => {
      if (pl.id === playlistId) {
        targetPlaylist = { ...pl, name: newName.trim() };
        return targetPlaylist;
      }
      return pl;
    });
    
    if (targetPlaylist) {
      set({ playlists: updated });
      saveToLocalStorage('celeste_playlists', updated);
      await saveToDB('playlists', targetPlaylist);
    }
  }
}));

// Derived helper to get the currently playing track
export const useCurrentTrack = () => {
  const queue = useStore((state) => state.queue);
  const currentIndex = useStore((state) => state.currentIndex);
  if (currentIndex >= 0 && currentIndex < queue.length) {
    return queue[currentIndex];
  }
  return null;
};
