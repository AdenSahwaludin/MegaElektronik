<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex flex-col bg-black/90 text-white select-none backdrop-blur-xs overflow-hidden font-sans"
      >
        <!-- Top Bar Header -->
        <div class="relative z-20 flex items-center justify-between px-4 py-3 bg-gray-900/80 backdrop-blur-md border-b border-white/10 shadow-md">
          <div class="flex items-center gap-2">
            <div class="p-2 rounded-lg bg-orange-500/20 text-orange-400">
              <Icon name="lucide:scan-line" class="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-bold leading-tight text-white">Scan Barcode Produk</h3>
                <span class="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full tracking-wider animate-pulse">POS</span>
              </div>
              <p class="text-xs text-gray-400">Arahkan kamera ke barcode atau QR code</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- Flash / Torch Button (if supported) -->
            <button
              v-if="hasTorchSupport"
              @click="toggleTorch"
              type="button"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer"
              :class="isTorchOn ? 'bg-amber-500 text-gray-950 border-amber-400 font-bold shadow-lg shadow-amber-500/30' : 'bg-gray-800/80 text-gray-300 border-gray-700 hover:bg-gray-700'"
            >
              <Icon name="lucide:zap" class="w-4 h-4" :class="{ 'fill-current': isTorchOn }" />
              <span>Flash {{ isTorchOn ? 'ON' : 'OFF' }}</span>
            </button>

            <!-- Close Button -->
            <button
              @click="closeScanner"
              type="button"
              class="p-2 rounded-lg bg-gray-800/80 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors cursor-pointer"
              title="Tutup (Esc)"
            >
              <Icon name="lucide:x" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Camera / Scanner View Container -->
        <div class="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          <!-- HTML5 Video element -->
          <video
            ref="videoRef"
            class="absolute inset-0 w-full h-full object-cover"
            playsinline
            muted
            autoplay
          ></video>

          <!-- Error Overlay State -->
          <div v-if="cameraError" class="relative z-30 max-w-sm mx-4 p-6 bg-gray-900/90 rounded-2xl border border-red-500/40 text-center shadow-2xl backdrop-blur-md">
            <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
              <Icon name="lucide:camera-off" class="w-6 h-6" />
            </div>
            <h4 class="text-lg font-bold text-white mb-1">Kamera Tidak Aktif</h4>
            <p class="text-sm text-gray-300 mb-4">{{ cameraError }}</p>
            <button
              @click="initCamera"
              type="button"
              class="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-600/30 cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>

          <!-- Loading Camera State -->
          <div v-else-if="isLoadingCamera" class="relative z-30 flex flex-col items-center gap-3">
            <div class="w-10 h-10 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
            <p class="text-sm font-medium text-gray-300">Menyiapkan kamera...</p>
          </div>

          <!-- Target Scanning Frame & Overlay Grid (when camera is running) -->
          <template v-else>
            <!-- Dim Backdrop Overlay around target window -->
            <div class="absolute inset-0 z-10 pointer-events-none flex flex-col">
              <!-- Top mask -->
              <div class="bg-black/40 flex-1"></div>
              
              <!-- Middle strip containing clear window -->
              <div class="flex h-56 sm:h-64">
                <div class="bg-black/40 flex-1"></div>
                <!-- Target Box (Scan Window) -->
                <div ref="targetBoxRef" class="relative w-72 sm:w-80 h-full">
                  <!-- Corner Borders -->
                  <div class="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-orange-400 rounded-tl-lg"></div>
                  <div class="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-orange-400 rounded-tr-lg"></div>
                  <div class="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-orange-400 rounded-bl-lg"></div>
                  <div class="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-orange-400 rounded-br-lg"></div>

                  <!-- Animated Laser Beam -->
                  <div
                    class="absolute left-1 right-1 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_#ef4444] animate-scan-beam"
                    :class="{ 'opacity-30': isLocked }"
                  ></div>

                  <!-- Success Pulse Flash inside target window -->
                  <div
                    v-if="showSuccessFlash"
                    class="absolute inset-0 bg-emerald-500/30 border-2 border-emerald-400 rounded-lg animate-pulse"
                  ></div>
                </div>
                <div class="bg-black/40 flex-1"></div>
              </div>

              <!-- Bottom mask -->
              <div class="bg-black/40 flex-1 flex items-start justify-center pt-6 px-4">
                <div class="text-center bg-gray-900/75 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                  <p class="text-xs sm:text-sm font-medium text-gray-200">
                    Arahkan kamera ke barcode atau QR code
                  </p>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Scanned Item Toast Badge (Appears inside camera overlay) -->
        <div v-if="lastScannedItem || lastScannedName" class="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-30 transition-all transform duration-300">
          <div class="inline-flex items-center gap-2 bg-emerald-600/95 text-white px-4 py-2 rounded-full shadow-xl border border-emerald-400/40 backdrop-blur-md text-xs sm:text-sm font-bold animate-bounce">
            <Icon name="lucide:check-circle" class="w-4 h-4 text-emerald-200" />
            <span>+1 {{ lastScannedItem || lastScannedName }}</span>
          </div>
        </div>

        <!-- Scanner Cart Panel Bar & Expandable Drawer -->
        <div v-if="cartItems && cartItems.length > 0" class="relative z-30 bg-gray-900/95 border-t border-white/10 backdrop-blur-xl transition-all">
          <!-- Expandable Cart Items Drawer Sheet -->
          <div v-if="isCartDrawerOpen" class="max-h-60 sm:max-h-72 overflow-y-auto p-4 space-y-2 border-b border-white/10 bg-gray-950/80">
            <div class="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              <span>Item Di Keranjang ({{ totalItemsCount }})</span>
              <span>Subtotal</span>
            </div>

            <div
              v-for="item in cartItems"
              :key="getItemKey(item)"
              class="flex items-center justify-between p-2.5 bg-gray-900/90 border border-white/10 rounded-xl text-xs sm:text-sm gap-2"
            >
              <div class="min-w-0 flex-1 pr-1">
                <p class="font-semibold text-white truncate">{{ getItemName(item) }}</p>
                <p class="text-[11px] text-gray-400 font-mono">{{ formatRupiah(getItemPrice(item)) }}</p>
              </div>

              <!-- Quantity Controls (- / + / delete) -->
              <div class="flex items-center gap-1 shrink-0">
                <button
                  @click.stop="emit('decrement-qty', getItemId(item))"
                  type="button"
                  class="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white border border-white/15 active:scale-95 transition-all cursor-pointer"
                  title="Kurangi 1"
                >
                  <Icon name="lucide:minus" class="w-3.5 h-3.5" />
                </button>

                <span class="w-7 text-center font-extrabold text-white text-xs sm:text-sm font-mono">
                  {{ getItemQty(item) }}
                </span>

                <button
                  @click.stop="emit('increment-qty', getItemId(item))"
                  type="button"
                  class="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white border border-white/15 active:scale-95 transition-all cursor-pointer"
                  title="Tambah 1"
                >
                  <Icon name="lucide:plus" class="w-3.5 h-3.5" />
                </button>

                <button
                  @click.stop="emit('remove-item', getItemId(item))"
                  type="button"
                  class="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/30 active:scale-95 transition-all ml-1 cursor-pointer"
                  title="Hapus dari keranjang"
                >
                  <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
                </button>
              </div>

              <div class="text-right font-extrabold text-emerald-400 min-w-16">
                {{ formatRupiah(getItemSubtotal(item)) }}
              </div>
            </div>
          </div>

          <!-- Bottom Control & Summary Bar -->
          <div class="px-4 py-3 flex items-center justify-between gap-3">
            <!-- Left: Cart Summary & Toggle -->
            <button
              @click="isCartDrawerOpen = !isCartDrawerOpen"
              type="button"
              class="flex items-center gap-2.5 text-left hover:opacity-90 transition-opacity cursor-pointer"
            >
              <div class="relative p-2 rounded-xl bg-orange-600/30 text-orange-400 border border-orange-500/30">
                <Icon name="lucide:shopping-cart" class="w-5 h-5" />
                <span class="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 text-[10px] font-black bg-orange-500 text-white rounded-full min-w-4 text-center">
                  {{ totalItemsCount }}
                </span>
              </div>
              <div>
                <div class="flex items-center gap-1">
                  <span class="text-xs font-bold text-gray-300">Keranjang Transaksi</span>
                  <Icon :name="isCartDrawerOpen ? 'lucide:chevron-down' : 'lucide:chevron-up'" class="w-3.5 h-3.5 text-gray-400" />
                </div>
                <p class="text-sm sm:text-base font-extrabold text-emerald-400">
                  {{ formatRupiah(totalAmount || 0) }}
                </p>
              </div>
            </button>

            <!-- Right: Action Buttons -->
            <div class="flex items-center gap-2">
              <button
                @click="handlePayFromScanner"
                type="button"
                class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Bayar / Transaksi</span>
                <Icon name="lucide:arrow-right" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Bottom Scanner Status Bar -->
        <div class="relative z-20 px-4 py-2.5 bg-gray-950/90 border-t border-white/10 text-center text-xs text-gray-400 flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full" :class="isLocked ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'"></span>
            <span>{{ isLocked ? 'Memproses barcode...' : 'Kamera Aktif (Siap Scan)' }}</span>
          </div>

          <div class="text-[11px] font-mono text-gray-500">
            Engine: {{ activeEngine }}
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { useAudioBeep } from '~/composables/useAudioBeep'

