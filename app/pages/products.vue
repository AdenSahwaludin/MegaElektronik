<template>
  <div class="h-[100dvh] w-full bg-orange-50 flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom)]">
    <!-- App Header with Navigation -->
    <AppHeader />

    <!-- Main Content -->
    <div class="mt-3 flex-1 overflow-y-auto p-4 lg:p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Low Stock Warning (Out of Stock Alert) -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-4"
        >
          <div
            v-if="lowStockProducts.length > 0"
            class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800 flex flex-col gap-1.5 shadow-sm"
          >
            <div class="flex items-center gap-2 font-bold text-amber-900">
              <Icon name="lucide:alert-triangle" class="w-5 h-5 text-amber-600 shrink-0" />
              <span>Ada {{ lowStockProducts.length }} produk stok habis!</span>
            </div>
            <div class="text-xs text-amber-700 font-medium pb-0.5">
              Produk habis: {{ lowStockProducts.map(p => {
                let str = p.name || '';
                if (p.brand && p.brand.trim() !== '' && p.brand !== 'No Brand') str += ' ' + p.brand;
                if (p.model && p.model.trim() !== '' && p.model !== '-' && p.model.toLowerCase() !== 'standar' && p.model.toLowerCase() !== 'standard') str += ' ' + p.model;
                return str;
              }).join(', ') }}
            </div>
          </div>
        </Transition>

        <!-- Add Product Section -->
        <div class="bg-white rounded-lg shadow p-6 mb-8">
          <div class="flex items-center justify-between mb-4">
            <h2
              class="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2"
            >
              <Icon name="lucide:plus-circle" class="w-6 h-6 text-orange-600" />
              Tambah Produk Baru
            </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Nama Produk <span class="text-red-500">*</span></label
              >
              <input
                v-model="newProduct.name"
                type="text"
                placeholder="Kipas Angin"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Merk</label
              >
              <input
                v-model="newProduct.brand"
                type="text"
                placeholder="Sanex"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Model/Tipe</label
              >
              <input
                v-model="newProduct.model"
                type="text"
                placeholder="FS-1899"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Nama Lain <span class="text-xs font-normal text-gray-500">Opsional</span></label
              >
              <input
                v-model="newProduct.otherName"
                type="text"
                placeholder="Alias untuk pencarian"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Stok <span class="text-red-500">*</span></label
              >
              <input
                :value="newProduct.stock !== undefined ? formatNumber(newProduct.stock) : ''"
                @input="newProduct.stock = parseFromDisplay(($event.target as HTMLInputElement).value)"
                type="text"
                inputmode="numeric"
                placeholder="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Harga Service (Teknisi)</label
              >
              <input
                :value="newProduct.servicePrice ? formatNumber(newProduct.servicePrice) : ''"
                @input="newProduct.servicePrice = parseFromDisplay(($event.target as HTMLInputElement).value)"
                type="text"
                inputmode="numeric"
                placeholder="Khusus teknisi"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Harga Tawar (Rp) <span class="text-red-500">*</span></label
              >
              <input
                :value="newProduct.askingPrice ? formatNumber(newProduct.askingPrice) : ''"
                @input="newProduct.askingPrice = parseFromDisplay(($event.target as HTMLInputElement).value)"
                type="text"
                inputmode="numeric"
                placeholder="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Harga Pas (Rp)</label
              >
              <input
                :value="newProduct.fixedPrice ? formatNumber(newProduct.fixedPrice) : ''"
                @input="newProduct.fixedPrice = parseFromDisplay(($event.target as HTMLInputElement).value)"
                type="text"
                inputmode="numeric"
                placeholder="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
