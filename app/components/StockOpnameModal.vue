<template>
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/60 backdrop-blur-xs z-[70] flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      @click.self="handleClose"
    >
      <div
        class="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        <!-- Modal Header -->
        <div class="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white flex items-center justify-between shadow-xs shrink-0">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-white/15 rounded-xl backdrop-blur-xs">
              <Icon name="lucide:clipboard-check" class="w-6 h-6 text-white" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-lg sm:text-xl font-bold tracking-tight">Stock Opname</h3>
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white/95">
                  Audit Stok
                </span>
              </div>
              <p class="text-xs text-orange-100 hidden sm:block mt-0.5">
                Hitung fisik stok produk, sesuaikan jumlah, dan pantau riwayat audit
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="handleClose"
              class="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-full transition cursor-pointer"
              title="Tutup Modal"
            >
              <Icon name="lucide:x" class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Navigation Tabs & Stats Bar -->
        <div class="px-4 sm:px-6 py-2.5 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <!-- Mode Tabs -->
          <div class="flex items-center bg-gray-200/80 p-1 rounded-xl text-xs font-bold">
            <button
              @click="activeTab = 'sheet'"
              :class="[
                'px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer',
                activeTab === 'sheet'
                  ? 'bg-white text-orange-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900',
              ]"
            >
              <Icon name="lucide:clipboard-list" class="w-4 h-4 text-orange-600" />
              <span>Lembar Hitung Stok</span>
              <span
                class="ml-1 px-1.5 py-0.2 rounded-full text-[10px]"
                :class="activeTab === 'sheet' ? 'bg-orange-100 text-orange-800' : 'bg-gray-300 text-gray-700'"
              >
                {{ products.length }}
              </span>
            </button>

            <button
              @click="activeTab = 'history'"
              :class="[
                'px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer',
                activeTab === 'history'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900',
              ]"
            >
              <Icon name="lucide:history" class="w-4 h-4 text-blue-600" />
              <span>Riwayat Opname</span>
              <span
                v-if="historyTotalCount > 0"
                class="ml-1 px-1.5 py-0.2 rounded-full text-[10px]"
                :class="activeTab === 'history' ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 text-gray-700'"
              >
                {{ historyTotalCount }}
              </span>
            </button>
          </div>

          <!-- Quick Stats & Session Reset -->
          <div class="flex items-center gap-2 sm:gap-3 text-xs ml-auto">
            <div class="hidden sm:flex items-center gap-2">
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                <Icon name="lucide:check-circle" class="w-3.5 h-3.5 text-emerald-600" />
                Sudah: {{ opnamedCount }}
              </span>
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 border border-gray-200 font-semibold">
                <Icon name="lucide:clock" class="w-3.5 h-3.5 text-gray-400" />
                Belum: {{ unopnamedCount }}
              </span>
            </div>

            <!-- Reset Cycle Button -->
            <button
              @click="confirmResetSession"
              class="px-2.5 py-1 text-gray-500 hover:text-orange-700 hover:bg-orange-50 rounded-lg border border-gray-200 hover:border-orange-200 transition font-semibold flex items-center gap-1 cursor-pointer active:scale-95"
              title="Reset penandaan agar produk ditandai belum di-opname untuk periode baru"
            >
              <Icon name="lucide:rotate-ccw" class="w-3.5 h-3.5" />
              <span class="hidden md:inline">Reset Siklus</span>
            </button>
          </div>
        </div>

        <!-- TAB 1: LEMBAR HITUNG STOK (AUDIT SHEET) -->
        <div v-show="activeTab === 'sheet'" class="flex-1 flex flex-col min-h-0 overflow-hidden">
          <!-- Filters & Search Toolbar -->
          <div class="p-3 sm:px-6 sm:py-3.5 border-b border-gray-200 bg-white flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <!-- Search Input -->
            <div class="relative flex-1">
              <Icon name="lucide:search" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                v-model="sheetSearch"
                type="text"
                placeholder="Cari nama, merek, atau model produk..."
                class="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-medium transition"
              />
              <button
                v-if="sheetSearch"
                @click="sheetSearch = ''"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              >
                <Icon name="lucide:x-circle" class="w-4 h-4" />
              </button>
            </div>

            <!-- Filter Status Chips -->
            <div class="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto shrink-0">
              <button
                @click="sheetFilter = 'all'"
                :class="[
                  'px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap',
                  sheetFilter === 'all'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-800',
                ]"
              >
                Semua ({{ products.length }})
              </button>
              <button
                @click="sheetFilter = 'unopnamed'"
                :class="[
                  'px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer whitespace-nowrap',
                  sheetFilter === 'unopnamed'
                    ? 'bg-white text-orange-700 shadow-xs'
                    : 'text-gray-500 hover:text-gray-800',
                ]"
              >
                <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                Belum ({{ unopnamedCount }})
              </button>
              <button
                @click="sheetFilter = 'opnamed'"
                :class="[
                  'px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer whitespace-nowrap',
                  sheetFilter === 'opnamed'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-gray-500 hover:text-gray-800',
                ]"
              >
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                Sudah ({{ opnamedCount }})
              </button>
            </div>
          </div>

          <!-- Product Audit List -->
          <div class="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 bg-gray-50/60">
            <!-- Empty state -->
            <div
              v-if="filteredSheetProducts.length === 0"
              class="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed border-gray-300 p-6"
            >
              <div class="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-3">
                <Icon name="lucide:clipboard-x" class="w-6 h-6" />
              </div>
              <h4 class="text-base font-bold text-gray-800">Tidak ada produk ditemukan</h4>
              <p class="text-xs text-gray-500 max-w-sm mt-1">
                {{ sheetSearch ? `Tidak ada produk dengan kata kunci "${sheetSearch}" pada filter ini.` : 'Semua produk telah sesuai dengan filter yang dipilih.' }}
              </p>
              <button
                v-if="sheetSearch || sheetFilter !== 'all'"
                @click="sheetSearch = ''; sheetFilter = 'all'"
                class="mt-3 px-3 py-1.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-lg hover:bg-orange-200 transition"
              >
                Reset Filter
              </button>
            </div>

            <!-- Product Card Items -->
            <div
              v-for="product in filteredSheetProducts"
              :key="product.id"
              :class="[
                'bg-white rounded-xl p-3 sm:p-4 border transition-all duration-150 shadow-xs',
                isItemDirty(product.id)
                  ? 'border-orange-400 ring-2 ring-orange-200/50 bg-orange-50/20'
                  : product.lastStockOpnameAt
                  ? 'border-gray-200 hover:border-gray-300'
                  : 'border-amber-200/80 hover:border-amber-300'
              ]"
            >
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <!-- Product Details -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap mb-1">
                    <!-- Subtle Opname Status Badge -->
                    <span
                      v-if="product.lastStockOpnameAt"
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0"
                      title="Produk ini sudah di-stock opname"
                    >
                      <Icon name="lucide:check-circle-2" class="w-3 h-3 text-emerald-600" />
                      Sudah Opname
                      <span class="text-emerald-600 font-normal hidden md:inline">({{ formatShortDate(product.lastStockOpnameAt) }})</span>
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200 shrink-0"
                    >
                      <Icon name="lucide:clock" class="w-3 h-3 text-gray-400" />
                      Belum Opname
                    </span>

                    <span
                      v-if="!product.isActive"
                      class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-700 border border-red-200"
                    >
                      Non-Aktif
                    </span>
                  </div>

                  <h4 class="font-bold text-gray-900 text-sm sm:text-base leading-snug truncate">
                    {{ product.name }}
                  </h4>
                  <div class="text-xs text-gray-500 flex items-center gap-2 flex-wrap mt-0.5 font-medium">
                    <span v-if="product.brand && product.brand.trim() !== '-'">Merk: <strong class="text-gray-700">{{ product.brand }}</strong></span>
                    <span v-if="product.model && product.model.trim() !== '-'">• Model: <strong class="text-gray-700 font-mono">{{ product.model }}</strong></span>
                    <span v-if="product.barcode">• Barcode: <span class="font-mono text-gray-600">{{ product.barcode }}</span></span>
                  </div>
                </div>

                <!-- Stock Counter & Difference Controls -->
                <div class="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-4 shrink-0 bg-gray-50/80 p-2 sm:p-2.5 rounded-xl border border-gray-200/80">
                  <!-- System Stock Column -->
                  <div class="text-center px-2 py-0.5">
                    <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Stok Sistem</div>
                    <div class="text-sm sm:text-base font-black font-mono text-gray-700">
                      {{ product.stock }}
                    </div>
                  </div>

                  <!-- Arrow Divider -->
                  <div class="text-gray-300 hidden sm:block">
                    <Icon name="lucide:arrow-right" class="w-4 h-4" />
                  </div>

                  <!-- Physical Stock Stepper -->
                  <div class="flex flex-col items-center">
                    <div class="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Stok Fisik
                    </div>
                    <div class="flex items-center gap-1">
                      <!-- Minus Button -->
                      <button
                        @click="decrementStock(product)"
                        :disabled="getDraftStock(product) <= 0"
                        class="w-8 h-8 rounded-lg bg-white hover:bg-orange-50 active:bg-orange-100 border border-gray-300 hover:border-orange-300 text-gray-700 hover:text-orange-600 font-black text-sm flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs touch-manipulation"
                        title="Kurangi stok fisik (-1)"
                      >
                        <Icon name="lucide:minus" class="w-4 h-4" />
                      </button>

                      <!-- Direct Number Input -->
                      <input
                        type="number"
                        min="0"
                        :value="getDraftStock(product)"
                        @input="onStockInput(product, $event)"
                        class="w-16 h-8 text-center font-mono font-black text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-2xs"
                      />

                      <!-- Plus Button -->
                      <button
                        @click="incrementStock(product)"
                        class="w-8 h-8 rounded-lg bg-white hover:bg-orange-50 active:bg-orange-100 border border-gray-300 hover:border-orange-300 text-gray-700 hover:text-orange-600 font-black text-sm flex items-center justify-center transition cursor-pointer shadow-2xs touch-manipulation"
                        title="Tambah stok fisik (+1)"
                      >
                        <Icon name="lucide:plus" class="w-4 h-4" />
                      </button>

                      <!-- Quick Match Button (Sama) -->
                      <button
                        v-if="getDraftStock(product) !== product.stock"
                        @click="setStockSame(product)"
                        class="px-2 h-8 text-[11px] font-bold bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition ml-1 cursor-pointer"
                        title="Samakan stok fisik dengan stok sistem"
                      >
                        Sama
                      </button>
                    </div>
                  </div>

                  <!-- Difference Badge -->
                  <div class="text-center min-w-18 px-1">
                    <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Selisih</div>
                    <div v-if="getDifference(product) === 0">
                      <span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <Icon name="lucide:check" class="w-3 h-3 text-emerald-600" />
                        0 (Pas)
                      </span>
                    </div>
                    <div v-else-if="getDifference(product) > 0">
                      <span class="inline-flex items-center gap-1 text-[11px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        +{{ getDifference(product) }} (Lebih)
                      </span>
                    </div>
                    <div v-else>
                      <span class="inline-flex items-center gap-1 text-[11px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        {{ getDifference(product) }} (Kurang)
                      </span>
                    </div>
                  </div>

                  <!-- Save Single Product Button -->
                  <div class="flex items-center">
                    <button
                      @click="saveSingleProductOpname(product)"
                      :disabled="savingProductId === product.id"
                      class="h-8 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs active:scale-95"
                      :class="[
                        isItemDirty(product.id)
                          ? 'bg-orange-600 hover:bg-orange-700 text-white'
                          : product.lastStockOpnameAt
                          ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      ]"
                    >
                      <Icon
                        :name="savingProductId === product.id ? 'lucide:loader-2' : 'lucide:check'"
                        class="w-3.5 h-3.5"
                        :class="{ 'animate-spin': savingProductId === product.id }"
                      />
                      <span>{{ product.lastStockOpnameAt && !isItemDirty(product.id) ? 'Update' : 'Simpan' }}</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Optional Notes Input (shows or expands when there is a difference or user clicks add note) -->
              <div v-if="getDifference(product) !== 0 || getDraftNotes(product) || showNoteForId === product.id" class="mt-2.5 pt-2 border-t border-gray-100 flex items-center gap-2">
                <Icon name="lucide:message-square" class="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  :value="getDraftNotes(product)"
                  @input="onNotesInput(product, $event)"
                  placeholder="Keterangan selisih (misal: barang rusak, selisih pengiriman, dll)..."
                  class="flex-1 text-xs py-1 px-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div v-else class="mt-1 flex justify-end">
                <button
                  @click="showNoteForId = product.id"
                  class="text-[11px] text-gray-400 hover:text-orange-600 flex items-center gap-1 transition cursor-pointer"
                >
                  <Icon name="lucide:plus" class="w-3 h-3" />
                  <span>Tambah Catatan</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Sticky Footer Action Bar -->
          <div class="p-3 sm:px-6 sm:py-3 bg-white border-t border-gray-200 flex items-center justify-between gap-3 shrink-0 shadow-lg">
            <div class="text-xs text-gray-600">
              <span v-if="dirtyCount > 0" class="font-bold text-orange-600">
                <Icon name="lucide:alert-circle" class="w-3.5 h-3.5 inline mr-1 text-orange-500" />
                {{ dirtyCount }} produk telah diubah
              </span>
              <span v-else class="text-gray-500">
                Telah di-opname: <strong class="text-emerald-600 font-bold">{{ opnamedCount }}</strong> dari {{ products.length }} produk
              </span>
            </div>

            <div class="flex items-center gap-2">
              <button
                @click="resetAllDrafts"
                v-if="dirtyCount > 0"
                class="px-3 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition cursor-pointer"
              >
                Reset Perubahan
              </button>

              <button
                @click="saveAllModifiedOpnames"
                :disabled="dirtyCount === 0 || isSavingBatch"
                class="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer active:scale-95"
              >
                <Icon
                  :name="isSavingBatch ? 'lucide:loader-2' : 'lucide:save'"
                  class="w-4 h-4"
                  :class="{ 'animate-spin': isSavingBatch }"
                />
                <span>{{ isSavingBatch ? 'Menyimpan...' : `Simpan Semua Perubahan (${dirtyCount})` }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- TAB 2: RIWAYAT & CRUD STOCK OPNAME -->
        <div v-show="activeTab === 'history'" class="flex-1 flex flex-col min-h-0 overflow-hidden bg-gray-50/50">
          <!-- History Filters Toolbar -->
          <div class="p-3 sm:px-6 sm:py-3.5 border-b border-gray-200 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
            <!-- Search in History -->
            <div class="relative flex-1">
              <Icon name="lucide:search" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                v-model="historySearch"
                @input="debouncedFetchHistory"
                type="text"
                placeholder="Cari riwayat produk atau catatan..."
                class="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium transition"
              />
            </div>

            <!-- Filter Type Difference -->
            <div class="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto shrink-0">
              <button
                @click="changeDifferenceFilter('all')"
                :class="[
                  'px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap',
                  historyDiffFilter === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
                ]"
              >
                Semua
              </button>
              <button
                @click="changeDifferenceFilter('mismatch')"
                :class="[
                  'px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap',
                  historyDiffFilter === 'mismatch' ? 'bg-white text-rose-700 shadow-xs' : 'text-gray-500 hover:text-gray-800'
                ]"
              >
                Ada Selisih
              </button>
              <button
                @click="changeDifferenceFilter('match')"
                :class="[
                  'px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap',
                  historyDiffFilter === 'match' ? 'bg-white text-emerald-700 shadow-xs' : 'text-gray-500 hover:text-gray-800'
                ]"
              >
                Sesuai (0)
              </button>
            </div>
          </div>

          <!-- History Table / List -->
          <div class="flex-1 overflow-y-auto p-3 sm:p-6">
            <!-- Loading History -->
            <div v-if="loadingHistory" class="flex flex-col items-center justify-center py-20 text-center">
              <Icon name="lucide:loader-2" class="w-9 h-9 animate-spin text-blue-600 mb-2" />
              <p class="text-xs font-bold text-gray-500">Memuat riwayat stock opname...</p>
            </div>

            <!-- Empty History -->
            <div
              v-else-if="stockOpnameHistory.length === 0"
              class="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-gray-300 p-6"
            >
              <Icon name="lucide:archive" class="w-12 h-12 text-gray-300 mb-3" />
              <h4 class="text-base font-bold text-gray-800">Belum Ada Riwayat Opname</h4>
              <p class="text-xs text-gray-500 max-w-sm mt-1">
                Data riwayat akan otomatis tercatat setiap kali Anda menyimpan hasil hitungan fisik pada tab "Lembar Hitung Stok".
              </p>
            </div>

            <!-- History Items Table -->
            <div v-else class="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse min-w-[750px]">
                  <thead class="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    <tr>
                      <th class="p-3.5">Tanggal & Waktu</th>
                      <th class="p-3.5">Produk</th>
                      <th class="p-3.5 text-center">Stok Sistem</th>
                      <th class="p-3.5 text-center">Stok Fisik</th>
                      <th class="p-3.5 text-center">Selisih</th>
                      <th class="p-3.5">Catatan</th>
                      <th class="p-3.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 text-sm">
                    <tr
                      v-for="record in stockOpnameHistory"
                      :key="record.id"
                      class="hover:bg-blue-50/30 transition-colors"
                    >
                      <!-- Date -->
                      <td class="p-3.5 whitespace-nowrap text-xs text-gray-500 font-medium">
                        {{ formatFullDate(record.createdAt) }}
                      </td>

                      <!-- Product -->
                      <td class="p-3.5">
                        <div class="font-bold text-gray-900 leading-tight">
                          {{ record.product?.name || 'Produk Dihapus' }}
                        </div>
                        <div class="text-xs text-gray-500 mt-0.5">
                          {{ record.product?.brand || '-' }} • <span class="font-mono">{{ record.product?.model || '-' }}</span>
                        </div>
                      </td>

                      <!-- System Stock -->
                      <td class="p-3.5 text-center font-mono font-semibold text-gray-600">
                        {{ record.systemStock }}
                      </td>

                      <!-- Physical Stock -->
                      <td class="p-3.5 text-center font-mono font-black text-gray-900">
                        {{ record.physicalStock }}
                      </td>

                      <!-- Difference -->
                      <td class="p-3.5 text-center whitespace-nowrap">
                        <span
                          v-if="record.difference === 0"
                          class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200"
                        >
                          <Icon name="lucide:check" class="w-3 h-3 text-emerald-600" />
                          0 (Pas)
                        </span>
                        <span
                          v-else-if="record.difference > 0"
                          class="inline-flex items-center gap-1 text-[11px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200"
                        >
                          +{{ record.difference }} (Lebih)
                        </span>
                        <span
                          v-else
                          class="inline-flex items-center gap-1 text-[11px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200"
                        >
                          {{ record.difference }} (Kurang)
                        </span>
                      </td>

                      <!-- Notes -->
                      <td class="p-3.5 text-xs text-gray-600 max-w-xs truncate">
                        <span v-if="record.notes" class="italic">{{ record.notes }}</span>
                        <span v-else class="text-gray-300">-</span>
                      </td>

                      <!-- CRUD Actions (Edit & Delete) -->
                      <td class="p-3.5 text-center whitespace-nowrap">
                        <div class="flex items-center justify-center gap-1.5">
                          <button
                            @click="openEditModal(record)"
                            class="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Edit Riwayat Opname"
                          >
                            <Icon name="lucide:edit-2" class="w-4 h-4" />
                          </button>
                          <button
                            @click="deleteOpnameRecord(record)"
                            :disabled="deletingId === record.id"
                            class="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition disabled:opacity-40 cursor-pointer"
                            title="Hapus riwayat dan kembalikan penyesuaian stok"
                          >
                            <Icon
                              :name="deletingId === record.id ? 'lucide:loader-2' : 'lucide:trash-2'"
                              class="w-4 h-4"
                              :class="{ 'animate-spin': deletingId === record.id }"
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- History Pagination -->
              <div v-if="historyTotalPages > 1" class="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs">
                <span class="text-gray-600 font-medium">
                  Halaman {{ historyPage }} dari {{ historyTotalPages }} (Total {{ historyTotalCount }} data)
                </span>
                <div class="flex items-center gap-1.5">
                  <button
                    @click="goToHistoryPage(historyPage - 1)"
                    :disabled="historyPage <= 1"
                    class="px-2.5 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
                  >
                    ← Sebelumnya
                  </button>
                  <button
                    @click="goToHistoryPage(historyPage + 1)"
                    :disabled="historyPage >= historyTotalPages"
                    class="px-2.5 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
                  >
                    Berikutnya →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- EDIT OPNAME RECORD MODAL (CRUD Update) -->
  <Transition name="fade">
    <div
      v-if="showEditRecordModal && editingRecord"
      class="fixed inset-0 bg-black/60 backdrop-blur-xs z-[80] flex items-center justify-center p-4 overflow-y-auto"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 my-auto">
        <div class="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
            <Icon name="lucide:edit-3" class="w-5 h-5 text-blue-600" />
            Edit Catatan Opname
          </h3>
          <button
            @click="showEditRecordModal = false"
            class="text-gray-400 hover:text-gray-600 p-1"
          >
            <Icon name="lucide:x" class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-4">
          <!-- Product Name Info -->
          <div class="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
            <div class="font-bold text-gray-900 text-sm mb-0.5">
              {{ editingRecord.product?.name }}
            </div>
            <div class="text-gray-500">
              Merk: {{ editingRecord.product?.brand || '-' }} • Model: {{ editingRecord.product?.model || '-' }}
            </div>
          </div>

          <!-- Stock Comparators -->
          <div class="grid grid-cols-2 gap-3 text-center">
            <div class="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <span class="text-[10px] font-bold text-gray-400 uppercase">Stok Sistem Awal</span>
              <div class="text-lg font-black font-mono text-gray-700 mt-0.5">
                {{ editingRecord.systemStock }}
              </div>
            </div>
            <div class="p-3 bg-blue-50/50 rounded-xl border border-blue-200">
              <span class="text-[10px] font-bold text-blue-600 uppercase">Stok Fisik Baru</span>
              <div class="flex items-center justify-center gap-2 mt-1">
                <button
                  @click="editDraftStock = Math.max(0, editDraftStock - 1)"
                  class="w-7 h-7 rounded-lg bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 font-bold flex items-center justify-center cursor-pointer"
                >
                  <Icon name="lucide:minus" class="w-3.5 h-3.5" />
                </button>
                <input
                  v-model.number="editDraftStock"
                  type="number"
                  min="0"
                  class="w-14 h-7 text-center font-mono font-black text-base bg-white border border-blue-300 rounded-lg focus:outline-none"
                />
                <button
                  @click="editDraftStock++"
                  class="w-7 h-7 rounded-lg bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 font-bold flex items-center justify-center cursor-pointer"
                >
                  <Icon name="lucide:plus" class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Difference Preview -->
          <div class="p-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold"
            :class="[
              editDraftStock - editingRecord.systemStock === 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : editDraftStock - editingRecord.systemStock > 0
                ? 'bg-blue-50 border-blue-200 text-blue-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            ]"
          >
            <span>Selisih Revisi:</span>
            <span class="font-black text-sm font-mono">
              {{ editDraftStock - editingRecord.systemStock > 0 ? `+${editDraftStock - editingRecord.systemStock}` : editDraftStock - editingRecord.systemStock }}
            </span>
          </div>

          <!-- Notes Input -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5">Catatan / Alasan Revisi</label>
            <input
              v-model="editDraftNotes"
              type="text"
              placeholder="Contoh: Koreksi hitungan fisik..."
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 pt-2">
            <button
              @click="saveEditRecord"
              :disabled="isUpdatingRecord || editDraftStock === undefined || editDraftStock < 0"
              class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Icon
                :name="isUpdatingRecord ? 'lucide:loader-2' : 'lucide:check'"
                class="w-4 h-4"
                :class="{ 'animate-spin': isUpdatingRecord }"
              />
              <span>{{ isUpdatingRecord ? 'Menyimpan...' : 'Simpan Revisi' }}</span>
            </button>
            <button
              @click="showEditRecordModal = false"
              class="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs sm:text-sm transition cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

