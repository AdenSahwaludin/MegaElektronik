<template>
  <div class="h-screen w-screen bg-orange-50 flex flex-col overflow-hidden">
    <!-- Header -->
    <header
      class="bg-orange-600 text-white px-4 lg:px-6 py-4 shadow-lg fixed w-full top-0 z-50"
    >
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-2 lg:gap-3">
          <img
            src="/Logo Mega Elektronik Bongas Merah no-bg.png"
            alt="Mega Elektronik"
            class="h-8 lg:h-10 w-auto"
          />
          <h1 class="text-lg lg:text-2xl font-bold hidden sm:block">
            Mega Elektronik POS
          </h1>
        </div>
        <div class="flex items-center gap-2 lg:gap-4">
          <span class="text-sm lg:text-base font-semibold">{{
            new Date().toLocaleDateString("id-ID")
          }}</span>
        </div>
      </div>
    </header>

    <!-- Main Content - Split Layout (iPad Optimized, Responsive) -->
    <div class="flex flex-1 gap-3 lg:gap-4 p-3 lg:p-4 overflow-hidden mt-16">
      <!-- Left Panel: Products Grid -->
      <div class="flex-1 flex flex-col bg-white rounded-lg shadow">
        <div class="px-4 pt-4 pb-2">
          <h2 class="text-xl font-bold text-gray-800 mb-3">Products</h2>

          <!-- Search & Filter -->
          <div class="flex gap-2 mb-4">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search product..."
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              @click="refreshProducts"
              class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition"
            >
              ↻
            </button>
          </div>

          <!-- Stock Status -->
          <div
            v-if="lowStockProducts.length > 0"
            class="bg-yellow-50 border border-yellow-200 rounded p-2 mb-3 text-sm text-yellow-800 flex items-center gap-2"
          >
            <Icon name="lucide:alert-triangle" class="w-5 h-5 flex-shrink-0" />
            {{ lowStockProducts.length }} product(s) low on stock
          </div>
        </div>

        <!-- Products Grid -->
        <div class="flex-1 overflow-y-auto px-4 pb-4">
          <div v-if="loading" class="flex items-center justify-center h-full">
            <p class="text-gray-500">Loading products...</p>
          </div>

          <div
            v-else-if="filteredProducts.length === 0"
            class="flex items-center justify-center h-full"
          >
            <p class="text-gray-500">No products found</p>
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
                  <p class="text-xs">
                    <span class="font-semibold">{{
                      formatCurrency(product.askingPrice)
                    }}</span>
                  </p>
                  <p class="text-xs text-gray-500">
                    Stock:
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
          <h2 class="text-xl font-bold">Shopping Cart</h2>
          <p class="text-sm opacity-90">Items: {{ cartStore.totalItems }}</p>
        </div>

        <!-- Customer Selection -->
        <div class="border-b px-4 py-3">
          <button
            @click="showCustomerModal = true"
            class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-orange-500 text-left font-semibold text-sm transition"
          >
            {{
              cartStore.selectedCustomer?.name || "+ Select Customer (Optional)"
            }}
          </button>
        </div>

        <!-- Cart Items -->
        <div
          v-if="cartStore.items.length === 0"
          class="flex-1 flex items-center justify-center text-gray-500"
        >
          <p>Cart is empty</p>
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
              <label class="text-xs font-semibold flex-shrink-0">Qty:</label>
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
                >Price/Unit:</label
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
                Below cost price!
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
                <p class="text-gray-600">Profit:</p>
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
              Remove
            </button>
          </div>
        </div>

        <!-- Cart Summary -->
        <div class="border-t bg-gray-50 px-4 py-4 space-y-2">
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-700">Total Items:</span>
            <span class="font-bold">{{ cartStore.totalItems }}</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-700">Revenue:</span>
            <span class="font-bold text-lg">{{
              formatCurrency(cartStore.totalRevenue)
            }}</span>
          </div>
          <div
            class="flex justify-between items-center text-sm bg-white p-2 rounded border border-green-200"
          >
            <span class="text-green-700 font-semibold">Net Profit:</span>
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
            {{ cartStore.isProcessing ? "Processing..." : "Checkout" }}
          </button>
          <button
            @click="handleClearCart"
            :disabled="cartStore.items.length === 0"
            class="w-full px-4 py-3 bg-orange-400 hover:bg-orange-500 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-bold rounded-lg transition"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>

    <!-- Customer Modal -->
    <UModal v-model="showCustomerModal" title="Select or Create Customer">
      <div class="space-y-4 p-4">
        <!-- Search existing customers -->
        <div>
          <label class="block text-sm font-semibold mb-2"
            >Search Customer:</label
          >
          <input
            v-model="customerSearch"
            type="text"
            placeholder="Enter name or phone..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Customer list -->
        <div
          v-if="filteredCustomers.length > 0"
          class="max-h-56 overflow-y-auto border rounded-lg"
        >
          <button
            v-for="customer in filteredCustomers"
            :key="customer.id"
            @click="selectCustomer(customer)"
            class="w-full text-left px-4 py-2 hover:bg-orange-50 border-b last:border-b-0 transition"
          >
            <p class="font-semibold">{{ customer.name }}</p>
            <p class="text-xs text-gray-600">
              {{ customer.phone || "No phone" }}
            </p>
          </button>
        </div>

        <!-- Create new customer -->
        <div class="border-t pt-4">
          <h3 class="font-semibold mb-3">Create New Customer</h3>
          <div class="space-y-2">
            <input
              v-model="newCustomer.name"
              type="text"
              placeholder="Name *"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              v-model="newCustomer.phone"
              type="tel"
              placeholder="Phone (optional)"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              v-model="newCustomer.address"
              type="text"
              placeholder="Address (optional)"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              @click="createNewCustomer"
              :disabled="!newCustomer.name"
              class="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
            >
              Create & Select
            </button>
          </div>
        </div>

        <!-- No customer (anonymous) -->
        <button
          @click="selectCustomer(null)"
          class="w-full px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold rounded-lg transition"
        >
          Continue as Anonymous
        </button>
      </div>
    </UModal>

    <!-- Success Toast -->
    <Transition name="fade">
      <div
        v-if="showSuccessMessage"
        class="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg font-semibold"
      >
        ✓ {{ successMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Ref } from "vue";
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

// Customer Modal
const showCustomerModal = ref(false);
const customerSearch = ref("");
const customers: Ref<any[]> = ref([]);
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
  const query = searchQuery.value.toLowerCase();
  return products.value.filter(
    (p) =>
      p.name.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query) ||
      p.model.toLowerCase().includes(query),
  );
});

