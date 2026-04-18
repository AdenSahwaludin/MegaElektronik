<template>
  <div class="h-screen w-screen bg-orange-50 flex flex-col overflow-hidden">
    <!-- App Header with Navigation -->
    <AppHeader />

    <!-- Main Content - Split Layout (iPad Optimized, Responsive) -->
    <div
      class="flex flex-1 gap-3 lg:gap-4 p-3 lg:p-4 overflow-hidden mt-12 lg:mt-10"
    >
      <!-- Left Panel: Products Grid (Full width on mobile, flex-1 on desktop) -->
      <div class="flex-1 flex flex-col bg-white rounded-lg shadow">
        <div class="px-4 pt-4 pb-2">
          <h2 class="text-xl font-bold text-gray-800 mb-3">Produk</h2>

          <!-- Search & Filter -->
          <div class="flex gap-2 mb-4">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari produk..."
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              @click="refreshProducts"
              class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition"
            >
              ↻
            </button>
            <!-- Mobile Cart Toggle Button -->
            <button
              @click="showMobileCart = true"
              class="md:hidden px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition flex items-center gap-2"
            >
              <Icon name="lucide:shopping-cart" class="w-5 h-5" />
              <span class="text-xs">{{ cartStore.totalItems }}</span>
            </button>
          </div>

          <!-- Stock Status -->
          <div
            v-if="lowStockProducts.length > 0"
            class="bg-yellow-50 border border-yellow-200 rounded p-2 mb-3 text-sm text-yellow-800 flex items-center gap-2"
          >
            <Icon name="lucide:alert-triangle" class="w-5 h-5 shrink-0" />
            {{ lowStockProducts.length }} produk stok abis
          </div>
        </div>

        <!-- Products Grid -->
        <div class="flex-1 overflow-y-auto px-4 pb-4">
          <div v-if="loading" class="flex items-center justify-center h-full">
            <p class="text-gray-500">Muat produk...</p>
          </div>

          <div
            v-else-if="filteredProducts.length === 0"
            class="flex items-center justify-center h-full"
          >
            <p class="text-gray-500">Produk gak ada</p>
          </div>

          <div v-else class="grid grid-cols-2 gap-3 auto-rows-max">
            <button
              v-for="product in filteredProducts"
              :key="product.id"
              @click="addProductToCart(product)"
              :disabled="product.stock === 0"
              :class="[
                'p-4 rounded-lg border-2 transition-all transform active:scale-95',
                product.stock === 0
                  ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                  : 'bg-white border-orange-300 hover:border-orange-500 hover:shadow-md cursor-pointer',
              ]"
            >
              <div class="text-left">
                <p class="font-bold text-sm truncate">{{ product.name }}</p>
                <p class="text-xs text-gray-600 mb-2">
                  {{ product.brand }} - {{ product.model }}
                </p>
                <div class="space-y-1">
                  <div class="text-xs space-y-0.5">
                    <p class="text-gray-600">
                      Tawar:
                      <span class="font-semibold">{{
                        formatCurrency(product.askingPrice)
                      }}</span>
                    </p>
                    <p class="text-orange-600 font-bold">
                      Pas: {{ formatCurrency(product.fixedPrice) }}
                    </p>
                  </div>
                  <p class="text-xs text-gray-500">
                    Stok:
                    <span
                      class="font-semibold"
                      :class="product.stock < 5 ? 'text-red-600' : ''"
                    >
                      {{ product.stock }}
                    </span>
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Right Panel: Cart -->
      <div
        class="w-72 lg:w-96 flex flex-col bg-white rounded-lg shadow-lg overflow-hidden hidden md:flex"
      >
        <!-- Cart Header -->
        <div class="bg-orange-600 text-white px-4 py-3">
          <h2 class="text-xl font-bold">Keranjang</h2>
          <p class="text-sm opacity-90">Item: {{ cartStore.totalItems }}</p>
        </div>

        <!-- Create Customer Section (Collapsible) -->
        <div class="border-b px-4 py-3 bg-orange-50">
          <button
            @click="showCustomerForm = !showCustomerForm"
            class="w-full flex items-center justify-between font-bold text-sm text-gray-900 hover:text-orange-700 transition"
          >
            <span>Data Pelanggan (Opsional)</span>
            <Icon
              :name="
                showCustomerForm ? 'lucide:chevron-up' : 'lucide:chevron-down'
              "
              class="w-5 h-5"
            />
          </button>

          <!-- Collapsible Form -->
          <div
            v-show="showCustomerForm"
            class="space-y-2 mt-3 pt-3 border-t border-orange-200"
          >
            <input
              v-model="newCustomer.name"
              type="text"
              placeholder="Nama pelanggan"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              v-model="newCustomer.phone"
              type="tel"
              placeholder="No HP (opsional)"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              v-model="newCustomer.address"
              type="text"
              placeholder="Alamat (opsional)"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              @click="createNewCustomer"
              :disabled="!newCustomer.name.trim()"
              class="w-full px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition"
            >
              Buat Pelanggan
            </button>
          </div>

          <!-- Selected Customer -->
          <div
            v-if="cartStore.selectedCustomer"
            class="mt-3 p-2 bg-white rounded border border-green-300"
          >
            <p class="text-xs text-gray-600">Pelanggan saat ini:</p>
            <p class="font-bold text-sm text-green-700">
              {{ cartStore.selectedCustomer.name }}
            </p>
          </div>
        </div>

        <!-- Cart Items -->
        <div
          v-if="cartStore.items.length === 0"
          class="flex-1 flex items-center justify-center text-gray-500"
        >
          <p>Keranjang kosong</p>
        </div>

        <div v-else class="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          <div
            v-for="item in cartStore.items"
            :key="item.id"
            class="bg-gray-50 rounded-lg p-3 border border-gray-200"
          >
            <!-- Product Info -->
            <div class="mb-2">
              <p class="font-bold text-sm">{{ item.productName }}</p>
              <p class="text-xs text-gray-600">
                {{ item.brand }} - {{ item.model }}
              </p>
            </div>

            <!-- Quantity Control -->
            <div class="flex items-center gap-2 mb-2">
              <label class="text-xs font-semibold shrink-0">Qty:</label>
              <div class="flex items-center border border-gray-300 rounded">
                <button
                  @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
                  class="px-2 py-1 hover:bg-gray-200 font-bold"
                >
                  −
                </button>
                <input
                  :value="item.quantity"
                  @input="
                    (e: any) =>
                      cartStore.updateQuantity(
                        item.id,
                        parseInt(e.target.value, 10) || 1,
                      )
                  "
                  type="number"
                  min="1"
                  class="w-12 text-center border-l border-r border-gray-300 py-1 focus:outline-none"
                />
                <button
                  @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
                  class="px-2 py-1 hover:bg-gray-200 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <!-- Price Input (Bargaining Feature) -->
            <div class="mb-2">
              <label class="text-xs font-semibold block mb-1"
                >Harga/Unit:</label
              >
              <div class="relative">
                <span
                  class="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm"
                  >Rp</span
                >
                <input
                  :value="formatCurrency(item.soldPrice)"
                  @input="handlePriceInput(item.id, $event)"
                  type="text"
                  class="w-full pl-8 pr-3 py-2 border border-orange-300 rounded font-semibold text-right focus:outline-none focus:ring-2 focus:ring-orange-500 bg-orange-50"
                />
              </div>
              <p
                v-if="item.soldPrice < item.buyPrice"
                class="text-xs text-red-600 mt-1 flex items-center gap-1"
              >
                <Icon name="lucide:alert-circle" class="w-4 h-4" />
                Harga di bawah pokok!
              </p>
            </div>

            <!-- Line Total & Profit -->
            <div
              class="grid grid-cols-2 gap-2 text-xs mb-2 bg-white p-2 rounded"
            >
              <div>
                <p class="text-gray-600">Subtotal:</p>
                <p class="font-bold">
                  {{ formatCurrency(item.soldPrice * item.quantity) }}
                </p>
              </div>
              <div>
                <p class="text-gray-600">Untung:</p>
                <p
                  class="font-bold"
                  :class="
                    item.soldPrice - item.buyPrice > 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  "
                >
                  {{
                    formatCurrency(
                      (item.soldPrice - item.buyPrice) * item.quantity,
                    )
                  }}
                </p>
              </div>
            </div>

            <!-- Remove Button -->
            <button
              @click="cartStore.removeFromCart(item.id)"
              class="w-full px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded text-sm transition"
            >
              Hapus
            </button>
          </div>
        </div>

        <!-- Cart Summary -->
        <div class="border-t bg-gray-50 px-4 py-4 space-y-2">
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-700">Total Item:</span>
            <span class="font-bold">{{ cartStore.totalItems }}</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-700">Omset:</span>
            <span class="font-bold text-lg">{{
              formatCurrency(cartStore.totalRevenue)
            }}</span>
          </div>
          <div
            class="flex justify-between items-center text-sm bg-white p-2 rounded border border-green-200"
          >
            <span class="text-green-700 font-semibold">Untung Bersih:</span>
            <span class="font-bold text-lg text-green-600">{{
              formatCurrency(cartStore.totalProfit)
            }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="border-t px-4 py-3 space-y-2">
          <button
            @click="handleCheckout"
            :disabled="cartStore.items.length === 0 || cartStore.isProcessing"
            class="w-full px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-lg rounded-lg transition"
          >
            {{ cartStore.isProcessing ? "Proses..." : "Bayar" }}
          </button>
          <button
            @click="handleClearCart"
            :disabled="cartStore.items.length === 0"
            class="w-full px-4 py-3 bg-orange-400 hover:bg-orange-500 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-bold rounded-lg transition"
          >
            Hapus Semua
          </button>
        </div>
      </div>
    </div>

    <!-- Success Toast -->
    <Transition name="fade">
      <div
        v-if="showSuccessMessage"
        class="fixed bottom-6 left-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg font-semibold flex items-center gap-2"
      >
        <Icon name="lucide:check-circle" class="w-5 h-5" />
        {{ successMessage }}
      </div>
    </Transition>

    <!-- Mobile Cart Drawer (Fullscreen Modal untuk Mobile) -->
    <Transition
      enter-active-class="transition-opacity transition-transform duration-300"
      enter-from-class="opacity-0 translate-y-full"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-opacity transition-transform duration-300"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-full"
    >
      <div
        v-if="showMobileCart"
        class="fixed inset-0 z-50 flex flex-col bg-white md:hidden mt-24"
      >
        <!-- Mobile Cart Header -->
        <div
          class="bg-orange-600 text-white px-4 py-4 flex items-center justify-between"
        >
          <h2 class="text-xl font-bold">Keranjang</h2>
          <button
            @click="showMobileCart = false"
            class="text-white hover:bg-orange-700 p-2 rounded transition"
          >
            <Icon name="lucide:x" class="w-6 h-6" />
          </button>
        </div>

        <!-- Mobile Cart Content -->
        <div class="flex-1 overflow-y-auto">
          <!-- Customer Section -->
          <div class="border-b px-4 py-3 bg-orange-50">
            <button
              @click="showCustomerForm = !showCustomerForm"
              class="w-full flex items-center justify-between font-bold text-sm text-gray-900 hover:text-orange-700 transition"
            >
              <span>Data Pelanggan</span>
              <Icon
                :name="
                  showCustomerForm ? 'lucide:chevron-up' : 'lucide:chevron-down'
                "
                class="w-5 h-5"
              />
            </button>
            <div
              v-show="showCustomerForm"
              class="space-y-2 mt-3 pt-3 border-t border-orange-200"
            >
              <input
                v-model="newCustomer.name"
                type="text"
                placeholder="Nama pelanggan"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                v-model="newCustomer.phone"
                type="tel"
                placeholder="No HP (opsional)"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                v-model="newCustomer.address"
                type="text"
                placeholder="Alamat (opsional)"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                @click="createNewCustomer"
                :disabled="!newCustomer.name.trim()"
                class="w-full px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition"
              >
                Buat Pelanggan
              </button>
            </div>
            <div
              v-if="cartStore.selectedCustomer"
              class="mt-3 p-2 bg-white rounded border border-green-300"
            >
              <p class="text-xs text-gray-600">Pelanggan saat ini:</p>
              <p class="font-bold text-sm text-green-700">
                {{ cartStore.selectedCustomer.name }}
              </p>
            </div>
          </div>

          <!-- Cart Items -->
          <div
            v-if="cartStore.items.length === 0"
            class="flex items-center justify-center py-20 text-gray-500"
          >
            <p>Keranjang kosong</p>
          </div>

          <div v-else class="px-3 py-3 space-y-3">
            <div
              v-for="item in cartStore.items"
              :key="item.id"
              class="bg-gray-50 rounded-lg p-3 border border-gray-200"
            >
              <div class="mb-2">
                <p class="font-bold text-sm">{{ item.productName }}</p>
                <p class="text-xs text-gray-600">
                  {{ item.brand }} - {{ item.model }}
                </p>
              </div>
              <div class="flex items-center gap-2 mb-2">
                <label class="text-xs font-semibold shrink-0">Qty:</label>
                <div class="flex items-center border border-gray-300 rounded">
                  <button
                    @click="
                      cartStore.updateQuantity(item.id, item.quantity - 1)
                    "
                    class="px-2 py-1 hover:bg-gray-200 font-bold"
                  >
                    −
                  </button>
                  <input
                    :value="item.quantity"
                    @input="
                      (e: any) =>
                        cartStore.updateQuantity(
                          item.id,
                          parseInt(e.target.value, 10) || 1,
                        )
                    "
                    type="number"
                    min="1"
                    class="w-12 text-center border-l border-r border-gray-300 py-1 focus:outline-none"
                  />
                  <button
                    @click="
                      cartStore.updateQuantity(item.id, item.quantity + 1)
                    "
                    class="px-2 py-1 hover:bg-gray-200 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
              <div class="mb-2">
                <label class="text-xs font-semibold block mb-1"
                  >Harga/Unit:</label
                >
                <div class="relative">
                  <span
                    class="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm"
                    >Rp</span
                  >
                  <input
                    :value="formatCurrency(item.soldPrice)"
                    @input="handlePriceInput(item.id, $event)"
                    type="text"
                    class="w-full pl-8 pr-3 py-2 border border-orange-300 rounded font-semibold text-right focus:outline-none focus:ring-2 focus:ring-orange-500 bg-orange-50"
                  />
                </div>
              </div>
              <div
                class="grid grid-cols-2 gap-2 text-xs mb-2 bg-white p-2 rounded"
              >
                <div>
                  <p class="text-gray-600">Subtotal:</p>
                  <p class="font-bold">
                    {{ formatCurrency(item.soldPrice * item.quantity) }}
                  </p>
                </div>
                <div>
                  <p class="text-gray-600">Untung:</p>
                  <p
                    class="font-bold"
                    :class="
                      item.soldPrice - item.buyPrice > 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    "
                  >
                    {{
                      formatCurrency(
                        (item.soldPrice - item.buyPrice) * item.quantity,
                      )
                    }}
                  </p>
                </div>
              </div>
              <button
                @click="cartStore.removeFromCart(item.id)"
                class="w-full px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded text-sm transition"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile Cart Summary & Actions -->
        <div class="border-t bg-gray-50 px-4 py-4 space-y-2">
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-700">Total Item:</span>
            <span class="font-bold">{{ cartStore.totalItems }}</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-700">Omset:</span>
            <span class="font-bold text-lg">{{
              formatCurrency(cartStore.totalRevenue)
            }}</span>
          </div>
          <div
            class="flex justify-between items-center text-sm bg-white p-2 rounded border border-green-200"
          >
            <span class="text-green-700 font-semibold">Untung:</span>
            <span class="font-bold text-lg text-green-600">{{
              formatCurrency(cartStore.totalProfit)
            }}</span>
          </div>
          <div class="space-y-2 pt-4">
            <button
              @click="handleCheckout"
              :disabled="cartStore.items.length === 0 || cartStore.isProcessing"
              class="w-full px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-lg transition"
            >
              {{ cartStore.isProcessing ? "Proses..." : "Bayar" }}
            </button>
            <button
              @click="handleClearCart"
              :disabled="cartStore.items.length === 0"
              class="w-full px-4 py-3 bg-orange-400 hover:bg-orange-500 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-bold rounded-lg transition"
            >
              Hapus Semua
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Ref } from "vue";
import { watch, computed, ref } from "vue";
import { useCartStore } from "../stores/cart";
import { useCurrency } from "../../composables/useCurrency";

