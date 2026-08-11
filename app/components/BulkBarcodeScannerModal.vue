<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex flex-col bg-black/95 text-white select-none backdrop-blur-md overflow-hidden font-sans"
      >
        <!-- Top Bar Header -->
        <div class="relative z-20 flex items-center justify-between px-4 py-3 bg-gray-900/90 backdrop-blur-md border-b border-white/10 shadow-lg">
          <div class="flex items-center gap-3">
            <div class="p-2.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Icon name="lucide:layers" class="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-bold leading-tight text-white">Scan Barcode Massal</h3>
                <span class="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full tracking-wider">
                  {{ completedCount }} / {{ items.length }} Selesai
                </span>
              </div>
              <p class="text-xs text-gray-400">Pindai barcode secara berturut-turut untuk daftar produk terpilih</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- Flash / Torch Toggle -->
            <button
              v-if="hasTorchSupport"
              @click="toggleTorch"
              type="button"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer"
              :class="isTorchOn ? 'bg-amber-500 text-gray-950 border-amber-400 font-bold shadow-lg shadow-amber-500/30' : 'bg-gray-800/80 text-gray-300 border-gray-700 hover:bg-gray-700'"
            >
              <Icon name="lucide:zap" class="w-4 h-4" :class="{ 'fill-current': isTorchOn }" />
              <span class="hidden sm:inline">Flash {{ isTorchOn ? 'ON' : 'OFF' }}</span>
            </button>

            <!-- Close Scanner Button -->
            <button
              @click="closeScanner"
              type="button"
              class="p-2 rounded-xl bg-gray-800/80 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors border border-white/10 cursor-pointer"
              title="Tutup (Esc)"
            >
              <Icon name="lucide:x" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Progress Bar Line -->
        <div class="w-full bg-gray-800 h-1.5 relative overflow-hidden z-20">
          <div
            class="bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-500 h-full transition-all duration-300"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>

        <!-- Main Body: Camera Feed & Side/Bottom Product List -->
        <div class="relative flex-1 flex flex-col md:flex-row overflow-hidden">
          
          <!-- Camera Container -->
          <div class="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px]">
            <!-- HTML5 Video Element -->
            <video
              ref="videoRef"
              class="absolute inset-0 w-full h-full object-cover"
              playsinline
              muted
              autoplay
            ></video>

            <!-- Camera Error State -->
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
              <p class="text-sm font-medium text-gray-300">Menyiapkan kamera scanner massal...</p>
            </div>

            <!-- Completed All State Overlay -->
            <div v-else-if="isAllCompleted" class="relative z-30 max-w-md mx-4 p-8 bg-gray-900/95 rounded-3xl border border-emerald-500/40 text-center shadow-2xl backdrop-blur-xl">
              <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-bounce">
                <Icon name="lucide:check-circle-2" class="w-10 h-10" />
              </div>
              <h4 class="text-xl font-extrabold text-white mb-2">Semua Barcode Selesai!</h4>
              <p class="text-sm text-gray-300 mb-6">
                Berhasil memindai dan menyimpan barcode untuk {{ completedCount }} dari {{ items.length }} produk.
              </p>
              <button
                @click="closeScanner"
                type="button"
                class="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                Selesai & Kembali ke Daftar Produk
              </button>
            </div>

            <!-- Target Scan Viewport -->
            <template v-else>
              <!-- Dim Backdrop Overlay around scan frame -->
              <div class="absolute inset-0 z-10 pointer-events-none flex flex-col">
                <!-- Top Mask -->
                <div class="bg-black/60 flex-1"></div>

                <!-- Center Strip with Scan Frame -->
                <div class="flex h-52 sm:h-60">
                  <div class="bg-black/60 flex-1"></div>

                  <!-- Scan Box Frame -->
                  <div ref="targetBoxRef" class="relative w-72 sm:w-80 h-full">
                    <!-- Corner Reticles -->
                    <div class="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-orange-400 rounded-tl-lg"></div>
                    <div class="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-orange-400 rounded-tr-lg"></div>
                    <div class="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-orange-400 rounded-bl-lg"></div>
                    <div class="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-orange-400 rounded-br-lg"></div>

                    <!-- Animated Scan Laser Beam -->
                    <div
                      class="absolute left-1 right-1 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_#ef4444] animate-scan-beam"
                      :class="{ 'opacity-30': isLocked }"
                    ></div>

                    <!-- Success Pulse Flash -->
                    <div
                      v-if="showSuccessFlash"
                      class="absolute inset-0 bg-emerald-500/35 border-2 border-emerald-400 rounded-lg animate-pulse"
                    ></div>
                  </div>

                  <div class="bg-black/60 flex-1"></div>
                </div>

                <!-- Bottom Mask & Target Product Toast Card -->
                <div class="bg-black/60 flex-1 flex flex-col items-center justify-start pt-4 px-4 gap-2">
                  <!-- Active Target Product Indicator Card -->
                  <div v-if="activeItem" class="max-w-md w-full bg-gray-900/90 border border-orange-500/40 rounded-2xl p-3.5 shadow-xl backdrop-blur-md flex items-center justify-between gap-3 pointer-events-auto">
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2 mb-0.5">
                        <span class="px-2 py-0.5 text-[10px] font-bold uppercase bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-full">
                          Sedang Diproses #{{ currentIndex + 1 }}
                        </span>
                        <span v-if="activeItem.barcode" class="text-[10px] text-amber-300 font-mono">
                          (Barcode lama: {{ activeItem.barcode }})
                        </span>
                      </div>
                      <h4 class="text-sm font-bold text-white truncate">{{ activeItem.name }}</h4>
                      <p v-if="activeItem.brand || activeItem.model" class="text-xs text-gray-400 font-mono">
                        {{ [activeItem.brand, activeItem.model].filter(Boolean).join(' - ') }}
                      </p>
                    </div>

                    <!-- Action: Skip Button -->
                    <button
                      @click="skipCurrentItem"
                      type="button"
                      class="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-white/10 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
                      title="Lewati produk ini"
                    >
                      <Icon name="lucide:skip-forward" class="w-4 h-4 text-amber-400" />
                      <span>Lewati</span>
                    </button>
                  </div>

                  <p class="text-xs text-gray-300 font-medium bg-gray-900/60 px-3 py-1 rounded-full border border-white/5">
                    Arahkan kamera tepat ke barcode produk di atas
                  </p>
                </div>
              </div>
            </template>
          </div>

          <!-- Side / Bottom Product Queue List Drawer -->
          <div class="w-full md:w-80 lg:w-96 bg-gray-900 border-t md:border-t-0 md:border-l border-white/10 flex flex-col max-h-[45vh] md:max-h-full shrink-0 z-20">
            <!-- Queue Header -->
            <div class="p-3.5 bg-gray-950/80 border-b border-white/10 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Icon name="lucide:list-ordered" class="w-4 h-4 text-orange-400" />
                <h4 class="text-xs font-bold text-gray-200 uppercase tracking-wider">Antrean Scan ({{ items.length }})</h4>
              </div>
              <div class="text-xs text-emerald-400 font-bold font-mono">
                {{ completedCount }}/{{ items.length }} Selesai
              </div>
            </div>

            <!-- Items List -->
            <div class="flex-1 overflow-y-auto p-3 space-y-2">
              <div
                v-for="(item, idx) in items"
                :key="item.id"
                @click="selectActiveIndex(idx)"
                class="p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-left"
                :class="{
                  'bg-orange-950/60 border-orange-500 shadow-md ring-1 ring-orange-500/50': idx === currentIndex && item.status !== 'completed',
                  'bg-emerald-950/40 border-emerald-500/40 opacity-90': item.status === 'completed',
                  'bg-gray-800/40 border-white/5 hover:border-white/20': idx !== currentIndex && item.status !== 'completed' && item.status !== 'skipped',
                  'bg-gray-900/60 border-gray-700/50 opacity-60': item.status === 'skipped'
                }"
              >
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span
                      class="w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0"
                      :class="idx === currentIndex ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400'"
                    >
                      {{ idx + 1 }}
                    </span>
                    <p class="text-xs font-semibold text-white truncate">{{ item.name }}</p>
                  </div>
                  
                  <div class="flex items-center gap-2 mt-1 pl-7 text-[11px]">
                    <span v-if="item.scannedBarcode" class="font-mono text-emerald-400 font-bold flex items-center gap-1">
                      <Icon name="lucide:barcode" class="w-3 h-3" /> {{ item.scannedBarcode }}
                    </span>
                    <span v-else-if="item.barcode" class="font-mono text-gray-400">
                      Semula: {{ item.barcode }}
                    </span>
                    <span v-else class="text-gray-500 italic">
                      Belum ada barcode
                    </span>
                  </div>
                </div>

                <!-- Status Badge -->
                <div class="shrink-0">
                  <span
                    v-if="item.status === 'completed'"
                    class="px-2 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1"
                  >
                    <Icon name="lucide:check-circle-2" class="w-3 h-3" /> Selesai
                  </span>
                  <span
                    v-else-if="idx === currentIndex"
                    class="px-2 py-1 bg-orange-500/20 text-orange-300 border border-orange-500/40 rounded-lg text-[10px] font-bold animate-pulse flex items-center gap-1"
                  >
                    <Icon name="lucide:scan-line" class="w-3 h-3" /> Diproses
                  </span>
                  <span
                    v-else-if="item.status === 'skipped'"
                    class="px-2 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-lg text-[10px] font-medium"
                  >
                    Dilewati
                  </span>
                  <span
                    v-else
                    class="px-2 py-1 bg-gray-800 text-gray-400 rounded-lg text-[10px] font-medium"
                  >
                    Belum
                  </span>
                </div>
              </div>
            </div>

            <!-- Footer Controls -->
            <div class="p-3 bg-gray-950/90 border-t border-white/10 flex items-center justify-between text-xs">
              <button
                @click="closeScanner"
                type="button"
                class="w-full py-2.5 px-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl border border-white/10 transition-all text-center cursor-pointer"
              >
                Selesai / Keluar Scan Massal
              </button>
            </div>
          </div>
        </div>

        <!-- Overwrite Confirmation Modal -->
        <div v-if="overwriteTarget" class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div class="bg-gray-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl">
            <div class="flex items-center gap-3 text-amber-400">
              <Icon name="lucide:alert-triangle" class="w-6 h-6 shrink-0" />
              <h3 class="text-base font-bold">Konfirmasi Timpa Barcode</h3>
            </div>
            <p class="text-xs text-gray-300 leading-relaxed">
              Produk <strong class="text-white">{{ overwriteTarget.item.name }}</strong> sudah memiliki barcode lama
              <code class="bg-gray-800 text-amber-300 px-1.5 py-0.5 rounded font-mono">{{ overwriteTarget.item.barcode }}</code>.
              <br /><br />
              Apakah Anda yakin ingin menimpanya dengan barcode baru
              <code class="bg-gray-800 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">{{ overwriteTarget.barcode }}</code>?
            </p>
            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                @click="cancelOverwrite"
                type="button"
                class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                @click="confirmOverwrite"
                type="button"
                class="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-600/30 cursor-pointer"
              >
                Ya, Timpa Barcode
              </button>
            </div>
          </div>
        </div>

        <!-- Warning Alert Modal (Duplicate / Error) -->
        <div v-if="warningModal" class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div class="bg-gray-900 border border-red-500/40 rounded-2xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl">
            <div class="flex items-center gap-3 text-red-400">
              <Icon name="lucide:alert-octagon" class="w-6 h-6 shrink-0" />
              <h3 class="text-base font-bold">Peringatan Barcode</h3>
            </div>
            <p class="text-xs text-gray-300 leading-relaxed">
              {{ warningModal.message }}
            </p>
            <div class="flex items-center justify-end pt-2">
              <button
                @click="closeWarningModal"
                type="button"
                class="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-600/30 cursor-pointer"
              >
                Mengerti (Scan Ulang)
              </button>
            </div>
          </div>
        </div>

      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { useAudioBeep } from '~/composables/useAudioBeep'

