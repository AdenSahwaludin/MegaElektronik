<template>
  <div class="h-[100dvh] w-full bg-orange-50 flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom)]">
    <!-- App Header with Navigation -->
    <AppHeader />

    <!-- Main Content -->
    <div class="mt-3 flex-1 overflow-y-auto p-4 lg:p-6 pt-20 lg:pt-24">
      <div class="max-w-7xl mx-auto">
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

          <!-- Search and Pagination Controls -->
          <div class="px-6 py-4 border-b border-gray-200 space-y-4">
            <!-- Search Input -->
            <div class="flex gap-2">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari produk pake nama, merk, atau model..."
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

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
                  @click="goToPreviousPage"
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
                    {{ product.name }}
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
                @click="goToPreviousPage"
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
                      <div class="font-semibold">{{ product.name }}</div>
                      <div class="text-xs text-gray-500">{{ product.brand || 'No Brand' }} - Stok: {{ product.stock }}</div>
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
import { watch, computed, ref, reactive } from "vue";
import { useCurrency } from "../../composables/useCurrency";

definePageMeta({
  layout: "default",
});

const { formatCurrency, formatNumber, parseFromDisplay } = useCurrency();

const toTitleCase = (str: string | null | undefined) => {
  if (!str) return str;
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

// State
const products: Ref<any[]> = ref([]);
const loading = ref(false);
const showEditModal = ref(false);
const showArrivalModal = ref(false);
const showHistoryModal = ref(false);
const arrivalHistory = ref<any[]>([]);
const loadingHistory = ref(false);
const showMessage = ref(false);
const message = ref("");
const allProductsForSelect = ref<any[]>([]);

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
  const q = query.toLowerCase();
  return allProductsForSelect.value.filter(p => 
    p.name.toLowerCase().includes(q) || 
    (p.brand && p.brand.toLowerCase().includes(q)) || 
    (p.model && p.model.toLowerCase().includes(q))
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

// Search and Pagination State
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalItems = ref(0);
const totalPages = ref(0);
const sortBy = ref("name");
const sortOrder = ref("asc");

const toggleSort = (field: string) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = field;
    sortOrder.value = "asc";
  }
  fetchProducts();
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

// Computed
const totalStock = computed(() => {
  return products.value.reduce((sum, p) => sum + p.stock, 0);
});

const canGoToPrevPage = computed(() => currentPage.value > 1);
const canGoToNextPage = computed(() => currentPage.value < totalPages.value);

// Methods
const fetchProducts = async () => {
  loading.value = true;
  try {
    // Build query with search and pagination
    const params = new URLSearchParams();
    if (searchQuery.value.trim()) {
      params.append("search", searchQuery.value);
    }
    params.append("page", currentPage.value.toString());
    params.append("limit", itemsPerPage.value.toString());
    params.append("sortBy", sortBy.value);
    params.append("sortOrder", sortOrder.value);
    params.append("activeOnly", "false"); // Fetch all for management page

    const url = `/api/products?${params.toString()}`;
    const response = await $fetch<any>(url);
    products.value = response.products || [];
    totalItems.value = response.total || 0;
    totalPages.value = response.totalPages || 0;
  } catch (error) {
    console.error("Error loading products:", error);
    showToast("Gagal muat data produk");
  } finally {
    loading.value = false;
  }
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
        model: newProduct.model ? newProduct.model.toUpperCase() : null,
        otherName: newProduct.otherName || null,
        stock: newProduct.stock,
        servicePrice: newProduct.servicePrice,
        buyPrice: newProduct.buyPrice,
        askingPrice: newProduct.askingPrice,
        fixedPrice: newProduct.fixedPrice || newProduct.askingPrice,
        isActive: newProduct.isActive,
      },
    });

    products.value.push(response.product);
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
        model: editingProduct.model ? editingProduct.model.toUpperCase() : null,
        otherName: editingProduct.otherName || null,
        stock: editingProduct.stock,
        servicePrice: editingProduct.servicePrice,
        buyPrice: editingProduct.buyPrice,
        fixedPrice: editingProduct.fixedPrice,
        askingPrice: editingProduct.askingPrice,
        isActive: editingProduct.isActive,
      },
    });

    const index = products.value.findIndex((p) => p.id === editingProduct.id);
    if (index !== -1) {
      products.value[index] = response.product;
    }
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

    products.value = products.value.filter((p) => p.id !== productId);
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
  } catch (error: any) {
    showToast(error.message || "Gagal mencatat kedatangan barang.");
  }
};

