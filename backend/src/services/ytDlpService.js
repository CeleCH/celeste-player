import { execFile } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const YTDLP_PATH = process.env.YTDLP_PATH || 'yt-dlp';

// YouTube Video ID Validation Regex (exactly 11 characters)
const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

export const ytDlpService = {
  /**
   * Check if yt-dlp is installed and retrieve its version
   * @returns {Promise<string>} version string or empty if not installed
   */
  async checkVersion() {
    return new Promise((resolve) => {
      execFile(YTDLP_PATH, ['--version'], { timeout: 5000 }, (error, stdout) => {
        if (error) {
          console.warn('yt-dlp version check failed. Is it installed? Details:', error.message);
          resolve('');
        } else {
          resolve(stdout.trim());
        }
      });
    });
  },

  /**
   * Safe retrieval of streaming audio URL from a YouTube Video ID using yt-dlp
   * @param {string} videoId 
   * @returns {Promise<string>} audio direct stream URL
   */
  async getAudioStreamUrl(videoId) {
    // 1. Strict Input Validation (Security check against shell parameter pollution)
    if (!videoId || !VIDEO_ID_REGEX.test(videoId)) {
      throw new Error('Identificador de contenido inválido.');
    }

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Select best audio formats that are playable directly in standard HTML5 audio tags (AAC / MP3 / OPUS streams)
    const args = [
      '-f', 'bestaudio[ext=m4a]/bestaudio/best', 
      '-g', // Get streaming URL directly
      videoUrl
    ];

    return new Promise((resolve, reject) => {
      // Use execFile with explicit string arguments (no shell interpreter invoked, preventing commands injection)
      execFile(YTDLP_PATH, args, { timeout: 15000 }, (error, stdout, stderr) => {
        if (error) {
          console.error(`yt-dlp execution error for video ID ${videoId}:`, error.message);
          console.error(`yt-dlp stderr output:`, stderr);
          reject(new Error(`yt-dlp failed: ${error.message}. Stderr: ${stderr}`));
        } else {
          const streamUrl = stdout.trim();
          if (!streamUrl) {
            reject(new Error('yt-dlp resolvió una URL vacía.'));
          } else {
            resolve(streamUrl);
          }
        }
      });
    });
  }
};
