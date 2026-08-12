import { execFile } from 'child_process';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

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
    ];

    // Force IPv4 as datacenter IPv6 is more aggressively rate-limited
    args.push('--force-ipv4');

    // Specify Node.js as the JavaScript runtime for signature challenge solving
    args.push('--js-runtimes', 'node');

    // Bypass YouTube 429 rate limits by forcing iOS/Android mobile clients
    // (which do not require web PO tokens and have different rate limit ceilings)
    args.push('--extractor-args', 'youtube:player_client=ios,android');

    // Secure Cookies Integration:
    // Check both Render's default secure mount path (/etc/secrets/cookies.txt) and the local directory
    const renderCookiesPath = '/etc/secrets/cookies.txt';
    const localCookiesPath = path.resolve(process.cwd(), 'cookies.txt');
    const tempCookiesPath = '/tmp/cookies.txt';

    if (fs.existsSync(renderCookiesPath)) {
      try {
        // Copy the read-only secrets file to a writable path (/tmp) because yt-dlp 
        // attempts to write back/update session cookies during execution.
        fs.copyFileSync(renderCookiesPath, tempCookiesPath);
        args.push('--cookies', tempCookiesPath);
      } catch (copyErr) {
        console.error('Failed to copy cookies to temp path:', copyErr.message);
        args.push('--cookies', renderCookiesPath); // fallback to read-only
      }
    } else if (fs.existsSync(localCookiesPath)) {
      args.push('--cookies', localCookiesPath);
    }

    args.push(videoUrl);

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