const props = defineProps<{
  isOpen: boolean;
  products: any[];
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "stock-updated", updatedProducts: any[]): void;
  (e: "show-toast", message: string): void;
}>();

// Tab state
const activeTab = ref<"sheet" | "history">("sheet");

// Sheet state
const sheetSearch = ref("");
const sheetFilter = ref<"all" | "unopnamed" | "opnamed">("all");
const draftStocks = ref<Record<number, number>>({});
const draftNotes = ref<Record<number, string>>({});
const showNoteForId = ref<number | null>(null);
const savingProductId = ref<number | null>(null);
const isSavingBatch = ref(false);

// History state
const stockOpnameHistory = ref<any[]>([]);
const historyTotalCount = ref(0);
const historyPage = ref(1);
const historyLimit = ref(20);
const historyTotalPages = ref(1);
const historySearch = ref("");
const historyDiffFilter = ref<"all" | "mismatch" | "match">("all");
const loadingHistory = ref(false);
const deletingId = ref<number | null>(null);

// Edit Record Modal state (CRUD Update)
const showEditRecordModal = ref(false);
const editingRecord = ref<any>(null);
const editDraftStock = ref<number>(0);
const editDraftNotes = ref<string>("");
const isUpdatingRecord = ref(false);

// Debounce timer for search
let searchTimer: any = null;

