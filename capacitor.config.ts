import type { CapacitorConfig } from '@capacitor/cli';

/**
 * iOS/Android wrapper untuk aplikasi web Mega Elektronik (Nuxt full-stack).
 *
 * API + login cookie hidup di server Nuxt (Nitro), yang tidak bisa berjalan
 * di dalam iPhone — jadi aplikasi native ini memuat web yang sudah berjalan:
 * - Online  : URL Vercel/hosting, mis. https://mega-elektronik.vercel.app
 * - LAN toko: http://192.168.x.x:3000 (butuh ATS exception di Info.plist)
 *
 * Override saat build CI: env CAP_SERVER_URL (lihat .github/workflows/build-ios.yml).
 * GANTI placeholder di bawah bila membuild manual tanpa env.
 */
const serverUrl = process.env.CAP_SERVER_URL || 'https://GANTI-URL-MEGA-ELEKTRONIK';

const config: CapacitorConfig = {
  appId: 'com.megaelektronik.pos',
  appName: 'Mega Elektronik POS',
  webDir: 'www',
  server: {
    url: serverUrl,
    // Izinkan http:// (server LAN toko tanpa TLS)
    cleartext: true,
  },
};

export default config;
