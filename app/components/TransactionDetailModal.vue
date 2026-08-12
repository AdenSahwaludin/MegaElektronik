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

          <!-- QR Code Transaksi & Action Print Struk -->
          <div class="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="QR Transaksi" class="w-16 h-16 bg-white p-1 rounded border border-gray-300" />
              <div>
                <p class="text-xs font-bold text-gray-700">QR Code Struk Transaksi</p>
                <p class="text-[10px] text-gray-500 font-mono">TRX-{{ transaction.id }}</p>
              </div>
            </div>
            <button
              @click="printReceipt"
              class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition"
            >
              <Icon name="lucide:printer" class="w-4 h-4" />
              <span>Cetak Struk (dengan QR)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import QRCode from "qrcode";
import { useCurrency } from "../../composables/useCurrency";

const props = defineProps<{ transactionId: string | number | null }>();
const emit = defineEmits(["close"]);
const { formatCurrency } = useCurrency();

const transaction = ref<any>({ transactionItems: [] });
const loading = ref(false);
const qrCodeUrl = ref<string>("");

const fetchDetail = async () => {
  if (!props.transactionId) return;
  loading.value = true;
  qrCodeUrl.value = "";
  try {
    transaction.value = await $fetch(
      `/api/transactions/${props.transactionId}`,
    );
    // Generate QR Code for transaction
    const trxData = `TRX-${transaction.value.id}-${transaction.value.totalAmount}`;
    qrCodeUrl.value = await QRCode.toDataURL(trxData, { width: 200, margin: 1 });
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

const printReceipt = () => {
  if (!transaction.value) return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const itemsHtml = (transaction.value.transactionItems || [])
    .map(
      (it: any) => `
        <tr>
          <td style="padding: 4px 0;">${it.product?.name || 'Produk'}</td>
          <td style="text-align: center; padding: 4px 0;">${it.quantity}</td>
          <td style="text-align: right; padding: 4px 0;">${formatCurrency(it.soldPrice)}</td>
          <td style="text-align: right; padding: 4px 0;">${formatCurrency(it.subtotal)}</td>
        </tr>
      `
    )
    .join("");

  const tDate = transaction.value.createdAt ? formatDate(transaction.value.createdAt) + " " + formatTime(transaction.value.createdAt) : "";

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Struk Pembayaran TRX-${transaction.value.id}</title>
        <style>
          @page { size: 80mm 200mm; margin: 0; }
          body {
            font-family: 'Courier New', Courier, monospace;
            width: 76mm;
            margin: 0 auto;
            padding: 8px;
            font-size: 11px;
            color: #000;
          }
          .header { text-align: center; margin-bottom: 8px; }
          .header h2 { margin: 0; font-size: 14px; }
          .divider { border-top: 1px dashed #000; margin: 6px 0; }
          table { width: 100%; border-collapse: collapse; font-size: 10px; }
          .qr-container { text-align: center; margin-top: 10px; }
          .qr-container img { width: 70px; height: 70px; }
          .footer { text-align: center; font-size: 9px; margin-top: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>MEGA ELEKTRONIK</h2>
          <p style="margin: 2px 0;">Nota Pembayaran Toko</p>
          <p style="margin: 2px 0;">No: TRX-${transaction.value.id}</p>
          <p style="margin: 2px 0;">${tDate}</p>
        </div>
        <div class="divider"></div>
        <table>
          <thead>
            <tr>
              <th style="text-align: left;">Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Harga</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div class="divider"></div>
        <div style="display: flex; justify-content: space-between; font-weight: bold;">
          <span>TOTAL</span>
          <span>${formatCurrency(transaction.value.totalAmount)}</span>
        </div>
        ${
          transaction.value.paidAmount != null
            ? `
          <div style="display: flex; justify-content: space-between; margin-top: 2px;">
            <span>BAYAR</span>
            <span>${formatCurrency(transaction.value.paidAmount)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 2px;">
            <span>KEMBALI</span>
            <span>${formatCurrency(transaction.value.paidAmount - transaction.value.totalAmount)}</span>
          </div>
        `
            : ""
        }
        <div class="divider"></div>
        <div class="qr-container">
          <img src="${qrCodeUrl.value}" />
          <div style="font-size: 8px; margin-top: 2px;">Scan untuk Verifikasi Transaksi</div>
        </div>
        <div class="footer">
          <p style="margin: 4px 0;">Terima Kasih Atas Kunjungan Anda!</p>
          <p style="margin: 0;">Barang yang sudah dibeli tidak dapat ditukar.</p>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 200);
          }
        <\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

const close = () => emit("close");
</script>