// Initialize drafts from products when opened or changed
const initializeDrafts = () => {
  const newDrafts: Record<number, number> = {};
  for (const p of props.products) {
    if (draftStocks.value[p.id] === undefined) {
      newDrafts[p.id] = p.stock ?? 0;
    } else {
      newDrafts[p.id] = draftStocks.value[p.id];
    }
  }
  draftStocks.value = newDrafts;
};

// Watch for modal open to initialize and fetch
watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      initializeDrafts();
      fetchHistory();
    }
  },
  { immediate: true }
);

watch(
  () => props.products,
  () => {
    initializeDrafts();
  },
  { deep: true }
);

// Computed stats
const opnamedCount = computed(() => {
  return props.products.filter((p) => Boolean(p.lastStockOpnameAt)).length;
});

const unopnamedCount = computed(() => {
  return props.products.length - opnamedCount.value;
});

// Sheet filtered products
const filteredSheetProducts = computed(() => {
  return props.products.filter((p) => {
    // 1. Status Filter
    if (sheetFilter.value === "opnamed" && !p.lastStockOpnameAt) return false;
    if (sheetFilter.value === "unopnamed" && p.lastStockOpnameAt) return false;

    // 2. Search
    if (!sheetSearch.value.trim()) return true;
    const query = sheetSearch.value.trim().toLowerCase();
    const fullName = `${p.name || ""} ${p.brand || ""} ${p.model || ""} ${p.otherName || ""} ${p.barcode || ""}`.toLowerCase();
    return fullName.includes(query);
  });
});