interface ProductProp {
  id: number | string
  name: string
  brand?: string
  model?: string
  barcode?: string | null
}

interface QueueItem {
  id: number | string
  name: string
  brand?: string
  model?: string
  barcode?: string | null
  status: 'pending' | 'completed' | 'skipped'
  scannedBarcode: string | null
}

const props = defineProps<{
  isOpen: boolean
  products: ProductProp[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'updated-product', productId: number | string, newBarcode: string): void
}>()

const { playSuccessBeep, playErrorBeep, unlockAudio } = useAudioBeep()

const items = ref<QueueItem[]>([])
const currentIndex = ref(0)
const isLocked = ref(false)
const showSuccessFlash = ref(false)

const videoRef = ref<HTMLVideoElement | null>(null)
const targetBoxRef = ref<HTMLElement | null>(null)
const isLoadingCamera = ref(true)
const cameraError = ref<string | null>(null)
const isTorchOn = ref(false)
const hasTorchSupport = ref(false)
const activeEngine = ref<'BarcodeDetector' | 'ZXing' | 'None'>('None')

const overwriteTarget = ref<{ barcode: string; item: QueueItem } | null>(null)
const warningModal = ref<{ message: string } | null>(null)

let mediaStream: MediaStream | null = null
let mediaTrack: MediaStreamTrack | null = null
let animFrameId: number | null = null
let barcodeDetector: any = null
let zxingReader: any = null
let lockTimer: any = null
let cropCanvas: HTMLCanvasElement | null = null
let cropCtx: CanvasRenderingContext2D | null = null
let lastScanTime = 0