const props = withDefaults(
  defineProps<{
    isOpen: boolean
    autoCloseOnScan?: boolean
    cartItems?: any[]
    totalAmount?: number
    lastScannedItem?: string
    lastScannedName?: string
  }>(),
  {
    autoCloseOnScan: false,
    cartItems: () => [],
    totalAmount: 0,
    lastScannedItem: '',
    lastScannedName: ''
  }
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'scan', barcode: string): void
  (e: 'pay'): void
  (e: 'increment-qty', productId: any): void
  (e: 'decrement-qty', productId: any): void
  (e: 'update-qty', productId: any, qty: number): void
  (e: 'remove-item', productId: any): void
}>()

const isCartDrawerOpen = ref(false)

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0)
}

function getItemKey(item: any) {
  return item.product?.id || item.produk?.id || item.productId || item.id
}
function getItemId(item: any) {
  return item.product?.id || item.produk?.id || item.productId || item.id
}
function getItemName(item: any) {
  return item.product?.name || item.produk?.name || item.name || 'Produk'
}
function getItemPrice(item: any) {
  return item.product?.fixedPrice || item.product?.askingPrice || item.produk?.price || item.price || item.agreedPrice || 0
}
function getItemQty(item: any) {
  return item.quantity || item.qty || 1
}
function getItemSubtotal(item: any) {
  if (item.subtotal !== undefined) return item.subtotal
  return getItemPrice(item) * getItemQty(item)
}

