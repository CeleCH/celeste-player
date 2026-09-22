# 🌌 Nebula Player - Guía de Configuración y Despliegue en la Nube

**Nebula Player** está integrado al 100% con el ecosistema oficial de **Spotify (Web API + Web Playback SDK)**.  
No requiere servidores pesados de descarga, no depende de YouTube y no sufre bloqueos anti-bot.

---

## 🛠️ Arquitectura
* **Frontend:** Vercel (React + Vite + Spotify Web Playback SDK)
* **Backend:** Render.com (Node.js Express ultra-ligero para catálogo de Spotify y caché)
* **Audio:** Spotify Oficial en streaming de alta calidad directamente al navegador

---

## 🔑 Paso 1: Configurar Redirect URIs en Spotify Developer Dashboard

Para que Spotify permita el inicio de sesión desde tu aplicación web:

1. Ve a tu [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) y abre tu aplicación.
2. Haz clic en **Settings**.
3. En la sección **Redirect URIs**, agrega:
   * `https://nebula-player-puce.vercel.app/`
   * `http://127.0.0.1:5173/` *(para pruebas en tu computadora local)*
4. Haz clic en **Save** al final de la página.

---

## 🖥️ Paso 2: Desplegar el Backend en Render.com

1. Ve a tu panel en [Render.com](https://dashboard.render.com/) y abre tu servicio `nebula-backend`.
2. En la pestaña **Environment**, solo necesitas estas variables:
   * `NODE_ENV` = `production`
   * `FRONTEND_URL` = `https://nebula-player-puce.vercel.app`
   * `SPOTIFY_CLIENT_ID` = `fbb530a3fbc84cc7bdb234ea0df15010`
   * `SPOTIFY_CLIENT_SECRET` = `a7ced53af60240049dd068273edc4f11`
   *(Ya no necesitas YTDLP_PATH ni Secret Files cookies.txt).*
3. Render compilará el contenedor en solo 20 segundos.

---

## 🎨 Paso 3: Desplegar el Frontend en Vercel

1. En tu proyecto de [Vercel](https://vercel.com/):
   * Variable de entorno: `VITE_API_URL` = `https://nebula-backend-f83l.onrender.com/api`
2. Vercel se actualiza automáticamente con cada `git push`.

---

## 📱 Cómo reproducir música en Nebula Player

1. Abre tu aplicación: [https://nebula-player-puce.vercel.app/](https://nebula-player-puce.vercel.app/)
2. Haz clic en **"Conectar Spotify"** (en la barra lateral o en el reproductor inferior).
3. Inicia sesión con tu cuenta de Spotify Premium.
4. ¡Listo! Busca cualquier canción, álbum o artista y dale a reproducir: sonará al instante con la calidad oficial de Spotify.
