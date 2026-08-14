<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none backdrop-blur-md overflow-hidden font-sans"
      >
        <!-- Top Bar Header -->
        <div class="relative z-20 flex items-center justify-between px-4 py-3 bg-slate-900/95 backdrop-blur-md border-b border-orange-500/20 shadow-lg">
          <div class="flex items-center gap-3">
            <div class="p-2.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Icon name="lucide:scan-line" class="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-extrabold leading-tight text-white">Scanner Barcode Interaktif</h3>
                <span class="px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full tracking-wider">
                  {{ sessionHistory.length }} Barcode Disimpan
                </span>
              </div>
              <p class="text-xs text-slate-300 flex items-center gap-1.5 flex-wrap mt-0.5">
                <span>Pindai barcode/QR</span>
                <Icon name="lucide:arrow-right" class="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span>Tentukan produk tujuan</span>
                <Icon name="lucide:arrow-right" class="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span>Simpan</span>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- Flash / Torch Toggle -->
            <button
              v-if="hasTorchSupport"
              @click="toggleTorch"
              type="button"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer"
              :class="isTorchOn ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-lg shadow-amber-500/30' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'"
            >
              <Icon name="lucide:zap" class="w-4 h-4" :class="{ 'fill-current': isTorchOn }" />
              <span class="hidden sm:inline">Flash {{ isTorchOn ? 'ON' : 'OFF' }}</span>
            </button>

            <!-- Close Scanner Button -->
            <button
              @click="closeScanner"
              type="button"
              class="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700 cursor-pointer"
              title="Tutup (Esc)"
            >
              <Icon name="lucide:x" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Progress Line if items queue exists -->
        <div v-if="items.length > 0" class="w-full bg-slate-900 h-1.5 relative overflow-hidden z-20 border-b border-orange-500/10">
          <div
            class="bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-500 h-full transition-all duration-300"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>

        <!-- Main Body: Camera Feed & Side/Bottom Drawer -->
        <div class="relative flex-1 flex flex-col md:flex-row overflow-hidden">
          
          <!-- Camera Viewport Container -->
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
            <div v-if="cameraError" class="relative z-30 max-w-sm mx-4 p-6 bg-slate-900/95 rounded-2xl border border-red-500/40 text-center shadow-2xl backdrop-blur-md">
              <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                <Icon name="lucide:camera-off" class="w-6 h-6" />
              </div>
              <h4 class="text-lg font-bold text-white mb-1">Kamera Tidak Aktif</h4>
              <p class="text-sm text-slate-300 mb-4">{{ cameraError }}</p>
              <button
                @click="initCamera"
                type="button"
                class="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-600/30 cursor-pointer"
              >
                Coba Lagi
              </button>
            </div>

            <!-- Loading Camera State -->
            <div v-else-if="isLoadingCamera" class="relative z-30 flex flex-col items-center gap-3">
              <div class="w-10 h-10 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
              <p class="text-sm font-medium text-slate-300">Menyiapkan kamera scanner interaktif...</p>
            </div>

            <!-- Target Scan Viewport Overlay -->
            <template v-else>
              <!-- Dim Backdrop Mask around scan frame -->
              <div class="absolute inset-0 z-10 pointer-events-none flex flex-col">
                <!-- Top Mask -->
                <div class="bg-black/40 flex-1"></div>

                <!-- Center Strip with Scan Frame -->
                <div class="flex h-52 sm:h-60">
                  <div class="bg-black/40 flex-1"></div>

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
                      :class="{ 'opacity-20': isLocked }"
                    ></div>

                    <!-- Success Pulse Flash -->
                    <div
                      v-if="showSuccessFlash"
                      class="absolute inset-0 bg-emerald-500/35 border-2 border-emerald-400 rounded-lg animate-pulse"
                    ></div>
                  </div>

                  <div class="bg-black/40 flex-1"></div>
                </div>

                <!-- Bottom Mask & Instructions -->
                <div class="bg-black/40 flex-1 flex flex-col items-center justify-start pt-4 px-4 gap-2">
                  <div class="bg-slate-900/90 border border-orange-500/30 px-4 py-2 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-2 pointer-events-auto">
                    <Icon name="lucide:qr-code" class="w-4 h-4 text-orange-400 animate-pulse" />
                    <span class="text-xs font-semibold text-slate-100">
                      {{ isLocked ? 'Memproses barcode yang terbaca...' : 'Arahkan kamera ke barcode atau QR code' }}
                    </span>
                  </div>
                  <p class="text-[11px] text-slate-400 italic">
                    Kamera tetap aktif & otomatis memindai barcode berikutnya setelah Anda memilih produk.
                  </p>
                </div>
              </div>
            </template>
          </div>

          <!-- Side / Bottom Drawer: Tabs for Riwayat Scan & Antrean Produk -->
          <div class="w-full md:w-80 lg:w-96 bg-slate-950 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col max-h-[45vh] md:max-h-full shrink-0 z-20">
            <!-- Drawer Header & Tabs -->
            <div class="p-2.5 bg-slate-900 border-b border-slate-800 flex items-center gap-2">
              <button
                @click="activeDrawerTab = 'history'"
                type="button"
                class="flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                :class="activeDrawerTab === 'history' ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white font-extrabold shadow-md shadow-orange-600/30 border border-orange-400/40' : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/50'"
              >
                <Icon name="lucide:history" class="w-4 h-4" />
                <span>Riwayat Scan</span>
                <span class="px-1.5 py-0.2 bg-black/30 text-white rounded-md text-[10px]">
                  {{ sessionHistory.length }}
                </span>
              </button>

              <button
                @click="activeDrawerTab = 'queue'"
                type="button"
                class="flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                :class="activeDrawerTab === 'queue' ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white font-extrabold shadow-md shadow-orange-600/30 border border-orange-400/40' : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/50'"
              >
                <Icon name="lucide:list-ordered" class="w-4 h-4" />
                <span>Antrean Target</span>
                <span class="px-1.5 py-0.2 bg-black/30 text-white rounded-md text-[10px]">
                  {{ items.length }}
                </span>
              </button>
            </div>

            <!-- Tab Content 1: Riwayat Scan Sesi Ini -->
            <div v-if="activeDrawerTab === 'history'" class="flex-1 overflow-y-auto p-3 space-y-2">
              <div v-if="sessionHistory.length === 0" class="text-center py-10 px-4 text-slate-500">
                <Icon name="lucide:barcode" class="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                <p class="text-xs font-semibold">Belum Ada Barcode Dipindai</p>
                <p class="text-[11px] mt-1 text-slate-400">Arahkan kamera ke barcode untuk mulai memindai dan memasukkan ke produk.</p>
              </div>

              <div
                v-for="log in sessionHistory"
                :key="log.id"
                class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3 text-left hover:border-orange-500/40 transition-all"
              >
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-mono text-xs font-extrabold text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      <Icon name="lucide:qr-code" class="w-3.5 h-3.5" /> {{ log.barcode }}
                    </span>
                    <span class="text-[10px] text-slate-400 font-mono">
                      {{ formatTime(log.timestamp) }}
                    </span>
                  </div>
                  <p class="text-xs font-bold text-white truncate">{{ log.productName }}</p>
                  <p v-if="log.productBrand || log.productModel" class="text-[11px] text-slate-400 font-mono truncate">
                    {{ [log.productBrand, log.productModel].filter(Boolean).join(' - ') }}
                  </p>
                </div>
                <span class="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-bold shrink-0">
                  Sukses
                </span>
              </div>
            </div>

            <!-- Tab Content 2: Antrean Target Produk -->
            <div v-else-if="activeDrawerTab === 'queue'" class="flex-1 overflow-y-auto p-3 space-y-2">
              <div v-if="items.length === 0" class="text-center py-10 px-4 text-slate-500">
                <Icon name="lucide:package" class="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                <p class="text-xs font-semibold">Tidak Ada Produk Antrean Khusus</p>
                <p class="text-[11px] mt-1 text-slate-400">Anda dapat memindai barcode secara bebas dan memilih produk manapun dari katalog toko saat barcode terbaca.</p>
              </div>

              <div
                v-for="(item, idx) in items"
                :key="item.id"
                @click="selectActiveIndex(idx)"
                class="p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-left"
                :class="{
                  'bg-orange-950/80 border-orange-500 shadow-lg shadow-orange-950/50 ring-1 ring-orange-500/50': idx === currentIndex && item.status !== 'completed',
                  'bg-emerald-950/40 border-emerald-500/40 opacity-90': item.status === 'completed',
                  'bg-slate-900 border-slate-800 hover:border-orange-500/40 hover:bg-slate-850': idx !== currentIndex && item.status !== 'completed' && item.status !== 'skipped',
                  'bg-slate-900/60 border-slate-800/50 opacity-60': item.status === 'skipped'
                }"
              >
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span
                      class="w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0"
                      :class="idx === currentIndex ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'"
                    >
                      {{ idx + 1 }}
                    </span>
                    <p class="text-xs font-semibold text-white truncate">{{ item.name }}</p>
                  </div>
                  
                  <div class="flex items-center gap-2 mt-1 pl-7 text-[11px]">
                    <span v-if="item.scannedBarcode" class="font-mono text-emerald-400 font-bold flex items-center gap-1">
                      <Icon name="lucide:qr-code" class="w-3 h-3" /> {{ item.scannedBarcode }}
                    </span>
                    <span v-else-if="item.barcode" class="font-mono text-slate-400">
                      Semula: {{ item.barcode }}
                    </span>
                    <span v-else class="text-slate-400 italic">
                      Belum ada Barcode
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
                    class="px-2.5 py-1 bg-orange-500 text-white font-extrabold rounded-lg text-[10px] shadow-sm shadow-orange-500/40 flex items-center gap-1"
                  >
                    <Icon name="lucide:scan-line" class="w-3 h-3" /> Target
                  </span>
                  <span
                    v-else-if="item.status === 'skipped'"
                    class="px-2 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-medium"
                  >
                    Dilewati
                  </span>
                  <span
                    v-else
                    class="px-2 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-lg text-[10px] font-medium"
                  >
                    Belum
                  </span>
                </div>
              </div>
            </div>

            <!-- Footer Controls -->
            <div class="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
              <button
                @click="closeScanner"
                type="button"
                class="w-full py-2.5 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold rounded-xl border border-orange-400/30 shadow-lg shadow-orange-600/30 transition-all text-center cursor-pointer flex items-center justify-center gap-2"
              >
                <Icon name="lucide:check" class="w-4 h-4 text-white" />
                <span>Selesai & Keluar Scanner</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Interactive Product Selection Modal (Appears when barcode is scanned) -->
        <div v-if="showProductSelectionModal" class="fixed inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-4 backdrop-blur-md">
          <div class="bg-slate-900 border-2 border-orange-500/40 rounded-3xl max-w-lg w-full p-6 text-white space-y-4 shadow-2xl shadow-orange-950/80 max-h-[90vh] flex flex-col">
            <!-- Modal Header -->
            <div class="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  <Icon name="lucide:barcode" class="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 class="text-base font-extrabold text-white">Barcode / QR Code Terbaca!</h3>
                  <p class="text-xs text-slate-400">Pilih produk tujuan untuk memasukkan barcode ini</p>
                </div>
              </div>
              <button
                @click="closeProductSelectionModal"
                type="button"
                class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Abaikan & Scan Barcode Lain"
              >
                <Icon name="lucide:x" class="w-5 h-5" />
              </button>
            </div>

            <!-- Scanned Barcode Display Box -->
            <div class="p-3.5 bg-slate-950 rounded-2xl border-2 border-orange-500/40 flex items-center justify-between gap-3 shrink-0 shadow-inner">
              <div class="flex items-center gap-3 min-w-0">
                <Icon name="lucide:qr-code" class="w-6 h-6 text-orange-400 shrink-0" />
                <div class="min-w-0">
                  <span class="text-xs text-slate-400 block font-medium">Hasil Pemindaian Barcode:</span>
                  <span class="text-lg font-mono font-black text-orange-300 tracking-wider break-all select-all">
                    {{ scannedBarcodeResult }}
                  </span>
                </div>
              </div>
              <span class="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full shrink-0">
                Aktif
              </span>
            </div>

            <!-- Duplicate Barcode Warning Alert Banner -->
            <div v-if="duplicateWarning" class="p-3.5 bg-red-950/90 border border-red-500/60 rounded-2xl text-red-200 text-xs flex items-start gap-3 shrink-0 shadow-lg">
              <Icon name="lucide:alert-triangle" class="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div class="flex-1">
                <h5 class="font-bold text-red-100 text-sm">Peringatan Duplikasi Barcode!</h5>
                <p class="mt-0.5 text-red-300 leading-relaxed">{{ duplicateWarning }}</p>
                <p class="mt-1 text-[11px] text-red-400 italic">Barcode yang sudah digunakan produk lain tidak boleh terduplikasi.</p>
              </div>
            </div>

            <!-- Scrollable Body: Target Product Selection Options -->
            <div class="flex-1 overflow-y-auto space-y-4 pr-1">
              
              <!-- Section A: Pilihan Cepat Produk Target Antrean (if queue provided) -->
              <div v-if="items.length > 0" class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Icon name="lucide:sparkles" class="w-4 h-4 text-orange-400" />
                    <span>Pilihan Cepat Produk Antrean:</span>
                  </label>
                  <span class="text-[10px] text-slate-400 font-mono">{{ items.length }} Produk</span>
                </div>

                <div class="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                  <button
                    v-for="item in items"
                    :key="item.id"
                    @click="selectedTargetProduct = item"
                    type="button"
                    class="p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer"
                    :class="selectedTargetProduct?.id === item.id
                      ? 'bg-orange-950/80 border-orange-500 ring-2 ring-orange-500/60 shadow-lg shadow-orange-950/50'
                      : 'bg-slate-800/60 border-slate-700/60 hover:border-orange-500/40 hover:bg-slate-800'"
                  >
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2">
                        <Icon
                          :name="selectedTargetProduct?.id === item.id ? 'lucide:check-circle-2' : 'lucide:circle'"
                          class="w-4 h-4 shrink-0"
                          :class="selectedTargetProduct?.id === item.id ? 'text-orange-400' : 'text-slate-500'"
                        />
                        <p class="text-xs font-bold text-white truncate">{{ item.name }}</p>
                      </div>
                      <p v-if="item.brand || item.model" class="text-[11px] text-slate-400 font-mono pl-6 truncate">
                        {{ [item.brand, item.model].filter(Boolean).join(' - ') }}
                      </p>
                      <div class="pl-6 text-[10px] font-mono mt-0.5">
                        <span v-if="item.scannedBarcode" class="text-emerald-400 font-bold">
                          Terisi: {{ item.scannedBarcode }}
                        </span>
                        <span v-else-if="item.barcode" class="text-amber-300">
                          Lama: {{ item.barcode }}
                        </span>
                        <span v-else class="text-slate-500 italic">
                          Belum ada barcode
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Section B: Cari Produk Lainnya dari Seluruh Katalog Toko -->
              <div class="space-y-2">
                <label class="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Icon name="lucide:search" class="w-4 h-4 text-orange-400" />
                  <span>Atau Cari & Pilih Produk Lainnya:</span>
                </label>

                <div class="relative">
                  <input
                    v-model="searchProductQuery"
                    type="text"
                    placeholder="Ketik nama, brand, atau model produk..."
                    class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  />
                  <Icon name="lucide:search" class="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <button
                    v-if="searchProductQuery"
                    @click="searchProductQuery = ''"
                    type="button"
                    class="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    <Icon name="lucide:x" class="w-4 h-4" />
                  </button>
                </div>

                <!-- Dropdown / List Result for Other Products Search -->
                <div v-if="searchProductQuery.trim()" class="max-h-48 overflow-y-auto space-y-1.5 bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <div v-if="filteredOtherProducts.length === 0" class="text-center py-4 text-xs text-slate-500">
                    Tidak ada produk yang cocok dengan "{{ searchProductQuery }}"
                  </div>
                  <button
                    v-for="prod in filteredOtherProducts"
                    :key="prod.id"
                    @click="selectedTargetProduct = prod"
                    type="button"
                    class="w-full p-2.5 rounded-lg border text-left transition-all flex items-center justify-between gap-3 cursor-pointer"
                    :class="selectedTargetProduct?.id === prod.id
                      ? 'bg-orange-950/80 border-orange-500 ring-1 ring-orange-500'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'"
                  >
                    <div class="min-w-0 flex-1">
                      <p class="text-xs font-bold text-white truncate">{{ prod.name }}</p>
                      <p class="text-[11px] text-slate-400 font-mono truncate">
                        {{ [prod.brand, prod.model].filter(Boolean).join(' - ') || 'Tanpa Brand/Model' }}
                      </p>
                    </div>
                    <span v-if="prod.barcode" class="text-[10px] font-mono text-amber-300 shrink-0">
                      {{ prod.barcode }}
                    </span>
                    <span v-else class="text-[10px] text-slate-500 italic shrink-0">
                      Tanpa barcode
                    </span>
                  </button>
                </div>
              </div>

              <!-- Selected Product Indicator Summary -->
              <div v-if="selectedTargetProduct" class="p-3.5 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl flex items-center justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <span class="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider">Produk Tujuan Terpilih:</span>
                  <h4 class="text-sm font-extrabold text-white truncate">{{ selectedTargetProduct.name }}</h4>
                  <p v-if="selectedTargetProduct.brand || selectedTargetProduct.model" class="text-xs text-slate-300 font-mono truncate">
                    {{ [selectedTargetProduct.brand, selectedTargetProduct.model].filter(Boolean).join(' - ') }}
                  </p>
                </div>
                <Icon name="lucide:check-circle-2" class="w-6 h-6 text-emerald-400 shrink-0" />
              </div>

            </div>

            <!-- Modal Footer Actions -->
            <div class="flex items-center justify-between gap-3 pt-3 border-t border-slate-800 shrink-0">
              <button
                @click="closeProductSelectionModal"
                type="button"
                class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Icon name="lucide:refresh-cw" class="w-4 h-4" />
                <span>Abaikan & Scan Ulang</span>
              </button>

              <button
                @click="handleConfirmProductSave(false)"
                :disabled="!selectedTargetProduct || !!duplicateWarning || isSaving"
                type="button"
                class="px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                :class="selectedTargetProduct && !duplicateWarning
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-orange-600/30'
                  : 'bg-slate-800 text-slate-500'"
              >
                <Icon v-if="isSaving" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
                <Icon v-else name="lucide:save" class="w-4 h-4" />
                <span>Simpan Barcode ke Produk Ini</span>
              </button>
            </div>

          </div>
        </div>

        <!-- Overwrite Confirmation Modal -->
        <div v-if="overwriteTarget" class="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div class="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl">
            <div class="flex items-center gap-3 text-amber-400">
              <Icon name="lucide:alert-triangle" class="w-6 h-6 shrink-0" />
              <h3 class="text-base font-bold">Konfirmasi Timpa Barcode</h3>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed">
              Produk <strong class="text-white">{{ overwriteTarget.item.name }}</strong> sudah memiliki barcode lama
              <code class="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded font-mono">{{ overwriteTarget.item.barcode }}</code>.
              <br /><br />
              Apakah Anda yakin ingin menimpanya dengan barcode baru
              <code class="bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">{{ overwriteTarget.barcode }}</code>?
            </p>
            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                @click="cancelOverwrite"
                type="button"
                class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
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

        <!-- Warning Alert Modal (General Error) -->
        <div v-if="warningModal" class="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div class="bg-slate-900 border border-red-500/40 rounded-2xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl">
            <div class="flex items-center gap-3 text-red-400">
              <Icon name="lucide:alert-octagon" class="w-6 h-6 shrink-0" />
              <h3 class="text-base font-bold">Peringatan Barcode</h3>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed">
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
import { useDataCacheStore } from '~/stores/data-cache'

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