const totalItemsCount = computed(() => {
  return (props.cartItems || []).reduce((sum, item) => sum + getItemQty(item), 0)
})

function handlePayFromScanner() {
  emit('pay')
  closeScanner()
}

const videoRef = ref<HTMLVideoElement | null>(null)
const targetBoxRef = ref<HTMLElement | null>(null)
const isLoadingCamera = ref(true)
const cameraError = ref<string | null>(null)
const isTorchOn = ref(false)
const hasTorchSupport = ref(false)
const isLocked = ref(false)
const showSuccessFlash = ref(false)
const activeEngine = ref<'BarcodeDetector' | 'ZXing' | 'None'>('None')

let mediaStream: MediaStream | null = null
let mediaTrack: MediaStreamTrack | null = null
let animFrameId: number | null = null
let barcodeDetector: any = null
let zxingReader: any = null
let lockTimer: any = null
let roiCanvas: HTMLCanvasElement | null = null
let roiCtx: CanvasRenderingContext2D | null = null
let roiRotCanvas: HTMLCanvasElement | null = null
let roiRotCtx: CanvasRenderingContext2D | null = null
let fullCanvas: HTMLCanvasElement | null = null
let fullCtx: CanvasRenderingContext2D | null = null
let fullRotCanvas: HTMLCanvasElement | null = null
let fullRotCtx: CanvasRenderingContext2D | null = null
let lastScanTime = 0
let isDetecting = false
let scanPassCount = 0

