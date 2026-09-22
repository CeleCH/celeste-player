import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Home from './pages/Home';
import Search from './pages/Search';
import Favorites from './pages/Favorites';
import Playlists from './pages/Playlists';
import History from './pages/History';
import Settings from './pages/Settings';
import { spotifyAuth } from './services/spotifyAuth';
import { useStore } from './store/store';

export default function App() {
  const setSpotifyUser = useStore((state) => state.setSpotifyUser);

  useEffect(() => {
    async function initAuth() {
      // 1. Check if returning from Spotify OAuth redirect
      const authResult = await spotifyAuth.handleCallback();
      if (authResult?.userProfile) {
        setSpotifyUser(authResult.userProfile);
        return;
      }

      // 2. Check if already authenticated from previous session
      if (spotifyAuth.isAuthenticated()) {
        const cached = spotifyAuth.getCachedUser();
        if (cached) {
          setSpotifyUser(cached);
        }
        // Fetch fresh profile in background
        const profile = await spotifyAuth.fetchUserProfile();
        if (profile) {
          setSpotifyUser(profile);
        }
      }
    }

    initAuth();
  }, [setSpotifyUser]);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="playlists" element={<Playlists />} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
