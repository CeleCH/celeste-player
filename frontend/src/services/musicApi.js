const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const musicApi = {
  /**
   * Search for songs, albums, and artists
   * @param {string} query 
   */
  async search(query) {
    try {
      const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Error al buscar contenido musical.');
      }
      return await response.json();
    } catch (error) {
      console.error('API search error:', error);
      throw error;
    }
  },

  /**
   * Get metadata details of a specific track
   * @param {string} id 
   */
  async getTrackDetails(id) {
    try {
      const response = await fetch(`${BASE_URL}/tracks/${id}`);
      if (!response.ok) {
        throw new Error('Error al obtener metadatos de la canción.');
      }
      return await response.json();
    } catch (error) {
      console.error('API track metadata error:', error);
      throw error;
    }
  },

  /**
   * Resolve audio stream URL for a track via backend
   * @param {string} id 
   */
  async getPlaybackStream(id) {
    try {
      const response = await fetch(`${BASE_URL}/tracks/${id}/play`);
      if (!response.ok) {
        throw new Error('Error al preparar el recurso de audio.');
      }
      return await response.json();
    } catch (error) {
      console.error('API playback stream error:', error);
      throw error;
    }
  },

  /**
   * Get the proxied audio stream URL for direct use in <audio> src.
   * Supports passing a track object or track ID with optional metadata query for Spotify tracks.
   * @param {string|object} trackOrId
   * @returns {string} proxy stream URL
   */
  getStreamUrl(trackOrId) {
    if (typeof trackOrId === 'object' && trackOrId !== null) {
      const id = trackOrId.id;
      const title = encodeURIComponent(trackOrId.title || '');
      const artist = encodeURIComponent(trackOrId.artists?.[0]?.name || '');
      return `${BASE_URL}/tracks/${id}/stream?title=${title}&artist=${artist}`;
    }
    return `${BASE_URL}/tracks/${trackOrId}/stream`;
  },

  /**
   * Get Spotify featured playlists and top charts
   */
  async getSpotifyFeatured() {
    try {
      const response = await fetch(`${BASE_URL}/spotify/featured`);
      if (!response.ok) throw new Error('Error al obtener playlists de Spotify.');
      return await response.json();
    } catch (error) {
      console.error('API getSpotifyFeatured error:', error);
      return { playlists: [] };
    }
  },

  /**
   * Get tracks for a Spotify playlist
   * @param {string} playlistId 
   */
  async getSpotifyPlaylist(playlistId) {
    try {
      const response = await fetch(`${BASE_URL}/spotify/playlist/${playlistId}`);
      if (!response.ok) throw new Error('Error al obtener canciones de la playlist.');
      return await response.json();
    } catch (error) {
      console.error('API getSpotifyPlaylist error:', error);
      return { tracks: [] };
    }
  },

  /**
   * Get Spotify API status
   */
  async getSpotifyStatus() {
    try {
      const response = await fetch(`${BASE_URL}/spotify/status`);
      if (!response.ok) throw new Error('Error al obtener estado de Spotify.');
      return await response.json();
    } catch (error) {
      return { configured: false };
    }
  }
};

