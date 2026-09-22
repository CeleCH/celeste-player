import { spotifyService } from '../services/spotifyService.js';

// Simple Search Cache (TTL: 10 minutes)
export const searchCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes in ms

// In-memory data structures for backup history and favorites (IndexedDB is primary on client)
let inMemoryHistory = [];
let inMemoryFavorites = [];

// GET /api/health
export const healthCheck = async (req, res) => {
  res.json({
    status: "ok",
    app: "Nebula Player API (Spotify Official)",
    spotifyConfigured: spotifyService.isConfigured(),
  });
};

// GET /api/spotify/status
export const getSpotifyStatus = (req, res) => {
  res.json({
    configured: spotifyService.isConfigured(),
    message: spotifyService.isConfigured() 
      ? "Spotify API oficial conectada" 
      : "Spotify API pendiente de credenciales"
  });
};

// GET /api/spotify/featured
export const getSpotifyFeatured = async (req, res) => {
  try {
    const playlists = await spotifyService.getFeaturedPlaylists();
    res.json({ playlists });
  } catch (error) {
    console.error("Error in getSpotifyFeatured:", error.message);
    res.json({ playlists: spotifyService.getFallbackPlaylists() });
  }
};

// GET /api/spotify/playlist/:id
export const getSpotifyPlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const tracks = await spotifyService.getPlaylistTracks(id);
    res.json({ id, tracks });
  } catch (error) {
    console.error(`Error in getSpotifyPlaylist (${req.params.id}):`, error.message);
    res.status(500).json({ error: "No se pudieron obtener las canciones de la playlist." });
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
      searchCache.delete(cacheKey);
    }

    let results = null;
    if (spotifyService.isConfigured()) {
      results = await spotifyService.search(cleanQuery);
    }

    if (!results) {
      results = { tracks: [], artists: [], albums: [], playlists: [] };
    }

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

    if (!id) {
      return res.status(400).json({ error: "Identificador de canción inválido." });
    }

    const spTrack = await spotifyService.getTrack(id);
    if (spTrack) return res.json(spTrack);

    res.status(404).json({ error: "Canción no encontrada en Spotify." });
  } catch (error) {
    console.error(`Error in getTrackDetails controller (id: ${req.params.id}):`, error);
    res.status(500).json({ error: "No se pudo obtener la información de la canción." });
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