// Draft helper functions
const getDraftStock = (product: any): number => {
  if (draftStocks.value[product.id] !== undefined) {
    return draftStocks.value[product.id];
  }
  return product.stock ?? 0;
};

const getDraftNotes = (product: any): string => {
  return draftNotes.value[product.id] || "";
};

const getDifference = (product: any): number => {
  const physical = getDraftStock(product);
  const system = product.stock ?? 0;
  return physical - system;
};

const isItemDirty = (productId: number): boolean => {
  const product = props.products.find((p) => p.id === productId);
  if (!product) return false;
  const draftVal = draftStocks.value[productId];
  const hasStockDiff = draftVal !== undefined && draftVal !== (product.stock ?? 0);
  const hasNotes = Boolean(draftNotes.value[productId]?.trim());
  return hasStockDiff || hasNotes;
};

const dirtyCount = computed(() => {
  let count = 0;
  for (const p of props.products) {
    if (isItemDirty(p.id)) count++;
  }
  return count;
});

const decrementStock = (product: any) => {
  const current = getDraftStock(product);
  if (current > 0) {
    draftStocks.value[product.id] = current - 1;
  }
};

const incrementStock = (product: any) => {
  const current = getDraftStock(product);
  draftStocks.value[product.id] = current + 1;
};

const setStockSame = (product: any) => {
  draftStocks.value[product.id] = product.stock ?? 0;
};

