<template>
  <div class="min-h-screen w-screen bg-orange-50 flex flex-col overflow-hidden">
    <!-- App Header with Navigation -->
    <AppHeader />

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto p-4 lg:p-6 mt-12 lg:mt-10">
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
                >Product Name *</label
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
                >Brand</label
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
                >Model</label
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
                >Stock *</label
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
                >Buying Price (Rp) *</label
              >
              <input
                v-model.number="newProduct.buyPrice"
                type="number"
                min="0"
                placeholder="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Asking Price (Rp) *</label
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
                >Fixed Price (Rp)</label
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
                >Category</label
              >
              <input
                v-model="newProduct.category"
                type="text"
                placeholder="Kipas Angin"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div class="flex items-end gap-2">
              <button
                @click="addProduct"
                :disabled="
                  !newProduct.name ||
                  !newProduct.stock ||
                  !newProduct.buyPrice ||
                  !newProduct.askingPrice
                "
                class="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
              >
                <Icon name="lucide:check" class="w-5 h-5" />
                <span class="hidden sm:inline">Add</span>
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
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="px-6 py-4 bg-orange-600 text-white">
            <h2 class="text-lg lg:text-xl font-bold flex items-center gap-2">
              <Icon name="lucide:list" class="w-6 h-6" />
              Product List ({{ totalItems }})
            </h2>
          </div>

          <!-- Search and Pagination Controls -->
          <div class="px-6 py-4 border-b border-gray-200 space-y-4">
            <!-- Search Input -->
            <div class="flex gap-2">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search products by name, brand, or model..."
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
                  >Items per page:</label
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
                  Page {{ currentPage }} of {{ totalPages }} |
                  {{ totalItems }} total items
                </span>
                <span v-else>No products found</span>
              </div>

              <!-- Pagination Buttons -->
              <div class="flex items-center gap-2">
                <button
                  @click="goToPreviousPage"
                  :disabled="!canGoToPrevPage"
                  class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition font-semibold"
                >
                  ← Previous
                </button>
                <button
                  @click="goToNextPage"
                  :disabled="!canGoToNextPage"
                  class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition font-semibold"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

          <div v-if="loading" class="flex items-center justify-center py-20">
            <p class="text-gray-500 flex items-center gap-2">
              <Icon name="lucide:loader" class="w-5 h-5 animate-spin" />
              Loading products...
            </p>
          </div>

          <div
            v-else-if="products.length === 0"
            class="flex items-center justify-center py-20"
          >
            <p class="text-gray-500 flex items-center gap-2">
              <Icon name="lucide:inbox" class="w-5 h-5" />
              No products yet. Add one above.
            </p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th
                    class="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                  >
                    Product Name
                  </th>
                  <th
                    class="px-4 py-3 text-left text-sm font-semibold text-gray-700 hidden sm:table-cell"
                  >
                    Brand
                  </th>
                  <th
                    class="px-4 py-3 text-left text-sm font-semibold text-gray-700 hidden md:table-cell"
                  >
                    Model
                  </th>
                  <th
                    class="px-4 py-3 text-right text-sm font-semibold text-gray-700"
                  >
                    Stock
                  </th>
                  <th
                    class="px-4 py-3 text-right text-sm font-semibold text-gray-700 hidden lg:table-cell"
                  >
                    Buy Price
                  </th>
                  <th
                    class="px-4 py-3 text-right text-sm font-semibold text-gray-700 hidden lg:table-cell"
                  >
                    Ask Price
                  </th>
                  <th
                    class="px-4 py-3 text-right text-sm font-semibold text-gray-700 hidden lg:table-cell"
                  >
                    Fixed Price
                  </th>
                  <th
                    class="px-4 py-3 text-center text-sm font-semibold text-gray-700"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr
                  v-for="product in products"
                  :key="product.id"
                  class="hover:bg-orange-50 transition"
                >
                  <td class="px-4 py-3 text-sm font-semibold text-gray-800">
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
                    class="px-4 py-3 text-right text-sm font-mono font-bold"
                    :class="
                      product.stock < 5 ? 'text-red-600' : 'text-green-600'
                    "
                  >
                    {{ product.stock }}
                  </td>
                  <td
                    class="px-4 py-3 text-right text-sm font-mono hidden lg:table-cell"
                  >
                    {{ formatCurrency(product.buyPrice) }}
                  </td>
                  <td
                    class="px-4 py-3 text-right text-sm font-mono hidden lg:table-cell"
                  >
                    {{ formatCurrency(product.askingPrice) }}
                  </td>
                  <td
                    class="px-4 py-3 text-right text-sm font-mono hidden lg:table-cell"
                  >
                    {{ formatCurrency(product.fixedPrice) }}
                  </td>
                  <td class="px-4 py-3 text-center">
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
                        <span class="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            v-if="!loading && products.length === 0"
            class="flex items-center justify-center py-20"
          >
            <p class="text-gray-500 text-lg">No products found</p>
          </div>

          <div
            v-if="!loading && products.length > 0"
            class="bg-gray-50 border-t border-gray-300 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <p class="text-sm text-gray-600">
              <Icon name="lucide:info" class="w-4 h-4 inline mr-1" />
              Showing {{ (currentPage - 1) * itemsPerPage + 1 }}-{{
                Math.min(currentPage * itemsPerPage, totalItems)
              }}
              of {{ totalItems }} products | Total Stock:
              <span class="font-bold">{{ totalStock }}</span>
            </p>

            <!-- Bottom Pagination Controls -->
            <div class="flex items-center gap-2">
              <button
                @click="goToPreviousPage"
                :disabled="!canGoToPrevPage"
                class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition"
              >
                ← Prev
              </button>
              <div class="text-sm font-semibold text-gray-700">
                {{ currentPage }} / {{ totalPages }}
              </div>
              <button
                @click="goToNextPage"
                :disabled="!canGoToNextPage"
                class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition"
              >
                Next →
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
        class="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
      >
        <div class="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Icon name="lucide:edit-2" class="w-6 h-6 text-orange-600" />
              Edit Product
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
                >Product Name</label
              >
              <input
                v-model="editingProduct.name"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Brand</label
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
                >Stock</label
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
                >Buying Price</label
              >
              <input
                v-model.number="editingProduct.buyPrice"
                type="number"
                min="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Asking Price</label
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
                >Fixed Price</label
              >
              <input
                v-model.number="editingProduct.fixedPrice"
                type="number"
                min="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div class="flex gap-2 pt-4">
              <button
                @click="saveProduct"
                class="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
              >
                <Icon name="lucide:save" class="w-5 h-5" />
                Save
              </button>
              <button
                @click="showEditModal = false"
                class="flex-1 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded-lg transition"
              >
                Cancel
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
        class="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg font-semibold flex items-center gap-2"
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