const completedCount = computed(() => {
  return items.value.filter((i) => i.status === 'completed').length
})

const progressPercentage = computed(() => {
  if (items.value.length === 0) return 0
  return Math.round((completedCount.value / items.value.length) * 100)
})

const isAllCompleted = computed(() => {
  return items.value.length > 0 && items.value.every((i) => i.status === 'completed' || i.status === 'skipped')
})

const activeItem = computed(() => {
  if (currentIndex.value >= 0 && currentIndex.value < items.value.length) {
    return items.value[currentIndex.value]
  }
  return null
})

// Initialize items queue whenever modal is opened
watch(
  () => props.isOpen,
  async (val) => {
    if (val) {
      unlockAudio()
      items.value = (props.products || []).map((p) => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        model: p.model,
        barcode: p.barcode,
        status: 'pending',
        scannedBarcode: null
      }))
      currentIndex.value = 0
      overwriteTarget.value = null
      warningModal.value = null

      await nextTick()
      initCamera()
    } else {
      stopEverything()
    }
  }
)

function selectActiveIndex(idx: number) {
  if (idx >= 0 && idx < items.value.length) {
    currentIndex.value = idx
  }
}

function skipCurrentItem() {
  if (!activeItem.value) return
  activeItem.value.status = 'skipped'
  advanceToNextPending()
}