const lowStockProducts = computed(() => {
  return products.value.filter((p) => p.stock > 0 && p.stock < 5);
});

const filteredCustomers = computed(() => {
  const query = customerSearch.value.toLowerCase();
  return customers.value.filter(
    (c) =>
      c.name.toLowerCase().includes(query) ||
      (c.phone && c.phone.includes(query)),
  );
});

// Methods
const fetchProducts = async () => {
  loading.value = true;
  try {
    const response = await $fetch("/api/products");
    products.value = response.products || [];
  } catch (error) {
    console.error("Error loading products:", error);
    showToast("Failed to load products");
  } finally {
    loading.value = false;
  }
};

const refreshProducts = async () => {
  await fetchProducts();
  showToast("Products refreshed");
};

const fetchCustomers = async () => {
  try {
    // This endpoint doesn't exist yet, create it if needed
    const response = await $fetch("/api/customers");
    customers.value = response.customers || [];
  } catch (error) {
    console.warn("Could not load customers:", error);
    customers.value = [];
  }
};

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
    showToast("Transaction completed successfully!");
    await fetchProducts(); // Refresh product stock
  } catch (error: any) {
    showToast(error.message || "Checkout failed");
  }
};

const handleClearCart = () => {
  if (confirm("Clear the cart?")) {
    cartStore.clearCart();
  }
};

const selectCustomer = (customer: any) => {
  if (customer) {
    cartStore.selectedCustomer = customer;
  } else {
    cartStore.selectedCustomer = null;
  }
  showCustomerModal.value = false;
};

const createNewCustomer = async () => {
  if (!newCustomer.name.trim()) {
    showToast("Customer name is required");
    return;
  }

  try {
    const response = await $fetch("/api/customers", {
      method: "POST",
      body: {
        name: newCustomer.name,
        phone: newCustomer.phone || null,
        address: newCustomer.address || null,
      },
    });

    selectCustomer(response);
    newCustomer.name = "";
    newCustomer.phone = "";
    newCustomer.address = "";
    await fetchCustomers();
    showToast("Customer created successfully");
  } catch (error: any) {
    showToast(error.message || "Failed to create customer");
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
  fetchCustomers();
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
