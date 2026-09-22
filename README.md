# 🌌 Nebula Player - Cosmic Cross-Platform Music Player & Spotify Hybrid

Nebula Player es un reproductor de música cósmico, moderno y multiplataforma con estética espacial oscura y efectos de neón. Cuenta con una **arquitectura híbrida** que integra la **API oficial de Spotify** para Tops mundiales, playlists oficiales, búsquedas y metadatos en Ultra-HD, resolviendo el streaming de audio en tiempo real de forma libre para que **tú y tus amigos puedan escuchar música al mismo tiempo sin necesidad de cuentas Premium** individuales y sin límites de concurrencia.

---

## 🚀 Características Principales

*   **Integración Oficial de Spotify (Híbrida):** Consulta listas de éxitos (Top 50 Global, Novedades, Virales) y canciones directamente desde Spotify.
*   **Audio Libre y Simultáneo:** Sin el límite de 1 usuario por cuenta de Spotify. Decenas de amigos pueden escuchar canciones distintas al mismo tiempo.
*   **Estética Cósmica y Neón:** Interfaz oscura espacial con acentos en violeta cósmico (`#8b5cf6`), cian eléctrico (`#06b6d4`), magenta y efectos de cristal líquido (*glassmorphism*).
*   **Buscador Inteligente:** Consulta canciones, álbumes y artistas con debounce en tiempo real.
*   **Aparato de Audio de Alta Fidelidad:** Controles de reproducción interactivos (reproducir, pausar, siguiente, anterior, aleatorio, repetición y volumen progresivo).
*   **Colecciones Locales (Playlists y Favoritos):** Creación y administración local de listas de reproducción y marcado de favoritos sin requerir bases de datos externas.
*   **Persistencia Local:** Sincronización transparente con IndexedDB y localStorage con migración automática.
*   **Historial Musical:** Registro cronológico de canciones escuchadas recientemente con prevención de duplicación.
*   **Diseño Adaptable (Responsive & PWA):** Experiencia de escritorio y modo mini-reproductor y drawer táctil para celulares.

---

## 🛠️ Tecnologías

### Frontend
*   **React 18** + **Vite** (Compilador ultrarrápido)
*   **Tailwind CSS** (Tema cósmico oscuro con resplandor neón)
*   **Zustand** (Manejador de estado global ágil)
*   **React Router Dom v6** (Navegación e itinerarios)
*   **Lucide React** (Iconos modernos y estilizados)
*   **IndexedDB** (Base de datos local en el navegador)

### Backend
*   **Node.js** + **Express.js** (Servidor API REST)
*   **Spotify Web API** (Metadatos, tops mundiales y playlists oficiales)
*   **ytmusic-api** + **yt-dlp** (Resolución y streaming de audio)
*   **Helmet & CORS** (Seguridad y políticas de recursos compartidos)

---

## 📂 Estructura del Proyecto

```text
nebula-player/
│
├── frontend/                 # React SPA (Client)
│   ├── src/
│   │   ├── components/      # UI Components (AudioPlayer, TrackRow, etc.)
│   │   ├── pages/           # Pages (Home, Search, Favorites, Playlists, History, Settings)
│   │   ├── layouts/         # Layouts (AppLayout for navigation)
│   │   ├── hooks/           # Custom Hooks (useAudioPlayer)
│   │   ├── services/        # API Connections (musicApi)
│   │   ├── store/           # Zustand Store (store)
│   │   └── utils/           # Database Helpers (db)
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # Express REST API (Server)
│   ├── src/
│   │   ├── controllers/     # Route Controllers (musicController)
│   │   ├── routes/          # REST Endpoints (musicRoutes)
│   │   ├── services/        # Spawning yt-dlp & Provider routing
│   │   └── server.js        # Express Bootstrapper
│   ├── package.json
│   └── .env.example
│
├── README.md                 # Documentation
├── package.json              # Main project scripts
└── .gitignore
```

---

## 📋 Requisitos Previos

1.  **Node.js:** Versión 18 o superior instalada.
2.  **yt-dlp:** El reproductor depende de la presencia de `yt-dlp` para resolver los enlaces multimedia. Sigue las instrucciones a continuación para instalarlo en tu sistema.

---

## 🔧 Instalación de `yt-dlp`