const { unlockAudio } = useAudioBeep()

function computeRoi(vw: number, vh: number) {
  let roiX = 0, roiY = 0, roiW = vw, roiH = vh

  if (targetBoxRef.value && videoRef.value) {
    const vRect = videoRef.value.getBoundingClientRect()
    const tRect = targetBoxRef.value.getBoundingClientRect()
    if (vRect.width && vRect.height && tRect.width && tRect.height) {
      const scale = Math.max(vRect.width / vw, vRect.height / vh)
      const offsetX = (vRect.width - vw * scale) / 2
      const offsetY = (vRect.height - vh * scale) / 2

      const padX = tRect.width * 0.15
      const padY = tRect.height * 0.15

      roiX = (tRect.left - padX - vRect.left - offsetX) / scale
      roiY = (tRect.top - padY - vRect.top - offsetY) / scale
      roiW = (tRect.width + padX * 2) / scale
      roiH = (tRect.height + padY * 2) / scale

      roiX = Math.max(0, roiX)
      roiY = Math.max(0, roiY)
      if (roiX + roiW > vw) roiW = vw - roiX
      if (roiY + roiH > vh) roiH = vh - roiY
    }
  } else {
    roiX = vw * 0.15
    roiY = vh * 0.15
    roiW = vw * 0.7
    roiH = vh * 0.7
  }

  return { roiX, roiY, roiW, roiH }
}

// 0 degrees normal ROI (uncompressed native pixels)
function getRoiCanvas(): HTMLCanvasElement | null {
  if (!videoRef.value) return null
  const video = videoRef.value
  const vw = video.videoWidth
  const vh = video.videoHeight
  if (!vw || !vh) return null

  const { roiX, roiY, roiW, roiH } = computeRoi(vw, vh)
  if (roiW <= 0 || roiH <= 0) return null

  if (!roiCanvas) {
    roiCanvas = document.createElement('canvas')
    roiCtx = roiCanvas.getContext('2d', { willReadFrequently: true })
  }

  const targetW = Math.round(roiW)
  const targetH = Math.round(roiH)

  if (roiCanvas.width !== targetW || roiCanvas.height !== targetH) {
    roiCanvas.width = targetW
    roiCanvas.height = targetH
  }

  if (roiCtx) {
    roiCtx.drawImage(video, roiX, roiY, roiW, roiH, 0, 0, targetW, targetH)
  }

  return roiCanvas
}

// 90 degrees rotated ROI (uncompressed native pixels for vertical barcodes & QR codes)
function getRoiRotatedCanvas(): HTMLCanvasElement | null {
  if (!videoRef.value) return null
  const video = videoRef.value
  const vw = video.videoWidth
  const vh = video.videoHeight
  if (!vw || !vh) return null

  const { roiX, roiY, roiW, roiH } = computeRoi(vw, vh)
  if (roiW <= 0 || roiH <= 0) return null

  const targetW = Math.round(roiW)
  const targetH = Math.round(roiH)
  const rotW = targetH
  const rotH = targetW

  if (!roiRotCanvas) {
    roiRotCanvas = document.createElement('canvas')
    roiRotCtx = roiRotCanvas.getContext('2d', { willReadFrequently: true })
  }

  if (roiRotCanvas.width !== rotW || roiRotCanvas.height !== rotH) {
    roiRotCanvas.width = rotW
    roiRotCanvas.height = rotH
  }

  if (roiRotCtx) {
    roiRotCtx.save()
    roiRotCtx.translate(rotW / 2, rotH / 2)
    roiRotCtx.rotate(Math.PI / 2)
    roiRotCtx.drawImage(video, roiX, roiY, roiW, roiH, -targetW / 2, -targetH / 2, targetW, targetH)
    roiRotCtx.restore()
  }

  return roiRotCanvas
}

