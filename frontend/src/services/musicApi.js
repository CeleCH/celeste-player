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
   * Resolve audio stream URL for a track via yt-dlp.
   * Returns { id, url, source } where url is the direct YouTube CDN audio URL
   * that the browser can play directly via <audio> element.
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
   * The backend proxies the audio from YouTube CDN with proper headers.
   * @param {string} id 
   * @returns {string} proxy stream URL
   */
  getStreamUrl(id) {
    return `${BASE_URL}/tracks/${id}/stream`;
  },
};