definePageMeta({
  layout: "default",
});

const cartStore = useCartStore();
const { formatCurrency } = useCurrency();

// Products
const products: Ref<any[]> = ref([]);
const loading = ref(false);
const searchQuery = ref("");

// Customer Form
const showCustomerForm = ref(true); // Changed: default to true (expanded)
const showMobileCart = ref(false);
const newCustomer = reactive({
  name: "",
  phone: "",
  address: "",
});

// Messages
const showSuccessMessage = ref(false);
const successMessage = ref("");

// Computed
const filteredProducts = computed(() => {
  // Products are already filtered & active on server, just return them
  return products.value;
});

const lowStockProducts = computed(() => {
  return products.value.filter((p) => p.stock >= 0 && p.stock < 2);
});

// Methods
const fetchProducts = async () => {
  loading.value = true;
  try {
    // Use advanced search from API - pass searchQuery as parameter
    const params = new URLSearchParams();
    if (searchQuery.value.trim()) {
      params.append("search", searchQuery.value);
    }
    params.append("limit", "100"); // Get all products for POS view

    const url = `/api/products?${params.toString()}`;
    const response = await $fetch<any>(url);
    products.value = response.products || [];
  } catch (error) {
    console.error("Error loading products:", error);
    showToast("Gagal muat produk");
  } finally {
    loading.value = false;
  }
};