const onStockInput = (product: any, evt: Event) => {
  const val = parseInt((evt.target as HTMLInputElement).value, 10);
  draftStocks.value[product.id] = isNaN(val) ? 0 : Math.max(0, val);
};

const onNotesInput = (product: any, evt: Event) => {
  draftNotes.value[product.id] = (evt.target as HTMLInputElement).value;
};

const resetAllDrafts = () => {
  initializeDrafts();
  draftNotes.value = {};
};

// Save single product opname
const saveSingleProductOpname = async (product: any) => {
  try {
    savingProductId.value = product.id;
    const physicalStock = getDraftStock(product);
    const notes = getDraftNotes(product);

    const res = await $fetch<any>("/api/stock-opname", {
      method: "POST",
      body: {
        productId: product.id,
        physicalStock,
        notes: notes || undefined,
      },
    });

    if (res.success && res.updatedProducts?.length > 0) {
      emit("stock-updated", res.updatedProducts);
      emit("show-toast", `Stock opname "${product.name}" berhasil disimpan!`);
      // Clear notes draft for this item
      delete draftNotes.value[product.id];
      // Refresh history list in background
      fetchHistory();
    }
  } catch (error: any) {
    console.error("Save single opname error:", error);
    alert(error?.statusMessage || error?.message || "Gagal menyimpan stock opname");
  } finally {
    savingProductId.value = null;
  }
};

