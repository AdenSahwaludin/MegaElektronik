<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white"
  >
    <!-- Hero Section -->
    <div class="relative overflow-hidden">
      <div class="absolute inset-0 opacity-30">
        <div
          class="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"
        ></div>
        <div
          class="absolute top-40 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"
        ></div>
        <div
          class="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"
        ></div>
      </div>

      <div class="relative px-6 py-20 mx-auto max-w-6xl">
        <div class="text-center mb-12">
          <h1
            class="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600"
          >
            Mega Elektronik
          </h1>
          <p class="text-xl text-gray-300 mb-2">
            Point of Sale & Inventory Management System
          </p>
          <p class="text-gray-400">
            Optimized for iPad - Touch-Friendly & Ultra-Fast
          </p>
        </div>

        <!-- Main Cards -->
        <div class="grid md:grid-cols-2 gap-8 mt-16">
          <!-- POS Section -->
          <div class="group relative">
            <div
              class="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"
            ></div>
            <NuxtLink
              to="/pos"
              class="relative block px-8 py-12 bg-slate-900 rounded-2xl hover:scale-105 transition transform duration-200"
            >
              <div class="text-5xl mb-4">🛒</div>
              <h2 class="text-3xl font-bold mb-3">Point of Sale</h2>
              <p class="text-gray-400 mb-6">
                Process transactions, manage cart with bargaining feature, and
                checkout with real-time stock management.
              </p>
              <div class="flex items-center text-blue-400 font-semibold">
                <span>Open POS</span>
                <span class="ml-2 group-hover:translate-x-1 transition">→</span>
              </div>
            </NuxtLink>
          </div>

          <!-- Financial Report Section -->
          <div class="group relative">
            <div
              class="absolute -inset-1 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"
            ></div>
            <NuxtLink
              to="/profit"
              class="relative block px-8 py-12 bg-slate-900 rounded-2xl hover:scale-105 transition transform duration-200"
            >
              <div class="text-5xl mb-4">📊</div>
              <h2 class="text-3xl font-bold mb-3">Financial Report</h2>
              <p class="text-gray-400 mb-6">
                View comprehensive sales analytics, profit margins, transaction
                history, and detailed financial insights.
              </p>
              <div class="flex items-center text-green-400 font-semibold">
                <span>View Reports</span>
                <span class="ml-2 group-hover:translate-x-1 transition">→</span>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Features Section -->
        <div class="mt-20 grid md:grid-cols-3 gap-6">
          <div
            class="p-6 bg-white/10 backdrop-blur rounded-lg border border-white/20 hover:bg-white/20 transition"
          >
            <div class="text-4xl mb-4">📱</div>
            <h3 class="text-xl font-bold mb-2">iPad Optimized</h3>
            <p class="text-gray-400 text-sm">
              Touch-friendly UI with large buttons and split-screen layout
            </p>
          </div>

          <div
            class="p-6 bg-white/10 backdrop-blur rounded-lg border border-white/20 hover:bg-white/20 transition"
          >
            <div class="text-4xl mb-4">💬</div>
            <h3 class="text-xl font-bold mb-2">Price Bargaining</h3>
            <p class="text-gray-400 text-sm">
              Editable prices in cart - perfect for flexible pricing
              negotiations
            </p>
          </div>

          <div
            class="p-6 bg-white/10 backdrop-blur rounded-lg border border-white/20 hover:bg-white/20 transition"
          >
            <div class="text-4xl mb-4">📈</div>
            <h3 class="text-xl font-bold mb-2">Real-Time Analytics</h3>
            <p class="text-gray-400 text-sm">
              Live profit tracking and comprehensive financial reports
            </p>
          </div>

          <div
            class="p-6 bg-white/10 backdrop-blur rounded-lg border border-white/20 hover:bg-white/20 transition"
          >
            <div class="text-4xl mb-4">📦</div>
            <h3 class="text-xl font-bold mb-2">Stock Management</h3>
            <p class="text-gray-400 text-sm">
              Automatic inventory tracking with low-stock alerts
            </p>
          </div>

          <div
            class="p-6 bg-white/10 backdrop-blur rounded-lg border border-white/20 hover:bg-white/20 transition"
          >
            <div class="text-4xl mb-4">🔄</div>
            <h3 class="text-xl font-bold mb-2">Bulk Import</h3>
            <p class="text-gray-400 text-sm">
              Import products from JSON with easy data management
            </p>
          </div>

          <div
            class="p-6 bg-white/10 backdrop-blur rounded-lg border border-white/20 hover:bg-white/20 transition"
          >
            <div class="text-4xl mb-4">👥</div>
            <h3 class="text-xl font-bold mb-2">Customer Management</h3>
            <p class="text-gray-400 text-sm">
              Track customers, phone numbers, and delivery addresses
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Help Section -->
    <div
      class="relative px-6 py-16 mx-auto max-w-6xl border-t border-white/10 mt-20"
    >
      <h2 class="text-3xl font-bold mb-12 text-center">Quick Start Guide</h2>

      <div class="grid md:grid-cols-3 gap-8">
        <div class="space-y-4">
          <div class="bg-blue-500/20 border border-blue-500 rounded-lg p-4">
            <div class="text-2xl font-bold text-blue-400 mb-2">1️⃣</div>
            <h3 class="text-lg font-semibold mb-2">Import Products</h3>
            <p class="text-gray-400 text-sm">
              Use API endpoint or master data page to bulk import products from
              JSON file
            </p>
          </div>
        </div>

        <div class="space-y-4">
          <div class="bg-purple-500/20 border border-purple-500 rounded-lg p-4">
            <div class="text-2xl font-bold text-purple-400 mb-2">2️⃣</div>
            <h3 class="text-lg font-semibold mb-2">Start Selling</h3>
            <p class="text-gray-400 text-sm">
              Open POS page, tap products to add to cart, adjust prices for
              bargaining
            </p>
          </div>
        </div>

        <div class="space-y-4">
          <div class="bg-green-500/20 border border-green-500 rounded-lg p-4">
            <div class="text-2xl font-bold text-green-400 mb-2">3️⃣</div>
            <h3 class="text-lg font-semibold mb-2">Check Reports</h3>
            <p class="text-gray-400 text-sm">
              View financial reports and profit analytics in real-time
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tech Stack Footer -->
    <div
      class="relative px-6 py-12 mx-auto max-w-6xl border-t border-white/10 mt-16"
    >
      <h3 class="text-center text-gray-400 mb-6">
        Built with Modern Tech Stack
      </h3>
      <div class="flex flex-wrap justify-center gap-4 text-sm text-gray-300">
        <span class="px-4 py-2 bg-white/10 rounded-full border border-white/20"
          >Nuxt 3</span
        >
        <span class="px-4 py-2 bg-white/10 rounded-full border border-white/20"
          >Vue.js</span
        >
        <span class="px-4 py-2 bg-white/10 rounded-full border border-white/20"
          >Tailwind CSS</span
        >
        <span class="px-4 py-2 bg-white/10 rounded-full border border-white/20"
          >Pinia</span
        >
        <span class="px-4 py-2 bg-white/10 rounded-full border border-white/20"
          >Prisma</span
        >
        <span class="px-4 py-2 bg-white/10 rounded-full border border-white/20"
          >SQLite</span
        >
        <span class="px-4 py-2 bg-white/10 rounded-full border border-white/20"
          >Nuxt UI</span
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
});
</script>

<style scoped>
@keyframes blob {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>
