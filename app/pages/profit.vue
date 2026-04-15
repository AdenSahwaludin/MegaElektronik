<template>
  <div
    class="h-screen w-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col overflow-hidden"
  >
    <!-- Header -->
    <header
      class="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4 shadow-lg"
    >
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold">Financial Report</h1>
        <div class="flex items-center gap-6">
          <div class="text-right">
            <p class="text-sm opacity-75">Today's Date</p>
            <p class="text-xl font-semibold">
              {{ new Date().toLocaleDateString("id-ID") }}
            </p>
          </div>
          <NuxtLink
            to="/pos"
            class="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition"
          >
            ← Back to POS
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto p-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Total Revenue Card -->
        <div
          class="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white shadow-xl"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm opacity-75 mb-1">Total Revenue</p>
              <p class="text-4xl font-bold">
                {{ formatCurrency(summary.totalRevenue) }}
              </p>
            </div>
            <div class="text-6xl opacity-20">💰</div>
          </div>
          <p class="text-sm mt-4 opacity-75">
            From {{ summary.transactionCount }} transactions
          </p>
        </div>

        <!-- Total Profit Card -->
        <div
          class="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-6 text-white shadow-xl"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm opacity-75 mb-1">Total Net Profit</p>
              <p class="text-4xl font-bold">
                {{ formatCurrency(summary.totalProfit) }}
              </p>
            </div>
            <div class="text-6xl opacity-20">📈</div>
          </div>
          <p class="text-sm mt-4 opacity-75">
            Profit Margin: {{ profitMargin }}%
          </p>
        </div>

        <!-- Items Sold Card -->
        <div
          class="bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl p-6 text-white shadow-xl"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm opacity-75 mb-1">Total Items Sold</p>
              <p class="text-4xl font-bold">{{ summary.totalItemsSold }}</p>
            </div>
            <div class="text-6xl opacity-20">📦</div>
          </div>
          <p class="text-sm mt-4 opacity-75">
            {{ summary.avgItemsPerTransaction.toFixed(1) }} per transaction
          </p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white/10 backdrop-blur rounded-lg p-4 mb-6">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <label class="block text-white text-sm font-semibold mb-2"
              >Search by Product/Customer:</label
            >
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Type to filter..."
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div class="flex-1">
            <label class="block text-white text-sm font-semibold mb-2"
              >Date Range:</label
            >
            <select
              v-model="dateRange"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="refreshData"
              class="w-full px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      <!-- Transaction History Table -->
      <div
        class="bg-white/95 backdrop-blur rounded-xl shadow-xl overflow-hidden"
      >
        <div
          class="px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white"
        >
          <h2 class="text-2xl font-bold">Transaction History</h2>
          <p class="text-sm opacity-75">
            {{ filteredTransactions.length }} transactions found
          </p>
        </div>

        <div v-if="loading" class="flex items-center justify-center py-20">
          <p class="text-gray-500">Loading transactions...</p>
        </div>

        <div
          v-else-if="filteredTransactions.length === 0"
          class="flex items-center justify-center py-20"
        >
          <p class="text-gray-500">No transactions found</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-100 border-b border-gray-300">
              <tr>
                <th
                  class="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                >
                  Date/Time
                </th>
                <th
                  class="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                >
                  Customer
                </th>
                <th
                  class="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                >
                  Product Details
                </th>
                <th
                  class="px-4 py-3 text-right text-sm font-semibold text-gray-700"
                >
                  Buy Price
                </th>
                <th
                  class="px-4 py-3 text-right text-sm font-semibold text-gray-700"
                >
                  Sold Price
                </th>
                <th
                  class="px-4 py-3 text-right text-sm font-semibold text-gray-700"
                >
                  Qty
                </th>
                <th
                  class="px-4 py-3 text-right text-sm font-semibold text-gray-700"
                >
                  Profit/Item
                </th>
                <th
                  class="px-4 py-3 text-right text-sm font-semibold text-gray-700"
                >
                  Total Profit
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <template
                v-for="transaction in filteredTransactions"
                :key="transaction.id"
              >
                <tr
                  v-for="(item, index) in transaction.transactionItems"
                  :key="item.id"
                  :class="index === 0 ? 'bg-blue-50' : 'bg-white'"
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
                    <span v-else class="text-gray-400">Anonymous</span>
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
                    class="px-4 py-3 text-right text-sm font-mono font-semibold text-blue-600"
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
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Table Footer -->
        <div
          v-if="filteredTransactions.length > 0"
          class="bg-gray-100 border-t border-gray-300 px-6 py-4"
        >
          <div class="grid grid-cols-3 gap-6 text-right">
            <div>
              <p class="text-sm text-gray-600">Total Revenue</p>
              <p class="text-2xl font-bold text-blue-600">
                {{ formatCurrency(filteredTotalRevenue) }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Total Cost</p>
              <p class="text-2xl font-bold text-orange-600">
                {{ formatCurrency(filteredTotalCost) }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Net Profit</p>
              <p class="text-2xl font-bold text-green-600">
                {{ formatCurrency(filteredTotalProfit) }}
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

// Computed
const summary = computed(() => {
  const totalRevenue = transactions.value.reduce(
    (sum, t) => sum + t.totalAmount,
    0,
  );
  const totalProfit = transactions.value.reduce(
    (sum, t) => sum + t.totalProfit,
    0,
  );
  const totalItemsSold = transactions.value.reduce(
    (sum, t) =>
      sum +
      t.transactionItems.reduce(
        (itemSum: number, item: any) => itemSum + item.quantity,
        0,
      ),
    0,
  );

  return {
    totalRevenue,
    totalProfit,
    totalItemsSold,
    transactionCount: transactions.value.length,
    avgItemsPerTransaction:
      transactions.value.length > 0
        ? totalItemsSold / transactions.value.length
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

const filteredTransactions = computed(() => {
  let filtered = transactions.value;

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.customer?.name.toLowerCase().includes(query) ||
        t.transactionItems.some(
          (item: any) =>
            item.product.name.toLowerCase().includes(query) ||
            item.product.brand.toLowerCase().includes(query) ||
            item.product.model.toLowerCase().includes(query),
        ),
    );
  }

  // Apply date filter
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  if (dateRange.value !== "all") {
    filtered = filtered.filter((t) => {
      const txDate = new Date(t.createdAt);
      if (dateRange.value === "today") return txDate >= today;
      if (dateRange.value === "week") return txDate >= weekStart;
      if (dateRange.value === "month") return txDate >= monthStart;
      return true;
    });
  }

  return filtered;
});

const filteredTotalRevenue = computed(() => {
  return filteredTransactions.value.reduce((sum, t) => sum + t.totalAmount, 0);
});

const filteredTotalCost = computed(() => {
  return filteredTransactions.value.reduce(
    (sum, t) =>
      sum +
      t.transactionItems.reduce(
        (itemSum: number, item: any) =>
          itemSum + item.product.buyPrice * item.quantity,
        0,
      ),
    0,
  );
});

const filteredTotalProfit = computed(() => {
  return filteredTotalRevenue.value - filteredTotalCost.value;
});

// Methods
const fetchTransactions = async () => {
  loading.value = true;
  try {
    const response = await $fetch("/api/transactions");
    transactions.value = response.transactions || [];
  } catch (error) {
    console.error("Error loading transactions:", error);
  } finally {
    loading.value = false;
  }
};

const refreshData = async () => {
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

// Lifecycle
onMounted(() => {
  fetchTransactions();
});
</script>