const newProduct = reactive({
  name: "",
  brand: "",
  model: "",
  stock: 0,
  buyPrice: 0,
  askingPrice: 0,
  fixedPrice: 0,
  category: "",
});

const editingProduct = reactive({
  id: "",
  name: "",
  brand: "",
  model: "",
  stock: 0,
  buyPrice: 0,
  askingPrice: 0,
  fixedPrice: 0,
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

    const url = `/api/products?${params.toString()}`;
    const response = await $fetch<any>(url);
    products.value = response.products || [];
    totalItems.value = response.total || 0;
    totalPages.value = response.totalPages || 0;
  } catch (error) {
    console.error("Error loading products:", error);
    showToast("Failed to load products");
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
    showToast("Please fill all required fields");
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
        buyPrice: newProduct.buyPrice,
        askingPrice: newProduct.askingPrice,
        fixedPrice: newProduct.fixedPrice || newProduct.askingPrice,
        category: newProduct.category || null,
      },
    });

    products.value.push(response.product);
    resetForm();
    showToast("Product added successfully!");
  } catch (error: any) {
    showToast(error.message || "Failed to add product");
  }
};

const editProduct = (product: any) => {
  editingProduct.id = product.id;
  editingProduct.name = product.name;
  editingProduct.brand = product.brand;
  editingProduct.model = product.model;
  editingProduct.stock = product.stock;
  editingProduct.buyPrice = product.buyPrice;
  editingProduct.askingPrice = product.askingPrice;
  editingProduct.fixedPrice = product.fixedPrice;
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
        buyPrice: editingProduct.buyPrice,
        fixedPrice: editingProduct.fixedPrice,
        askingPrice: editingProduct.askingPrice,
      },
    });

    const index = products.value.findIndex((p) => p.id === editingProduct.id);
    if (index !== -1) {
      products.value[index] = response.product;
    }
    showEditModal.value = false;
    showToast("Product updated successfully!");
  } catch (error: any) {
    showToast(error.message || "Failed to update product");
  }
};

const deleteProduct = async (productId: string) => {
  if (!confirm("Delete this product?")) return;

  try {
    await $fetch(`/api/products/${productId}`, {
      method: "DELETE",
    });

    products.value = products.value.filter((p) => p.id !== productId);
    showToast("Product deleted successfully!");
  } catch (error: any) {
    showToast(error.message || "Failed to delete product");
  }
};

const resetForm = () => {
  newProduct.name = "";
  newProduct.brand = "";
  newProduct.model = "";
  newProduct.stock = 0;
  newProduct.buyPrice = 0;
  newProduct.fixedPrice = 0;
  newProduct.askingPrice = 0;
  newProduct.category = "";
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
