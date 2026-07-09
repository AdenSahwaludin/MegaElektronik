import { readFileSync } from 'fs';
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/eslint", "@nuxt/ui", "@nuxt/icon", "@pinia/nuxt", "@vercel/speed-insights"],
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

  // Server middleware
  nitro: {
    srcDir: "./server",
  },
});
