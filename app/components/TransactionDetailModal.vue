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
        <p class="text-sm text-gray-600">
          Pelanggan: {{ transaction.customer?.name || "Umum" }}
        </p>

        <table class="w-full mt-4 text-sm">
          <thead class="text-left text-xs text-gray-600 border-b">
            <tr>
              <th class="py-2">Produk</th>
              <th class="py-2 text-right w-20">Qty</th>
              <th class="py-2 text-right w-28">Harga</th>
              <th class="py-2 text-right w-32">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="it in transaction.transactionItems"
              :key="it.id"
              class="border-b last:border-b-0"
            >
              <td class="py-2">{{ it.product?.name }}</td>
              <td class="py-2 text-right">{{ it.quantity }}</td>
              <td class="py-2 text-right">
                {{ formatCurrency(it.soldPrice) }}
              </td>
              <td class="py-2 text-right">{{ formatCurrency(it.subtotal) }}</td>
            </tr>
          </tbody>
        </table>

        <div class="mt-4 text-right">
          <p>
            Total:
            <span class="font-bold">{{
              formatCurrency(transaction.totalAmount)
            }}</span>
          </p>
          <p>
            Untung:
            <span class="font-semibold text-green-600">{{
              formatCurrency(transaction.totalProfit)
            }}</span>
          </p>
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

const close = () => emit("close");
</script>
