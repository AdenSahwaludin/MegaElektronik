<script setup>
import { onMounted } from "vue";
import { useDataCacheStore } from "./stores/data-cache";

const dataCacheStore = useDataCacheStore();

onMounted(() => {
  // Load products cache immediately in the background on app load
  dataCacheStore.fetchProducts();
});

useHead({
  meta: [
    { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=0" },
    { name: "mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
    { name: "theme-color", content: "#ea580c" } // orange-600
  ],
  link: [
    { rel: "icon", href: "/logo.png" },
    { rel: "manifest", href: "/manifest.json" }
  ],
  htmlAttrs: {
    lang: "id",
  },
});
useSeoMeta({
  title: "Mega Elektronik",
  ogTitle: "Mega Elektronik - Sistem Kasir dan Manajemen Stok",
  description:
    "Aplikasi Point of Sale (POS) dan manajemen stok untuk toko Mega Elektronik.",
  ogDescription:
    "Aplikasi Point of Sale (POS) dan manajemen stok untuk toko Mega Elektronik.",
  ogImage: "/logo.png",
  twitterCard: "summary_large_image",
});
</script>

<template>
  <div>
    <NuxtPwaManifest />
    <NuxtPage keepalive />
  </div>
</template>