// Capture scaled full frame for wide-angle scanning anywhere in view (0 degrees)
function getFullCanvas(maxDim = 640): HTMLCanvasElement | null {
  if (!videoRef.value) return null
  const video = videoRef.value
  const vw = video.videoWidth
  const vh = video.videoHeight
  if (!vw || !vh) return null

  let targetW = vw
  let targetH = vh
  if (targetW > maxDim || targetH > maxDim) {
    if (targetW >= targetH) {
      targetH = Math.round((vh / vw) * maxDim)
      targetW = maxDim
    } else {
      targetW = Math.round((vw / vh) * maxDim)
      targetH = maxDim
    }
  }

  if (!fullCanvas) {
    fullCanvas = document.createElement('canvas')
    fullCtx = fullCanvas.getContext('2d', { willReadFrequently: true })
  }

  if (fullCanvas.width !== targetW || fullCanvas.height !== targetH) {
    fullCanvas.width = targetW
    fullCanvas.height = targetH
  }

  if (fullCtx) {
    fullCtx.drawImage(video, 0, 0, targetW, targetH)
  }

  return fullCanvas
}

// Capture 90 degrees rotated scaled full frame for vertical barcodes anywhere in view
function getFullRotatedCanvas(maxDim = 640): HTMLCanvasElement | null {
  if (!videoRef.value) return null
  const video = videoRef.value
  const vw = video.videoWidth
  const vh = video.videoHeight
  if (!vw || !vh) return null

  let targetW = vw
  let targetH = vh
  if (targetW > maxDim || targetH > maxDim) {
    if (targetW >= targetH) {
      targetH = Math.round((vh / vw) * maxDim)
      targetW = maxDim
    } else {
      targetW = Math.round((vw / vh) * maxDim)
      targetH = maxDim
    }
  }

  const rotW = targetH
  const rotH = targetW

  if (!fullRotCanvas) {
    fullRotCanvas = document.createElement('canvas')
    fullRotCtx = fullRotCanvas.getContext('2d', { willReadFrequently: true })
  }

  if (fullRotCanvas.width !== rotW || fullRotCanvas.height !== rotH) {
    fullRotCanvas.width = rotW
    fullRotCanvas.height = rotH
  }

  if (fullRotCtx) {
    fullRotCtx.save()
    fullRotCtx.translate(rotW / 2, rotH / 2)
    fullRotCtx.rotate(Math.PI / 2)
    fullRotCtx.drawImage(video, 0, 0, vw, vh, -targetW / 2, -targetH / 2, targetW, targetH)
    fullRotCtx.restore()
  }

  return fullRotCanvas
}

// Watch isOpen to initialize or stop camera
watch(
  () => props.isOpen,
  async (val) => {
    if (val) {
      unlockAudio()
      await nextTick()
      initCamera()
    } else {
      stopEverything()
    }
  }
)

async function initCamera() {
  if (!import.meta.client) return
  isLoadingCamera.value = true
  cameraError.value = null
  isTorchOn.value = false
  hasTorchSupport.value = false
  activeEngine.value = 'None'
  isLocked.value = false
  isDetecting = false

  stopEverything()

  try {
    let stream: MediaStream
    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280, min: 640 },
        height: { ideal: 720, min: 480 }
      },
      audio: false
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: 'environment' },
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        },
        audio: false
      })
    } catch (_) {
      stream = await navigator.mediaDevices.getUserMedia(constraints)
    }

    mediaStream = stream
    mediaTrack = stream.getVideoTracks()[0] || null

    if (mediaTrack && typeof mediaTrack.applyConstraints === 'function') {
      try {
        const caps = typeof mediaTrack.getCapabilities === 'function' ? (mediaTrack.getCapabilities() as any) : {}
        const adv: any = {}
        if (caps.focusMode && Array.isArray(caps.focusMode) && caps.focusMode.includes('continuous')) {
          adv.focusMode = 'continuous'
        }
        if (caps.torch) {
          hasTorchSupport.value = true
        }
        if (Object.keys(adv).length > 0) {
          await mediaTrack.applyConstraints({ advanced: [adv] })
        }
      } catch (_) {}
    }

    if (videoRef.value) {
      videoRef.value.srcObject = stream
      await videoRef.value.play()
    }

    isLoadingCamera.value = false
    startScanEngine()
  } catch (err: any) {
    isLoadingCamera.value = false
    console.error('Camera access error:', err)

    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      cameraError.value = 'Akses kamera ditolak. Silakan izinkan akses kamera di pengaturan browser.'
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      cameraError.value = 'Perangkat tidak memiliki kamera yang tersedia.'
    } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      cameraError.value = 'Kamera sedang digunakan oleh aplikasi lain.'
    } else {
      cameraError.value = 'Browser Anda belum mendukung fitur scan kamera ini.'
    }
  }
}