interface ScanHistoryLog {
  id: number
  barcode: string
  productId: number | string
  productName: string
  productBrand?: string
  productModel?: string
  timestamp: Date
}

const props = defineProps<{
  isOpen: boolean
  products: ProductProp[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'updated-product', productId: number | string, newBarcode: string): void
}>()

const dataCacheStore = useDataCacheStore()
const { playSuccessBeep, playErrorBeep, unlockAudio } = useAudioBeep()

const items = ref<QueueItem[]>([])
const sessionHistory = ref<ScanHistoryLog[]>([])
const activeDrawerTab = ref<'history' | 'queue'>('history')
const currentIndex = ref(0)
const isLocked = ref(false)
const isSaving = ref(false)
const showSuccessFlash = ref(false)

// Interactive Selection Modal State
const showProductSelectionModal = ref(false)
const scannedBarcodeResult = ref<string | null>(null)
const selectedTargetProduct = ref<any | null>(null)
const searchProductQuery = ref('')
const duplicateWarning = ref<string | null>(null)

const videoRef = ref<HTMLVideoElement | null>(null)
const targetBoxRef = ref<HTMLElement | null>(null)
const isLoadingCamera = ref(true)
const cameraError = ref<string | null>(null)
const isTorchOn = ref(false)
const hasTorchSupport = ref(false)
const activeEngine = ref<'BarcodeDetector' | 'ZXing' | 'None'>('None')