function advanceToNextPending() {
  // 1. Find next pending item starting after current index
  const nextPendingIdx = items.value.findIndex((item, i) => i > currentIndex.value && item.status === 'pending')
  if (nextPendingIdx !== -1) {
    currentIndex.value = nextPendingIdx
    return
  }

  // 2. Wrap around to find any first pending item anywhere in queue
  const firstPendingIdx = items.value.findIndex((item) => item.status === 'pending')
  if (firstPendingIdx !== -1) {
    currentIndex.value = firstPendingIdx
    return
  }

  // 3. If no pending left, find next skipped item after current index
  const nextSkippedIdx = items.value.findIndex((item, i) => i > currentIndex.value && item.status === 'skipped')
  if (nextSkippedIdx !== -1) {
    currentIndex.value = nextSkippedIdx
    return
  }

  // 4. Otherwise find first skipped item
  const firstSkippedIdx = items.value.findIndex((item) => item.status === 'skipped')
  if (firstSkippedIdx !== -1) {
    currentIndex.value = firstSkippedIdx
  }
}

function updateCropCanvas(): HTMLCanvasElement | null {
  if (!videoRef.value || !targetBoxRef.value) return null
  const video = videoRef.value
  const vRect = video.getBoundingClientRect()
  const tRect = targetBoxRef.value.getBoundingClientRect()

  const vw = video.videoWidth
  const vh = video.videoHeight
  if (!vw || !vh || !vRect.width || !vRect.height || !tRect.width || !tRect.height) {
    return null
  }

  const scale = Math.max(vRect.width / vw, vRect.height / vh)
  const offsetX = (vRect.width - vw * scale) / 2
  const offsetY = (vRect.height - vh * scale) / 2

  let roiX = (tRect.left - vRect.left - offsetX) / scale
  let roiY = (tRect.top - vRect.top - offsetY) / scale
  let roiW = tRect.width / scale
  let roiH = tRect.height / scale

  roiX = Math.max(0, roiX)
  roiY = Math.max(0, roiY)
  if (roiX + roiW > vw) roiW = vw - roiX
  if (roiY + roiH > vh) roiH = vh - roiY

  if (roiW <= 0 || roiH <= 0) return null

  if (!cropCanvas) {
    cropCanvas = document.createElement('canvas')
    cropCtx = cropCanvas.getContext('2d', { willReadFrequently: true })
  }

  const targetW = Math.round(roiW)
  const targetH = Math.round(roiH)

  if (cropCanvas.width !== targetW || cropCanvas.height !== targetH) {
    cropCanvas.width = targetW
    cropCanvas.height = targetH
  }

  if (cropCtx) {
    cropCtx.drawImage(video, roiX, roiY, roiW, roiH, 0, 0, targetW, targetH)
  }

  return cropCanvas
}

