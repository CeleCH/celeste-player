import { Router } from "express";
import {
  healthCheck,
  getSpotifyStatus,
  getSpotifyFeatured,
  getSpotifyPlaylist,
  searchTracks,
  getTrackDetails,
  getStreamUrl,
  streamAudio,
  getHistory,
  addHistory,
  clearHistory,
  getFavorites,
  addFavorite,
  deleteFavorite
} from "../controllers/musicController.js";

const router = Router();

// Health Check
router.get("/health", healthCheck);

// Spotify Hybrid Endpoints
router.get("/spotify/status", getSpotifyStatus);
router.get("/spotify/featured", getSpotifyFeatured);
router.get("/spotify/playlist/:id", getSpotifyPlaylist);

// Search & Track Meta
router.get("/search", searchTracks);
router.get("/tracks/:id", getTrackDetails);
router.get("/tracks/:id/play", getStreamUrl);
router.get("/tracks/:id/stream", streamAudio);

// History (In-memory back-up, client uses IndexedDB as primary source)
router.get("/history", getHistory);
router.post("/history", addHistory);
router.delete("/history", clearHistory);

// Favorites (In-memory back-up, client uses IndexedDB as primary source)
router.get("/favorites", getFavorites);
router.post("/favorites", addFavorite);
router.delete("/favorites/:id", deleteFavorite);

export default router;

