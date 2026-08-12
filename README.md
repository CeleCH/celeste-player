# 🎧 Celeste Player - Personal Cross-Platform Music Player

Celeste Player es un reproductor de música personal y local con una interfaz premium y moderna inspirada en Spotify y YouTube Music. Está diseñado con una arquitectura desacoplada utilizando React (Vite) para el frontend, Express.js (Node.js) para el backend, y el motor `yt-dlp` para resolver y reproducir streams multimedia locales autorizados de manera segura.

---

## 🚀 Características Principales

*   **Buscador Rápido:** Consulta de canciones, álbumes y artistas con autocompletado y debounce (500ms).
*   **Aparato de Audio Premium:** Controles de reproducción interactivos (reproducir, pausar, siguiente, anterior, aleatorio, repetición y volumen progresivo).
*   **Colecciones Locales (Playlists y Favoritos):** Creación y administración local de listas de reproducción y marcado de favoritos sin requerir bases de datos externas.
*   **Persistencia Local:** Sincronización transparente con el almacenamiento del navegador utilizando IndexedDB y localStorage.
*   **Historial Musical:** Registro cronológico de canciones escuchadas recientemente con prevención de duplicación.
*   **Diseño Adaptable (Responsive):** Experiencia de escritorio con barra lateral que se transforma dinámicamente en navegación inferior en pantallas táctiles y dispositivos móviles.
*   **Seguridad:** Ejecución segura de subprocesos externos para evitar vulnerabilidades de inyección de comandos en el servidor.

---

## 🛠️ Tecnologías

### Frontend
*   **React 18** + **Vite** (Compilador ultrarrápido)
*   **Tailwind CSS** (Estilos y tokens de diseño oscuros)
*   **Zustand** (Manejador de estado global ágil)
*   **React Router Dom v6** (Navegación e itinerarios)
*   **Lucide React** (Paquete de iconos consistentes)
*   **IndexedDB** (Base de datos local en el navegador)

### Backend
*   **Node.js** + **Express.js** (Servidor API REST)
*   **Helmet & CORS** (Seguridad y políticas de recursos compartidos)
*   **Express Rate Limit** (Prevención de abusos a endpoints)
*   **ytmusic-api** (Consultas y metadatos de YouTube Music)
*   **yt-dlp** (Resolución segura de streams de audio)

---

## 📂 Estructura del Proyecto

```text
celeste-player/
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

## 📱 Instalación en Móviles y Escritorio (PWA)

Celeste Player está configurado como una **PWA (Progressive Web App)**. Esto significa que puedes instalarlo en tu celular o computadora como si fuera una aplicación nativa (APK) sin necesidad de pasar por la Play Store ni compilar código nativo.

### Pasos para instalar en Android (Chrome):
1.  Asegúrate de que tu computadora (donde corre el backend) y tu celular estén conectados a la **misma red Wi-Fi**.
2.  Busca la dirección IP local de tu computadora (por ejemplo, `192.168.1.15`). Puedes obtenerla en la terminal ejecutando `ipconfig` (Windows) o `ifconfig` (macOS/Linux).
3.  En el navegador Chrome de tu celular, ingresa a: `http://192.168.1.15:5173`.
4.  Toca el menú de tres puntos arriba a la derecha en Chrome y selecciona **"Agregar a la pantalla principal"** o **"Instalar aplicación"**.
5.  ¡Listo! Celeste aparecerá con su propio icono en tu celular y se abrirá en pantalla completa sin barra de navegación del navegador.

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