async function initCamera() {
  if (!process.client) return
  isLoadingCamera.value = true
  cameraError.value = null
  isTorchOn.value = false
  hasTorchSupport.value = false
  activeEngine.value = 'None'
  isLocked.value = false

  stopEverything()

  try {
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      })
    } catch (_) {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      })
    }

    mediaStream = stream
    mediaTrack = stream.getVideoTracks()[0] || null

    if (mediaTrack && typeof mediaTrack.getCapabilities === 'function') {
      const caps = mediaTrack.getCapabilities() as any
      if (caps?.torch) {
        hasTorchSupport.value = true
      }
    }

    if (videoRef.value) {
      videoRef.value.srcObject = stream
      await videoRef.value.play()
    }

    isLoadingCamera.value = false
    startScanEngine()
  } catch (err: any) {
    isLoadingCamera.value = false
    console.error('Bulk Scanner Camera access error:', err)
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      cameraError.value = 'Akses kamera ditolak. Silakan izinkan akses kamera di pengaturan browser.'
    } else {
      cameraError.value = 'Browser Anda belum mendukung fitur scan kamera ini.'
    }
  }
}

async function startScanEngine() {
  if (!process.client || !videoRef.value) return

  if ('BarcodeDetector' in window) {
    try {
      activeEngine.value = 'BarcodeDetector'
      let formats: string[]
      try {
        formats = await (window as any).BarcodeDetector.getSupportedFormats()
      } catch (_) {
        formats = []
      }
      if (!formats || formats.length === 0) {
        formats = [
          'ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_39', 'code_93', 'code_128',
          'itf', 'codabar', 'qr_code', 'data_matrix', 'pdf417', 'aztec'
        ]
      }
      barcodeDetector = new (window as any).BarcodeDetector({ formats })
      startScanLoop()
      return
    } catch (e) {
      console.warn('BarcodeDetector failed, falling back to ZXing:', e)
    }
  }

  try {
    activeEngine.value = 'ZXing'
    const { BrowserMultiFormatReader } = await import('@zxing/browser')
    const { DecodeHintType, BarcodeFormat } = await import('@zxing/library')

    const hints = new Map()
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13, BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A, BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_39, BarcodeFormat.CODE_93, BarcodeFormat.CODE_128,
      BarcodeFormat.ITF, BarcodeFormat.CODABAR,
      BarcodeFormat.QR_CODE, BarcodeFormat.DATA_MATRIX,
      BarcodeFormat.PDF_417, BarcodeFormat.AZTEC
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
    if (!isLocked.value && !overwriteTarget.value && !warningModal.value && activeItem.value && videoRef.value.readyState >= 2 && now - lastScanTime >= 70) {
      lastScanTime = now
      const croppedCanvas = updateCropCanvas()
      if (croppedCanvas) {
        if (activeEngine.value === 'BarcodeDetector' && barcodeDetector) {
          try {
            const barcodes = await barcodeDetector.detect(croppedCanvas)
            if (barcodes && barcodes.length > 0) {
              const rawVal = barcodes[0].rawValue?.trim()
              if (rawVal) {
                handleDetectedBarcode(rawVal)
              }
            }
          } catch (_) {}
        } else if (activeEngine.value === 'ZXing' && zxingReader) {
          try {
            const res = zxingReader.decodeFromCanvas(croppedCanvas)
            const result = res && typeof res.then === 'function' ? await res : res
            if (result) {
              const text = typeof result.getText === 'function' ? result.getText()?.trim() : result.text?.trim()
              if (text) {
                handleDetectedBarcode(text)
              }
            }
          } catch (_) {}
        }
      }
    }

    if (props.isOpen) {
      animFrameId = requestAnimationFrame(scanFrame)
    }
  }

  animFrameId = requestAnimationFrame(scanFrame)
}