const overwriteTarget = ref<{ barcode: string; item: any } | null>(null)
const warningModal = ref<{ message: string } | null>(null)

let mediaStream: MediaStream | null = null
let mediaTrack: MediaStreamTrack | null = null
let animFrameId: number | null = null
let barcodeDetector: any = null
let zxingReader: any = null
let lockTimer: any = null
let roiCanvas: HTMLCanvasElement | null = null
let roiCtx: CanvasRenderingContext2D | null = null
let fullCanvas: HTMLCanvasElement | null = null
let fullCtx: CanvasRenderingContext2D | null = null
let lastScanTime = 0
let isDetecting = false
let scanPassCount = 0

const completedCount = computed(() => {
  return items.value.filter((i) => i.status === 'completed').length
})

const progressPercentage = computed(() => {
  if (items.value.length === 0) return 0
  return Math.round((completedCount.value / items.value.length) * 100)
})

const activeItem = computed(() => {
  if (currentIndex.value >= 0 && currentIndex.value < items.value.length) {
    return items.value[currentIndex.value]
  }
  return null
})

// Filter products for "Cari Produk Lainnya"
const filteredOtherProducts = computed(() => {
  const query = searchProductQuery.value.trim().toLowerCase()
  if (!query) return []
  const keywords = query.split(/\s+/).filter(Boolean)

  return (dataCacheStore.products || []).filter((p: any) => {
    const name = (p.name || '').toLowerCase()
    const brand = (p.brand || '').toLowerCase()
    const model = (p.model || '').toLowerCase()
    const barcode = (p.barcode || '').toLowerCase()

    return keywords.every((k) => name.includes(k) || brand.includes(k) || model.includes(k) || barcode.includes(k))
  }).slice(0, 25)
})

