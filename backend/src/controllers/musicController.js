import { getProvider } from '../services/providers/index.js';
import { ytDlpService } from '../services/ytDlpService.js';
import { spotifyService } from '../services/spotifyService.js';

// Simple Search Cache (TTL: 10 minutes)
export const searchCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes in ms

// Cache to map Spotify IDs (or search queries) to resolved YouTube Music video IDs
const spotifyToYoutubeCache = new Map();

// In-memory data structures for backup history and favorites (IndexedDB is primary on client)
let inMemoryHistory = [];
let inMemoryFavorites = [];

// YouTube Video ID Validation Regex (11 chars)
const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Resolves any track ID (YouTube or Spotify) to an 11-char YouTube Video ID for streaming.
 */
async function resolveToYoutubeId(id, queryTitle, queryArtist) {
  if (VIDEO_ID_REGEX.test(id)) {
    return id;
  }

  if (spotifyToYoutubeCache.has(id)) {
    return spotifyToYoutubeCache.get(id);
  }

  let searchQuery = '';
  if (queryTitle) {
    searchQuery = `${queryTitle} ${queryArtist || ''}`.trim();
  } else if (id.startsWith('sp_') || id.length === 22) {
    const spTrack = await spotifyService.getTrack(id);
    if (spTrack) {
      searchQuery = `${spTrack.title} ${spTrack.artists?.[0]?.name || ''}`.trim();
    }
  }

  if (!searchQuery) {
    throw new Error('No se pudo determinar el título de la canción para resolver el audio.');
  }

  const ytProvider = getProvider('youtube');
  const searchResults = await ytProvider.search(searchQuery);
  const matchedTrack = searchResults.tracks?.[0];

  if (!matchedTrack || !matchedTrack.id) {
    throw new Error(`No se encontró stream de audio libre para "${searchQuery}".`);
  }

  spotifyToYoutubeCache.set(id, matchedTrack.id);
  return matchedTrack.id;
}

// GET /api/health
export const healthCheck = async (req, res) => {
  try {
    const ytdlpVersion = await ytDlpService.checkVersion();
    res.json({
      status: "ok",
      app: "Nebula Player API",
      spotifyConfigured: spotifyService.isConfigured(),
      cookiesConfigured: ytDlpService.hasCookies(),
      ytdlp: ytdlpVersion || null
    });
  } catch (error) {
    res.json({ status: "ok", app: "Nebula Player API", ytdlp: null, error: error.message });
  }
};

// GET /api/spotify/status
export const getSpotifyStatus = (req, res) => {
  res.json({
    configured: spotifyService.isConfigured(),
    message: spotifyService.isConfigured() 
      ? "Spotify API oficial conectada en modo híbrido" 
      : "Spotify API pendiente de credenciales (usando catálogo cósmico alternativo)"
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
      searchCache.delete(cacheKey); // Evict expired item
    }

    // Try Spotify official search if configured, else YouTube Music provider
    let results = null;
    if (spotifyService.isConfigured()) {
      results = await spotifyService.search(cleanQuery);
    }

    if (!results || !results.tracks || results.tracks.length === 0) {
      const provider = getProvider('youtube');
      results = await provider.search(cleanQuery);
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

    if (id.startsWith('sp_') || id.length === 22) {
      const spTrack = await spotifyService.getTrack(id);
      if (spTrack) return res.json(spTrack);
    }

    const provider = getProvider('youtube');
    const trackDetails = await provider.getTrack(id);
    res.json(trackDetails);
  } catch (error) {
    console.error(`Error in getTrackDetails controller (id: ${req.params.id}):`, error);
    res.status(500).json({ error: "No se pudo obtener la información de la canción." });
  }
};

// GET /api/tracks/:id/play - Resolve audio URL
export const getStreamUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, artist } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Identificador de canción inválido." });
    }

    const youtubeId = await resolveToYoutubeId(id, title, artist);
    const url = `${req.protocol}://${req.get('host')}/api/tracks/${youtubeId}/stream`;
    
    res.json({
      id,
      resolvedId: youtubeId,
      url,
      source: id.startsWith('sp_') ? "spotify_hybrid" : "youtube_music"
    });
  } catch (error) {
    console.error(`Error in getStreamUrl controller (id: ${req.params.id}):`, error);
    res.status(500).json({ 
      error: `Error al preparar la reproducción: ${error.message}` 
    });
  }
};

// GET /api/tracks/:id/stream - Stream audio via yt-dlp
export const streamAudio = async (req, res) => {
  const { id } = req.params;
  const { title, artist } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Identificador de canción inválido." });
  }

  try {
    const youtubeId = await resolveToYoutubeId(id, title, artist);
    await ytDlpService.streamAudio(youtubeId, res);
  } catch (error) {
    console.error(`Error streaming audio (id: ${id}):`, error.message);
    if (!res.headersSent) {
      res.status(502).json({ error: `No se pudo obtener el audio: ${error.message}` });
    }
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

