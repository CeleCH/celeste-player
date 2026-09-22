# 🚀 Guía de Despliegue 100% Gratuito en la Nube

Esta guía te guiará paso a paso para desplegar **Nebula Player** en la nube de forma totalmente gratuita y segura, permitiéndote usar la aplicación desde tu teléfono móvil o cualquier otro dispositivo y compartirla con tus amigos.

---

## 🛠️ Arquitectura de Despliegue

*   **Repositorio:** GitHub (Donde guardaremos el código de forma gratuita y privada).
*   **Servidor Backend (API & yt-dlp & Spotify Hybrid):** Render.com (Plan gratuito que soporta Docker Containers de forma nativa).
*   **Frontend (React Client):** Vercel (Plan gratuito de hosting estático ultrarrápido).

---

## 📦 Paso 1: Subir el Código a GitHub

1.  Crea una cuenta en [GitHub](https://github.com/) si aún no la tienes.
2.  Crea un nuevo repositorio con el nombre `nebula-player`.
3.  Abre la terminal en la carpeta raíz del proyecto (`celeste-player/`) y ejecuta los siguientes comandos para subir el código:
    ```bash
    git init
    git add .
    git commit -m "feat: transformar en Nebula Player con Spotify Hybrid API"
    git branch -M main
    git remote add origin https://github.com/TU-USUARIO/nebula-player.git
    git push -u origin main
    ```

---

## 🖥️ Paso 2: Desplegar el Backend en Render.com

Render ofrece alojamiento gratuito para aplicaciones en contenedores utilizando el archivo `Dockerfile` que creamos.

1.  Crea una cuenta gratuita en [Render.com](https://render.com/).
2.  Haz clic en **New +** y selecciona **Web Service**.
3.  Conecta tu cuenta de GitHub y selecciona tu repositorio `nebula-player`.
4.  Configura las siguientes opciones en el formulario de creación:
    *   **Name:** `nebula-backend`
    *   **Root Directory:** `backend` *(¡Muy importante! Apunta a la carpeta del servidor)*
    *   **Language:** `Docker` *(Render detectará nuestro Dockerfile e instalará Node.js, Python y yt-dlp de forma automática)*
    *   **Instance Type:** `Free` ($0/mo)
5.  Haz clic en la pestaña **Environment Variables** (o Variables de Entorno) y agrega las siguientes:
    *   `NODE_ENV` = `production`
    *   `YTDLP_PATH` = `yt-dlp`
    *   `FRONTEND_URL` = `https://TU-FRONTEND-DE-VERCEL.vercel.app` *(Paso 3)*
    *   `SPOTIFY_CLIENT_ID` = `TU_SPOTIFY_CLIENT_ID` *(Opcional para Tops y metadatos de Spotify)*
    *   `SPOTIFY_CLIENT_SECRET` = `TU_SPOTIFY_CLIENT_SECRET` *(Opcional para Tops y metadatos de Spotify)*
6.  **🍪 Desbloquear YouTube en la Nube (Secret File `cookies.txt`):**
    > [!IMPORTANT]
    > Los servidores en la nube (Render, AWS, etc.) son detectados por YouTube y bloquean las descargas de audio con el error *"Sign in to confirm you're not a bot"*. Para solucionarlo al 100%:
    *   En tu navegador Chrome/Brave/Edge, instala la extensión gratuita **"Get cookies.txt LOCALLY"**.
    *   Entra a [YouTube](https://www.youtube.com/) con tu cuenta de Google.
    *   Abre la extensión y presiona **"Export"** para descargar el archivo `cookies.txt`.
    *   En Render, ve a la pestaña **Environment** -> sección **Secret Files** -> **Add Secret File**:
        *   **Filename:** `cookies.txt`
        *   **Contents:** Abre el archivo `cookies.txt` descargado, copia todo el texto y pégalo ahí.
    *   Haz clic en **Save Changes**.
7.  Haz clic en **Create Web Service** (o guarda los cambios). El proceso de compilación tomará entre 3 y 5 minutos. Al finalizar, Render te dará una URL pública (ejemplo: `https://nebula-backend.onrender.com`). **Copia esta URL**.

> [!NOTE]
> Los servicios gratuitos de Render entran en "modo de suspensión" después de 15 minutos sin recibir visitas. La primera carga del reproductor tras un tiempo inactivo puede demorar unos 30-50 segundos mientras el servidor vuelve a despertar. Puedes verificar si tus cookies están activas abriendo `https://TU-BACKEND.onrender.com/api/health` (debe mostrar `"cookiesConfigured": true`).

---

## 🎨 Paso 3: Desplegar el Frontend en Vercel

Vercel compilará y alojará la interfaz de React de forma permanente y 100% gratuita.

1.  Crea una cuenta en [Vercel.com](https://vercel.com/) usando tu cuenta de GitHub.
2.  Haz clic en **Add New** y luego en **Project**.
3.  Importa tu repositorio `nebula-player`.
4.  Configura los parámetros del proyecto:
    *   **Framework Preset:** `Vite`
    *   **Root Directory:** `frontend` *(¡Muy importante! Apunta a la carpeta de React)*
5.  Abre la sección **Environment Variables** y agrega la siguiente variable:
    *   **Key:** `VITE_API_URL`
    *   **Value:** `https://nebula-backend.onrender.com/api` *(Reemplaza con la URL de Render que copiaste en el Paso 2 agregando /api al final)*
6.  Haz clic en **Deploy**. ¡Listo! En menos de un minuto tu cliente estará en línea y te entregará un dominio seguro `https://nebula-player.vercel.app`.
7.  **Actualización importante:** Ve a la configuración de Render y asegúrate de actualizar la variable `FRONTEND_URL` con este nuevo dominio de Vercel para que las políticas de seguridad (CORS) permitan la reproducción de música.

---

## 📱 Instalar en tu Celular desde Internet

Una vez completados los pasos:
1.  Abre el navegador de tu celular y entra a la URL de Vercel (`https://TU-FRONTEND-DE-VERCEL.vercel.app`).
2.  **En Android (Chrome):** Toca los tres puntos arriba a la derecha y presiona **"Instalar aplicación"**.
3.  **En iOS (Safari):** Toca compartir y selecciona **"Agregar al inicio"**.
4.  Ya tendrás Nebula Player instalado en tu pantalla de inicio, listo para escuchar música en cualquier sitio y compartir con tus amigos totalmente gratis.

