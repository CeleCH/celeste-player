/**
 * Spotify OAuth 2.0 with PKCE (Proof Key for Code Exchange)
 * Standard, secure authorization flow for Single Page Applications (React/Vite).
 * Zero client_secret needed on the browser!
 */

const SPOTIFY_CLIENT_ID = 'fbb530a3fbc84cc7bdb234ea0df15010';

// Scopes required for Web Playback SDK, user profile, and playback state
const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-library-read',
  'user-library-modify'
].join(' ');

/**
 * Returns the dynamic redirect URI matching the current domain (Vercel or local).
 */
export function getRedirectUri() {
  const origin = window.location.origin;
  // Use root origin without trailing slash / hash
  return `${origin}/`;
}

/**
 * Generates a high-entropy random string for PKCE code verifier.
 */
function generateRandomString(length = 64) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

/**
 * Computes SHA-256 digest of the verifier string.
 */
async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

/**
 * Base64-URL encodes the hash buffer.
 */
function base64urlEncode(a) {
  let str = '';
  const bytes = new Uint8Array(a);
  for (let i = 0; i < bytes.byteLength; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export const spotifyAuth = {
  getClientId() {
    return SPOTIFY_CLIENT_ID;
  },

  /**
   * Start the PKCE authorization flow. Redirects to Spotify login.
   */
  async login() {
    const codeVerifier = generateRandomString(64);
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64urlEncode(hashed);

    window.localStorage.setItem('spotify_code_verifier', codeVerifier);
    window.localStorage.setItem('spotify_auth_redirect_origin', window.location.href);

    const redirectUri = getRedirectUri();

    const authUrl = new URL('https://accounts.spotify.com/authorize');
    const params = {
      response_type: 'code',
      client_id: SPOTIFY_CLIENT_ID,
      scope: SCOPES,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      redirect_uri: redirectUri,
    };

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
  },

  /**
   * Check URL params for Spotify authorization code and exchange for access tokens.
   * Works seamlessly with HashRouter.
   */
  async handleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      console.error('Spotify Auth error:', error);
      // Clean query params from URL
      window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
      return null;
    }

    if (!code) {
      return null;
    }

    const codeVerifier = window.localStorage.getItem('spotify_code_verifier');
    if (!codeVerifier) {
      console.warn('No PKCE code verifier found in localStorage.');
      return null;
    }

    const redirectUri = getRedirectUri();

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: SPOTIFY_CLIENT_ID,
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error_description || 'Error canjeando código de autorización de Spotify.');
      }

      const tokenData = await response.json();
      this.saveTokens(tokenData);

      // Clean query params from URL so code isn't reused or shown
      window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
      window.localStorage.removeItem('spotify_code_verifier');

      const userProfile = await this.fetchUserProfile(tokenData.access_token);
      return { tokenData, userProfile };
    } catch (err) {
      console.error('Failed to exchange Spotify auth code:', err);
      window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
      return null;
    }
  },

  /**
   * Refresh the access token using the stored refresh_token.
   */
  async refreshAccessToken() {
    const refreshToken = window.localStorage.getItem('spotify_refresh_token');
    if (!refreshToken) return null;

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: SPOTIFY_CLIENT_ID,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        this.logout();
        return null;
      }

      const tokenData = await response.json();
      this.saveTokens(tokenData);
      return tokenData.access_token;
    } catch (err) {
      console.error('Error refreshing Spotify access token:', err);
      return null;
    }
  },

  /**
   * Save access token and expiration in localStorage.
   */
  saveTokens(tokenData) {
    if (tokenData.access_token) {
      window.localStorage.setItem('spotify_access_token', tokenData.access_token);
      const expiresAt = Date.now() + (tokenData.expires_in * 1000) - 60000; // 1 min buffer
      window.localStorage.setItem('spotify_token_expires_at', String(expiresAt));
    }
    if (tokenData.refresh_token) {
      window.localStorage.setItem('spotify_refresh_token', tokenData.refresh_token);
    }
  },

  /**
   * Get a valid, unexpired access token (refreshes automatically if expired).
   */
  async getValidToken() {
    const token = window.localStorage.getItem('spotify_access_token');
    const expiresAt = Number(window.localStorage.getItem('spotify_token_expires_at') || '0');

    if (!token) return null;

    if (Date.now() > expiresAt) {
      return await this.refreshAccessToken();
    }

    return token;
  },

  /**
   * Fetch Spotify user profile info (name, image, product: premium/free).
   */
  async fetchUserProfile(token) {
    const authToken = token || await this.getValidToken();
    if (!authToken) return null;

    try {
      const res = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) return null;
      const profile = await res.json();
      window.localStorage.setItem('spotify_user_profile', JSON.stringify(profile));
      return profile;
    } catch (e) {
      console.error('Failed to fetch Spotify user profile:', e);
      return null;
    }
  },

  /**
   * Get cached user profile from localStorage.
   */
  getCachedUser() {
    try {
      const data = window.localStorage.getItem('spotify_user_profile');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  /**
   * Logout user and clear tokens.
   */
  logout() {
    window.localStorage.removeItem('spotify_access_token');
    window.localStorage.removeItem('spotify_refresh_token');
    window.localStorage.removeItem('spotify_token_expires_at');
    window.localStorage.removeItem('spotify_user_profile');
    window.localStorage.removeItem('spotify_code_verifier');
  },

  isAuthenticated() {
    return Boolean(window.localStorage.getItem('spotify_access_token'));
  }
};
