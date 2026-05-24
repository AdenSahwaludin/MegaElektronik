<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="fixed inset-0 bg-black/40" @click="close" />

    <div class="bg-white rounded-lg w-11/12 max-w-3xl p-6 z-10 shadow-lg">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold">Detail Transaksi</h3>
        <button @click="close" class="text-gray-500 hover:text-gray-700">
          Tutup
        </button>
      </div>

      <div v-if="loading" class="py-8 text-center text-gray-600">
        Loading...
      </div>

      <div v-else>
        <p class="text-sm text-gray-600">
          Tanggal: {{ formatDate(transaction.createdAt) }}
          {{ formatTime(transaction.createdAt) }}
        </p>
        <table class="w-full mt-4 text-sm border-collapse">
          <thead class="text-left text-xs text-gray-500 uppercase tracking-wider border-b-2 border-gray-300">
            <tr>
              <th class="py-3 px-2">Produk</th>
              <th class="py-3 px-2 text-right w-16">Qty</th>
              <th class="py-3 px-2 text-right w-24">Harga Jual</th>
              <th class="py-3 px-2 text-right w-24">Subtotal</th>
              <th class="py-3 px-2 text-right w-36">Untung</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="it in transaction.transactionItems"
              :key="it.id"
              class="even:bg-orange-50/30 transition-colors border-b border-gray-100"
            >
              <td class="py-3 px-2">
                <p class="font-bold text-gray-900">{{ it.product?.name }}</p>
                <p class="text-[10px] text-gray-400 uppercase tracking-tight">HPP: {{ formatCurrency(it.buyPrice) }}</p>
              </td>
              <td class="py-3 px-2 text-right font-bold text-gray-500">
                {{ it.quantity }}
              </td>
              <td class="py-3 px-2 text-right text-gray-600 font-medium">
                {{ formatCurrency(it.soldPrice) }}
              </td>
              <td class="py-3 px-2 text-right font-bold text-gray-900">
                {{ formatCurrency(it.subtotal) }}
              </td>
              <td class="py-3 px-2 text-right">
                <p class="font-black text-green-700 leading-none mb-1">{{ formatCurrency(it.totalProfit) }}</p>
                <p class="text-[10px] text-gray-500 flex items-center justify-end gap-1">
                  <span class="font-bold text-gray-700">{{ formatCurrency(it.profitPerItem) }}</span>
                  <span class="text-green-600 font-bold">/ {{ calculateMargin(it) }}%</span>
                </p>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-col gap-4">
          <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500">Total Omset:</span>
              <span class="font-bold text-gray-900 text-lg">{{ formatCurrency(transaction.totalAmount) }}</span>
            </div>
            <div class="flex items-center gap-2 text-green-700">
              <span class="text-xs font-bold uppercase tracking-wider">Total Untung:</span>
              <span class="font-black text-xl">{{ formatCurrency(transaction.totalProfit) }}</span>
              <span class="text-sm font-bold">/ {{ ((transaction.totalProfit / (transaction.totalAmount || 1)) * 100).toFixed(1) }}%</span>
            </div>
          </div>
          <div v-if="transaction.paidAmount != null" class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-200">
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500">Jumlah Bayar:</span>
              <span class="font-bold text-gray-900 text-lg">{{ formatCurrency(transaction.paidAmount) }}</span>
            </div>
            <div class="flex items-center gap-2 text-orange-600">
              <span class="text-xs font-bold uppercase tracking-wider">Kembalian:</span>
              <span class="font-black text-xl">{{ formatCurrency(transaction.paidAmount - transaction.totalAmount) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useCurrency } from "../../composables/useCurrency";

const props = defineProps<{ transactionId: string | number | null }>();
const emit = defineEmits(["close"]);
const { formatCurrency } = useCurrency();

const transaction = ref<any>({ transactionItems: [] });
const loading = ref(false);

const fetchDetail = async () => {
  if (!props.transactionId) return;
  loading.value = true;
  try {
    transaction.value = await $fetch(
      `/api/transactions/${props.transactionId}`,
    );
  } catch (err) {
    console.error("Failed fetch transaction detail", err);
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.transactionId,
  () => {
    fetchDetail();
  },
  { immediate: true },
);

const formatDate = (s: string) =>
  new Date(s).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
const formatTime = (s: string) =>
  new Date(s).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

const calculateMargin = (it: any) => {
  if (!it.soldPrice) return "0";
  return ((it.profitPerItem / it.soldPrice) * 100).toFixed(1);
};

const close = () => emit("close");
</script>
