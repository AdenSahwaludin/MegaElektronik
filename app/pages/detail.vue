<template>
  <div class="min-h-screen bg-white text-gray-900">
    <!-- App Header with Navigation -->
    <AppHeader />

    <!-- Top Padding for Fixed Header -->
    <div class="h-24 lg:h-20"></div>

    <!-- Hero Section -->
    <div class="mt-4 bg-orange-50 py-8 lg:py-12 px-4">
      <div class="max-w-7xl mx-auto text-center">
        <h2 class="text-2xl lg:text-4xl font-bold text-gray-900 mb-3">
          Sistem Point of Sale Terpadu
        </h2>
        <p class="text-gray-700 text-sm lg:text-base mb-1">
          Kelola penjualan dan inventori dengan mudah
        </p>
        <p class="text-gray-600 text-xs lg:text-sm">
          Optimal untuk iPad, Laptop, dan Smartphone
        </p>
      </div>
    </div>

    <!-- Main Navigation Cards -->
    <div class="max-w-7xl mx-auto px-4 py-8 lg:py-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <!-- POS Card -->
        <NuxtLink
          to="/"
          class="bg-orange-600 hover:bg-orange-700 text-white rounded-lg p-6 lg:p-8 shadow hover:shadow-lg transition active:scale-95"
        >
          <Icon
            name="lucide:shopping-cart"
            class="w-8 lg:w-10 h-8 lg:h-10 mb-3"
          />
          <h3 class="text-xl lg:text-2xl font-bold mb-2">Point of Sale</h3>
          <p class="text-orange-100 text-sm lg:text-base mb-4">
            Kelola transaksi, keranjang belanja, harga bargain, dan checkout
            real-time
          </p>
          <div
            class="flex items-center text-orange-200 font-semibold text-sm lg:text-base"
          >
            <span>Buka POS</span>
            <span class="ml-2">→</span>
          </div>
        </NuxtLink>

        <!-- Products Card -->
        <NuxtLink
          to="/products"
          class="bg-orange-600 hover:bg-orange-700 text-white rounded-lg p-6 lg:p-8 shadow hover:shadow-lg transition active:scale-95"
        >
          <Icon name="lucide:package" class="w-8 lg:w-10 h-8 lg:h-10 mb-3" />
          <h3 class="text-xl lg:text-2xl font-bold mb-2">Kelola Produk</h3>
          <p class="text-orange-100 text-sm lg:text-base mb-4">
            Tambah, edit, dan hapus produk dengan mudah. Pantau stok real-time.
          </p>
          <div
            class="flex items-center text-orange-200 font-semibold text-sm lg:text-base"
          >
            <span>Kelola Produk</span>
            <span class="ml-2">→</span>
          </div>
        </NuxtLink>

        <!-- Reports Card -->
        <NuxtLink
          to="/profit"
          class="bg-orange-600 hover:bg-orange-700 text-white rounded-lg p-6 lg:p-8 shadow hover:shadow-lg transition active:scale-95"
        >
          <Icon
            name="lucide:bar-chart-3"
            class="w-8 lg:w-10 h-8 lg:h-10 mb-3"
          />
          <h3 class="text-xl lg:text-2xl font-bold mb-2">Laporan Keuangan</h3>
          <p class="text-orange-100 text-sm lg:text-base mb-4">
            Lihat analisis penjualan, margin keuntungan, dan riwayat transaksi
            detail
          </p>
          <div
            class="flex items-center text-orange-200 font-semibold text-sm lg:text-base"
          >
            <span>Lihat Laporan</span>
            <span class="ml-2">→</span>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Features Section -->
    <div class="bg-gray-50 py-8 lg:py-12 px-4">
      <div class="max-w-7xl mx-auto">
        <h3
          class="text-xl lg:text-2xl font-bold text-center mb-6 lg:mb-8 text-gray-900"
        >
          Fitur Unggulan
        </h3>
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
          <div class="bg-white rounded-lg p-4 lg:p-6 shadow">
            <Icon
              name="lucide:smartphone"
              class="w-6 lg:w-8 h-6 lg:h-8 mb-2 text-orange-600"
            />
            <h4 class="font-bold text-sm lg:text-base mb-1 text-gray-900">
              Responsif
            </h4>
            <p class="text-gray-600 text-xs lg:text-sm">
              Bekerja di iPad, Laptop, dan Smartphone
            </p>
          </div>

          <div class="bg-white rounded-lg p-4 lg:p-6 shadow">
            <Icon
              name="lucide:dollar-sign"
              class="w-6 lg:w-8 h-6 lg:h-8 mb-2 text-orange-600"
            />
            <h4 class="font-bold text-sm lg:text-base mb-1 text-gray-900">
              Bargain
            </h4>
            <p class="text-gray-600 text-xs lg:text-sm">
              Edit harga di keranjang untuk negosiasi
            </p>
          </div>

          <div class="bg-white rounded-lg p-4 lg:p-6 shadow">
            <Icon
              name="lucide:trending-up"
              class="w-6 lg:w-8 h-6 lg:h-8 mb-2 text-orange-600"
            />
            <h4 class="font-bold text-sm lg:text-base mb-1 text-gray-900">
              Analytics
            </h4>
            <p class="text-gray-600 text-xs lg:text-sm">
              Pelacakan profit real-time
            </p>
          </div>

          <div class="bg-white rounded-lg p-4 lg:p-6 shadow">
            <Icon
              name="lucide:box"
              class="w-6 lg:w-8 h-6 lg:h-8 mb-2 text-orange-600"
            />
            <h4 class="font-bold text-sm lg:text-base mb-1 text-gray-900">
              Stok
            </h4>
            <p class="text-gray-600 text-xs lg:text-sm">
              Manajemen inventori otomatis
            </p>
          </div>

          <div class="bg-white rounded-lg p-4 lg:p-6 shadow">
            <Icon
              name="lucide:upload"
              class="w-6 lg:w-8 h-6 lg:h-8 mb-2 text-orange-600"
            />
            <h4 class="font-bold text-sm lg:text-base mb-1 text-gray-900">
              Import
            </h4>
            <p class="text-gray-600 text-xs lg:text-sm">
              Import produk dari JSON
            </p>
          </div>

          <div class="bg-white rounded-lg p-4 lg:p-6 shadow">
            <Icon
              name="lucide:users"
              class="w-6 lg:w-8 h-6 lg:h-8 mb-2 text-orange-600"
            />
            <h4 class="font-bold text-sm lg:text-base mb-1 text-gray-900">
              Pelanggan
            </h4>
            <p class="text-gray-600 text-xs lg:text-sm">
              Kelola data pelanggan
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Start Section -->
    <div class="max-w-7xl mx-auto px-4 py-8 lg:py-12">
      <h3
        class="text-xl lg:text-2xl font-bold text-center mb-6 lg:mb-8 text-gray-900"
      >
        Panduan Cepat
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <div
          class="bg-orange-50 border-l-4 border-orange-600 rounded p-4 lg:p-6"
        >
          <div
            class="flex items-center gap-2 text-lg lg:text-xl font-bold text-orange-600 mb-2"
          >
            <Icon name="lucide:cog" class="w-5 h-5" />
            Setup
          </div>
          <p class="text-gray-700 text-xs lg:text-sm">
            Instal dependencies dan setup database
          </p>
        </div>

        <div
          class="bg-orange-50 border-l-4 border-orange-600 rounded p-4 lg:p-6"
        >
          <div
            class="flex items-center gap-2 text-lg lg:text-xl font-bold text-orange-600 mb-2"
          >
            <Icon name="lucide:shopping-cart" class="w-5 h-5" />
            Jual
          </div>
          <p class="text-gray-700 text-xs lg:text-sm">
            Buka POS, tambah produk, checkout
          </p>
        </div>

        <div
          class="bg-orange-50 border-l-4 border-orange-600 rounded p-4 lg:p-6"
        >
          <div
            class="flex items-center gap-2 text-lg lg:text-xl font-bold text-orange-600 mb-2"
          >
            <Icon name="lucide:bar-chart-3" class="w-5 h-5" />
            Laporan
          </div>
          <p class="text-gray-700 text-xs lg:text-sm">
            Lihat profit dan analisis penjualan
          </p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer
      class="bg-gray-900 text-gray-400 py-6 lg:py-8 px-4 text-center text-xs lg:text-sm"
    >
      <p>
        &copy; 2026 Mega Elektronik. Powered by Nuxt 3 • Vue 3 • Tailwind CSS •
        Prisma
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
});
</script>
