<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" @click="close" />

    <!-- Modal Container -->
    <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col z-10 shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
      <!-- Modal Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-orange-500 text-white rounded-xl shadow-md shadow-orange-200">
            <Icon name="lucide:qr-code" class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900 leading-snug">
              {{ isBulk ? `QR Code Label Massal (${productsList.length} Produk)` : 'QR Code Label Produk' }}
            </h3>
            <p class="text-xs text-gray-500">Pratinjau, unduh, dan cetak stiker label QR Code</p>
          </div>
        </div>
        <button
          @click="close"
          class="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-xl transition-colors"
        >
          <Icon name="lucide:x" class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-6 overflow-y-auto flex-1 space-y-6">
        <!-- Controls Bar -->
        <div class="bg-gray-50 p-4 rounded-xl border border-gray-200/80 flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <label class="text-xs font-semibold text-gray-700">Jumlah Salinan Per Produk:</label>
            <input
              v-model.number="copyCount"
              type="number"
              min="1"
              max="50"
              class="w-20 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none font-bold text-center"
            />
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="$emit('scan-qr', productsList)"
              class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-amber-200 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              title="Scan QR Code Produk"
            >
              <Icon name="lucide:qr-code" class="w-4 h-4" />
              <span>Scan QR Produk</span>
            </button>
            <button
              @click="printLabels"
              class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-orange-200 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Icon name="lucide:printer" class="w-4 h-4" />
              <span>Cetak Label Stiker</span>
            </button>
          </div>
        </div>

        <!-- Products QR Preview List / Grid -->
        <div v-if="loading" class="py-12 text-center text-gray-500">
          <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-orange-500 mb-2" />
          <p class="text-sm font-medium">Memproses QR Code...</p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            v-for="(item, idx) in qrItems"
            :key="item.product.id || idx"
            class="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-between text-center relative group hover:border-orange-400 transition-colors shadow-xs"
          >
            <!-- Store / Brand Header -->
            <div class="w-full text-center pb-2 border-b border-gray-100 mb-3">
              <p class="text-[11px] font-black uppercase tracking-wider text-orange-600">MEGA ELEKTRONIK</p>
              <h4 class="text-xs font-bold text-gray-800 line-clamp-1 mt-0.5" :title="item.product.name">
                {{ item.product.name }}
              </h4>
            </div>

            <!-- QR Code Data Image -->
            <div class="bg-white p-2 rounded-xl shadow-inner border border-gray-100 my-1">
              <img
                v-if="item.qrUrl"
                :src="item.qrUrl"
                :alt="item.product.name"
                class="w-36 h-36 object-contain mx-auto"
              />
              <div v-else class="w-36 h-36 flex items-center justify-center text-xs text-gray-400">
                Gagal memuat
              </div>
            </div>

            <!-- Barcode / Code text & Price -->
            <div class="w-full mt-3 pt-2 border-t border-gray-100">
              <p class="text-[11px] font-mono font-bold text-gray-600">
                {{ getProductCode(item.product) }}
              </p>
              <p class="text-sm font-black text-gray-900 mt-0.5">
                {{ formatCurrency(item.product.sellPrice || item.product.price || 0) }}
              </p>
            </div>

            <!-- Download Button Overlay / Actions -->
            <div class="mt-3 w-full flex items-center justify-center gap-2">
              <button
                @click="downloadQrCode(item)"
                class="px-3 py-1.5 bg-gray-100 hover:bg-orange-100 text-gray-700 hover:text-orange-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Download QR PNG"
              >
                <Icon name="lucide:download" class="w-3.5 h-3.5" />
                <span>Unduh PNG</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
        <p class="text-xs text-gray-500">
          Format QR Code berisi kode barcode / SKU produk.
        </p>
        <button
          @click="close"
          class="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-bold transition-colors"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useCurrency } from '../../composables/useCurrency'

const props = defineProps<{
  isOpen: boolean
  products: any[] | any
}>()

