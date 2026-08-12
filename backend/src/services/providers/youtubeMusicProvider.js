import YTMusic from 'ytmusic-api';

class YoutubeMusicProvider {
  constructor() {
    this.ytmusic = new YTMusic();
    this.initialized = false;
    this.initializePromise = null;
  }

  /**
   * Ensures that the ytmusic-api client is initialized safely.
   */
  async ensureInitialized() {
    if (this.initialized) return;

    if (!this.initializePromise) {
      this.initializePromise = (async () => {
        try {
          await this.ytmusic.initialize();
          this.initialized = true;
        } catch (error) {
          console.error('Error initializing YTMusic API:', error);
          this.initializePromise = null; // Reset to allow retry on next request
          throw error;
        }
      })();
    }

    return this.initializePromise;
  }

  /**
   * General search mapping queries to songs, artists, and albums.
   * @param {string} query
   */
  async search(query) {
    await this.ensureInitialized();

    // Query songs, artists, and albums concurrently to keep it fast
    const [songs, artists, albums] = await Promise.all([
      this.ytmusic.searchSongs(query).catch((err) => {
        console.error('ytmusic.searchSongs error:', err);
        return [];
      }),
      this.ytmusic.searchArtists(query).catch((err) => {
        console.error('ytmusic.searchArtists error:', err);
        return [];
      }),
      this.ytmusic.searchAlbums(query).catch((err) => {
        console.error('ytmusic.searchAlbums error:', err);
        return [];
      }),
    ]);

    return {
      tracks: songs.map((song) => ({
        id: song.videoId,
        title: song.name,
        artists: song.artist ? [{ id: song.artist.artistId, name: song.artist.name }] : [],
        album: song.album ? { id: song.album.albumId, name: song.album.name } : null,
        thumbnail: song.thumbnails && song.thumbnails.length > 0 ? song.thumbnails[song.thumbnails.length - 1].url : null,
        duration: song.duration || 0,
        source: 'youtube_music',
      })),
      artists: artists.map((artist) => ({
        id: artist.artistId,
        name: artist.name,
        thumbnail: artist.thumbnails && artist.thumbnails.length > 0 ? artist.thumbnails[artist.thumbnails.length - 1].url : null,
        source: 'youtube_music',
      })),
      albums: albums.map((album) => ({
        id: album.albumId,
        name: album.name,
        artist: album.artist ? { id: album.artist.artistId, name: album.artist.name } : null,
        thumbnail: album.thumbnails && album.thumbnails.length > 0 ? album.thumbnails[album.thumbnails.length - 1].url : null,
        year: album.year || null,
        source: 'youtube_music',
      })),
      playlists: [],
    };
  }

  /**
   * Fetches metadata for a specific track.
   * @param {string} trackId
   */
  async getTrack(trackId) {
    await this.ensureInitialized();
    const song = await this.ytmusic.getSong(trackId);
    if (!song) {
      throw new Error(`Canción con id ${trackId} no encontrada.`);
    }

    return {
      id: song.videoId,
      title: song.name,
      artists: song.artist ? [{ id: song.artist.artistId, name: song.artist.name }] : [],
      album: song.album ? { id: song.album.albumId, name: song.album.name } : null,
      thumbnail: song.thumbnails && song.thumbnails.length > 0 ? song.thumbnails[song.thumbnails.length - 1].url : null,
      duration: song.duration || 0,
      source: 'youtube_music',
    };
  }
}

export const youtubeMusicProvider = new YoutubeMusicProvider();
