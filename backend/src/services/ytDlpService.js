import { execFile, spawn } from 'child_process';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const YTDLP_PATH = process.env.YTDLP_PATH || 'yt-dlp';
const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;
const CACHE_DIR = path.resolve(process.cwd(), '.audio-cache');

const inflight = new Map();

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function findCachedFile(videoId) {
  for (const ext of ['m4a', 'webm', 'mp3', 'opus', 'mp4']) {
    const fp = path.join(CACHE_DIR, `${videoId}.${ext}`);
    if (fs.existsSync(fp) && fs.statSync(fp).size > 0) return fp;
  }
  return null;
}

const MIME = { 
  '.m4a': 'audio/mp4', 
  '.webm': 'audio/webm', 
  '.mp3': 'audio/mpeg', 
  '.opus': 'audio/opus',
  '.mp4': 'audio/mp4'
};

export const ytDlpService = {
  async checkVersion() {
    return new Promise((resolve) => {
      execFile(YTDLP_PATH, ['--version'], { timeout: 5000 }, (error, stdout) => {
        resolve(error ? '' : stdout.trim());
      });
    });
  },

  async streamAudio(videoId, res) {
    if (!videoId || !VIDEO_ID_REGEX.test(videoId)) {
      return res.status(400).json({ error: 'Identificador de canción inválido.' });
    }

    const cached = findCachedFile(videoId);
    if (cached) {
      return this._serveFile(cached, res);
    }

    try {
      const filePath = await this._downloadAudio(videoId);
      this._serveFile(filePath, res);
    } catch (err) {
      console.error(`[ytDlpService] Error sirviendo audio para ${videoId}:`, err.message);
      if (!res.headersSent) {
        res.status(502).json({ error: `No se pudo obtener el audio: ${err.message}` });
      }
    }
  },

  _downloadAudio(videoId) {
    if (inflight.has(videoId)) {
      return inflight.get(videoId);
    }

    const promise = this._doDownload(videoId);
    inflight.set(videoId, promise);

    return promise.finally(() => inflight.delete(videoId));
  },

  _doDownload(videoId) {
    return new Promise((resolve, reject) => {
      ensureCacheDir();

      const outputPath = path.join(CACHE_DIR, `${videoId}.%(ext)s`);
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

      const args = [
        '-f', 'bestaudio[ext=m4a]/bestaudio/best',
        '-o', outputPath,
        '--no-playlist',
        '--js-runtimes', 'node',
        '--extractor-args', 'youtube:player_client=ios,android,web;player_skip=configs,js;formats=missing_pot',
        videoUrl,
      ];

      console.log(`[ytDlpService] Descargando audio para ${videoId}...`);

      execFile(YTDLP_PATH, args, { timeout: 120000 }, (error, stdout, stderr) => {
        if (error) {
          const msg = stderr || error.message;
          console.error(`[ytDlpService] Descarga falló para ${videoId}: ${msg.slice(0, 300)}`);

          const fallbackArgs = [
            '-f', 'bestaudio',
            '-o', outputPath,
            '--no-playlist',
            '--js-runtimes', 'node',
            '--extractor-args', 'youtube:player_client=web',
            videoUrl,
          ];

          execFile(YTDLP_PATH, fallbackArgs, { timeout: 120000 }, (err2, _stdout2, stderr2) => {
            if (err2) {
              reject(new Error(`yt-dlp falló: ${(stderr2 || err2.message).slice(0, 200)}`));
              return;
            }
            const file = findCachedFile(videoId);
            if (file) {
              console.log(`[ytDlpService] Descarga (fallback) OK para ${videoId}`);
              resolve(file);
            } else {
              reject(new Error('No se encontró el archivo descargado.'));
            }
          });
          return;
        }

        const file = findCachedFile(videoId);
        if (file) {
          console.log(`[ytDlpService] Descarga OK para ${videoId}: ${path.basename(file)}`);
          resolve(file);
        } else {
          reject(new Error('No se encontró el archivo descargado.'));
        }
      });
    });
  },

  _serveFile(filePath, res) {
    res.sendFile(filePath, {
      headers: {
        'Cache-Control': 'public, max-age=3600',
      }
    });
  },
};