function isValidBarcodeText(code: string): boolean {
  if (!code) return false
  const trimmed = code.trim()
  if (trimmed.length < 2) return false
  if (/^(.)\1+$/i.test(trimmed) && trimmed.length > 2) return false
  return true
}

function processCandidateBarcode(rawVal: string) {
  if (!isValidBarcodeText(rawVal)) return
  handleDetectedBarcode(rawVal)
}

async function startScanEngine() {
  if (!import.meta.client || !videoRef.value) return

  // Strategy 1: Native BarcodeDetector API
  if ('BarcodeDetector' in window) {
    try {
      activeEngine.value = 'BarcodeDetector'
      const supported = await (window as any).BarcodeDetector.getSupportedFormats().catch(() => [])
      let formats = [
        'qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39', 'code_93', 'upc_a', 'upc_e',
        'data_matrix', 'pdf417', 'aztec'
      ]
      if (Array.isArray(supported) && supported.length > 0) {
        formats = formats.filter((f) => supported.includes(f))
      }
      if (!formats || formats.length === 0) {
        formats = [
          'qr_code', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_39', 'code_93', 'code_128',
          'data_matrix', 'pdf417', 'aztec'
        ]
      }

      barcodeDetector = new (window as any).BarcodeDetector({ formats })
      startScanLoop()
      return
    } catch (e) {
      console.warn('BarcodeDetector failed, falling back to ZXing:', e)
    }
  }

  // Strategy 2: ZXing library fallback
  try {
    activeEngine.value = 'ZXing'
    const { BrowserMultiFormatReader } = await import('@zxing/browser')
    const { DecodeHintType, BarcodeFormat } = await import('@zxing/library')

    const hints = new Map()
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.QR_CODE,
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.CODE_93,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.DATA_MATRIX,
      BarcodeFormat.PDF_417,
      BarcodeFormat.AZTEC
    ])
    hints.set(DecodeHintType.TRY_HARDER, true)

    zxingReader = new BrowserMultiFormatReader(hints)
    startScanLoop()
  } catch (e) {
    console.error('ZXing fallback failed:', e)
    cameraError.value = 'Gagal memuat engine barcode scanner.'
  }
}

