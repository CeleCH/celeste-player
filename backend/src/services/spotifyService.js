/**
 * Spotify Service for Nebula Player
 * Implements the Spotify Web API Client Credentials Flow.
 * Fetches metadata, featured playlists, top charts, and searches with zero user login required.
 */

class SpotifyService {
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID || '';
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
    this.accessToken = null;
    this.tokenExpiresAt = 0;
  }

  /**
   * Check if Spotify API credentials are configured.
   */
  isConfigured() {
    return Boolean(
      process.env.SPOTIFY_CLIENT_ID && 
      process.env.SPOTIFY_CLIENT_SECRET &&
      process.env.SPOTIFY_CLIENT_ID !== 'TU_SPOTIFY_CLIENT_ID'
    );
  }

  /**
   * Refresh the access token using Client Credentials flow if expired.
   */
  async getAccessToken() {
    if (!this.isConfigured()) {
      return null;
    }

    const now = Date.now();
    if (this.accessToken && this.tokenExpiresAt > now + 60000) {
      return this.accessToken;
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('Failed to authenticate with Spotify API:', errText);
        return null;
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiresAt = now + (data.expires_in * 1000);
      return this.accessToken;
    } catch (error) {
      console.error('Error in getAccessToken for Spotify:', error.message);
      return null;
    }
  }

  /**
   * Helper for authorized Spotify API GET requests.
   */
  async fetchSpotify(endpoint) {
    const token = await this.getAccessToken();
    if (!token) {
      throw new Error('Spotify API no configurada o token no disponible.');
    }

    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Spotify API error HTTP ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get featured/curated playlists from Spotify.
   */
  async getFeaturedPlaylists() {
    if (!this.isConfigured()) {
      return this.getFallbackPlaylists();
    }

    try {
      const data = await this.fetchSpotify('/search?q=Top%20Hits&type=playlist&limit=8');
      const items = (data.playlists?.items || []).filter(Boolean);

      if (items.length === 0) return this.getFallbackPlaylists();

      return items.map((pl) => ({
        id: pl.id,
        name: pl.name,
        description: pl.description || 'Playlist oficial de Spotify',
        thumbnail: pl.images?.[0]?.url || null,
        tracksCount: pl.tracks?.total || 0,
        source: 'spotify'
      }));
    } catch (error) {
      console.warn('Could not fetch Spotify featured playlists, using fallback:', error.message);
      return this.getFallbackPlaylists();
    }
  }

  /**
   * Get tracks for a specific Spotify playlist.
   */
  async getPlaylistTracks(playlistId) {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      const data = await this.fetchSpotify(`/playlists/${playlistId}/tracks?limit=50`);
      const items = (data.items || []).filter(item => item && item.track && item.track.id);

      return items.map(({ track }) => ({
        id: `sp_${track.id}`,
        originalSpotifyId: track.id,
        title: track.name,
        artists: (track.artists || []).map(a => ({ id: a.id, name: a.name })),
        album: track.album ? { id: track.album.id, name: track.album.name } : null,
        thumbnail: track.album?.images?.[0]?.url || null,
        duration: Math.round((track.duration_ms || 0) / 1000),
        source: 'spotify',
      }));
    } catch (error) {
      console.warn(`Direct playlist fetch restricted, searching Spotify tracks:`, error.message);
      const cleanQuery = playlistId.replace('fallback_', '').replace('_', ' ');
      const searchRes = await this.search(cleanQuery || 'Top Hits 2026');
      return searchRes?.tracks || [];
    }
  }

  /**
   * Fetch details of a single track from Spotify.
   */
  async getTrack(trackId) {
    if (!this.isConfigured()) return null;
    const cleanId = trackId.replace(/^sp_/, '');
    try {
      const track = await this.fetchSpotify(`/tracks/${cleanId}`);
      return {
        id: `sp_${track.id}`,
        originalSpotifyId: track.id,
        title: track.name,
        artists: track.artists.map(a => ({ id: a.id, name: a.name })),
        album: track.album ? { id: track.album.id, name: track.album.name } : null,
        thumbnail: track.album?.images?.[0]?.url || null,
        duration: Math.round((track.duration_ms || 0) / 1000),
        source: 'spotify',
      };
    } catch (e) {
      console.error(`Error fetching Spotify track ${cleanId}:`, e.message);
      return null;
    }
  }

  /**
   * Search Spotify for tracks, artists, and albums.
   */
  async search(query) {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const q = encodeURIComponent(query);
      const data = await this.fetchSpotify(`/search?q=${q}&type=track,artist,album&limit=10`);

      const tracks = (data.tracks?.items || []).filter(Boolean).map(track => ({
        id: `sp_${track.id}`,
        originalSpotifyId: track.id,
        title: track.name,
        artists: track.artists.map(a => ({ id: a.id, name: a.name })),
        album: track.album ? { id: track.album.id, name: track.album.name } : null,
        thumbnail: track.album?.images?.[0]?.url || null,
        duration: Math.round((track.duration_ms || 0) / 1000),
        source: 'spotify',
      }));

      const artists = (data.artists?.items || []).map(artist => ({
        id: artist.id,
        name: artist.name,
        thumbnail: artist.images?.[0]?.url || null,
        source: 'spotify',
      }));

      const albums = (data.albums?.items || []).map(album => ({
        id: album.id,
        name: album.name,
        artist: album.artists?.[0] ? { id: album.artists[0].id, name: album.artists[0].name } : null,
        thumbnail: album.images?.[0]?.url || null,
        year: album.release_date ? album.release_date.split('-')[0] : null,
        source: 'spotify',
      }));

      return {
        tracks,
        artists,
        albums,
        playlists: [],
      };
    } catch (error) {
      console.error('Spotify search failed:', error.message);
      return null;
    }
  }

  /**
   * Curated cosmic fallback playlists when Spotify API keys aren't configured yet.
   */
  getFallbackPlaylists() {
    return [
      {
        id: 'fallback_top50',
        name: 'Top 50 Global',
        description: 'Los temas más reproducidos y virales del planeta.',
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        tracksCount: 50,
        source: 'nebula_curated'
      },
      {
        id: 'fallback_cyberpunk',
        name: 'Synthwave & Cyberpunk',
        description: 'Vibras retro-futuristas, neón espacial y bajos profundos.',
        thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
        tracksCount: 30,
        source: 'nebula_curated'
      },
      {
        id: 'fallback_lofi',
        name: 'Cosmic Chill & Lofi',
        description: 'Melodías tranquilas para relajarte, estudiar y flotar.',
        thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
        tracksCount: 40,
        source: 'nebula_curated'
      },
      {
        id: 'fallback_latino',
        name: 'Éxitos Urbanos',
        description: 'El ritmo y la fiesta urbana más sonada de la escena.',
        thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80',
        tracksCount: 45,
        source: 'nebula_curated'
      }
    ];
  }
}

export const spotifyService = new SpotifyService();