const refreshProducts = async () => {
  await fetchProducts();
  showToast("Produk diperbarui");
};

// Watch for search query changes with debounce
let searchTimeout: ReturnType<typeof setTimeout> | null = null;
watch(searchQuery, async () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    await fetchProducts();
  }, 300);
});

const addProductToCart = (product: any) => {
  if (product.stock > 0) {
    cartStore.addToCart(product);
  }
};

const handlePriceInput = (cartItemId: string, event: Event) => {
  const input = event.target as HTMLInputElement;
  const value = parseFloat(input.value.replace(/\D/g, "")) || 0;
  cartStore.updateSoldPrice(cartItemId, value);
};

const handleCheckout = async () => {
  try {
    await cartStore.checkout();
    showToast("✓ Transaksi berhasil!");
    await fetchProducts(); // Refresh product stock
  } catch (error: any) {
    showToast("❌ " + (error.message || "Transaksi gagal"));
  }
};

const handleClearCart = () => {
  if (confirm("Hapus semua dari keranjang?")) {
    cartStore.clearCart();
  }
};

const createNewCustomer = async () => {
  if (!newCustomer.name.trim()) {
    showToast("Nama pelanggan diperlukan");
    return;
  }

  try {
    const response = await $fetch<any>("/api/customers", {
      method: "POST",
      body: {
        name: newCustomer.name,
        phone: newCustomer.phone || null,
        address: newCustomer.address || null,
      },
    });

    cartStore.selectedCustomer = response;
    newCustomer.name = "";
    newCustomer.phone = "";
    newCustomer.address = "";
    showToast("✓ Pelanggan dibuat!");
  } catch (error: any) {
    showToast("❌ " + (error.message || "Gagal buat pelanggan"));
  }
};

const showToast = (message: string) => {
  successMessage.value = message;
  showSuccessMessage.value = true;
  setTimeout(() => {
    showSuccessMessage.value = false;
  }, 3000);
};

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
