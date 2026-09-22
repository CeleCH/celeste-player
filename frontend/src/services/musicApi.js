const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const musicApi = {
  /**
   * Search for songs, albums, and artists via Spotify
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
   * Get metadata details of a specific track from Spotify
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
