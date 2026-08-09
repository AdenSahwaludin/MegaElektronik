import { readFileSync } from 'fs';
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/ui",
    "@nuxt/icon",
    "@pinia/nuxt",
    "@vercel/speed-insights",
    "@vite-pwa/nuxt"
  ],

  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "Mega Elektronik POS",
      short_name: "MegaPOS",
      description: "Aplikasi POS Kasir dan Manajemen Stok Mega Elektronik",
      theme_color: "#ea580c",
      background_color: "#fff7ed",
      display: "standalone",
      start_url: "/",
      orientation: "portrait-primary",
      icons: [
        {
          src: "/logo.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable"
        },
        {
          src: "/logo.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable"
        }
      ]
    },
    workbox: {
      navigateFallback: "/",
      globPatterns: ["**/*.{js,css,html,png,svg,ico,woff2}"],
      runtimeCaching: [
        {
          urlPattern: "^https://fonts\\.googleapis\\.com/.*",
          handler: "CacheFirst",
          options: {
            cacheName: "google-fonts-stylesheets",
            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
          }
        },
        {
          urlPattern: "/api/products.*",
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "api-products-cache",
            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 }
          }
        },
        {
          urlPattern: "/api/transactions.*",
          handler: "NetworkFirst",
          options: {
            cacheName: "api-transactions-cache",
            expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 12 }
          }
        }
      ]
    },
    client: {
      installPrompt: true
    }
  },
  ui: {
    colorMode: false,
  },
  icon: {
    mode: "svg"
  },
  devtools: {
    enabled: true,
  },

  css: ["~/assets/css/main.css"],

  runtimeConfig: {
    public: {
      appVersion: pkg.version || "1.0.0",
    },
  },

  routeRules: {
    "/": { ssr: true },
    "/_nuxt/**": { headers: { "cache-control": "public, max-age=31536000, immutable" } },
    "/logo.png": { headers: { "cache-control": "public, max-age=31536000, immutable" } },
  },

  compatibilityDate: "2025-01-15",

  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs",
      },
    },
  },

  // Pinia configuration
  pinia: {
    storesDirs: ["./app/stores/**"],
  },

  // Server middleware & compression
  nitro: {
    srcDir: "./server",
    compressPublicAssets: {
      gzip: true,
      brotli: true,
    },
    minify: true,
  },
});
