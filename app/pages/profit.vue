<template>
  <div class="min-h-screen w-screen bg-orange-50 flex flex-col overflow-hidden">
    <!-- App Header with Navigation -->
    <AppHeader />

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto p-4 lg:p-6 mt-12 lg:mt-10">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8">
        <!-- Total Revenue Card -->
        <div class="bg-blue-500 rounded-xl p-6 text-white shadow-xl">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm opacity-75 mb-1">Omset Total</p>
              <p class="text-2xl lg:text-4xl font-bold">
                {{ formatCurrency(summary.totalRevenue) }}
              </p>
            </div>
            <Icon
              name="lucide:wallet"
              class="w-12 lg:w-16 h-12 lg:h-16 opacity-20"
            />
          </div>
          <p class="text-xs lg:text-sm mt-4 opacity-75">
            Dari {{ summary.transactionCount }} transaksi
          </p>
        </div>

        <!-- Total Profit Card -->
        <div class="bg-green-500 rounded-xl p-6 text-white shadow-xl">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm opacity-75 mb-1">Untung Bersih</p>
              <p class="text-2xl lg:text-4xl font-bold">
                {{ formatCurrency(summary.totalProfit) }}
              </p>
            </div>
            <Icon
              name="lucide:trending-up"
              class="w-12 lg:w-16 h-12 lg:h-16 opacity-20"
            />
          </div>
          <p class="text-xs lg:text-sm mt-4 opacity-75">
            Margin: {{ profitMargin }}%
          </p>
        </div>

        <!-- Items Sold Card -->
        <div class="bg-orange-500 rounded-xl p-6 text-white shadow-xl">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm opacity-75 mb-1">Total Item Terjual</p>
              <p class="text-2xl lg:text-4xl font-bold">
                {{ summary.totalItemsSold }}
              </p>
            </div>
            <Icon
              name="lucide:package"
              class="w-12 lg:w-16 h-12 lg:h-16 opacity-20"
            />
          </div>
          <p class="text-xs lg:text-sm mt-4 opacity-75">
            {{ summary.avgItemsPerTransaction.toFixed(1) }} per transaksi
          </p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg p-4 mb-6 shadow">
        <div class="flex flex-col lg:flex-row gap-4">
          <div class="flex-1">
            <label class="block text-gray-700 text-sm font-semibold mb-2"
              >Cari Produk/Pelanggan:</label
            >
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Ketik untuk filter..."
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div class="flex-1">
            <label class="block text-gray-700 text-sm font-semibold mb-2"
              >Range Tanggal:</label
            >
            <select
              v-model="dateRange"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Semua Waktu</option>
              <option value="today">Hari Ini</option>
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
            </select>
          </div>
          <div class="flex-1 lg:flex-none">
            <label class="block text-gray-700 text-sm font-semibold mb-2"
              >Baris per Halaman:</label
            >
            <select
              :value="itemsPerPage"
              @change="
                setItemsPerPage(
                  parseInt(($event.target as HTMLSelectElement).value),
                )
              "
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="999999">Semua</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="refreshData"
              class="w-full lg:w-auto px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition"
            >
              Segarkan
            </button>
          </div>
        </div>
      </div>

      <!-- Transaction History Table -->
      <div class="bg-white rounded-xl shadow-xl overflow-hidden">
        <div class="px-6 py-4 bg-orange-600 text-white">
          <h2 class="text-xl lg:text-2xl font-bold">Riwayat Transaksi</h2>
          <p class="text-sm opacity-75">
            {{ transactions.length }} transaksi ditemukan
          </p>
        </div>

        <div v-if="loading" class="flex items-center justify-center py-20">
          <p class="text-gray-500 flex items-center gap-2">
            <Icon name="lucide:loader" class="w-5 h-5 animate-spin" />
            Muat transaksi...
          </p>
        </div>

        <div
          v-else-if="transactions.length === 0"
          class="flex items-center justify-center py-20"
        >
          <p class="text-gray-500 flex items-center gap-2">
            <Icon name="lucide:inbox" class="w-5 h-5" />
            Transaksi tidak ada
          </p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-100 border-b border-gray-300">
              <tr>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">
                  Tgl/Jam
                </th>
                <th
                  class="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                >
                  Pelanggan
                </th>

                <th
                  class="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                >
                  Detail Produk
                </th>
                <th
                  class="px-4 py-3 text-right text-sm font-semibold text-gray-700"
                >
                  Harga Pokok
                </th>
                <th
                  class="px-4 py-3 text-right text-sm font-semibold text-gray-700"
                >
                  Harga Jual
                </th>
                <th
                  class="px-4 py-3 text-right text-sm font-semibold text-gray-700"
                >
                  Qty
                </th>
                <th
                  class="px-4 py-3 text-right text-sm font-semibold text-gray-700"
                >
                  Untung/Item
                </th>
                <th
                  class="px-4 py-3 text-right text-sm font-semibold text-gray-700"
                >
                  Total Untung
                </th>
                <th
                  class="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <template
                v-for="transaction in transactions"
                :key="transaction.id"
              >
                <tr
                  v-for="(item, index) in transaction.transactionItems"
                  :key="item.id"
                  :class="index === 0 ? 'bg-orange-50' : 'bg-orange-50'"
                  class="hover:bg-gray-50 transition"
                >
                  <td
                    v-if="index === 0"
                    :rowspan="transaction.transactionItems.length"
                    class="px-4 py-3 text-sm font-semibold text-gray-800"
                  >
                    {{ formatDateTime(transaction.createdAt) }}
                  </td>
                  <td
                    v-if="index === 0"
                    :rowspan="transaction.transactionItems.length"
                    class="px-4 py-3 text-sm text-gray-700"
                  >
                    <span v-if="transaction.customer" class="font-semibold">{{
                      transaction.customer.name
                    }}</span>
                    <span v-else class="text-gray-400">Ga Dikenal</span>
                    <p
                      v-if="transaction.customer?.phone"
                      class="text-xs text-gray-500"
                    >
                      {{ transaction.customer.phone }}
                    </p>
                  </td>

                  <td class="px-4 py-3 text-sm text-gray-800">
                    <p class="font-semibold">{{ item.product.name }}</p>
                    <p class="text-xs text-gray-600">
                      {{ item.product.brand }} - {{ item.product.model }}
                    </p>
                  </td>

                  <td class="px-4 py-3 text-right text-sm font-mono">
                    {{ formatCurrency(item.product.buyPrice) }}
                  </td>

                  <td
                    class="px-4 py-3 text-right text-sm font-mono font-semibold text-orange-600"
                  >
                    {{ formatCurrency(item.soldPrice) }}
                  </td>

                  <td class="px-4 py-3 text-right text-sm font-semibold">
                    {{ item.quantity }}
                  </td>

                  <td
                    class="px-4 py-3 text-right text-sm font-mono"
                    :class="
                      item.profitPerItem > 0 ? 'text-green-600' : 'text-red-600'
                    "
                  >
                    {{ formatCurrency(item.profitPerItem) }}
                  </td>

                  <td
                    class="px-4 py-3 text-right text-sm font-bold"
                    :class="
                      item.profitPerItem * item.quantity > 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    "
                  >
                    {{ formatCurrency(item.profitPerItem * item.quantity) }}
                  </td>
                  <td
                    v-if="index === 0"
                    :rowspan="transaction.transactionItems.length"
                    class="px-4 py-3 text-sm"
                  >
                    <button
                      @click="deleteTransaction(transaction.id)"
                      class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded transition flex items-center gap-1"
                    >
                      <Icon name="lucide:trash-2" class="w-4 h-4" />
                      Hapus
                    </button>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div
          v-if="transactions.length > 0"
          class="bg-gray-50 border-t border-gray-300 px-6 py-4"
        >
          <div
            class="flex flex-col lg:flex-row items-center justify-between gap-4"
          >
            <p class="text-sm text-gray-600">
              Halaman {{ currentPage }} dari {{ totalPages }} | Menampilkan
              {{ transactions.length }} dari {{ totalCount }} transaksi
            </p>
            <div class="flex items-center gap-2">
              <button
                @click="prevPage"
                :disabled="currentPage === 1"
                class="px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition flex items-center gap-1"
              >
                <Icon name="lucide:chevron-left" class="w-4 h-4" />
                Sebelum
              </button>
              <div class="flex gap-1">
                <button
                  v-for="page in Math.min(5, totalPages)"
                  :key="page"
                  @click="goToPage(page)"
                  :class="[
                    'px-2 py-2 rounded font-semibold text-sm transition',
                    currentPage === page
                      ? 'bg-orange-600 text-white'
                      : 'bg-white border border-gray-300 hover:border-orange-500 text-gray-700',
                  ]"
                >
                  {{ page }}
                </button>
              </div>
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition flex items-center gap-1"
              >
                <span>Setelah</span>
                <Icon name="lucide:chevron-right" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Table Footer -->
        <div
          v-if="transactions.length > 0"
          class="bg-gray-100 border-t border-gray-300 px-6 py-4"
        >
          <div class="grid grid-cols-3 gap-6 text-right">
            <div>
              <p class="text-sm text-gray-600">Omset Total</p>
              <p class="text-sm sm:text-2xl font-bold text-blue-600">
                {{ formatCurrency(summaryData.totalRevenue) }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Total Pokok</p>
              <p class="text-sm sm:text-2xl font-bold text-orange-600">
                {{ formatCurrency(summaryData.totalCost) }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Untung Bersih</p>
              <p class="text-sm sm:text-2xl font-bold text-green-600">
                {{ formatCurrency(summaryData.totalProfit) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Ref } from "vue";
import { useCurrency } from "../../composables/useCurrency";

definePageMeta({
  layout: "default",
});

const { formatCurrency } = useCurrency();

// Data
const transactions: Ref<any[]> = ref([]);
const loading = ref(false);
const searchQuery = ref("");
const dateRange = ref("all");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalPages = ref(0);
const totalCount = ref(0);
const summaryData = ref({
  totalRevenue: 0,
  totalProfit: 0,
  totalCost: 0,
  totalItemsSold: 0,
  transactionCount: 0,
});

// Computed
const summary = computed(() => {
  return {
    totalRevenue: summaryData.value.totalRevenue,
    totalProfit: summaryData.value.totalProfit,
    totalItemsSold: summaryData.value.totalItemsSold,
    transactionCount: summaryData.value.transactionCount,
    avgItemsPerTransaction:
      summaryData.value.transactionCount > 0
        ? summaryData.value.totalItemsSold / summaryData.value.transactionCount
        : 0,
  };
});

const profitMargin = computed(() => {
  if (summary.value.totalRevenue === 0) return 0;
  return (
    (summary.value.totalProfit / summary.value.totalRevenue) *
    100
  ).toFixed(2);
});

// Methods
const fetchTransactions = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      limit: itemsPerPage.value.toString(),
      dateRange: dateRange.value,
      search: searchQuery.value,
    });

    const response = await $fetch<any>(`/api/transactions?${params}`);
    transactions.value = response.transactions || [];
    totalPages.value = response.pagination.totalPages || 1;
    totalCount.value = response.pagination.totalCount || 0;
    summaryData.value = response.summary || {
      totalRevenue: 0,
      totalProfit: 0,
      totalCost: 0,
      totalItemsSold: 0,
      transactionCount: 0,
    };
  } catch (error) {
    console.error("Error loading transactions:", error);
  } finally {
    loading.value = false;
  }
};

const setItemsPerPage = (limit: number) => {
  itemsPerPage.value = limit;
  currentPage.value = 1;
  fetchTransactions();
};

const refreshData = async () => {
  currentPage.value = 1;
  await fetchTransactions();
};

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString("id-ID", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const deleteTransaction = async (transactionId: string) => {
  if (!confirm("Hapus transaksi ini? Aksi tidak bisa dibalik!")) {
    return;
  }

  try {
    await $fetch(`/api/transactions/${transactionId}`, {
      method: "DELETE",
    });
    await fetchTransactions();
    alert("✓ Transaksi berhasil dihapus");
  } catch (error: any) {
    alert(
      "❌ Gagal hapus transaksi: " +
        (error.message || error.data?.message || "Error"),
    );
  }
};

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchTransactions();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchTransactions();
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchTransactions();
  }
};

// Watch for filter changes to reset pagination
watch([searchQuery, dateRange], () => {
  currentPage.value = 1;
  fetchTransactions();
});

// Lifecycle
onMounted(() => {
  fetchTransactions();
});
</script>