<div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Harga Beli (Rp) <span class="text-red-500">*</span></label
              >
              <input
                :value="newProduct.buyPrice ? formatNumber(newProduct.buyPrice) : ''"
                @input="newProduct.buyPrice = parseFromDisplay(($event.target as HTMLInputElement).value)"
                type="text"
                inputmode="numeric"
                placeholder="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>



            <div class="flex items-center gap-2 mt-auto pb-2">
              <input
                type="checkbox"
                id="isActiveNew"
                v-model="newProduct.isActive"
                class="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label for="isActiveNew" class="text-sm font-semibold text-gray-700">Produk Aktif</label>
            </div>

            <div class="flex items-end gap-2">
              <button
                @click="addProduct"
                :disabled="
                  !newProduct.name ||
                  newProduct.stock === undefined ||
                  !newProduct.buyPrice ||
                  !newProduct.askingPrice
                "
                class="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
              >
                <Icon name="lucide:check" class="w-5 h-5" />
                <span class="hidden sm:inline">Tambah</span>
              </button>
              <button
                @click="resetForm"
                class="flex-1 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
              >
                <Icon name="lucide:x" class="w-5 h-5" />
                <span class="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Products Table -->
        <div class="bg-white rounded-lg shadow overflow-hidden min-h-[600px]">
          <div class="px-6 py-4 bg-orange-600 text-white flex justify-between items-center">
            <h2 class="text-lg lg:text-xl font-bold flex items-center gap-2">
              <Icon name="lucide:list" class="w-6 h-6" />
              Daftar Produk ({{ totalItems }})
            </h2>
            <div class="flex gap-2">
              <button
                @click="showArrivalModal = true"
                class="px-4 py-2 bg-white text-green-700 hover:bg-green-50 font-bold rounded-lg shadow-sm transition flex items-center gap-2 text-sm"
                title="Catat Barang Datang"
              >
                <Icon name="lucide:truck" class="w-5 h-5" />
                <span class="hidden sm:inline">Barang Datang</span>
              </button>
              <button
                @click="printProductList"
                class="px-4 py-2 bg-white text-orange-700 hover:bg-orange-50 font-bold rounded-lg shadow-sm transition flex items-center gap-2 text-sm"
                title="Cetak Semua Daftar Harga"
              >
                <Icon name="lucide:printer" class="w-5 h-5" />
                <span class="hidden sm:inline">Cetak Semua Harga</span>
              </button>
            </div>
          </div>

          <!-- Search and Quick Categories Controls -->
          <div class="px-4 lg:px-6 py-4 border-b border-gray-200 space-y-3.5 bg-gray-50/50">
            <!-- Search & Filter Actions -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div class="relative flex-1">
                <Icon name="lucide:search" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Cari produk pake nama, merk, atau model..."
                  class="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium text-sm text-gray-800 placeholder-gray-400 shadow-sm transition"
                />
                <button
                  v-if="searchQuery"
                  @click="searchQuery = ''"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded-full"
                  title="Clear search"
                >
                  <Icon name="lucide:x-circle" class="w-4 h-4" />
                </button>
              </div>

              <!-- Quick Categories Toggle Button -->
              <button
                @click="showCategories = !showCategories"
                class="px-3.5 py-2.5 bg-white hover:bg-orange-50 text-orange-700 border border-orange-200 hover:border-orange-300 font-bold rounded-xl shadow-sm text-xs transition flex items-center justify-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
                title="Tampilkan / Sembunyikan Kategori Cepat"
              >
                <Icon name="lucide:tags" class="w-4 h-4 text-orange-500" />
                <span>{{ showCategories ? 'Sembunyikan Kategori' : 'Kategori Cepat' }}</span>
                <Icon :name="showCategories ? 'lucide:chevron-up' : 'lucide:chevron-down'" class="w-3.5 h-3.5 text-orange-500" />
              </button>
            </div>

            <!-- Quick Categories Chips Bar -->
            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 max-h-0 -translate-y-2 overflow-hidden"
              enter-to-class="opacity-100 max-h-64 translate-y-0"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100 max-h-64 translate-y-0"
              leave-to-class="opacity-0 max-h-0 -translate-y-2 overflow-hidden"
            >
              <div v-show="showCategories" class="pt-1">
                <!-- Scrollable Category Chips Container -->
                <div class="relative group">
                  <div class="flex items-center gap-2 overflow-x-auto py-1.5 px-0.5 scrollbar-hide scroll-smooth">
                    
                    <!-- "Semua Produk" Pill -->
                    <button
                      @click="searchQuery = ''"
                      :class="[
                        'px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shrink-0 shadow-sm border active:scale-95 cursor-pointer select-none',
                        !searchQuery
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-500 shadow-orange-500/20 ring-2 ring-orange-400/30'
                          : 'bg-white hover:bg-orange-50/80 text-gray-700 hover:text-orange-600 border-gray-200 hover:border-orange-300'
                      ]"
                    >
                      <Icon name="lucide:layout-grid" class="w-3.5 h-3.5" />
                      <span>Semua</span>
                      <span
                        :class="[
                          'px-1.5 py-0.5 text-[10px] rounded-md font-extrabold',
                          !searchQuery ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600'
                        ]"
                      >
                        {{ dataCacheStore.products.length }}
                      </span>
                    </button>

                    <!-- Category Pills -->
                    <button
                      v-for="cat in categoriesList"
                      :key="cat.name"
                      @click="selectCategory(cat.name)"
                      :class="[
                        'px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shrink-0 shadow-sm border active:scale-95 cursor-pointer select-none',
                        isCategoryActive(cat.name)
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-500 shadow-orange-500/20 ring-2 ring-orange-400/30'
                          : 'bg-white hover:bg-orange-50/80 text-gray-700 hover:text-orange-600 border-gray-200 hover:border-orange-300'
                      ]"
                    >
                      <Icon :name="cat.icon" class="w-3.5 h-3.5" />
                      <span>{{ cat.name }}</span>
                      <span
                        v-if="cat.count > 0"
                        :class="[
                          'px-1.5 py-0.5 text-[10px] rounded-md font-extrabold',
                          isCategoryActive(cat.name) ? 'bg-white/25 text-white' : 'bg-orange-100/70 text-orange-700'
                        ]"
                      >
                        {{ cat.count }}
                      </span>
                    </button>
                  </div>
                </div>

                <!-- Active Filter Pill Indicator if a query is active -->
                <div v-if="searchQuery" class="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/60 text-xs">
                  <div class="flex items-center gap-2 text-gray-600 font-medium">
                    <span class="text-gray-400">Filter Aktif:</span>
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold border border-orange-200">
                      <Icon name="lucide:filter" class="w-3 h-3 text-orange-600" />
                      "{{ searchQuery }}"
                      <span class="text-orange-600 font-semibold">({{ totalItems }} produk)</span>
                    </span>
                  </div>
                  <button
                    @click="searchQuery = ''"
                    class="text-orange-600 hover:text-orange-800 font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Icon name="lucide:rotate-ccw" class="w-3 h-3" />
                    Reset Filter
                  </button>
                </div>
              </div>
            </Transition>

            <!-- Pagination Info and Controls -->
            <div
              class="flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <!-- Items Per Page Selector -->
              <div class="flex items-center gap-2">
                <label class="text-sm font-semibold text-gray-700"
                  >Item per halaman:</label
                >
                <select
                  :value="itemsPerPage"
                  @change="
                    changeItemsPerPage(
                      parseInt(($event.target as HTMLSelectElement).value),
                    )
                  "
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option :value="10">10</option>
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                  <option :value="999999">Semua Item</option>
                </select>
              </div>

              <!-- Pagination Info -->
              <div class="text-sm text-gray-600">
                <span v-if="totalItems > 0">
                  Halaman {{ currentPage }} dari {{ totalPages }} |
                  Total {{ totalItems }} item
                </span>
                <span v-else>0 item ditemukan</span>
              </div>

              <!-- Pagination Buttons -->
              <div class="flex items-center gap-2">
                <button
                  @click="goToPrevPage"
                  :disabled="!canGoToPrevPage"
                  class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition font-semibold"
                >
                  ← Sebelumnya
                </button>
                <button
                  @click="goToNextPage"
                  :disabled="!canGoToNextPage"
                  class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition font-semibold"
                >
                  Lanjut →
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-if="!loading && products.length === 0"
            class="flex flex-col items-center justify-center py-20 text-center"
          >
            <div class="bg-orange-100 p-4 rounded-full mb-4">
              <Icon :name="searchQuery ? 'lucide:search-x' : 'lucide:inbox'" class="w-10 h-10 text-orange-600" />
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-1">
              {{ searchQuery ? 'Produk nggak ketemu' : 'Belum ada produk' }}
            </h3>
            <p class="text-gray-500 max-w-xs mx-auto">
              {{ searchQuery ? `Maaf, produk dengan kata kunci "${searchQuery}" nggak ada di daftar.` : 'Daftar produk kamu masih kosong nih. Yuk tambahin produk baru di atas!' }}
            </p>
            <button 
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="mt-4 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition font-semibold flex items-center gap-2"
            >
              <Icon name="lucide:refresh-cw" class="w-4 h-4" />
              Reset Pencarian
            </button>
          </div>

          <!-- Loading State -->
          <div
            v-if="loading"
            class="flex flex-col items-center justify-center py-32 text-center"
          >
            <div class="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p class="text-orange-600 font-bold animate-pulse">Lagi nunggu data...</p>
          </div>

          <!-- Table Content -->
          <div 
            v-show="!loading && products.length > 0" 
            class="overflow-x-auto"
          >
            <table class="w-full">
              <thead class="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th
                    @click="toggleSort('name')"
                    class="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-1/4 min-w-50 cursor-pointer hover:bg-gray-200 transition"
                  >
                    <div class="flex items-center gap-1">
                      Nama Produk
                      <Icon v-if="sortBy === 'name'" :name="sortOrder === 'asc' ? 'lucide:sort-asc' : 'lucide:sort-desc'" class="w-4 h-4 text-orange-600" />
                    </div>
                  </th>
                  <th
                    @click="toggleSort('brand')"
                    class="px-4 py-3 text-left text-sm font-semibold text-gray-700 hidden lg:table-cell cursor-pointer hover:bg-gray-200 transition"
                  >
                    <div class="flex items-center gap-1">
                      Merk
                      <Icon v-if="sortBy === 'brand'" :name="sortOrder === 'asc' ? 'lucide:sort-asc' : 'lucide:sort-desc'" class="w-4 h-4 text-orange-600" />
                    </div>
                  </th>
                  <th
                    class="px-4 py-3 text-left text-sm font-semibold text-gray-700 hidden md:table-cell"
                  >
                    Model
                  </th>
                  <th
                    @click="toggleSort('stock')"
                    class="px-4 py-3 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition"
                  >
                    <div class="flex items-center justify-end gap-1">
                      Stok
                      <Icon v-if="sortBy === 'stock'" :name="sortOrder === 'asc' ? 'lucide:sort-asc' : 'lucide:sort-desc'" class="w-4 h-4 text-orange-600" />
                    </div>
                  </th>
                  <th
                    @click="toggleSort('askingPrice')"
                    class="px-4 py-3 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition"
                  >
                    <div class="flex items-center justify-end gap-1">
                      Harga Tawar
                      <Icon v-if="sortBy === 'askingPrice'" :name="sortOrder === 'asc' ? 'lucide:sort-asc' : 'lucide:sort-desc'" class="w-4 h-4 text-orange-600" />
                    </div>
                  </th>
                  <th
                    @click="toggleSort('fixedPrice')"
                    class="px-4 py-3 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition"
                  >
                    <div class="flex items-center justify-end gap-1">
                      Harga Pas
                      <Icon v-if="sortBy === 'fixedPrice'" :name="sortOrder === 'asc' ? 'lucide:sort-asc' : 'lucide:sort-desc'" class="w-4 h-4 text-orange-600" />
                    </div>
                  </th>
                  <th
                    @click="toggleSort('servicePrice')"
                    class="px-4 py-3 text-right text-sm font-semibold text-gray-700 hidden md:table-cell cursor-pointer hover:bg-gray-200 transition"
                  >
                    <div class="flex items-center justify-end gap-1">
                      Harga Service
                      <Icon v-if="sortBy === 'servicePrice'" :name="sortOrder === 'asc' ? 'lucide:sort-asc' : 'lucide:sort-desc'" class="w-4 h-4 text-orange-600" />
                    </div>
                  </th>
                  <th
                    @click="toggleSort('buyPrice')"
                    class="px-4 py-3 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition"
                  >
                    <div class="flex items-center justify-end gap-1">
                      Harga Beli
                      <Icon v-if="sortBy === 'buyPrice'" :name="sortOrder === 'asc' ? 'lucide:sort-asc' : 'lucide:sort-desc'" class="w-4 h-4 text-orange-600" />
                    </div>
                  </th>
                  <th
                    class="lg:table-cell hidden px-4 py-3 text-center text-sm font-semibold text-gray-700"
                  >
                    Status
                  </th>
                  <th
                    class="px-4 py-3 text-center text-sm font-semibold text-gray-700"
                  >
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr
                  v-for="product in products"
                  :key="product.id"
                  class="hover:bg-orange-50 transition"
                >
                  <td class="px-4 py-3 text-sm font-semibold text-gray-800 wrap-break-words max-w-75">
                    {{ getProductDisplayName(product) }}
                  </td>
                  <td
                    class="px-4 py-3 text-sm text-gray-700 hidden lg:table-cell"
                  >
                    {{ product.brand || "-" }}
                  </td>
                  <td
                    class="px-4 py-3 text-sm text-gray-700 hidden md:table-cell"
                  >
                    {{ product.model || "-" }}
                  </td>
                  <td
                    class="px-4 py-3 text-right text-sm font-mono font-bold"
                  >
                    <span :class="product.stock < 5 ? 'text-red-600' : 'text-green-600'">{{ product.stock }}</span>
                  </td>
                  <td class="px-4 py-3 text-right text-sm font-mono">
                    {{ formatCurrency(product.askingPrice) }}
                  </td>
                  <td class="px-4 py-3 text-right text-sm font-mono">
                    {{ formatCurrency(product.fixedPrice) }}
                  </td>
                  <td class="px-4 py-3 text-right text-sm font-mono hidden md:table-cell">
                    {{ product.servicePrice ? formatCurrency(product.servicePrice) : "-" }}
                  </td>
                  <td class="px-4 py-3 text-right text-sm font-mono">
                    {{ formatCurrency(product.buyPrice) }}
                  </td>
                  <td class="lg:table-cell hidden px-4 py-3 text-center whitespace-nowrap">
                    <span
                      :class="[
                        'px-2 py-1 text-xs font-bold rounded-full',
                        product.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700',
                      ]"
                    >
                      {{ product.isActive ? "Aktif" : "Non-Aktif" }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-center whitespace-nowrap">
                    <div class="flex items-center justify-center gap-2">
                      <button
                        @click="editProduct(product)"
                        class="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded transition flex items-center gap-1 text-sm"
                      >
                        <Icon name="lucide:edit" class="w-4 h-4" />
                        <span class="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        @click="deleteProduct(product.id)"
                        class="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded transition flex items-center gap-1 text-sm"
                      >
                        <Icon name="lucide:trash" class="w-4 h-4" />
                        <span class="hidden sm:inline">Hapus</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>


          <div
            v-if="!loading && products.length > 0"
            class="bg-gray-50 border-t border-gray-300 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <p class="text-sm text-gray-600">
              <Icon name="lucide:info" class="w-4 h-4 inline mr-1" />
              Nampilin {{ (currentPage - 1) * itemsPerPage + 1 }}-{{
                Math.min(currentPage * itemsPerPage, totalItems)
              }}
              dari {{ totalItems }} produk | Total Stok:
              <span class="font-bold">{{ totalStock }}</span>
            </p>

            <!-- Bottom Pagination Controls -->
            <div class="flex items-center gap-2">
              <button
                @click="goToPrevPage"
                :disabled="!canGoToPrevPage"
                class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition"
              >
                ← Sebelum
              </button>
              <div class="text-sm font-semibold text-gray-700">
                {{ currentPage }} / {{ totalPages }}
              </div>
              <button
                @click="goToNextPage"
                :disabled="!canGoToNextPage"
                class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition"
              >
                Lanjut →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <Transition name="fade">
      <div
        v-if="showEditModal"
        class="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center p-4 overflow-y-auto py-10"
      >
        <div class="bg-white rounded-lg max-w-md w-full p-6 shadow-xl my-auto">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Icon name="lucide:edit-2" class="w-6 h-6 text-orange-600" />
              Edit Produk
            </h3>
            <button
              @click="showEditModal = false"
              class="text-gray-500 hover:text-gray-700"
            >
              <Icon name="lucide:x" class="w-6 h-6" />
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Nama Produk</label
              >
              <input
                v-model="editingProduct.name"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Merk</label
              >
              <input
                v-model="editingProduct.brand"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Model</label
              >
              <input
                v-model="editingProduct.model"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Nama Lain</label
              >
              <input
                v-model="editingProduct.otherName"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2"
                  >Stok</label
                >
                <input
                  :value="editingProduct.stock !== undefined ? formatNumber(editingProduct.stock) : ''"
                  @input="editingProduct.stock = parseFromDisplay(($event.target as HTMLInputElement).value)"
                  type="text"
                  inputmode="numeric"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2"
                  >Harga Service</label
                >
                <input
                  :value="editingProduct.servicePrice ? formatNumber(editingProduct.servicePrice) : ''"
                  @input="editingProduct.servicePrice = parseFromDisplay(($event.target as HTMLInputElement).value)"
                  type="text"
                  inputmode="numeric"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

          

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Harga Tawar</label
              >
              <input
                :value="editingProduct.askingPrice ? formatNumber(editingProduct.askingPrice) : ''"
                @input="editingProduct.askingPrice = parseFromDisplay(($event.target as HTMLInputElement).value)"
                type="text"
                inputmode="numeric"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Harga Pas</label
              >
              <input
                :value="editingProduct.fixedPrice ? formatNumber(editingProduct.fixedPrice) : ''"
                @input="editingProduct.fixedPrice = parseFromDisplay(($event.target as HTMLInputElement).value)"
                type="text"
                inputmode="numeric"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
        <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Harga Beli</label
              >
              <input
                :value="editingProduct.buyPrice ? formatNumber(editingProduct.buyPrice) : ''"
                @input="editingProduct.buyPrice = parseFromDisplay(($event.target as HTMLInputElement).value)"
                type="text"
                inputmode="numeric"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <div class="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActiveEdit"
                v-model="editingProduct.isActive"
                class="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label for="isActiveEdit" class="text-sm font-semibold text-gray-700">Produk Aktif (Tampil di Penjualan)</label>
            </div>
            </div>
            <div class="flex gap-4 pt-4">
              <button
                @click="saveProduct"
                class="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
              >
                <Icon name="lucide:save" class="w-5 h-5" />
                Simpan
              </button>
              <button
                @click="showEditModal = false"
                class="flex-1 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded-lg transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- History Modal -->
    <Transition name="fade">
      <div
        v-if="showHistoryModal"
        class="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center p-4 overflow-y-auto py-10"
      >
        <div class="bg-white rounded-xl max-w-5xl w-full p-6 shadow-2xl my-auto border border-gray-100">
          <!-- Modal Header -->
          <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div class="flex items-center gap-3">
              <button
                @click="closeHistoryAndGoBackToArrival"
                class="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-gray-700 flex items-center justify-center"
                title="Kembali ke Form Barang Datang"
              >
                <Icon name="lucide:arrow-left" class="w-5 h-5" />
              </button>
              <h3 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Icon name="lucide:history" class="w-6 h-6 text-blue-600" />
                Riwayat Kedatangan Barang
              </h3>
            </div>
            <button
              @click="showHistoryModal = false"
              class="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-full transition flex items-center justify-center"
            >
              <Icon name="lucide:x" class="w-6 h-6" />
            </button>
          </div>

          <!-- Loading state -->
          <div v-if="loadingHistory" class="flex flex-col items-center justify-center p-12">
            <Icon name="lucide:loader-2" class="w-10 h-10 animate-spin text-blue-500" />
            <span class="text-sm text-gray-500 mt-3 font-semibold">Memuat riwayat...</span>
          </div>

          <!-- Empty state -->
          <div v-else-if="arrivalHistory.length === 0" class="text-center p-12 bg-gray-50 rounded-xl border border-dashed">
            <Icon name="lucide:archive-x" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p class="text-gray-500 font-medium">Belum ada riwayat kedatangan barang.</p>
          </div>

          <!-- Table Content -->
          <div v-else class="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
            <div class="overflow-x-auto max-h-[55vh]">
              <table class="w-full text-left border-collapse min-w-[900px]">
                <thead class="sticky top-0 bg-gray-50 z-10 border-b border-gray-200">
                  <tr class="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th class="p-4">Tanggal</th>
                    <th class="p-4">Produk</th>
                    <th class="p-4 text-center">Jumlah</th>
                    <th class="p-4 text-right">Harga Modal</th>
                    <th class="p-4 text-right">Harga Tawar</th>
                    <th class="p-4 text-right">Harga Pas</th>
                    <th class="p-4 text-right">Harga Service</th>
                    <th class="p-4">Supplier & Catatan</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr 
                    v-for="item in arrivalHistory" 
                    :key="item.id" 
                    class="hover:bg-blue-50/20 transition-colors text-sm"
                  >
                    <td class="p-4 whitespace-nowrap text-gray-500 font-medium">
                      {{ new Date(item.createdAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
                    </td>
                    <td class="p-4">
                      <div class="font-semibold text-gray-900 leading-tight">
                        {{ item.product?.name || 'Produk Dihapus' }}
                      </div>
                      <div class="text-xs text-gray-400 mt-1 font-mono">
                        {{ item.product?.brand || '-' }} / {{ item.product?.model || '-' }}
                      </div>
                    </td>
                    <td class="p-4 text-center whitespace-nowrap">
                      <span class="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        +{{ item.quantity }}
                      </span>
                    </td>
                    <td class="p-4 text-right whitespace-nowrap font-semibold">
                      <span v-if="item.buyPrice" class="font-mono text-gray-900">{{ formatCurrency(item.buyPrice) }}</span>
                      <span v-else class="text-gray-400 font-sans">-</span>
                    </td>
                    <td class="p-4 text-right whitespace-nowrap">
                      <span v-if="item.askingPrice" class="font-mono text-gray-600">{{ formatCurrency(item.askingPrice) }}</span>
                      <span v-else class="text-gray-400">-</span>
                    </td>
                    <td class="p-4 text-right whitespace-nowrap">
                      <span v-if="item.fixedPrice" class="font-mono text-gray-600">{{ formatCurrency(item.fixedPrice) }}</span>
                      <span v-else class="text-gray-400">-</span>
                    </td>
                    <td class="p-4 text-right whitespace-nowrap">
                      <span v-if="item.servicePrice" class="font-mono text-gray-600">{{ formatCurrency(item.servicePrice) }}</span>
                      <span v-else class="text-gray-400">-</span>
                    </td>
                    <td class="p-4 max-w-xs truncate">
                      <div v-if="item.supplier" class="font-medium text-gray-800 flex items-center gap-1">
                        <Icon name="lucide:user" class="w-3.5 h-3.5 text-gray-400" />
                        {{ item.supplier }}
                      </div>
                      <div v-if="item.notes" class="text-xs text-gray-500 mt-1 flex items-center gap-1 italic">
                        <Icon name="lucide:info" class="w-3 h-3 text-gray-400" />
                        {{ item.notes }}
                      </div>
                      <span v-if="!item.supplier && !item.notes" class="text-gray-400">-</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Modal Footer Actions -->
          <div class="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              @click="closeHistoryAndGoBackToArrival"
              class="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition text-sm flex items-center gap-2"
            >
              <Icon name="lucide:arrow-left" class="w-4 h-4" />
              Kembali ke Form
            </button>
            <button
              @click="showHistoryModal = false"
              class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition text-sm shadow-sm hover:shadow"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Arrival Modal -->
    <Transition name="fade">
      <div
        v-if="showArrivalModal"
        class="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center p-4 overflow-y-auto py-10"
      >
        <div class="bg-white rounded-lg max-w-4xl w-full p-6 shadow-xl my-auto">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Icon name="lucide:truck" class="w-6 h-6 text-green-600" />
              Catat Barang Datang
            </h3>
            <div class="flex items-center gap-2">
              <button
                @click="fetchArrivalHistory"
                class="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-md text-sm font-semibold flex items-center gap-1 transition"
                title="Lihat Riwayat"
              >
                <Icon name="lucide:history" class="w-4 h-4" />
                Riwayat
              </button>
              <button
                @click="showArrivalModal = false"
                class="text-gray-500 hover:text-gray-700 p-1"
              >
                <Icon name="lucide:x" class="w-6 h-6" />
              </button>
            </div>
          </div>

          <div class="space-y-6">
            <div v-for="(item, index) in arrivalForm.items" :key="item.id" class="p-4 border border-gray-200 rounded-lg relative bg-gray-50">
              <!-- Delete button if more than 1 -->
              <button 
                v-if="arrivalForm.items.length > 1" 
                @click="removeArrivalItem(index)"
                class="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"
                title="Hapus Produk Ini"
              >
                <Icon name="lucide:trash-2" class="w-5 h-5" />
              </button>

              <h4 class="font-bold text-gray-700 mb-3 border-b pb-2">Produk #{{ index + 1 }}</h4>
              
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- Product Search -->
                <div class="relative lg:col-span-2">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Cari & Pilih Produk <span class="text-red-500">*</span></label>
                  <input
                    v-model="item.searchQuery"
                    @focus="item.showDropdown = true"
                    @blur="hideDropdown(item)"
                    type="text"
                    placeholder="Ketik nama produk..."
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  />
                  <!-- Selected indicator -->
                  <div v-if="item.productId" class="mt-1 text-xs text-green-600 font-semibold flex items-center gap-1">
                    <Icon name="lucide:check-circle" class="w-3 h-3" /> Terpilih: {{ getProductName(item.productId) }}
                  </div>
                  <div v-if="item.showDropdown && filteredProducts(item.searchQuery).length > 0" class="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
                    <div 
                      v-for="product in filteredProducts(item.searchQuery)" 
                      :key="product.id" 
                      @mousedown.prevent="selectProduct(item, product)"
                      class="px-4 py-2 hover:bg-green-50 cursor-pointer border-b last:border-0 text-sm"
                    >
                      <div class="font-semibold">{{ getProductDisplayName(product) }}</div>
                      <div class="text-xs text-gray-500">Stok: {{ product.stock }}</div>
                    </div>
                  </div>
                </div>

                <!-- Quantity -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Jumlah Masuk <span class="text-red-500">*</span></label>
                  <input
                    :value="item.quantity ? formatNumber(Number(item.quantity)) : ''"
                    @input="item.quantity = parseFromDisplay(($event.target as HTMLInputElement).value)"
                    type="text"
                    inputmode="numeric"
                    placeholder="0"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  />
                </div>

                <!-- Buy Price -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Harga Modal Baru <span class="text-xs font-normal text-gray-500">Opsional</span></label>
                  <input
                    :value="item.buyPrice ? formatNumber(Number(item.buyPrice)) : ''"
                    @input="item.buyPrice = parseFromDisplay(($event.target as HTMLInputElement).value)"
                    type="text"
                    inputmode="numeric"
                    placeholder="Biarkan kosong jika sama"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  />
                </div>

                <!-- Asking Price -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Harga Tawar Baru <span class="text-xs font-normal text-gray-500">Opsional</span></label>
                  <input
                    :value="item.askingPrice ? formatNumber(Number(item.askingPrice)) : ''"
                    @input="item.askingPrice = parseFromDisplay(($event.target as HTMLInputElement).value)"
                    type="text"
                    inputmode="numeric"
                    placeholder="Harga Jual Normal"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  />
                </div>

                <!-- Fixed Price -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Harga Pas Baru <span class="text-xs font-normal text-gray-500">Opsional</span></label>
                  <input
                    :value="item.fixedPrice ? formatNumber(Number(item.fixedPrice)) : ''"
                    @input="item.fixedPrice = parseFromDisplay(($event.target as HTMLInputElement).value)"
                    type="text"
                    inputmode="numeric"
                    placeholder="Harga Net/Pas"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  />
                </div>

                <!-- Service Price -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Hrga Service Baru <span class="text-xs font-normal text-gray-500">Opsional</span></label>
                  <input
                    :value="item.servicePrice ? formatNumber(Number(item.servicePrice)) : ''"
                    @input="item.servicePrice = parseFromDisplay(($event.target as HTMLInputElement).value)"
                    type="text"
                    inputmode="numeric"
                    placeholder="Harga u/ Teknisi"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  />
                </div>

                <!-- Supplier -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Supplier <span class="text-xs font-normal text-gray-500">Opsional</span></label>
                  <input
                    v-model="item.supplier"
                    type="text"
                    placeholder="Nama Toko/Suplier"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  />
                </div>

                <!-- Notes -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Catatan <span class="text-xs font-normal text-gray-500">Opsional</span></label>
                  <input
                    v-model="item.notes"
                    type="text"
                    placeholder="Keterangan..."
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  />
                </div>
              </div>
            </div>

            <!-- Add More Button -->
            <button
              @click="addArrivalItem"
              class="w-full py-3 border-2 border-dashed border-green-300 text-green-600 rounded-lg font-semibold hover:bg-green-50 hover:border-green-400 transition flex items-center justify-center gap-2"
            >
              <Icon name="lucide:plus" class="w-5 h-5" />
              Tambah Produk Lain
            </button>

            <!-- Save Action -->
            <div class="flex gap-4 pt-4 border-t">
              <button
                @click="saveArrival"
                :disabled="!isArrivalFormValid"
                class="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
              >
                <Icon name="lucide:save" class="w-5 h-5" />
                Simpan & Tambah Stok ({{ arrivalForm.items.length }} Item)
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Success Toast -->
    <Transition name="fade">
      <div
        v-if="showMessage"
        class="fixed right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg font-semibold flex items-center gap-2 z-50"
        style="bottom: calc(1.5rem + env(safe-area-inset-bottom));"
      >
        <Icon name="lucide:check-circle" class="w-5 h-5" />
        {{ message }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Ref } from "vue";
import { watch, computed, ref, reactive, onMounted } from "vue";
import { useCurrency } from "../../composables/useCurrency";
import { useDataCacheStore } from "../stores/data-cache";

definePageMeta({
  layout: "default",
});

const { formatCurrency, formatNumber, parseFromDisplay } = useCurrency();

const toTitleCase = (str: string | null | undefined) => {
  if (!str) return str;
  // Hanya ubah ke Title Case kalau semua huruf kecil
  // Kalau sudah ada huruf besar (misal "AC AQUA 1 PK"), biarkan apa adanya
  const isAllLowerCase = str === str.toLowerCase();
  if (!isAllLowerCase) return str;
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

// State (using local computed filtering, sorting, and pagination on top of the cached store)
const dataCacheStore = useDataCacheStore();

const productsList = computed(() => {
  let list = dataCacheStore.products;

  // 1. Filter by search query
  if (searchQuery.value.trim()) {
    const keywords = searchQuery.value.toLowerCase().trim().split(/\s+/).filter((k) => k.length > 0);
    if (keywords.length > 0) {
      list = list.filter((p) => {
        const name = (p.name || "").toLowerCase();
        const brand = (p.brand || "").toLowerCase();
        const model = (p.model || "").toLowerCase();
        const otherName = (p.otherName || "").toLowerCase();

        return keywords.every((k) => {
          const isShortNumeric = k.length <= 2 && /^\d+$/.test(k);
          if (isShortNumeric) {
            return name.includes(k) || brand.includes(k) || otherName.includes(k);
          } else {
            return name.includes(k) || brand.includes(k) || model.includes(k) || otherName.includes(k);
          }
        });
      });
    }
  }

  // 2. Sort results
  const field = sortBy.value;
  const order = sortOrder.value === "desc" ? -1 : 1;
  const sorted = [...list];
  sorted.sort((a, b) => {
    let valA = a[field];
    let valB = b[field];

    if (typeof valA === "string" && typeof valB === "string") {
      return valA.localeCompare(valB, "id", { sensitivity: "base" }) * order;
    }

    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;
    return (valA < valB ? -1 : valA > valB ? 1 : 0) * order;
  });

  return sorted;
});

const products = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return productsList.value.slice(start, end);
});

const totalItems = computed(() => productsList.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

const lowStockProducts = computed(() => {
  return dataCacheStore.products.filter((p) => p.stock === 0);
});

const allProductsForSelect = computed(() => {
  return [...dataCacheStore.products].sort((a: any, b: any) => a.name.localeCompare(b.name));
});

const loading = computed(() => dataCacheStore.loadingProducts);
const showEditModal = ref(false);
const showArrivalModal = ref(false);
const showHistoryModal = ref(false);
const arrivalHistory = ref<any[]>([]);
const loadingHistory = ref(false);
const showMessage = ref(false);
const message = ref("");

interface ArrivalItem {
  id: string;
  productId: string;
  searchQuery: string;
  showDropdown: boolean;
  quantity: number | string;
  supplier: string;
  buyPrice: number | string | null;
  askingPrice: number | string | null;
  fixedPrice: number | string | null;
  servicePrice: number | string | null;
  notes: string;
}

const createEmptyArrivalItem = (): ArrivalItem => ({
  id: Math.random().toString(36).substring(2, 9),
  productId: "",
  searchQuery: "",
  showDropdown: false,
  quantity: "",
  supplier: "",
  buyPrice: null,
  askingPrice: null,
  fixedPrice: null,
  servicePrice: null,
  notes: "",
});

const arrivalForm = reactive({
  items: [createEmptyArrivalItem()]
});

const isArrivalFormValid = computed(() => {
  return arrivalForm.items.every(item => item.productId && item.quantity);
});

const addArrivalItem = () => {
  const lastSupplier = arrivalForm.items[arrivalForm.items.length - 1]?.supplier ?? "";
  const newItem = createEmptyArrivalItem();
  newItem.supplier = lastSupplier;
  arrivalForm.items.push(newItem);
};

const removeArrivalItem = (index: number) => {
  if (arrivalForm.items.length > 1) {
    arrivalForm.items.splice(index, 1);
  }
};

const filteredProducts = (query: string) => {
  if (!query) return allProductsForSelect.value.slice(0, 50);
  // Split query jadi beberapa keyword, semua keyword harus match
  // Keyword angka pendek (1-2 char) tidak dicari di model agar tidak false match
  const keywords = query.toLowerCase().trim().split(/\s+/).filter(k => k.length > 0);
  if (keywords.length === 0) return allProductsForSelect.value.slice(0, 50);
  return allProductsForSelect.value.filter(p => 
    keywords.every(keyword => {
      const isShortNumeric = keyword.length <= 2 && /^\d+$/.test(keyword);
      return p.name.toLowerCase().includes(keyword) || 
        (p.brand && p.brand.toLowerCase().includes(keyword)) || 
        (!isShortNumeric && p.model && p.model.toLowerCase().includes(keyword)) ||
        (p.otherName && p.otherName.toLowerCase().includes(keyword));
    })
  ).slice(0, 50);
};

const getProductName = (id: string) => {
  if (!id) return '';
  const p = allProductsForSelect.value.find(p => p.id === parseInt(id));
  return p ? p.name : '';
};

const selectProduct = (item: ArrivalItem, product: any) => {
  item.productId = product.id.toString();
  item.searchQuery = product.name;
  item.showDropdown = false;
};

const hideDropdown = (item: ArrivalItem) => {
  setTimeout(() => {
    item.showDropdown = false;
  }, 200);
};

// Search, Quick Categories, and Pagination State
const searchQuery = ref("");
const showCategories = ref(true);
const currentPage = ref(1);
const itemsPerPage = ref(25);
const sortBy = ref("name");
const sortOrder = ref("asc");

const getCategoryIcon = (catName: string) => {
  const lower = catName.toLowerCase();
  if (lower.includes('kipas')) return 'lucide:fan';
  if (lower.includes('kompor')) return 'lucide:flame';
  if (lower.includes('rice') || lower.includes('cooker') || lower.includes('magic')) return 'lucide:cooking-pot';
  if (lower.includes('blender') || lower.includes('juicer')) return 'lucide:blender';
  if (lower.includes('ac') || lower.includes('pendingin')) return 'lucide:snowflake';
  if (lower.includes('cuci')) return 'lucide:washing-machine';
  if (lower.includes('kulkas') || lower.includes('freezer')) return 'lucide:refrigerator';
  if (lower.includes('setrika')) return 'lucide:shirt';
  if (lower.includes('dispenser')) return 'lucide:droplets';
  if (lower.includes('teko') || lower.includes('kettle')) return 'lucide:coffee';
  if (lower.includes('exhaust') || lower.includes('ventilating')) return 'lucide:wind';
  if (lower.includes('pompa')) return 'lucide:gauge';
  if (lower.includes('tv') || lower.includes('televisi')) return 'lucide:tv';
  if (lower.includes('speaker') || lower.includes('audio') || lower.includes('sound')) return 'lucide:speaker';
  return 'lucide:tag';
};

const categoriesList = computed(() => {
  const products = dataCacheStore.products || [];
  
  const defaultNames = [
    'Kipas', 'Kompor', 'Rice cooker', 'Blender', 'AC',
    'Mesin cuci', 'Kulkas', 'Setrika', 'Dispenser', 'Teko',
    'Exhaust',  'Speaker'
    // 'Pompa', 'TV'
  ];

  const categoryMap = new Map<string, number>();

  defaultNames.forEach(name => {
    categoryMap.set(name, 0);
  });

  products.forEach((p: any) => {
    const fullText = `${p.name || ''} ${p.brand || ''} ${p.model || ''} ${p.otherName || ''}`.toLowerCase();

    categoryMap.forEach((_, catName) => {
      if (fullText.includes(catName.toLowerCase())) {
        categoryMap.set(catName, (categoryMap.get(catName) || 0) + 1);
      }
    });
  });

  return Array.from(categoryMap.entries()).map(([name, count]) => ({
    name,
    count,
    icon: getCategoryIcon(name)
  })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
});

const isCategoryActive = (catName: string) => {
  if (!searchQuery.value) return false;
  return searchQuery.value.trim().toLowerCase() === catName.trim().toLowerCase();
};

const selectCategory = (catName: string) => {
  if (isCategoryActive(catName)) {
    searchQuery.value = '';
  } else {
    searchQuery.value = catName;
  }
};

const toggleSort = (field: string) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = field;
    sortOrder.value = "asc";
  }
};

const newProduct = reactive({
  name: "",
  brand: "",
  model: "",
  otherName: "",
  stock: 0,
  servicePrice: null as number | null,
  buyPrice: 0,
  askingPrice: 0,
  fixedPrice: 0,
  isActive: true,
});

const editingProduct = reactive({
  id: "",
  name: "",
  brand: "",
  model: "",
  otherName: "",
  stock: 0,
  servicePrice: null as number | null,
  buyPrice: 0,
  askingPrice: 0,
  fixedPrice: 0,
  isActive: true,
});

const getProductDisplayName = (product: any) => {
  if (!product) return '';
  let name = product.name || '';
  if (product.brand && product.brand !== 'No Brand' && product.brand.trim() !== '') {
    name += ` ${product.brand}`;
  }
  // Model is intentionally omitted from the display name
  // otherName is intentionally omitted from the display name
  return name.trim();
};

// Computed
const totalStock = computed(() => {
  return products.value.reduce((sum, p) => sum + p.stock, 0);
});

const canGoToPrevPage = computed(() => currentPage.value > 1);
const canGoToNextPage = computed(() => currentPage.value < totalPages.value);

// Methods
const fetchProducts = async () => {
  try {
    await dataCacheStore.fetchProducts(true);
  } catch (error) {
    console.error("Error loading products:", error);
    showToast("Gagal muat data produk");
  }
};

const fetchLowStockProducts = async () => {
  // Low stock products is now a computed property locally!
};

const addProduct = async () => {
  if (
    !newProduct.name ||
    !newProduct.stock ||
    !newProduct.buyPrice ||
    !newProduct.askingPrice
  ) {
    showToast("Isi dulu semua yang wajib ya");
    return;
  }

  try {
    const response = await $fetch<any>("/api/products", {
      method: "POST",
      body: {
        name: toTitleCase(newProduct.name),
        brand: newProduct.brand ? toTitleCase(newProduct.brand) : null,
        model: newProduct.model ? newProduct.model.trim() : null,
        otherName: newProduct.otherName || null,
        stock: newProduct.stock,
        servicePrice: newProduct.servicePrice,
        buyPrice: newProduct.buyPrice,
        askingPrice: newProduct.askingPrice,
        fixedPrice: newProduct.fixedPrice || newProduct.askingPrice,
        isActive: newProduct.isActive,
      },
    });

    dataCacheStore.addLocalProduct(response.product);
    resetForm();
    showToast("Sip, produk udah ditambah!");
  } catch (error: any) {
    showToast(error.message || "Yah, gagal nambahin produk");
  }
};

const editProduct = (product: any) => {
  editingProduct.id = product.id;
  editingProduct.name = product.name;
  editingProduct.brand = product.brand;
  editingProduct.model = product.model;
  editingProduct.otherName = product.otherName;
  editingProduct.stock = product.stock;
  editingProduct.servicePrice = product.servicePrice;
  editingProduct.buyPrice = product.buyPrice;
  editingProduct.askingPrice = product.askingPrice;
  editingProduct.fixedPrice = product.fixedPrice;
  editingProduct.isActive = product.isActive;
  showEditModal.value = true;
};

const saveProduct = async () => {
  try {
    const response = await $fetch<any>(`/api/products/${editingProduct.id}`, {
      method: "PUT",
      body: {
        name: toTitleCase(editingProduct.name),
        brand: editingProduct.brand ? toTitleCase(editingProduct.brand) : null,
        model: editingProduct.model ? editingProduct.model.trim() : null,
        otherName: editingProduct.otherName || null,
        stock: editingProduct.stock,
        servicePrice: editingProduct.servicePrice,
        buyPrice: editingProduct.buyPrice,
        fixedPrice: editingProduct.fixedPrice,
        askingPrice: editingProduct.askingPrice,
        isActive: editingProduct.isActive,
      },
    });

    dataCacheStore.updateLocalProduct(response.product);
    showEditModal.value = false;
    showToast("Sip, produk udah diupdate!");
  } catch (error: any) {
    showToast(error.message || "Yah, gagal update produk");
  }
};

const deleteProduct = async (productId: string) => {
  if (!confirm("Beneran mau hapus produk ini?")) return;

  try {
    await $fetch(`/api/products/${productId}`, {
      method: "DELETE",
    });

    dataCacheStore.deleteLocalProduct(Number(productId));
    showToast("Oke, produk udah dihapus");
  } catch (error: any) {
    showToast(error.message || "Waduh, gagal hapus produk");
  }
};

const fetchArrivalHistory = async () => {
  loadingHistory.value = true;
  showArrivalModal.value = false;
  showHistoryModal.value = true;
  try {
    const response = await $fetch<any>('/api/arrivals?limit=50');
    arrivalHistory.value = response.arrivals || [];
  } catch (error) {
    showToast("Gagal memuat riwayat kedatangan");
  } finally {
    loadingHistory.value = false;
  }
};

const closeHistoryAndGoBackToArrival = () => {
  showHistoryModal.value = false;
  showArrivalModal.value = true;
};

const saveArrival = async () => {
  if (!isArrivalFormValid.value) {
    showToast("Pilih produk dan isi jumlahnya untuk semua baris ya.");
    return;
  }
  try {
    const itemsToSave = arrivalForm.items.map(item => ({
      productId: item.productId,
      quantity: typeof item.quantity === 'string' ? parseInt(item.quantity) : item.quantity,
      supplier: item.supplier,
      buyPrice: item.buyPrice,
      askingPrice: item.askingPrice,
      fixedPrice: item.fixedPrice,
      servicePrice: item.servicePrice,
      notes: item.notes,
    }));

    await $fetch("/api/arrivals", {
      method: "POST",
      body: { items: itemsToSave }
    });
    
    showArrivalModal.value = false;
    arrivalForm.items = [createEmptyArrivalItem()];
    
    showToast(`Kedatangan ${itemsToSave.length} barang berhasil dicatat.`);
    fetchProducts();
    fetchLowStockProducts();
  } catch (error: any) {
    showToast(error.message || "Gagal mencatat kedatangan barang.");
  }
};

// (Removed server-side products dropdown fetch as it's now computed locally from cache store)

const printProductList = async () => {
  try {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showToast("Gagal membuka jendela cetak. Pastikan pop-up diperbolehkan (khususnya di Safari/iPad).");
      return;
    }
    
    printWindow.document.write("<html><body style='font-family: sans-serif; text-align: center; padding-top: 50px;'><h2>Menyiapkan dokumen cetak... Mohon tunggu.</h2></body></html>");

    showToast("Menyiapkan dokumen cetak...");
    const allProducts = dataCacheStore.products.filter((p: any) => p.isActive !== false);

    if (allProducts.length === 0) {
      printWindow.close();
      showToast("Tidak ada produk untuk dicetak.");
      return;
    }

    const dateOptions: Intl.DateTimeFormatOptions = { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    };
    const printDate = new Date().toLocaleDateString('id-ID', dateOptions);

    const groupedProducts: Record<string, any[]> = {};
    allProducts.forEach((p: any) => {
      const firstWord = p.name ? p.name.split(' ')[0].toUpperCase() : 'LAIN-LAIN';
      if (!groupedProducts[firstWord]) {
        groupedProducts[firstWord] = [];
      }
      groupedProducts[firstWord].push(p);
    });

    const sortedCategories = Object.keys(groupedProducts).sort();

    let tableRows = "";
    sortedCategories.forEach((category) => {
      tableRows += `
        <tr>
          <td colspan="4" style="padding: 4px 6px; background-color: #f3f4f6; font-size: 12px; font-weight: bold; border: 1px solid #000; text-align: left;">
            Kategori: ${category}
          </td>
        </tr>
      `;
      
      const productsInCategory = (groupedProducts[category] || []).sort((a: any, b: any) => a.name.localeCompare(b.name));
      
      productsInCategory.forEach((p: any, index: number) => {
        const isEven = index % 2 === 0;
        const rowStyle = isEven ? "background-color: #ffffff;" : "background-color: #f9fafb;";
        
        const brand = p.brand ? p.brand : "";
        const productName = (p.name + (brand ? ` ${brand}` : "")).trim();
        const model = p.model ? p.model : "-";
        const askingPrice = formatCurrency(p.askingPrice);
        const fixedPrice = p.fixedPrice ? formatCurrency(p.fixedPrice) : "-";

        tableRows += `
          <tr style="${rowStyle}">
            <td style="padding: 4px 6px; border: 1px solid #000; font-size: 11px;">${productName}</td>
            <td style="padding: 4px 6px; border: 1px solid #000; font-size: 11px; text-align: center;">${model}</td>
            <td style="padding: 4px 6px; border: 1px solid #000; text-align: right; font-size: 12px; font-weight: bold;">${askingPrice}</td>
            <td style="padding: 4px 6px; border: 1px solid #000; text-align: right; font-size: 11px;">${fixedPrice}</td>
          </tr>
        `;
      });
    });

    const logoUrl = `${window.location.origin}/Logo%20Mega%20Elektronik%20Bongas%20Merah%20no-bg1.png`;

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Daftar Harga - Mega Elektronik</title>
          <style>
            @media print {
              @page { margin: 0mm; size: auto; }
              body { margin: 15mm; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
              thead { display: table-header-group; }
              tfoot { display: table-footer-group; }
            }
            body {
              font-family: 'Arial', sans-serif;
              color: #000;
              line-height: 1.4;
              margin: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 10px;
              border-bottom: 2px double #000;
              padding-bottom: 5px;
            }
            .logo {
              height: 40px;
              margin-bottom: 5px;
              object-fit: contain;
            }
            .store-name {
              font-size: 18px;
              font-weight: 900;
              text-transform: uppercase;
              margin-bottom: 3px;
            }
            .title {
              font-size: 14px;
              font-weight: bold;
            }
            .date-info {
              font-size: 11px;
              color: #444;
              margin-top: 3px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #000;
            }
            th {
              background-color: #e5e7eb;
              color: #000;
              font-size: 12px;
              font-weight: bold;
              padding: 4px 6px;
              border: 1px solid #000;
              text-align: center;
            }
            .footer {
              margin-top: 15px;
              text-align: center;
              font-size: 10px;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${logoUrl}" class="logo" alt="Logo Mega Elektronik" onerror="this.style.display='none'" />
            <div class="store-name">MEGA ELEKTRONIK & TEKNIK</div>
            <div class="title">DAFTAR HARGA PRODUK</div>
            <div class="date-info">Dicetak pada: ${printDate}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Nama Produk</th>
                <th>Model</th>
                <th>Harga Tawar</th>
                <th>Harga Pas (Net)</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div class="footer">
            * Daftar harga ini dicetak pada ${printDate} dan dapat berubah sewaktu-waktu.
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              }, 500);
            };
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  } catch (error) {
    showToast("Gagal mengambil data produk untuk dicetak.");
  }
};

const printProductPrice = (product: any) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    showToast("Gagal membuka jendela cetak. Pastikan pop-up diperbolehkan.");
    return;
  }

  const name = product.name || "-";
  const brand = product.brand || "";
  const model = product.model || "";
  const brandModel = [brand, model].filter(Boolean).join(" - ") || "";

  const askingPriceFormatted = formatCurrency(product.askingPrice);
  const fixedPriceFormatted = product.fixedPrice ? formatCurrency(product.fixedPrice) : null;
  const showBothPrices = fixedPriceFormatted && product.askingPrice !== product.fixedPrice;

  let priceHtml = "";
  if (showBothPrices) {
    priceHtml = `
      <div class="price-container">
        <div class="price-box">
          <div class="price-label">HARGA TAWAR</div>
          <div class="price-value">${askingPriceFormatted}</div>
        </div>
        <div class="price-box highlighted">
          <div class="price-label">HARGA PAS</div>
          <div class="price-value">${fixedPriceFormatted}</div>
        </div>
      </div>
    `;
  } else {
    priceHtml = `
      <div class="price-box single">
        <div class="price-label">HARGA JUAL</div>
        <div class="price-value">${askingPriceFormatted}</div>
      </div>
    `;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Cetak Harga - ${name}</title>
        <style>
          @media print {
            body { margin: 0; padding: 0; }
          }
          body {
            font-family: 'Arial', sans-serif;
            padding: 20px;
            color: #000;
            background-color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 90vh;
          }
          .tag-card {
            border: 6px dashed #000;
            border-radius: 20px;
            padding: 40px;
            width: 100%;
            max-width: 800px;
            text-align: center;
            box-sizing: border-box;
          }
          .store-name {
            font-size: 24px;
            font-weight: 800;
            letter-spacing: 2px;
            margin-bottom: 25px;
            text-transform: uppercase;
            border-bottom: 3px double #000;
            padding-bottom: 10px;
          }
          .product-name {
            font-size: 46px;
            font-weight: 800;
            margin: 15px 0 5px 0;
            text-transform: uppercase;
            line-height: 1.2;
          }
          .product-details {
            font-size: 26px;
            font-weight: 600;
            color: #444;
            margin-bottom: 40px;
            text-transform: uppercase;
          }
          .price-container {
            display: flex;
            gap: 20px;
            justify-content: center;
            margin-top: 20px;
          }
          .price-box {
            flex: 1;
            border: 3px solid #000;
            border-radius: 10px;
            padding: 20px 10px;
            background-color: #fff;
          }
          .price-box.highlighted {
            background-color: #000;
            color: #fff;
          }
          .price-box.single {
            max-width: 600px;
            margin: 0 auto;
            border-width: 4px;
          }
          .price-label {
            font-size: 20px;
            font-weight: 800;
            letter-spacing: 1px;
            margin-bottom: 10px;
          }
          .price-value {
            font-size: 54px;
            font-weight: 900;
            white-space: nowrap;
          }
        </style>
      </head>
      <body>
        <div class="tag-card">
          <div class="store-name">MEGA ELEKTRONIK & TEKNIK</div>
          <div class="product-name">${name}</div>
          ${brandModel ? `<div class="product-details">${brandModel}</div>` : '<div style="margin-bottom: 30px;"></div>'}
          
          ${priceHtml}
          
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 500);
          };
        <\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

const resetForm = () => {
  newProduct.name = "";
  newProduct.brand = "";
  newProduct.model = "";
  newProduct.stock = 0;
  newProduct.servicePrice = null;
  newProduct.buyPrice = 0;
  newProduct.askingPrice = 0;
  newProduct.fixedPrice = 0;
  newProduct.isActive = true;
};

const showToast = (msg: string) => {
  message.value = msg;
  showMessage.value = true;
  setTimeout(() => {
    showMessage.value = false;
  }, 3000);
};

// Pagination Methods
const goToPrevPage = () => {
  if (canGoToPrevPage.value) {
    currentPage.value--;
  }
};

const goToNextPage = () => {
  if (canGoToNextPage.value) {
    currentPage.value++;
  }
};

const goToPage = (page: number) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const changeItemsPerPage = (newLimit: number) => {
  itemsPerPage.value = newLimit;
  currentPage.value = 1; // Reset to first page
};

// Watch for search query changes to reset pagination
watch(searchQuery, () => {
  currentPage.value = 1;
});

// Lifecycle
onMounted(() => {
  dataCacheStore.fetchProducts();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Hide scrollbar for categories */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
