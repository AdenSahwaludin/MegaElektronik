// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/eslint", "@nuxt/ui", "@nuxt/icon", "@pinia/nuxt", "@vercel/speed-insights"],
  ui: {
    colorMode: false,
  },
  devtools: {
    enabled: true,
  },

  css: ["~/assets/css/main.css"],

  routeRules: {
    "/": { prerender: true },
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
    prerender: {
      crawlLinks: true,
      routes: ["/"],
    },
    srcDir: "./server",
    // Keep Prisma as external (not bundled) so process.env is read at runtime
    externals: {
      external: [
        "@prisma/client",
        "@prisma/adapter-libsql",
        "@libsql/client",
        ".prisma",
      ],
    },
  },

  runtimeConfig: {
    tursoUrl: process.env.TURSO_DATABASE_URL || "",
    tursoToken: process.env.TURSO_AUTH_TOKEN || "",
  },
});
