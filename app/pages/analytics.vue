<script setup lang="ts">
import { ref, watch, onMounted, onActivated } from 'vue'
import { useCurrency } from '../../composables/useCurrency'
import RevenueTrendChart from '../components/charts/RevenueTrendChart.vue'
import TopProductsChart from '../components/charts/TopProductsChart.vue'
import PriceDistributionChart from '../components/charts/PriceDistributionChart.vue'
import MarginBarChart from '../components/charts/MarginBarChart.vue'

definePageMeta({
  layout: "default",
});

const { formatCurrency } = useCurrency()

// State
const dateRange = ref('month')
const startDate = ref('')
const endDate = ref('')
const loading = ref(false)

onMounted(() => {
  const today = new Date().toISOString().slice(0, 10)
  startDate.value = today
  endDate.value = today
  fetchAllAnalytics()
})

// Refresh when navigating back to this page (Keep-alive support)
onActivated(() => {
  fetchAllAnalytics()
})

// Data refs
const summary = ref<any>(null)
const trendData = ref<any>(null)
const topProductsData = ref<any>(null)
const priceDistData = ref<any>(null)
const marginData = ref<any>(null)
const heatmapData = ref<any>(null)
const problemProducts = ref<any>(null)

const fetchAllAnalytics = async () => {
  loading.value = true
  try {
    const params: any = { dateRange: dateRange.value }
    if (dateRange.value === 'custom') {
      params.startDate = startDate.value
      params.endDate = endDate.value
    }
    
    const [s, t, p, pd, m, h, pp] = await Promise.all([
      $fetch('/api/analytics/summary', { params }),
      $fetch('/api/analytics/revenue-trend', { params }),
      $fetch('/api/analytics/top-products', { params }),
      $fetch('/api/analytics/price-distribution', { params }),
      $fetch('/api/analytics/margin-by-product', { params }),
      $fetch('/api/analytics/transaction-heatmap', { params }),
      $fetch('/api/analytics/problem-products')
    ])

    summary.value = s
    trendData.value = t
    topProductsData.value = p
    priceDistData.value = pd
    marginData.value = m
    heatmapData.value = h
    problemProducts.value = pp
  } catch (error) {
    console.error('Error fetching analytics:', error)
  } finally {
    loading.value = false
  }
}

// Watch dateRange
watch(dateRange, () => {
  if (dateRange.value !== 'custom') {
    fetchAllAnalytics()
  }
})
</script>