### Windows (Descarga automática o manual)
El backend de este proyecto viene pre-configurado para buscar `yt-dlp.exe` en su propio directorio.
1.  Si no está presente, puedes descargar la última versión ejecutable desde el [Repositorio Oficial de yt-dlp](https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe).
2.  Coloca el archivo `yt-dlp.exe` dentro de la carpeta `backend/`.
3.  Alternativamente, puedes instalarlo globalmente usando [Winget](https://learn.microsoft.com/en-us/windows/package-manager/winget/):
    ```bash
    winget install yt-dlp
    ```

### macOS
Instala `yt-dlp` utilizando [Homebrew](https://brew.sh/):
```bash
brew install yt-dlp
```

### Linux (Ubuntu/Debian)
Instala `yt-dlp` a través del gestor de paquetes de tu distribución o descárgalo directamente:
```bash
sudo wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

---

## ⚙️ Configuración del Entorno (`.env`)

Dentro de la carpeta `backend/`, crea un archivo `.env` tomando como base el archivo `.env.example`:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
YTDLP_PATH=./yt-dlp.exe # Usa ./yt-dlp.exe en Windows si lo colocaste localmente, o simplemente 'yt-dlp' si está en el PATH
```

---

## ⚡ Instalación y Ejecución

Sigue estos pasos desde el directorio raíz del proyecto:

### 1. Instalar todas las dependencias
Este comando instalará las dependencias en la raíz, el frontend y el backend de forma simultánea:
```bash
npm run install-all
```

### 2. Ejecutar en modo desarrollo
Inicia los servidores de React y Express concurrentemente:
```bash
npm run dev
```

*   **Frontend:** Disponible en [http://localhost:5173](http://localhost:5173)
*   **Backend Health Check:** [http://localhost:3001/api/health](http://localhost:3001/api/health)

---

## ⌨️ Scripts Disponibles

*   `npm run install-all`: Ejecuta `npm install` en la raíz, backend y frontend.
*   `npm run dev`: Ejecuta concurrentemente los entornos de desarrollo del frontend y backend.
*   `npm run frontend`: Lanza únicamente el servidor de Vite (`localhost:5173`).
*   `npm run backend`: Lanza únicamente el servidor Express con nodemon (`localhost:3001`).
*   `npm run build`: Compila los archivos del frontend para producción.

---

## 🛠️ Solución de Problemas (Troubleshooting)

### Error `spawn yt-dlp ENOENT`
*   **Causa:** El backend no encuentra el archivo ejecutable de `yt-dlp`.
*   **Solución:** Descarga `yt-dlp.exe` y colócalo en la carpeta `backend/`, luego asegúrate de que tu `.env` tenga la variable `YTDLP_PATH=./yt-dlp.exe`. Si usas macOS/Linux o lo instalaste en el PATH, cambia esa variable a `YTDLP_PATH=yt-dlp`.

### El audio no se reproduce o marca error de red
*   **Causa:** La versión de `yt-dlp` está desactualizada y las firmas de descodificación de YouTube han cambiado.
*   **Solución:** Actualiza `yt-dlp` ejecutando:
    ```bash
    # Si lo tienes instalado en el PATH
    yt-dlp -U
    
    # O si utilizas el binario local en Windows
    .\backend\yt-dlp.exe -U
    ```

---

## 🎵 Configuración de la API Oficial de Spotify (Opcional)

Nebula Player funciona de forma autónoma sin ninguna clave adicional gracias a su catálogo cósmico predeterminado. Sin embargo, para habilitar los Tops Mundiales oficiales de Spotify, búsquedas directas en el catálogo de Spotify y carátulas originales:

1. Ve a [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) e inicia sesión con tu cuenta de Spotify.
2. Haz clic en **Create App** (Nombre sugerido: `Nebula Player`, Redirect URI: `http://localhost:3001/callback`).
3. En la configuración de tu aplicación de Spotify, copia el **Client ID** y el **Client Secret**.
4. Abre el archivo `backend/.env` y pégalos:
   ```env
   SPOTIFY_CLIENT_ID=tu_client_id_aqui
   SPOTIFY_CLIENT_SECRET=tu_client_secret_aqui
   ```
5. Reinicia el backend. ¡La aplicación cargará automáticamente los Tops de Spotify para ti y tus amigos!

---

## 📱 Instalación en Móviles y Escritorio (PWA)

Nebula Player está configurado como una **PWA (Progressive Web App)**. Esto significa que puedes instalarlo en tu celular o computadora como si fuera una aplicación nativa sin necesidad de pasar por tiendas de aplicaciones.

### Pasos para instalar en Android (Chrome):
1.  Asegúrate de que tu computadora (donde corre el backend) y tu celular estén conectados a la **misma red Wi-Fi**.
2.  Busca la dirección IP local de tu computadora (por ejemplo, `192.168.1.15`). Puedes obtenerla en la terminal ejecutando `ipconfig` (Windows) o `ifconfig` (macOS/Linux).
3.  En el navegador Chrome de tu celular, ingresa a: `http://192.168.1.15:5173`.
4.  Toca el menú de tres puntos arriba a la derecha en Chrome y selecciona **"Agregar a la pantalla principal"** o **"Instalar aplicación"**.
5.  ¡Listo! Nebula aparecerá con su propio icono espacial en tu celular y se abrirá en pantalla completa.

### Pasos para instalar en iOS (Safari):
1.  Conecta tu iPhone a la misma red Wi-Fi de tu PC.
2.  Abre Safari en el celular e ingresa a `http://[IP-DE-TU-PC]:5173`.
3.  Toca el botón de **Compartir** (icono de la caja con la flecha hacia arriba) y selecciona **"Agregar al inicio"**.

### Pasos para instalar en Escritorio (Chrome / Edge):
1.  Ingresa a `http://localhost:5173`.
2.  En la barra de direcciones verás un icono de monitor con una flecha hacia abajo (Instalar). Haz clic allí para instalarlo como una aplicación nativa de escritorio Windows/macOS.

---

## ⚖️ Consideraciones Legales y de Uso

*   **Sin Evasión de DRM:** Esta aplicación no realiza descargas masivas, no almacena de forma permanente audio protegido por derechos de autor, y no implementa bypasses para DRM, paywalls o controles geográficos.
*   **Uso Personal:** El proyecto está diseñado con fines de demostración técnica de desarrollo full-stack y uso estrictamente personal. Se insta a los usuarios a respetar los términos de servicio de los proveedores de contenido correspondientes.