async function handleDetectedBarcode(scannedCode: string) {
  if (isLocked.value || !activeItem.value) return

  isLocked.value = true

  // Check batch session duplicate scan
  const duplicateInBatch = items.value.find(
    (i) => i.status === 'completed' && i.scannedBarcode === scannedCode && i.id !== activeItem.value?.id
  )
  if (duplicateInBatch) {
    playErrorBeep()
    warningModal.value = {
      message: `Barcode "${scannedCode}" sudah digunakan pada produk "${duplicateInBatch.name}" dalam sesi scan massal ini!`
    }
    return
  }

  // Attempt saving to database API
  await saveBarcodeToProduct(activeItem.value, scannedCode, false)
}

async function saveBarcodeToProduct(item: QueueItem, code: string, force = false) {
  try {
    const res = await $fetch<any>(`/api/products/${item.id}/barcode`, {
      method: 'PATCH',
      body: {
        barcode: code,
        force
      }
    })

    if (res.success) {
      playSuccessBeep()
      showSuccessFlash.value = true
      setTimeout(() => {
        showSuccessFlash.value = false
      }, 300)

      item.status = 'completed'
      item.scannedBarcode = code
      emit('updated-product', item.id, code)

      advanceToNextPending()

      if (lockTimer) clearTimeout(lockTimer)
      lockTimer = setTimeout(() => {
        isLocked.value = false
      }, 600)
    } else {
      playErrorBeep()
      warningModal.value = {
        message: res.message || 'Gagal menyimpan barcode.'
      }
    }
  } catch (err: any) {
    playErrorBeep()
    const status = err.statusCode || err.status || err.data?.statusCode
    const msg = err.data?.statusMessage || err.data?.message || err.message || 'Gagal menyimpan barcode'

    if (status === 409) {
      overwriteTarget.value = { barcode: code, item }
    } else {
      warningModal.value = { message: msg }
    }
  }
}

async function confirmOverwrite() {
  if (!overwriteTarget.value) return
  const { barcode: code, item } = overwriteTarget.value
  overwriteTarget.value = null
  await saveBarcodeToProduct(item, code, true)
}

function cancelOverwrite() {
  overwriteTarget.value = null
  isLocked.value = false
}

function closeWarningModal() {
  warningModal.value = null
  isLocked.value = false
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
  isTorchOn.value = false
  cropCanvas = null
  cropCtx = null
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