const emit = defineEmits(['close', 'scan-qr'])
const { formatCurrency } = useCurrency()

const copyCount = ref(1)
const loading = ref(false)
const qrItems = ref<Array<{ product: any; qrUrl: string }>>([])

const productsList = computed(() => {
  if (!props.products) return []
  return Array.isArray(props.products) ? props.products : [props.products]
})

const isBulk = computed(() => productsList.value.length > 1)

function getProductCode(p: any): string {
  return p.barcode || p.sku || p.code || `PRD-${p.id}`
}

async function generateQrCodes() {
  if (!props.isOpen || productsList.value.length === 0) return
  loading.value = true
  qrItems.value = []

  try {
    const QRCode = await import('qrcode')
    const toDataURL = QRCode.toDataURL || (QRCode as any).default?.toDataURL

    const generated = await Promise.all(
      productsList.value.map(async (product) => {
        const codeValue = getProductCode(product)
        const qrUrl = toDataURL
          ? await toDataURL(codeValue, {
              width: 300,
              margin: 1,
              color: {
                dark: '#000000',
                light: '#ffffff'
              }
            })
          : ''
        return {
          product,
          qrUrl
        }
      })
    )
    qrItems.value = generated
  } catch (err) {
    console.error('Error generating QR codes:', err)
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.isOpen, props.products],
  () => {
    if (props.isOpen) {
      generateQrCodes()
    }
  },
  { immediate: true }
)

function downloadQrCode(item: { product: any; qrUrl: string }) {
  if (!item.qrUrl) return
  const link = document.createElement('a')
  const code = getProductCode(item.product)
  link.download = `QR_${item.product.name.replace(/[^a-zA-Z0-9]/g, '_')}_${code}.png`
  link.href = item.qrUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function printLabels() {
  if (qrItems.value.length === 0) return

  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Mohon izinkan pop-up window untuk mencetak label stiker.')
    return
  }

  // Build grid items repeated by copyCount
  const labelHtml = qrItems.value
    .map((item) => {
      const code = getProductCode(item.product)
      const price = formatCurrency(item.product.sellPrice || item.product.price || 0)
      const singleLabel = `
        <div class="label-sticker">
          <div class="label-store">MEGA ELEKTRONIK</div>
          <div class="label-name">${escapeHtml(item.product.name)}</div>
          <div class="label-qr"><img src="${item.qrUrl}" /></div>
          <div class="label-code">${escapeHtml(code)}</div>
          <div class="label-price">${price}</div>
        </div>
      `
      return singleLabel.repeat(Math.max(1, copyCount.value))
    })
    .join('')

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Cetak Label Stiker QR Code</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          * {
            box-sizing: border-box;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          body {
            margin: 0;
            padding: 0;
            background: #fff;
          }
          .grid-container {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 6mm;
            width: 100%;
          }
          .label-sticker {
            border: 1px dashed #cbd5e1;
            border-radius: 6px;
            padding: 6px;
            text-align: center;
            background: #fff;
            page-break-inside: avoid;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            height: 48mm;
          }
          .label-store {
            font-size: 8px;
            font-weight: 900;
            color: #ea580c;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }
          .label-name {
            font-size: 10px;
            font-weight: 700;
            color: #0f172a;
            margin: 2px 0;
            line-clamp: 2;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            line-height: 1.2;
          }
          .label-qr img {
            width: 25mm;
            height: 25mm;
            object-fit: contain;
          }
          .label-code {
            font-family: monospace;
            font-size: 9px;
            font-weight: 700;
            color: #475569;
          }
          .label-price {
            font-size: 11px;
            font-weight: 900;
            color: #0f172a;
          }
          @media print {
            .no-print { display: none; }
            .label-sticker { border: 1px solid #94a3b8; }
          }
        </style>
      </head>
      <body>
        <div class="grid-container">
          ${labelHtml}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        <\/script>
      </body>
    </html>
  `)
  printWindow.document.close()
}

function escapeHtml(str: string): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function close() {
  emit('close')
}
</script>
