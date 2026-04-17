<template>
  <header class="bg-orange-600 text-white shadow-lg fixed w-full top-0 z-50">
    <div class="px-4 lg:px-6 py-4">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <!-- Logo & Brand (Left) -->
        <div class="flex items-center gap-2 lg:gap-3 shrink-0">
          <AppLogo class="h-12 lg:h-16 w-auto rounded-full" />
          <h1 class="text-lg lg:text-2xl font-bold hidden sm:block">
            Mega Elektronik
          </h1>
        </div>

        <!-- Navigation Menu (Center) -->
        <nav class="flex items-center gap-2 lg:gap-6 flex-1 justify-center">
          <NuxtLink
            to="/"
            :class="[
              'px-3 lg:px-4 py-2 rounded-lg font-semibold text-sm lg:text-base transition flex items-center gap-2',
              isActive('/')
                ? 'bg-white text-orange-600'
                : 'hover:bg-orange-700 text-white',
            ]"
          >
            <Icon name="lucide:shopping-cart" class="w-4 h-4" />
            <span class="hidden md:inline">Penjualan</span>
          </NuxtLink>

          <NuxtLink
            to="/products"
            :class="[
              'px-3 lg:px-4 py-2 rounded-lg font-semibold text-sm lg:text-base transition flex items-center gap-2',
              isActive('/products')
                ? 'bg-white text-orange-600'
                : 'hover:bg-orange-700 text-white',
            ]"
          >
            <Icon name="lucide:package" class="w-4 h-4" />
            <span class="hidden md:inline">Produk</span>
          </NuxtLink>

          <NuxtLink
            to="/profit"
            :class="[
              'px-3 lg:px-4 py-2 rounded-lg font-semibold text-sm lg:text-base transition flex items-center gap-2',
              isActive('/profit')
                ? 'bg-white text-orange-600'
                : 'hover:bg-orange-700 text-white',
            ]"
          >
            <Icon name="lucide:bar-chart-3" class="w-4 h-4" />
            <span class="hidden md:inline">Laporan</span>
          </NuxtLink>
        </nav>

        <!-- Live Clock (Right) -->
        <div class="text-right shrink-0">
          <p class="text-xs lg:text-sm opacity-90">{{ formattedDate }}</p>
          <p class="text-sm lg:text-base font-semibold font-mono">
            {{ formattedTime }}
          </p>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

const route = useRoute();

const currentTime = ref(new Date());

const formattedDate = computed(() => {
  return currentTime.value.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
});

const formattedTime = computed(() => {
  return currentTime.value.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
});

const isActive = (path: string) => {
  return route.path === path;
};

let interval: any;

onMounted(() => {
  // Update time every second
  interval = setInterval(() => {
    currentTime.value = new Date();
  }, 1000);
});

onBeforeUnmount(() => {
  if (interval) {
    clearInterval(interval);
  }
});
</script>
