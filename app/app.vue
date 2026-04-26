<script setup>
useHead({
  meta: [{ name: "viewport", content: "width=device-width, initial-scale=1" }],
  link: [
    { rel: "icon", href: "/Logo Mega Elektronik Bongas Merah no-bg1.png" },
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
  ogImage: "/cover-image.png",
  twitterCard: "summary_large_image",
});
</script>

<template>
  <UApp>
    <UMain>
      <NuxtPage />
    </UMain>
  </UApp>
</template>