// Initialize items queue & session state whenever modal is opened
watch(
  () => props.isOpen,
  async (val) => {
    if (val) {
      unlockAudio()
      dataCacheStore.fetchProducts() // Ensure fresh cache

      items.value = (props.products || []).map((p) => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        model: p.model,
        barcode: p.barcode,
        status: 'pending',
        scannedBarcode: null
      }))

      sessionHistory.value = []
      activeDrawerTab.value = items.value.length > 0 ? 'queue' : 'history'
      currentIndex.value = 0
      overwriteTarget.value = null
      warningModal.value = null
      closeProductSelectionModal()

      await nextTick()
      initCamera()
    } else {
      stopEverything()
    }
  }
)

function formatTime(d: Date): string {
  const dateObj = new Date(d)
  return dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function selectActiveIndex(idx: number) {
  if (idx >= 0 && idx < items.value.length) {
    currentIndex.value = idx
  }
}

function advanceToNextPending() {
  const nextPendingIdx = items.value.findIndex((item, i) => i > currentIndex.value && item.status === 'pending')
  if (nextPendingIdx !== -1) {
    currentIndex.value = nextPendingIdx
    return
  }

  const firstPendingIdx = items.value.findIndex((item) => item.status === 'pending')
  if (firstPendingIdx !== -1) {
    currentIndex.value = firstPendingIdx
  }
}

// Extract high-contrast, uncompressed native-pixel ROI from viewfinder area (0ms instant path)
function getRoiCanvas(): HTMLCanvasElement | null {
  if (!videoRef.value) return null
  const video = videoRef.value
  const vw = video.videoWidth
  const vh = video.videoHeight
  if (!vw || !vh) return null

  let roiX = 0, roiY = 0, roiW = vw, roiH = vh

  if (targetBoxRef.value) {
    const vRect = video.getBoundingClientRect()
    const tRect = targetBoxRef.value.getBoundingClientRect()
    if (vRect.width && vRect.height && tRect.width && tRect.height) {
      const scale = Math.max(vRect.width / vw, vRect.height / vh)
      const offsetX = (vRect.width - vw * scale) / 2
      const offsetY = (vRect.height - vh * scale) / 2

      // Add generous margin (+15%) around target box
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

// Capture scaled full frame for wide-angle scanning anywhere in view (even rotated / 90 degrees)
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

async function initCamera() {
  if (!process.client) return
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

    // Enable continuous autofocus & detect flashlight support
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
    console.error('Interactive Scanner Camera access error:', err)
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      cameraError.value = 'Akses kamera ditolak. Silakan izinkan akses kamera di pengaturan browser.'
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
  if (!process.client || !videoRef.value) return

  if ('BarcodeDetector' in window) {
    try {
      activeEngine.value = 'BarcodeDetector'
      let formats: string[]
      try {
        const supported = await (window as any).BarcodeDetector.getSupportedFormats()
        formats = (supported || []).filter((f: string) => f !== 'itf' && f !== 'codabar')
      } catch (_) {
        formats = []
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
    if (!isLocked.value && !isDetecting && !showProductSelectionModal.value && !overwriteTarget.value && !warningModal.value && videoRef.value.readyState >= 2 && now - lastScanTime >= 35) {
      lastScanTime = now
      isDetecting = true
      scanPassCount++

      try {
        if (activeEngine.value === 'BarcodeDetector' && barcodeDetector) {
          // Native BarcodeDetector processes the full video frame directly & fast
          const barcodes = await barcodeDetector.detect(videoRef.value)
          if (barcodes && barcodes.length > 0) {
            const rawVal = barcodes[0].rawValue?.trim()
            if (rawVal) {
              processCandidateBarcode(rawVal)
            }
          }
        } else if (activeEngine.value === 'ZXing' && zxingReader) {
          // Priority 1: High-contrast ROI canvas for instant detection
          let result: any = null
          const roi = getRoiCanvas()
          if (roi) {
            try {
              const res = zxingReader.decodeFromCanvas(roi)
              result = res && typeof res.then === 'function' ? await res : res
            } catch (_) {}
          }

          // Priority 2: Scaled full canvas every alternating frame for 360-deg / rotated / off-center barcodes
          if (!result && scanPassCount % 2 === 0) {
            const full = getFullCanvas(640)
            if (full) {
              try {
                const res = zxingReader.decodeFromCanvas(full)
                result = res && typeof res.then === 'function' ? await res : res
              } catch (_) {}
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

function handleDetectedBarcode(scannedCode: string) {
  if (isLocked.value) return
  isLocked.value = true

  playSuccessBeep()

  scannedBarcodeResult.value = scannedCode
  searchProductQuery.value = ''
  selectedTargetProduct.value = null
  duplicateWarning.value = null
  overwriteTarget.value = null

  // 1. Check duplicate against dataCacheStore products
  const existingInDb = (dataCacheStore.products || []).find(
    (p: any) => p.barcode && p.barcode.trim().toLowerCase() === scannedCode.trim().toLowerCase()
  )

  // 2. Check duplicate against current session history
  const existingInSession = sessionHistory.value.find(
    (h) => h.barcode.trim().toLowerCase() === scannedCode.trim().toLowerCase()
  )

  if (existingInDb) {
    const brandModel = [existingInDb.brand, existingInDb.model].filter(Boolean).join(' - ')
    duplicateWarning.value = `Barcode "${scannedCode}" sudah digunakan oleh produk "${existingInDb.name}" ${brandModel ? `(${brandModel})` : ''}!`
  } else if (existingInSession) {
    const brandModel = [existingInSession.productBrand, existingInSession.productModel].filter(Boolean).join(' - ')
    duplicateWarning.value = `Barcode "${scannedCode}" sudah dipindai dalam sesi ini untuk produk "${existingInSession.productName}" ${brandModel ? `(${brandModel})` : ''}!`
  }

  // Pre-select active item queue if pending
  if (activeItem.value && activeItem.value.status === 'pending') {
    selectedTargetProduct.value = activeItem.value
  } else if (items.value.length > 0) {
    const firstPending = items.value.find((i) => i.status === 'pending')
    if (firstPending) {
      selectedTargetProduct.value = firstPending
    }
  }

  showProductSelectionModal.value = true
}

function closeProductSelectionModal() {
  showProductSelectionModal.value = false
  scannedBarcodeResult.value = null
  selectedTargetProduct.value = null
  searchProductQuery.value = ''
  duplicateWarning.value = null

  if (lockTimer) clearTimeout(lockTimer)
  lockTimer = setTimeout(() => {
    isLocked.value = false
  }, 400)
}

async function handleConfirmProductSave(force = false) {
  if (!selectedTargetProduct.value || !scannedBarcodeResult.value) return
  if (duplicateWarning.value && !force) {
    playErrorBeep()
    return
  }

  const product = selectedTargetProduct.value
  const code = scannedBarcodeResult.value

  await saveBarcodeToProduct(product, code, force)
}

async function saveBarcodeToProduct(product: any, code: string, force = false) {
  isSaving.value = true
  try {
    const res = await $fetch<any>(`/api/products/${product.id}/barcode`, {
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

      // Update dataCacheStore
      dataCacheStore.updateLocalProduct({ id: product.id, barcode: code })
      emit('updated-product', product.id, code)

      // Record in Session History
      sessionHistory.value.unshift({
        id: Date.now(),
        barcode: code,
        productId: product.id,
        productName: product.name,
        productBrand: product.brand,
        productModel: product.model,
        timestamp: new Date()
      })

      // Update queue item if matched
      const itemMatch = items.value.find((i) => String(i.id) === String(product.id))
      if (itemMatch) {
        itemMatch.status = 'completed'
        itemMatch.scannedBarcode = code
      }

      advanceToNextPending()
      closeProductSelectionModal()
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
      overwriteTarget.value = { barcode: code, item: product }
    } else {
      warningModal.value = { message: msg }
    }
  } finally {
    isSaving.value = false
  }
}

async function confirmOverwrite() {
  if (!overwriteTarget.value) return
  const { barcode: code, item: product } = overwriteTarget.value
  overwriteTarget.value = null
  await saveBarcodeToProduct(product, code, true)
}

function cancelOverwrite() {
  overwriteTarget.value = null
  closeProductSelectionModal()
}

function closeWarningModal() {
  warningModal.value = null
  closeProductSelectionModal()
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
  fullCanvas = null
  fullCtx = null
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
