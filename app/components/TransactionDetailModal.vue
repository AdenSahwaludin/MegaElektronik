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

          <!-- Action Print Struk -->
          <div class="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p class="text-xs font-bold text-gray-700">No: TRX-{{ transaction.id }}</p>
            </div>
            <button
              @click="printReceipt"
              class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition"
            >
              <Icon name="lucide:printer" class="w-4 h-4" />
              <span>Cetak Struk</span>
            </button>
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

const printReceipt = () => {
  if (!transaction.value) return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const logoUrl = `${window.location.origin}/logo.png`;

  const itemsHtml = (transaction.value.transactionItems || [])
    .map(
      (it: any) => `
        <tr>
          <td style="padding: 10px 8px; font-weight: 600; text-align: left;">${it.product?.name || 'Produk'}</td>
          <td style="text-align: center; padding: 10px 8px; width: 90px;">${it.quantity}</td>
          <td style="text-align: right; padding: 10px 8px; width: 160px;">${formatCurrency(it.soldPrice)}</td>
          <td style="text-align: right; padding: 10px 8px; width: 160px; font-weight: 700;">${formatCurrency(it.subtotal)}</td>
        </tr>
      `
    )
    .join("");

  const tDate = transaction.value.createdAt ? formatDate(transaction.value.createdAt) + " " + formatTime(transaction.value.createdAt) : "";

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Struk Pembayaran - MEGA ELEKTRONIK</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm 12mm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            width: 100%;
            margin: 0;
            padding: 0;
            font-size: 13px;
            color: #111;
            line-height: 1.4;
          }
          .header {
            text-align: center;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 2px solid #111;
          }
          .logo {
            display: block;
            margin: 0 auto 8px auto;
            max-height: 70px;
            width: auto;
            object-fit: contain;
          }
          .header h2 {
            margin: 0 0 4px 0;
            font-size: 22px;
            font-weight: 900;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .header .subtitle {
            margin: 0 0 4px 0;
            font-size: 13px;
            color: #444;
            font-weight: 600;
          }
          .header .date {
            margin: 0;
            font-size: 12px;
            color: #666;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            font-size: 13px;
          }
          thead th {
            border-top: 1px solid #111;
            border-bottom: 2px solid #111;
            padding: 10px 8px;
            font-size: 12px;
            text-transform: uppercase;
            font-weight: 800;
            background-color: #f8fafc;
          }
          tbody td {
            border-bottom: 1px solid #e2e8f0;
          }
          .summary-section {
            margin-top: 16px;
            border-top: 2px solid #111;
            padding-top: 10px;
            width: 100%;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 5px 8px;
            font-size: 14px;
          }
          .summary-row.total {
            font-size: 18px;
            font-weight: 900;
            border-bottom: 1px dashed #cbd5e1;
            padding-bottom: 8px;
            margin-bottom: 6px;
          }
          .divider {
            border-top: 1px dashed #94a3b8;
            margin: 16px 0 12px 0;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            margin-top: 20px;
            color: #555;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${logoUrl}" alt="Logo Mega Elektronik" class="logo" onerror="this.style.display='none'" />
          <h2>MEGA ELEKTRONIK</h2>
          <p class="subtitle">Nota Pembayaran Toko</p>
          <p class="date">${tDate}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th style="text-align: left;">Nama Produk</th>
              <th style="text-align: center; width: 90px;">Qty</th>
              <th style="text-align: right; width: 160px;">Harga Satuan</th>
              <th style="text-align: right; width: 160px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div class="summary-section">
          <div class="summary-row total">
            <span>TOTAL PEMBAYARAN</span>
            <span>${formatCurrency(transaction.value.totalAmount)}</span>
          </div>
          ${
            transaction.value.paidAmount != null
              ? `
            <div class="summary-row">
              <span style="color: #475569; font-weight: 600;">JUMLAH BAYAR</span>
              <span style="font-weight: 700;">${formatCurrency(transaction.value.paidAmount)}</span>
            </div>
            <div class="summary-row">
              <span style="color: #ea580c; font-weight: 700;">KEMBALIAN</span>
              <span style="font-weight: 800; color: #ea580c;">${formatCurrency(transaction.value.paidAmount - transaction.value.totalAmount)}</span>
            </div>
          `
              : ""
          }
        </div>
        <div class="divider"></div>
        <div class="footer">
          <p style="margin: 4px 0; font-weight: 700;">Terima Kasih Atas Kunjungan Anda!</p>
          <p style="margin: 0; font-size: 11px; color: #64748b;">Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan.</p>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 250);
          }
        <\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

const close = () => emit("close");
</script>