// Save all modified products in batch
const saveAllModifiedOpnames = async () => {
  const itemsToSave: Array<{ productId: number; physicalStock: number; notes?: string }> = [];

  for (const p of props.products) {
    if (isItemDirty(p.id)) {
      itemsToSave.push({
        productId: p.id,
        physicalStock: getDraftStock(p),
        notes: getDraftNotes(p) || undefined,
      });
    }
  }

  if (itemsToSave.length === 0) return;

  try {
    isSavingBatch.value = true;
    const res = await $fetch<any>("/api/stock-opname", {
      method: "POST",
      body: { items: itemsToSave },
    });

    if (res.success && res.updatedProducts) {
      emit("stock-updated", res.updatedProducts);
      emit("show-toast", `Berhasil menyimpan stock opname untuk ${itemsToSave.length} produk!`);
      resetAllDrafts();
      fetchHistory();
    }
  } catch (error: any) {
    console.error("Save batch opname error:", error);
    alert(error?.statusMessage || error?.message || "Gagal menyimpan stock opname");
  } finally {
    isSavingBatch.value = false;
  }
};

// Fetch History
const fetchHistory = async () => {
  try {
    loadingHistory.value = true;
    let url = `/api/stock-opname?page=${historyPage.value}&limit=${historyLimit.value}`;
    if (historySearch.value.trim()) {
      url += `&search=${encodeURIComponent(historySearch.value.trim())}`;
    }
    if (historyDiffFilter.value !== "all") {
      url += `&differenceType=${historyDiffFilter.value}`;
    }

    const res = await $fetch<any>(url);
    if (res.success) {
      stockOpnameHistory.value = res.stockOpnames || [];
      historyTotalCount.value = res.total || 0;
      historyTotalPages.value = res.totalPages || 1;
    }
  } catch (err) {
    console.error("Fetch stock opname history error:", err);
  } finally {
    loadingHistory.value = false;
  }
};

