import { getProvider } from '../services/providers/index.js';
import { ytDlpService } from '../services/ytDlpService.js';

// Simple Search Cache (TTL: 10 minutes)
export const searchCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes in ms

// In-memory data structures for backup history and favorites (IndexedDB is primary on client)
let inMemoryHistory = [];
let inMemoryFavorites = [];

// YouTube Video ID Validation Regex
const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

// GET /api/health
export const healthCheck = async (req, res) => {
  try {
    const ytdlpVersion = await ytDlpService.checkVersion();
    res.json({
      status: "ok",
      ytdlp: ytdlpVersion || null
    });
  } catch (error) {
    res.json({ status: "ok", ytdlp: null, error: error.message });
  }
};

// GET /api/search?q=query
export const searchTracks = async (req, res) => {
  try {
    const query = req.query.q || "";
    const cleanQuery = query.trim();

    if (!cleanQuery) {
      return res.json({
        query: "",
        results: { tracks: [], artists: [], albums: [], playlists: [] }
      });
    }

    const cacheKey = cleanQuery.toLowerCase();
    
    // Check Cache
    if (searchCache.has(cacheKey)) {
      const cached = searchCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        return res.json(cached.data);
      }
      searchCache.delete(cacheKey); // Evict expired item
    }

    // Retrieve default provider (YouTube Music)
    const provider = getProvider();
    const results = await provider.search(cleanQuery);

    const responseData = {
      query: cleanQuery,
      results
    };

    // Store in Cache
    searchCache.set(cacheKey, {
      timestamp: Date.now(),
      data: responseData
    });

    res.json(responseData);
  } catch (error) {
    console.error("Error in searchTracks controller:", error);
    res.status(500).json({ error: "No se pudo completar la búsqueda musical." });
  }
};

// GET /api/tracks/:id
export const getTrackDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !VIDEO_ID_REGEX.test(id)) {
      return res.status(400).json({ error: "Identificador de canción inválido." });
    }

    const provider = getProvider();
    const trackDetails = await provider.getTrack(id);
    res.json(trackDetails);
  } catch (error) {
    console.error(`Error in getTrackDetails controller (id: ${req.params.id}):`, error);
    res.status(500).json({ error: "No se pudo obtener la información de la canción." });
  }
};

// GET /api/tracks/:id/play
export const getStreamUrl = async (req, res) => {
  try {
    const { id } = req.params;

    // Strict input validation
    if (!id || !VIDEO_ID_REGEX.test(id)) {
      return res.status(400).json({ error: "Identificador de canción inválido." });
    }

    // safe resolve url using yt-dlp execution
    const streamUrl = await ytDlpService.getAudioStreamUrl(id);
    
    res.json({
      id,
      url: streamUrl,
      source: "youtube_music"
    });
  } catch (error) {
    console.error(`Error in getStreamUrl controller (id: ${req.params.id}):`, error);
    res.status(500).json({ 
      error: "No se pudo preparar la reproducción. Verifica que yt-dlp esté instalado en el servidor." 
    });
  }
};

// History In-Memory fallback handlers
export const getHistory = (req, res) => {
  res.json(inMemoryHistory);
};

export const addHistory = (req, res) => {
  const { track } = req.body;
  if (!track || !track.id) {
    return res.status(400).json({ error: "Track inválido" });
  }
  inMemoryHistory = inMemoryHistory.filter(t => t.id !== track.id);
  inMemoryHistory.unshift(track);
  if (inMemoryHistory.length > 50) {
    inMemoryHistory.pop();
  }
  res.status(201).json(inMemoryHistory);
};

export const clearHistory = (req, res) => {
  inMemoryHistory = [];
  res.json({ status: "success", message: "Historial limpiado" });
};

// Favorites In-Memory fallback handlers
export const getFavorites = (req, res) => {
  res.json(inMemoryFavorites);
};

export const addFavorite = (req, res) => {
  const { track } = req.body;
  if (!track || !track.id) {
    return res.status(400).json({ error: "Track inválido" });
  }
  if (!inMemoryFavorites.some(t => t.id === track.id)) {
    inMemoryFavorites.push(track);
  }
  res.status(201).json(inMemoryFavorites);
};

export const deleteFavorite = (req, res) => {
  const { id } = req.params;
  inMemoryFavorites = inMemoryFavorites.filter(t => t.id !== id);
  res.json(inMemoryFavorites);
};