watch(showArrivalModal, async (val) => {
  if (val && allProductsForSelect.value.length === 0) {
    try {
      const response = await $fetch<any>('/api/products?limit=1000&activeOnly=true');
      allProductsForSelect.value = (response.products || []).sort((a: any, b: any) => a.name.localeCompare(b.name));
    } catch (e) {
      console.error(e);
    }
  }
});

const printProductList = async () => {
  try {
    showToast("Menyiapkan dokumen cetak...");
    const response = await $fetch<any>('/api/products?limit=1000&activeOnly=true');
    const allProducts = response.products || [];

    if (allProducts.length === 0) {
      showToast("Tidak ada produk untuk dicetak.");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showToast("Gagal membuka jendela cetak. Pastikan pop-up diperbolehkan.");
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
          <td colspan="5" style="padding: 10px 12px; background-color: #f3f4f6; font-size: 16px; font-weight: bold; border: 1px solid #000; text-align: left;">
            Kategori: ${category}
          </td>
        </tr>
      `;
      
      const productsInCategory = (groupedProducts[category] || []).sort((a: any, b: any) => a.name.localeCompare(b.name));
      
      productsInCategory.forEach((p: any, index: number) => {
        const isEven = index % 2 === 0;
        const rowStyle = isEven ? "background-color: #ffffff;" : "background-color: #f9fafb;";
        
        const productName = p.name;
        const brand = p.brand ? p.brand : "-";
        const askingPrice = formatCurrency(p.askingPrice);
        const fixedPrice = p.fixedPrice ? formatCurrency(p.fixedPrice) : "-";
        const stock = p.stock;

        tableRows += `
          <tr style="${rowStyle}">
            <td style="padding: 8px 12px; border: 1px solid #000; font-size: 15px;">${productName}</td>
            <td style="padding: 8px 12px; border: 1px solid #000; font-size: 15px; text-align: center;">${brand}</td>
            <td style="padding: 8px 12px; border: 1px solid #000; text-align: center; font-size: 15px; font-weight: bold;">${stock}</td>
            <td style="padding: 8px 12px; border: 1px solid #000; text-align: right; font-size: 15px;">${askingPrice}</td>
            <td style="padding: 8px 12px; border: 1px solid #000; text-align: right; font-size: 16px; font-weight: bold;">${fixedPrice}</td>
          </tr>
        `;
      });
    });

    const logoUrl = `${window.location.origin}/Logo%20Mega%20Elektronik%20Bongas%20Merah%20no-bg1.png`;

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
              margin-bottom: 20px;
              border-bottom: 3px double #000;
              padding-bottom: 15px;
            }
            .logo {
              height: 60px;
              margin-bottom: 10px;
              object-fit: contain;
            }
            .store-name {
              font-size: 24px;
              font-weight: 900;
              text-transform: uppercase;
              margin-bottom: 5px;
            }
            .title {
              font-size: 18px;
              font-weight: bold;
            }
            .date-info {
              font-size: 14px;
              color: #444;
              margin-top: 5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              border: 2px solid #000;
            }
            th {
              background-color: #e5e7eb;
              color: #000;
              font-size: 16px;
              font-weight: bold;
              padding: 10px 12px;
              border: 2px solid #000;
              text-align: center;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 14px;
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
                <th>Merk/Brand</th>
                <th>Sisa Stok</th>
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
const goToPreviousPage = () => {
  if (canGoToPrevPage.value) {
    currentPage.value--;
    fetchProducts();
  }
};

const goToNextPage = () => {
  if (canGoToNextPage.value) {
    currentPage.value++;
    fetchProducts();
  }
};

const goToPage = (page: number) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
    fetchProducts();
  }
};

const changeItemsPerPage = (newLimit: number) => {
  itemsPerPage.value = newLimit;
  currentPage.value = 1; // Reset to first page
  fetchProducts();
};

// Watch for search query changes with debounce
let searchTimeout: ReturnType<typeof setTimeout> | null = null;
watch(searchQuery, () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    currentPage.value = 1; // Reset to first page on search
    await fetchProducts();
  }, 300);
});

// Lifecycle
onMounted(() => {
  fetchProducts();
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
</style>
