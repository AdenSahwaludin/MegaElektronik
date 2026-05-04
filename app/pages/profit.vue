<template>
  <div class="h-[100dvh] w-full bg-orange-50 flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom)]">
    <!-- App Header -->
    <AppHeader />

    <!-- Main Content -->
    <div class="mt-3 flex-1 overflow-y-auto p-4 lg:p-6 pt-20 lg:pt-24">
      <div class="max-w-7xl mx-auto">
        <h1
          class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"
        >
          <Icon name="lucide:bar-chart-3" class="w-8 h-8 text-orange-600" />
          Laporan Laba & Transaksi
        </h1>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div
            class="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500"
          >
            <p class="text-sm text-gray-600 mb-1">Total Omset</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ formatCurrency(summary.totalRevenue) }}
            </p>
          </div>
          <div
            class="bg-white p-6 rounded-lg shadow border-l-4 border-green-500 flex justify-between items-start"
          >
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
          <div
            class="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500"
          >
            <p class="text-sm text-gray-600 mb-1">Total Transaksi</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ summary.transactionCount }}
            </p>
          </div>
          <div
            class="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500"
          >
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
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Cari Transaksi</label
              >
              <div class="relative">
                <Icon
                  name="lucide:search"
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Cari nama pelanggan atau produk..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>
            <div class="lg:w-48">
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Rentang Waktu</label
              >
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
        <div class="bg-white rounded-lg shadow overflow-hidden min-h-[500px]">
          <div
            class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center"
          >
            <h2 class="font-bold text-gray-800">Riwayat Transaksi</h2>
            <button
              @click="fetchTransactions"
              class="text-orange-600 hover:text-orange-700 font-semibold text-sm flex items-center gap-1"
            >
              <Icon
                name="lucide:refresh-cw"
                :class="{ 'animate-spin': loading }"
              />
              Refresh Data
            </button>
          </div>

          <!-- Empty State -->
          <div
            v-if="transactions.length === 0"
            class="flex items-center justify-center py-20"
          >
            <p class="text-gray-500">Belum ada transaksi di periode ini.</p>
          </div>

          <!-- Table Content -->
          <div 
            v-show="transactions.length > 0" 
            class="overflow-x-auto"
          >
            <table class="w-full text-sm text-left border-collapse min-w-[700px]">
              <thead class="bg-gray-50 text-gray-700 uppercase font-bold text-xs border-b">
                <tr>
                  <th class="px-6 py-3 text-left w-24">Jam</th>
                  <th class="px-6 py-3 text-left">Produk</th>
                  <th class="px-6 py-3 text-right w-16">Qty</th>
                  <th class="px-6 py-3 text-right w-36">Total</th>
                  <th class="px-6 py-3 text-right w-36">Untung</th>
                  <th class="px-6 py-3 text-center w-28">Aksi</th>
                </tr>
              </thead>

              <tbody v-for="(group, date) in groupedTransactions" :key="date">
                <!-- Date Header Row -->
                <tr class="bg-orange-100/50">
                  <td colspan="6" class="px-6 py-2 border-y border-orange-200">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <Icon name="lucide:calendar" class="w-4 h-4 text-orange-600" />
                        <span class="font-bold text-gray-900">{{ date }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-[10px] font-bold text-gray-500 uppercase">Keuntungan {{ date }} :</span>
                        <span class="font-bold text-green-700">{{ formatCurrency(dailyProfits[date] || 0) }}</span>
                      </div>
                    </div>
                  </td>
                </tr>
                
                <tr
                  v-for="transaction in group"
                  :key="transaction.id"
                  class="hover:bg-orange-50 border-b border-gray-100 transition-colors"
                >
                  <td class="px-6 py-4 whitespace-nowrap align-middle">
                    <p class="text-sm font-medium text-gray-700">
                      {{ formatTime(transaction.createdAt) }}
                    </p>
                  </td>

                  <td class="px-6 py-4 align-middle">
                    <p class="font-semibold text-gray-900 whitespace-normal break-words max-w-[300px]">
                      {{ getTransactionProductTitle(transaction) }}
                    </p>
                    <p class="text-xs text-gray-500 mt-1 whitespace-normal break-words max-w-[300px]">
                      {{ getTransactionProductSubtitle(transaction) }}
                    </p>
                  </td>

                  <td class="px-6 py-4 text-right align-middle">
                    <span class="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-medium">
                      {{ getTransactionQuantity(transaction) }}
                    </span>
                  </td>

                  <td class="px-6 py-4 text-right align-middle font-bold text-gray-900">
                    {{ formatCurrency(transaction.totalAmount) }}
                  </td>
                  
                  <td class="px-6 py-4 text-right align-middle font-bold text-green-700">
                    {{ formatCurrency(transaction.totalProfit) }}
                  </td>

                  <td class="px-6 py-4 text-center align-middle">
                    <div class="flex items-center justify-center gap-2">
                      <button
                        @click="openDetail(transaction.id)"
                        class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold transition shadow-sm"
                      >
                        Detail
                      </button>
                      <button
                        @click="deleteTransaction(transaction.id)"
                        class="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition"
                        title="Hapus Transaksi"
                      >
                        <Icon name="lucide:trash-2" class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                <!-- Spacer after group -->
                <tr class="h-4 bg-orange-50/20"><td colspan="6"></td></tr>
              </tbody>
            </table>
          </div>

          <div
            v-if="!loading && transactions.length > 0"
            class="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50"
          >
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
                    : 'bg-white text-gray-700 hover:bg-orange-100 border border-gray-300',
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

        <TransactionDetailModal
          v-if="modalVisible"
          :transactionId="selectedTransactionId"
          @close="closeDetailModal"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useCurrency } from "../../composables/useCurrency";
