import { ytDlpService } from '../src/services/ytDlpService.js';

async function runTests() {
  console.log('🔍 INICIANDO DIAGNÓSTICO DE YT-DLP...');

  try {
    const version = await ytDlpService.checkVersion();
    if (version) {
      console.log(`✅ yt-dlp está instalado y respondiendo.`);
      console.log(`ℹ️ Versión detectada: ${version}`);
    } else {
      console.warn(`⚠️ Warning: yt-dlp no retornó versión. Puede que no esté configurado en el PATH.`);
      console.warn(`👉 Define la variable YTDLP_PATH en tu archivo backend/.env apuntando al ejecutable.`);
    }

    console.log('\n--- Probando extracción de audio ---');
    const testVideoId = 'dQw4w9WgXcQ'; // Rick Astley - Never Gonna Give You Up (video de prueba estándar)
    console.log(`⏳ Intentando obtener URL de stream para el Video ID: "${testVideoId}"...`);

    const streamUrl = await ytDlpService.getAudioStreamUrl(testVideoId);
    console.log('✅ ÉXITO: Se obtuvo URL del stream de audio!');
    console.log(`🔗 URL (truncada): ${streamUrl.substring(0, 100)}...`);
  } catch (error) {
    console.error('❌ ERROR DURANTE LA PRUEBA:');
    console.error(error.message);
  }
}

runTests();
