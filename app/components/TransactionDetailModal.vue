<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="fixed inset-0 bg-black/40" @click="close" />

    <div class="bg-white rounded-lg w-11/12 max-w-3xl p-6 z-10 shadow-lg relative">
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

          <!-- Action Print Struk -->
          <div class="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p class="text-xs font-bold text-gray-700">No: TRX-{{ transaction.id }}</p>
            </div>
            
            <div class="flex items-center gap-2">
              <!-- iOS / iPhone Mode: Thermer Print with PDF Option -->
              <template v-if="isIOS">
                <button
                  @click="handlePrintThermer"
                  :disabled="isPrinting"
                  class="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed active:scale-95 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer"
                  title="Cetak Struk Thermal langsung ke Aplikasi Thermer"
                >
                  <Icon
                    :name="isPrinting ? 'lucide:loader-2' : 'lucide:printer'"
                    :class="['w-4 h-4', { 'animate-spin': isPrinting }]"
                  />
                  <span>{{ isPrinting ? "Membuka Thermer..." : "Cetak Struk (Thermer)" }}</span>
                </button>
                <button
                  @click="handlePrintBrowser"
                  :disabled="isPrinting"
                  class="px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 active:scale-95 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-gray-200 cursor-pointer"
                  title="Cetak format Browser / PDF"
                >
                  <Icon name="lucide:file-text" class="w-3.5 h-3.5 text-gray-500" />
                  <span class="hidden sm:inline">PDF</span>
                </button>
              </template>

              <!-- Android / Desktop Mode: Bluetooth + Browser Print -->
              <template v-else>
                <button
                  @click="handlePrintBluetooth"
                  :disabled="isPrinting"
                  class="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed active:scale-95 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer"
                  title="Cetak langsung via Bluetooth (ESC/POS)"
                >
                  <Icon
                    :name="isPrinting ? 'lucide:loader-2' : 'lucide:bluetooth'"
                    :class="['w-4 h-4', { 'animate-spin': isPrinting }]"
                  />
                  <span>{{ isPrinting ? 'Mencetak...' : 'Cetak Struk' }}</span>
                </button>
                <button
                  @click="handlePrintBrowser"
                  :disabled="isPrinting"
                  class="px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 active:scale-95 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-gray-200 cursor-pointer"
                  title="Cetak format Browser / PDF"
                >
                  <Icon name="lucide:file-text" class="w-3.5 h-3.5 text-gray-500" />
                  <span class="hidden sm:inline">PDF</span>
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fallback Modal (Bluetooth failed / Thermer not detected) -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isFallbackModalOpen"
        class="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      >
        <div class="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-100 flex flex-col gap-4">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-orange-100 text-orange-600 rounded-xl">
              <Icon name="lucide:alert-circle" class="w-6 h-6" />
            </div>
            <div>
              <h4 class="font-bold text-base text-gray-900">{{ isIOS ? 'Thermer Belum Terbuka' : 'Gagal Cetak Bluetooth' }}</h4>
              <p class="text-xs text-gray-500">Pilih opsi pencetakan struk di bawah</p>
            </div>
          </div>

          <p v-if="printError" class="text-sm text-red-600 bg-red-50 rounded-lg p-3">
            {{ printError }}
          </p>

          <p class="text-sm text-gray-600 leading-relaxed">
            <template v-if="isIOS">
              Jika aplikasi <strong class="text-gray-900">Thermer</strong> belum terinstal di iPhone Anda, unduh gratis dari App Store.
            </template>
            <template v-else>
              Pastikan printer Bluetooth sudah menyala dan dalam jangkauan. Anda bisa coba lagi atau cetak via browser.
            </template>
          </p>

          <div class="flex flex-col gap-2.5 pt-2">
            <!-- iOS: App Store button -->
            <button
              v-if="isIOS"
              @click="openAppStore"
              class="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
            >
              <Icon name="lucide:download" class="w-4 h-4" />
              <span>Buka Thermer di App Store</span>
            </button>

            <!-- Non-iOS: Retry Bluetooth -->
            <button
              v-if="!isIOS"
              @click="retryBluetooth"
              :disabled="isPrinting"
              class="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
            >
              <Icon :name="isPrinting ? 'lucide:loader-2' : 'lucide:bluetooth'" :class="['w-4 h-4', { 'animate-spin': isPrinting }]" />
              <span>{{ isPrinting ? 'Mencetak...' : 'Coba Lagi (Bluetooth)' }}</span>
            </button>

            <button
              @click="printFallbackBrowser"
              class="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 active:scale-98 text-gray-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition border border-gray-200 cursor-pointer"
            >
              <Icon name="lucide:file-text" class="w-4 h-4 text-gray-600" />
              <span>Cetak via Browser (PDF)</span>
            </button>

            <button
              @click="closeFallbackModal"
              class="w-full py-2 text-gray-400 hover:text-gray-600 text-xs font-semibold text-center transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useCurrency } from "../../composables/useCurrency";
import { useReceiptPrinter } from "../composables/useReceiptPrinter";

const props = defineProps<{ transactionId: string | number | null }>();
const emit = defineEmits(["close"]);
const { formatCurrency } = useCurrency();
const {
  isIOS,
  isPrinting,
  printError,
  isFallbackModalOpen,
  printReceipt,
  closeFallbackModal,
  printFallbackBrowser,
  retryBluetooth,
  openAppStore,
} = useReceiptPrinter();

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

// Print Handlers
const handlePrintThermer = () => {
  printReceipt(transaction.value, "thermer");
};

const handlePrintBrowser = () => {
  printReceipt(transaction.value, "browser");
};

const handlePrintBluetooth = () => {
  printReceipt(transaction.value, "bluetooth");
};

const close = () => emit("close");
</script>