import TransactionDetailModal from "../components/TransactionDetailModal.vue";

definePageMeta({
  layout: "default",
});

const { formatCurrency } = useCurrency();

// State
const transactions = ref<any[]>([]);
const dailyProfits = ref<Record<string, number>>({});
const totalCount = ref(0);
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
const dateRange = ref("all");
const searchQuery = ref("");
const modalVisible = ref(false);
const selectedTransactionId = ref<number | null>(null);

const openDetail = (id: number) => {
  selectedTransactionId.value = id;
  modalVisible.value = true;
};

const closeDetailModal = () => {
  modalVisible.value = false;
  selectedTransactionId.value = null;
};

// Computed
const markupPercentage = computed(() => {
  if (!summary.value.totalCost) return "0";
  return ((summary.value.totalProfit / summary.value.totalCost) * 100).toFixed(
    1,
  );
});

const groupedTransactions = computed(() => {
  const groups: Record<string, any[]> = {};

  transactions.value.forEach((transaction) => {
    const date = formatDate(transaction.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
  });

  return groups;
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

    const response = await $fetch<any>(
      `/api/transactions?${params.toString()}`,
    );
    transactions.value = response.transactions;
    dailyProfits.value = response.dailyProfits || {};
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

const getTransactionQuantity = (transaction: any) => {
  return (transaction.transactionItems || []).reduce(
    (sum: number, item: any) => sum + Number(item.quantity || 0),
    0,
  );
};

const getDailyProfit = (group: any[]) => {
  return group.reduce((sum, t) => sum + (t.totalProfit || 0), 0);
};

const getTransactionProductTitle = (transaction: any) => {
  const items = transaction.transactionItems || [];

  if (items.length === 0) return "-";
  if (items.length === 1) return items[0]?.product?.name || "-";

  const names = items.slice(0, 2).map((item: any) => item.product?.name || "-");
  return `${items.length} item — ${names.join(", ")}`;
};

const getTransactionProductSubtitle = (transaction: any) => {
  const items = transaction.transactionItems || [];

  if (items.length === 0) return "-";
  if (items.length === 1) {
    const brand = items[0]?.product?.brand || "";
    const model = items[0]?.product?.model || "";
    return `${brand} ${model}`.trim() || "-";
  }

  return items
    .map((item: any) => `${item.quantity}x ${item.product?.name || "-"}`)
    .join(", ");
};

const deleteTransaction = async (transactionId: string) => {
  if (
    !confirm(
      "Beneran mau hapus transaksi ini? Data yang diapus nggak bisa balik lagi lho!",
    )
  ) {
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
