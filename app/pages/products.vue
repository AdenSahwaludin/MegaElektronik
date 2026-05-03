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
                >Nama Produk *</label
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
                >Stok *</label
              >
              <input
                v-model.number="newProduct.stock"
                type="number"
                min="0"
                placeholder="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Harga Service (Teknisi)</label
              >
              <input
                v-model.number="newProduct.servicePrice"
                type="number"
                min="0"
                placeholder="Khusus teknisi"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Harga Tawar (Rp) *</label
              >
              <input
                v-model.number="newProduct.askingPrice"
                type="number"
                min="0"
                placeholder="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Harga Pas (Rp)</label
              >
              <input
                v-model.number="newProduct.fixedPrice"
                type="number"
                min="0"
                placeholder="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
<div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Harga Beli (Rp) *</label
              >
              <input
                v-model.number="newProduct.buyPrice"
                type="number"
                min="0"
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
          <div class="px-6 py-4 bg-orange-600 text-white">
            <h2 class="text-lg lg:text-xl font-bold flex items-center gap-2">
              <Icon name="lucide:list" class="w-6 h-6" />
              Daftar Produk ({{ totalItems }})
            </h2>
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
            v-if="products.length === 0"
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

          <!-- Table Content -->
          <div 
            v-show="products.length > 0" 
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
                    class="px-4 py-3 text-left text-sm font-semibold text-gray-700 hidden sm:table-cell cursor-pointer hover:bg-gray-200 transition"
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
                    class="px-4 py-3 text-right text-sm font-semibold text-gray-700 hidden lg:table-cell cursor-pointer hover:bg-gray-200 transition"
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
                    class="px-4 py-3 text-sm text-gray-700 hidden sm:table-cell"
                  >
                    {{ product.brand || "-" }}
                  </td>
                  <td
                    class="px-4 py-3 text-sm text-gray-700 hidden md:table-cell"
                  >
                    {{ product.model || "-" }}
                  </td>
                  <td
                    class="px-4 py-3 text-right text-sm font-mono font-bold hidden lg:table-cell"
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

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2"
                  >Stok</label
                >
                <input
                  v-model.number="editingProduct.stock"
                  type="number"
                  min="0"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2"
                  >Harga Service</label
                >
                <input
                  v-model.number="editingProduct.servicePrice"
                  type="number"
                  min="0"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

          

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Harga Tawar</label
              >
              <input
                v-model.number="editingProduct.askingPrice"
                type="number"
                min="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Harga Pas</label
              >
              <input
                v-model.number="editingProduct.fixedPrice"
                type="number"
                min="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
        <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Harga Beli</label
              >
              <input
                v-model.number="editingProduct.buyPrice"
                type="number"
                min="0"
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

const { formatCurrency } = useCurrency();

// State
const products: Ref<any[]> = ref([]);
const loading = ref(false);
const showEditModal = ref(false);
const showMessage = ref(false);
const message = ref("");

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
        name: newProduct.name,
        brand: newProduct.brand || null,
        model: newProduct.model || null,
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
        name: editingProduct.name,
        brand: editingProduct.brand,
        model: editingProduct.model,
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
