<template>
  <div class="h-screen w-full bg-orange-50 flex flex-col overflow-hidden">
    <!-- App Header -->
    <AppHeader />

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto p-4 lg:p-6 pt-20 lg:pt-24">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Icon name="lucide:bar-chart-3" class="w-8 h-8 text-orange-600" />
          Laporan Laba & Transaksi
        </h1>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
            <p class="text-sm text-gray-600 mb-1">Total Omset</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ formatCurrency(summary.totalRevenue) }}
            </p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow border-l-4 border-green-500 flex justify-between items-start">
            <div>
              <p class="text-sm text-gray-600 mb-1">Total Untung</p>
              <p class="text-2xl font-bold text-green-600">
                {{ formatCurrency(summary.totalProfit) }}
              </p>
            </div>
            <div 
              v-if="summary.totalCost > 0"
              class="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1"
              title="Keuntungan dibanding total modal"
            >
              <Icon name="lucide:trending-up" class="w-3 h-3" />
              {{ markupPercentage }}%
            </div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <p class="text-sm text-gray-600 mb-1">Total Transaksi</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ summary.transactionCount }}
            </p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
            <p class="text-sm text-gray-600 mb-1">Item Terjual</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ summary.totalItemsSold }}
            </p>
          </div>
        </div>

        <!-- Filters & Search -->
        <div class="bg-white p-4 rounded-lg shadow mb-6">
          <div class="flex flex-col lg:flex-row gap-4">
            <div class="flex-1">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Cari Transaksi</label>
              <div class="relative">
                <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Cari nama pelanggan atau produk..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>
            <div class="lg:w-48">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Rentang Waktu</label>
              <select
                v-model="dateRange"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              >
                <option value="all">Semua Waktu</option>
                <option value="today">Hari Ini</option>
                <option value="week">Minggu Ini</option>
                <option value="month">Bulan Ini</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Transactions Table -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 class="font-bold text-gray-800">Riwayat Transaksi</h2>
            <button
              @click="fetchTransactions"
              class="text-orange-600 hover:text-orange-700 font-semibold text-sm flex items-center gap-1"
            >
              <Icon name="lucide:refresh-cw" :class="{ 'animate-spin': loading }" />
              Refresh Data
            </button>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="flex items-center justify-center py-20">
            <p class="text-gray-500 flex items-center gap-2">
              <Icon name="lucide:loader" class="w-5 h-5 animate-spin" />
              Sabar ya, lagi ngambil data transaksi...
            </p>
          </div>

          <!-- Empty State -->
          <div v-else-if="transactions.length === 0" class="flex items-center justify-center py-20">
            <p class="text-gray-500">Belum ada transaksi di periode ini.</p>
          </div>

          <!-- Table Content -->
          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm text-left">
              <thead class="bg-gray-50 text-gray-700 uppercase font-bold text-xs border-b">
                <tr>
                  <th class="px-6 py-3">Tanggal</th>
                  <th class="px-6 py-3">Pelanggan</th>
                  <th class="px-6 py-3">Produk</th>
                  <th class="px-6 py-3 text-right">Qty</th>
                  <th class="px-6 py-3 text-right">Harga/Unit</th>
                  <th class="px-6 py-3 text-right">Laba/Unit</th>
                  <th class="px-6 py-3 text-right text-green-700">Total Laba</th>
                  <th class="px-6 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <template v-for="(transaction, txIndex) in transactions" :key="transaction.id">
                  <tr v-for="(item, itemIndex) in transaction.transactionItems" :key="`${transaction.id}-${item.id}`" class="hover:bg-orange-50">
                    <!-- Tanggal (only show on first item of transaction) -->
                    <td v-if="itemIndex === 0" :rowspan="transaction.transactionItems.length" class="px-6 py-4 whitespace-nowrap align-top border-r-2 border-orange-200">
                      <p class="font-semibold">{{ formatDate(transaction.createdAt) }}</p>
                      <p class="text-xs text-gray-500">{{ formatTime(transaction.createdAt) }}</p>
                    </td>

                    <!-- Pelanggan (only show on first item of transaction) -->
                    <td v-if="itemIndex === 0" :rowspan="transaction.transactionItems.length" class="px-6 py-4 align-top border-r-2 border-orange-200">
                      <span v-if="transaction.customer" class="font-semibold">{{
                        transaction.customer.name
                      }}</span>
                      <span v-else class="text-gray-400">Umum</span>
                      <p
                        v-if="transaction.customer?.phone"
                        class="text-xs text-gray-500"
                      >
                        {{ transaction.customer.phone }}
                      </p>
                    </td>

                    <!-- Produk -->
                    <td class="px-6 py-4">
                      <p class="font-semibold text-gray-900">{{ item.product.name }}</p>
                      <p class="text-xs text-gray-500">{{ item.product.brand }} {{ item.product.model }}</p>
                    </td>

                    <!-- Qty -->
                    <td class="px-6 py-4 text-right">
                      {{ item.quantity }}
                    </td>

                    <!-- Harga/Unit -->
                    <td class="px-6 py-4 text-right text-gray-700">
                      {{ formatCurrency(item.soldPrice) }}
                    </td>

                    <!-- Laba/Unit -->
                    <td class="px-6 py-4 text-right" :class="item.profitPerItem > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'">
                      {{ formatCurrency(item.profitPerItem) }}
                    </td>

                    <!-- Total Laba -->
                    <td class="px-6 py-4 text-right" :class="item.profitPerItem * item.quantity > 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'">
                      {{ formatCurrency(item.profitPerItem * item.quantity) }}
                    </td>

                    <!-- Aksi (only show on first item of transaction) -->
                    <td v-if="itemIndex === 0" :rowspan="transaction.transactionItems.length" class="px-6 py-4 text-center align-top border-l-2 border-orange-200">
                      <button
                        @click="deleteTransaction(transaction.id)"
                        class="p-2 text-red-600 hover:bg-red-100 rounded transition"
                        title="Hapus Transaksi"
                      >
                        <Icon name="lucide:trash-2" class="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div
            v-if="totalPages > 1"
            class="bg-gray-50 px-6 py-4 border-t border-gray-200"
          >
            <div class="flex flex-col lg:flex-row items-center justify-between gap-4">
              <p class="text-sm text-gray-600">
                Halaman {{ currentPage }} dari {{ totalPages }} | Ada
                {{ transactions.length }} dari {{ totalCount }} transaksi
              </p>
              <div class="flex items-center gap-2">
                <button
                  @click="currentPage--"
                  :disabled="currentPage === 1"
                  class="px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition flex items-center gap-1"
                >
                  <Icon name="lucide:chevron-left" class="w-4 h-4" />
                  Sebelumnya
                </button>
                <div class="flex gap-1">
                  <button
                    v-for="p in totalPages"
                    :key="p"
                    @click="currentPage = p"
                    :class="[
                      'w-8 h-8 rounded-lg text-sm font-semibold transition',
                      currentPage === p
                        ? 'bg-orange-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-orange-100 border border-gray-300'
                    ]"
                  >
                    {{ p }}
                  </button>
                </div>
                <button
                  @click="currentPage++"
                  :disabled="currentPage === totalPages"
                  class="px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition flex items-center gap-1"
                >
                  <span>Lanjut</span>
                  <Icon name="lucide:chevron-right" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useCurrency } from "../../composables/useCurrency";