const debouncedFetchHistory = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    historyPage.value = 1;
    fetchHistory();
  }, 300);
};

const changeDifferenceFilter = (val: "all" | "mismatch" | "match") => {
  historyDiffFilter.value = val;
  historyPage.value = 1;
  fetchHistory();
};

const goToHistoryPage = (page: number) => {
  if (page >= 1 && page <= historyTotalPages.value) {
    historyPage.value = page;
    fetchHistory();
  }
};

// CRUD: Edit Record
const openEditModal = (record: any) => {
  editingRecord.value = record;
  editDraftStock.value = record.physicalStock;
  editDraftNotes.value = record.notes || "";
  showEditRecordModal.value = true;
};

const saveEditRecord = async () => {
  if (!editingRecord.value) return;

  try {
    isUpdatingRecord.value = true;
    const res = await $fetch<any>(`/api/stock-opname/${editingRecord.value.id}`, {
      method: "PUT",
      body: {
        physicalStock: editDraftStock.value,
        notes: editDraftNotes.value || undefined,
      },
    });

    if (res.success) {
      showEditRecordModal.value = false;
      emit("show-toast", "Catatan opname berhasil diperbarui!");
      if (res.product) {
        emit("stock-updated", [res.product]);
        draftStocks.value[res.product.id] = res.product.stock;
      }
      fetchHistory();
    }
  } catch (error: any) {
    console.error("Update opname error:", error);
    alert(error?.statusMessage || error?.message || "Gagal mengedit stock opname");
  } finally {
    isUpdatingRecord.value = false;
  }
};