<template>
  <div class="h-[100dvh] w-full bg-orange-50 flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom)]">
    <!-- App Header -->
    <AppHeader />

    <!-- Main Content -->
    <div class="mt-3 flex-1 overflow-y-auto p-4 lg:p-6 pt-20 lg:pt-24 relative">
      <!-- Loading Overlay -->
      <div v-if="loading && !summary" class="absolute inset-0 z-50 bg-orange-50/80 backdrop-blur-sm flex flex-col items-center justify-center">
        <div class="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-orange-700 font-black text-xl animate-pulse">Menghitung Analitik...</p>
      </div>

      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Icon name="lucide:pie-chart" class="w-8 h-8 text-orange-600" />
            Analisis Keuangan
          </h1>

          <div class="flex flex-wrap items-center gap-2">
            <div class="flex items-center gap-2">
              <label class="text-sm font-semibold text-gray-700">Periode:</label>
              <select
                v-model="dateRange"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white font-semibold"
              >
                <option value="today">Hari Ini</option>
                <option value="week">Minggu Ini</option>
                <option value="month">Bulan Ini</option>
                <option value="quarter">3 Bulan</option>
                <option value="custom">Rentang Kustom</option>
                <option value="all">Semua Waktu</option>
              </select>
            </div>

            <div v-if="dateRange === 'custom'" class="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
              <input 
                type="date" 
                v-model="startDate" 
                class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm font-semibold"
              />
              <span class="text-gray-400">s/d</span>
              <input 
                type="date" 
                v-model="endDate" 
                class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm font-semibold"
              />
              <button 
                @click="fetchAllAnalytics"
                class="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold text-sm hover:bg-orange-700 transition"
              >
                Terapkan
              </button>
            </div>

            <button 
              @click="fetchAllAnalytics"
              class="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition ml-auto"
              :disabled="loading"
            >
              <Icon name="lucide:refresh-cw" :class="{ 'animate-spin': loading }" class="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <!-- KPI Cards -->
        <div v-if="summary" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="bg-white p-4 rounded-xl shadow-sm border-l-4 border-emerald-500">
            <p class="text-xs text-gray-500 uppercase font-bold mb-1">Produk Paling Untung</p>
            <p v-if="summary.mostProfitable" class="text-lg font-black text-gray-900 truncate" :title="summary.mostProfitable.name">
              {{ summary.mostProfitable.name }}
            </p>
            <p v-if="summary.mostProfitable" class="text-xs font-bold text-emerald-600">
              +{{ formatCurrency(summary.mostProfitable.profit) }} profit
            </p>
            <p v-else class="text-lg font-black text-gray-400">Belum ada data</p>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
            <p class="text-xs text-gray-500 uppercase font-bold mb-1">Avg. Per Transaksi</p>
            <p class="text-xl font-black text-gray-900">{{ formatCurrency(summary.aov) }}</p>
            <p class="text-[10px] text-gray-400 font-bold">Rata-rata nilai belanja</p>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border-l-4 border-orange-500">
            <p class="text-xs text-gray-500 uppercase font-bold mb-1">Avg. Untung / Hari</p>
            <p class="text-xl font-black text-gray-900">{{ formatCurrency(summary.avgProfitPerDay) }}</p>
            <p class="text-[10px] text-gray-400 font-bold">Rata-rata profit harian</p>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border-l-4 border-purple-500">
            <p class="text-xs text-gray-500 uppercase font-bold mb-1">Avg. Transaksi / Hari</p>
            <p class="text-xl font-black text-gray-900">
              {{ (Math.round(summary.avgTransactionsPerDay * 2) / 2).toLocaleString('id-ID') }}
            </p>
            <p class="text-[10px] text-gray-400 font-bold">Rata-rata nota per hari</p>
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <!-- Revenue Trend -->
          <div class="bg-white p-6 rounded-xl shadow-sm col-span-1 lg:col-span-2">
            <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Icon name="lucide:trending-up" class="w-5 h-5 text-orange-500" />
              Tren Pendapatan & Profit
            </h3>
            <RevenueTrendChart v-if="trendData" :labels="trendData.labels" :datasets="trendData.datasets" />
          </div>

          <!-- Top Products by Qty -->
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Icon name="lucide:package-check" class="w-5 h-5 text-orange-500" />
              Produk Terlaris (Unit)
            </h3>
            <TopProductsChart v-if="topProductsData" :labels="topProductsData.byQuantity.labels" :data="topProductsData.byQuantity.data" label="Unit Terjual" />
          </div>

          <!-- Top Products by Revenue -->
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Icon name="lucide:dollar-sign" class="w-5 h-5 text-orange-500" />
              Produk Paling Menghasilkan (Omset)
            </h3>
            <TopProductsChart v-if="topProductsData" :labels="topProductsData.byRevenue.labels" :data="topProductsData.byRevenue.data" label="Total Omset" :isCurrency="true" />
          </div>

          <!-- Price Distribution -->
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Icon name="lucide:tag" class="w-5 h-5 text-orange-500" />
              Distribusi Tipe Harga Jual
            </h3>
            <PriceDistributionChart v-if="priceDistData" :labels="priceDistData.labels" :data="priceDistData.data" />
          </div>

          <!-- Profit Analysis -->
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Icon name="lucide:banknote" class="w-5 h-5 text-emerald-500" />
              Analisis Total Profit per Produk (Rp)
            </h3>
            <MarginBarChart v-if="marginData" :labels="marginData.labels" :data="marginData.data" :soldCounts="marginData.soldCounts" />
          </div>

          <!-- Time Distribution -->
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Icon name="lucide:clock" class="w-5 h-5 text-orange-500" />
              Pola Jam Transaksi
            </h3>
            <TopProductsChart v-if="heatmapData" :labels="heatmapData.hours.labels" :data="heatmapData.hours.data" label="Jumlah Transaksi" />
          </div>

           <!-- Day Distribution -->
           <div class="bg-white p-6 rounded-xl shadow-sm">
            <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Icon name="lucide:calendar" class="w-5 h-5 text-orange-500" />
              Pola Hari Transaksi
            </h3>
            <TopProductsChart v-if="heatmapData" :labels="heatmapData.days.labels" :data="heatmapData.days.data" label="Jumlah Transaksi" />
          </div>

          <!-- Problem Products Table -->
          <div class="bg-white p-6 rounded-xl shadow-sm col-span-1 lg:col-span-2">
            <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Icon name="lucide:alert-triangle" class="w-5 h-5 text-red-500" />
              Produk Butuh Perhatian
            </h3>
            <div class="overflow-x-auto">
              <table class="w-full text-sm text-left">
                <thead class="bg-gray-50 text-gray-600 font-bold border-b">
                  <tr>
                    <th class="px-4 py-3">Nama Produk</th>
                    <th class="px-4 py-3 text-right">Stok</th>
                    <th class="px-4 py-3 text-right">Avg. Margin</th>
                    <th class="px-4 py-3 text-right">Total Terjual</th>
                    <th class="px-4 py-3 text-center">Terakhir Laku</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="p in problemProducts" :key="p.id" class="hover:bg-red-50 transition">
                    <td class="px-4 py-3 font-semibold text-gray-800">{{ p.name }}</td>
                    <td class="px-4 py-3 text-right">
                      <span :class="p.stock < 5 ? 'text-red-600 font-bold' : 'text-gray-700'">{{ p.stock }}</span>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <span :class="p.avgMargin < 10 ? 'text-red-600 font-bold' : 'text-gray-700'">{{ p.avgMargin.toFixed(1) }}%</span>
                    </td>
                    <td class="px-4 py-3 text-right text-orange-600 font-bold">{{ p.soldCount }} unit</td>
                    <td class="px-4 py-3 text-center text-gray-500">
                      {{ p.lastSold ? new Date(p.lastSold).toLocaleDateString('id-ID') : 'Belum Pernah' }}
                      <p v-if="p.daysSinceLastSold > 30" class="text-[10px] text-red-500 font-bold">Lama nggak laku!</p>
                    </td>
                  </tr>
                  <tr v-if="problemProducts && problemProducts.length === 0">
                    <td colspan="5" class="px-4 py-10 text-center text-gray-400">Semua aman, nggak ada produk bermasalah! ✨</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Best Seller Spotlight -->
        <div v-if="summary && summary.bestSeller" class="mt-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p class="text-orange-100 font-bold uppercase tracking-wider text-sm mb-2">Produk Bintang Periode Ini</p>
            <h2 class="text-3xl font-black mb-1">{{ summary.bestSeller.name }}</h2>
            <p class="text-orange-100 text-lg">Terjual sebanyak <span class="font-bold text-white">{{ summary.bestSeller.qty }} unit</span></p>
          </div>
          <div class="bg-white/20 p-4 rounded-full backdrop-blur-sm">
            <Icon name="lucide:award" class="w-16 h-16" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.max-w-7xl {
  padding-bottom: 2rem;
}
</style>