definePageMeta({
  layout: "default",
});

const { formatCurrency } = useCurrency();

// State
const transactions = ref<any[]>([]);
const summary = ref({
  totalRevenue: 0,
  totalProfit: 0,
  totalCost: 0,
  totalItemsSold: 0,
  transactionCount: 0,
});
const loading = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
const totalCount = ref(0);
const dateRange = ref("all");
const searchQuery = ref("");

// Computed
const markupPercentage = computed(() => {
  if (!summary.value.totalCost) return "0";
  return ((summary.value.totalProfit / summary.value.totalCost) * 100).toFixed(1);
});

// Methods
const fetchTransactions = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      limit: "10",
      dateRange: dateRange.value,
      search: searchQuery.value,
    });

    const response = await $fetch<any>(`/api/transactions?${params.toString()}`);
    transactions.value = response.transactions;
    summary.value = response.summary;
    totalCount.value = response.pagination.totalCount;
    totalPages.value = response.pagination.totalPages;
  } catch (error) {
    console.error("Error loading transactions:", error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const deleteTransaction = async (transactionId: string) => {
  if (!confirm("Beneran mau hapus transaksi ini? Data yang diapus nggak bisa balik lagi lho!")) {
    return;
  }

  try {
    await $fetch(`/api/transactions/${transactionId}`, {
      method: "DELETE",
    });
    await fetchTransactions();
    alert("Sip, transaksi udah diapus");
  } catch (error: any) {
    alert(
      "Yah, gagal apus transaksi: " +
        (error.message || error.data?.message || "Error"),
    );
  }
};

// Watchers
watch([searchQuery, dateRange], () => {
  currentPage.value = 1;
  fetchTransactions();
});

watch(currentPage, () => {
  fetchTransactions();
});

// Lifecycle
onMounted(() => {
  fetchTransactions();
});
</script>
