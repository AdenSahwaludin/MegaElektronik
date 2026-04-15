<template>
  <div class="min-h-screen w-screen bg-orange-50 flex flex-col overflow-hidden">
    <!-- Header -->
    <header
      class="bg-orange-600 text-white px-4 lg:px-6 py-4 shadow-lg fixed w-full top-0 z-50"
    >
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-2 lg:gap-3">
          <img
            src="/Logo Mega Elektronik Bongas Merah no-bg.png"
            alt="Mega Elektronik"
            class="h-8 lg:h-10 w-auto"
          />
          <h1 class="text-lg lg:text-2xl font-bold hidden sm:block">
            Financial Report
          </h1>
        </div>
        <div class="flex items-center gap-2 lg:gap-6">
          <div class="text-right hidden sm:block">
            <p class="text-xs lg:text-sm opacity-75">Today's Date</p>
            <p class="text-base lg:text-lg font-semibold">
              {{ new Date().toLocaleDateString("id-ID") }}
            </p>
          </div>
          <NuxtLink
            to="/pos"
            class="px-4 lg:px-6 py-2 bg-white hover:bg-orange-50 text-orange-600 font-semibold text-sm lg:text-base rounded-lg transition"
          >
            ← Back to POS
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto p-4 lg:p-6 mt-16">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8">
        <!-- Total Revenue Card -->
        <div class="bg-blue-500 rounded-xl p-6 text-white shadow-xl">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm opacity-75 mb-1">Total Revenue</p>
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
            From {{ summary.transactionCount }} transactions
          </p>
        </div>

        <!-- Total Profit Card -->
        <div class="bg-green-500 rounded-xl p-6 text-white shadow-xl">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm opacity-75 mb-1">Total Net Profit</p>
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
            Profit Margin: {{ profitMargin }}%
          </p>
        </div>

        <!-- Items Sold Card -->
        <div class="bg-orange-500 rounded-xl p-6 text-white shadow-xl">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm opacity-75 mb-1">Total Items Sold</p>
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
            {{ summary.avgItemsPerTransaction.toFixed(1) }} per transaction
          </p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg p-4 mb-6 shadow">
        <div class="flex flex-col lg:flex-row gap-4">
          <div class="flex-1">
            <label class="block text-gray-700 text-sm font-semibold mb-2"
              >Search by Product/Customer:</label
            >
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Type to filter..."
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div class="flex-1">
            <label class="block text-gray-700 text-sm font-semibold mb-2"
              >Date Range:</label
            >
            <select
              v-model="dateRange"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              class="w-full lg:w-auto px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      <!-- Transaction History Table -->
      <div class="bg-white rounded-xl shadow-xl overflow-hidden">
        <div class="px-6 py-4 bg-orange-600 text-white">
          <h2 class="text-xl lg:text-2xl font-bold">Transaction History</h2>
          <p class="text-sm opacity-75">
            {{ filteredTransactions.length }} transactions found
          </p>
        </div>

        <div v-if="loading" class="flex items-center justify-center py-20">
          <p class="text-gray-500 flex items-center gap-2">
            <Icon name="lucide:loader" class="w-5 h-5 animate-spin" />
            Loading transactions...
          </p>
        </div>

        <div
          v-else-if="filteredTransactions.length === 0"
          class="flex items-center justify-center py-20"
        >
          <p class="text-gray-500 flex items-center gap-2">
            <Icon name="lucide:inbox" class="w-5 h-5" />
            No transactions found
          </p>
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
                  :class="index === 0 ? 'bg-orange-50' : 'bg-white'"
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