function startScanLoop() {
  if (animFrameId) {
    cancelAnimationFrame(animFrameId)
    animFrameId = null
  }

  const scanFrame = async () => {
    if (!props.isOpen || !videoRef.value) return

    const now = performance.now()
    if (!isLocked.value && !isDetecting && videoRef.value.readyState >= 2 && now - lastScanTime >= 28) {
      lastScanTime = now
      isDetecting = true
      scanPassCount++

      try {
        if (activeEngine.value === 'BarcodeDetector' && barcodeDetector) {
          // Pass 1: High-contrast native 0° ROI canvas (ultra fast for normal 1D & QR in viewfinder)
          let barcodes: any[] = []
          const roi = getRoiCanvas()
          if (roi) {
            try {
              barcodes = await barcodeDetector.detect(roi)
            } catch (_) {}
          }

          // Pass 2: High-contrast native 90° Rotated ROI canvas (detects standing 90-degree barcodes instantly!)
          if (!barcodes || barcodes.length === 0) {
            const roiRot = getRoiRotatedCanvas()
            if (roiRot) {
              try {
                barcodes = await barcodeDetector.detect(roiRot)
              } catch (_) {}
            }
          }

          // Pass 3: Full video frame directly (detects barcodes/QR outside center box)
          if (!barcodes || barcodes.length === 0) {
            try {
              barcodes = await barcodeDetector.detect(videoRef.value)
            } catch (_) {}
          }

          if (barcodes && barcodes.length > 0) {
            const rawVal = barcodes[0].rawValue?.trim()
            if (rawVal) {
              processCandidateBarcode(rawVal)
            }
          }
        } else if (activeEngine.value === 'ZXing' && zxingReader) {
          // Pass 1: High-contrast 0° ROI canvas
          let result: any = null
          const roi = getRoiCanvas()
          if (roi) {
            try {
              const res = zxingReader.decodeFromCanvas(roi)
              result = res && typeof res.then === 'function' ? await res : res
            } catch (_) {}
          }

          // Pass 2: 90° Rotated ROI (detects vertical 90-degree barcodes instantly!)
          if (!result) {
            const roiRot = getRoiRotatedCanvas()
            if (roiRot) {
              try {
                const resRot = zxingReader.decodeFromCanvas(roiRot)
                result = resRot && typeof resRot.then === 'function' ? await resRot : resRot
              } catch (_) {}
            }
          }

          // Pass 3: Full frame 0° on even frames, 90° on odd frames
          if (!result) {
            if (scanPassCount % 2 === 0) {
              const full = getFullCanvas(640)
              if (full) {
                try {
                  const res = zxingReader.decodeFromCanvas(full)
                  result = res && typeof res.then === 'function' ? await res : res
                } catch (_) {}
              }
            } else {
              const fullRot = getFullRotatedCanvas(640)
              if (fullRot) {
                try {
                  const resRot = zxingReader.decodeFromCanvas(fullRot)
                  result = resRot && typeof resRot.then === 'function' ? await resRot : resRot
                } catch (_) {}
              }
            }
          }

          if (result) {
            const text = typeof result.getText === 'function' ? result.getText()?.trim() : result.text?.trim()
            if (text) {
              processCandidateBarcode(text)
            }
          }
        }
      } catch (_) {
        // Ignored
      } finally {
        isDetecting = false
      }
    }

    if (props.isOpen) {
      animFrameId = requestAnimationFrame(scanFrame)
    }
  }

  animFrameId = requestAnimationFrame(scanFrame)
}

function handleDetectedBarcode(code: string) {
  if (isLocked.value) return

  isLocked.value = true
  showSuccessFlash.value = true
  setTimeout(() => {
    showSuccessFlash.value = false
  }, 300)

  emit('scan', code)

  if (props.autoCloseOnScan) {
    setTimeout(() => {
      closeScanner()
    }, 150)
    return
  }

  if (lockTimer) clearTimeout(lockTimer)
  lockTimer = setTimeout(() => {
    isLocked.value = false
  }, 800)
}

async function toggleTorch() {
  if (!mediaTrack || !hasTorchSupport.value) return
  try {
    isTorchOn.value = !isTorchOn.value
    await mediaTrack.applyConstraints({
      advanced: [{ torch: isTorchOn.value } as any]
    })
  } catch (err) {
    console.warn('Toggle torch failed:', err)
  }
}

function stopEverything() {
  if (animFrameId) {
    cancelAnimationFrame(animFrameId)
    animFrameId = null
  }

  if (zxingReader) {
    try {
      if (typeof zxingReader.reset === 'function') zxingReader.reset()
    } catch (_) {}
    zxingReader = null
  }
  barcodeDetector = null

  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop())
    mediaStream = null
    mediaTrack = null
  }

  if (videoRef.value) {
    videoRef.value.srcObject = null
  }

  if (lockTimer) {
    clearTimeout(lockTimer)
    lockTimer = null
  }
  isLocked.value = false
  isDetecting = false
  isTorchOn.value = false
  roiCanvas = null
  roiCtx = null
  roiRotCanvas = null
  roiRotCtx = null
  fullCanvas = null
  fullCtx = null
  fullRotCanvas = null
  fullRotCtx = null
}

function closeScanner() {
  stopEverything()
  emit('close')
}

onUnmounted(() => {
  stopEverything()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes scanBeam {
  0% {
    top: 5%;
  }
  50% {
    top: 95%;
  }
  100% {
    top: 5%;
  }
}

.animate-scan-beam {
  animation: scanBeam 2.2s ease-in-out infinite;
}
</style>