// CRUD: Delete Record
const deleteOpnameRecord = async (record: any) => {
  const prodName = record.product?.name || "produk ini";
  const ok = confirm(`Hapus riwayat stock opname untuk ${prodName}? Penyesuaian stok akan dikembalikan.`);
  if (!ok) return;

  try {
    deletingId.value = record.id;
    const res = await $fetch<any>(`/api/stock-opname/${record.id}`, {
      method: "DELETE",
    });

    if (res.success) {
      emit("show-toast", res.message || "Riwayat opname berhasil dihapus!");
      if (res.product) {
        emit("stock-updated", [res.product]);
        draftStocks.value[res.product.id] = res.product.stock;
      }
      fetchHistory();
    }
  } catch (error: any) {
    console.error("Delete opname error:", error);
    alert(error?.statusMessage || error?.message || "Gagal menghapus riwayat opname");
  } finally {
    deletingId.value = null;
  }
};

// Reset Session (Cycle)
const confirmResetSession = async () => {
  const ok = confirm(
    "Mulai siklus baru stock opname?\n\nSemua produk akan ditandai 'Belum Opname' agar siap diperiksa kembali untuk periode baru. Seluruh data riwayat audit lama tetap tersimpan dengan aman."
  );
  if (!ok) return;

  try {
    const res = await $fetch<any>("/api/stock-opname/reset-session", {
      method: "POST",
    });

    if (res.success) {
      emit("show-toast", res.message || "Siklus opname berhasil direset!");
      // Mark all local products as unopnamed
      const updated = props.products.map((p) => ({
        ...p,
        lastStockOpnameAt: null,
      }));
      emit("stock-updated", updated);
      initializeDrafts();
    }
  } catch (error: any) {
    console.error("Reset session error:", error);
    alert(error?.statusMessage || error?.message || "Gagal mereset siklus opname");
  }
};

// Helper Formatters
const formatShortDate = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
};

const formatFullDate = (dateStr: string) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const handleClose = () => {
  if (dirtyCount.value > 0) {
    const ok = confirm("Ada perubahan stok yang belum disimpan. Anda yakin ingin menutup?");
    if (!ok) return;
  }
  emit("close");
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
