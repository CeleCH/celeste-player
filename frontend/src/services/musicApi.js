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
   * Fetch playback streaming URL for an audio track
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
  }
};
