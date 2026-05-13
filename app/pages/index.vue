<template>
  <div class="h-[100dvh] w-full bg-orange-50 flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom)]">
    <!-- App Header with Navigation -->
    <AppHeader />

    <!-- Main Content - Split Layout (iPad Optimized, Responsive) -->
    <div
      class="mt-3 flex flex-1 gap-3 lg:gap-4 p-3 lg:p-4 overflow-hidden pt-20 lg:pt-24"
    >
      <!-- Left Panel: Products Grid (Full width on mobile, flex-1 on desktop) -->
      <div class="flex-1 flex flex-col bg-white rounded-lg shadow">
        <div class="px-4 pt-4 pb-2">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-xl font-bold text-gray-800">Produk</h2>
            <button 
              @click="showCategories = !showCategories"
              class="flex items-center gap-1 px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-full text-xs font-bold transition-all active:scale-95"
            >
              <Icon :name="showCategories ? 'lucide:chevron-up' : 'lucide:chevron-down'" class="w-3.5 h-3.5" />
              {{ showCategories ? 'Sembunyikan Kategori' : 'Tampilkan Kategori' }}
            </button>
          </div>

          <!-- Search & Filter -->
          <div class="space-y-3 mb-4">
            <div class="flex gap-2">
              <div class="relative flex-1">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Cari produk..."
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10"
                />
                <button
                  v-if="searchQuery"
                  @click="searchQuery = ''"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  <Icon name="lucide:x" class="w-5 h-5" />
                </button>
              </div>
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

            <!-- Quick Categories -->
            <div v-show="showCategories" class="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <button
                v-for="cat in ['Kipas', 'Kompor', 'Rice cooker', 'Blender', 'AC', 'Mesin cuci', 'Kulkas', 'Setrika', 'Dispenser', 'Teko', 'Exhaust']"
                :key="cat"
                @click="searchQuery = cat"
                :class="[
                  'px-3 py-1 rounded-full text-xs font-semibold transition border',
                  searchQuery === cat
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-orange-500 hover:text-orange-600'
                ]"
              >
                {{ cat }}
              </button>
            </div>
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
          <div
            v-if="!loading && filteredProducts.length === 0"
            class="flex flex-col items-center justify-center h-full text-center p-6"
          >
            <Icon
              :name="searchQuery ? 'lucide:search-x' : 'lucide:package-open'"
              class="w-12 h-12 text-gray-300 mb-2"
            />
            <p class="text-gray-500 font-semibold">
              {{ searchQuery ? "Produk nggak ketemu" : "Belum ada produk" }}
            </p>
            <p class="text-xs text-gray-400 mt-1">
              {{
                searchQuery
                  ? "Coba cari dengan kata kunci lain ya."
                  : "Daftar produk masih kosong."
              }}
            </p>
          </div>

          <div
            v-show="loading"
            class="flex flex-col items-center justify-center h-full text-center p-6"
          >
            <div class="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
            <p class="text-orange-600 font-bold animate-pulse">Sabar ya, lagi ambil data...</p>
          </div>

          <div
            v-show="!loading && filteredProducts.length > 0"
            class="grid grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-max"
          >
            <button
              v-for="product in filteredProducts"
              :key="product.id"
              :disabled="product.stock === 0"
              @click="addProductToCart(product, 'umum')"
              :class="[
                'p-4 rounded-lg border-2 transition-all transform active:scale-[0.98] group relative overflow-hidden flex flex-col',
                product.stock === 0
                  ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                  : 'bg-white border-orange-200 hover:border-orange-500 hover:shadow-md cursor-pointer',
              ]"
            >
              <div class="text-left flex flex-col h-full w-full">
                <div class="min-h-10">
                  <p class="font-bold text-sm line-clamp-2 group-hover:text-orange-700 transition-colors">
                    {{ product.name }}
                  </p>
                  <p class="text-[10px] text-gray-500 truncate mb-2">
                    {{ product.brand }} - {{ product.model }}
                  </p>
                </div>
                
                <div class="space-y-0.5 mb-3">
                  <div class="grid grid-cols-[40px_1fr] gap-x-1 items-center">
                    <span class="text-[9px] text-gray-400 uppercase font-bold">Tawar</span>
                    <span class="text-xs font-bold text-orange-600">{{ formatCurrency(product.askingPrice) }}</span>
                  </div>
                  <div class="grid grid-cols-[40px_1fr] gap-x-1 items-center">
                    <span class="text-[9px] text-gray-400 uppercase font-bold">Pas</span>
                    <span class="text-[11px] font-semibold text-gray-700">{{ formatCurrency(product.fixedPrice) }}</span>
                  </div>
                  <div v-if="product.servicePrice" class="grid grid-cols-[40px_1fr] gap-x-1 items-center">
                    <span class="text-[9px] text-blue-400 uppercase font-bold">Svc</span>
                    <span class="text-[11px] font-bold text-blue-600">{{ formatCurrency(product.servicePrice) }}</span>
                  </div>
                  <div class="grid grid-cols-[40px_1fr] gap-x-1 items-center pt-1 mt-1 border-t border-dashed border-gray-100">
                    <span class="text-[9px] text-gray-500 uppercase italic font-bold">Modal</span>
                    <span class="text-[9px] text-gray-500 italic">{{ formatCurrency(product.buyPrice) }}</span>
                  </div>
                </div>

                <div class="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div class="flex flex-col items-start">
                    <span class="text-[9px] text-gray-400 uppercase font-bold leading-tight">Stok</span>
                    <span :class="product.stock < 5 ? 'text-red-600' : 'text-green-600'" class="text-sm font-black leading-tight">
                      {{ product.stock }}
                    </span>
                  </div>
                  
                  <button 
                    v-if="product.servicePrice"
                    @click.stop="addProductToCart(product, 'service')"
                    class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[8px] font-bold rounded-lg shadow transition active:scale-90 flex items-center gap-1"
                  >
                    <Icon name="lucide:tag" class="w-2.5 h-2.5" />
                    Service
                  </button>
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

        <!-- Transaction Date & Time Section -->
        <div class="border-b px-4 py-3 bg-orange-50">
          <div class="flex items-center justify-between mb-2">
             <span class="text-sm font-bold text-gray-900 flex items-center gap-1">
               <Icon name="lucide:calendar-days" class="w-4 h-4 text-orange-600" />
               Waktu Transaksi
             </span>
          </div>
          <input
            v-model="transactionDateTime"
            type="datetime-local"
            @input="stopLiveClock"
            class="w-full px-3 py-2 border border-orange-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          />
          <p class="text-[10px] text-gray-400 mt-1 italic">* Default adalah waktu sekarang</p>
        </div>

        <!-- Cart Items -->
        <div
          v-if="cartStore.items.length === 0"
          class="flex-1 flex items-center justify-center text-gray-500"
        >
          <p>Keranjang masih sepi nih</p>
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
                <span v-if="item.servicePrice" :class="item.stockType === 'service' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'" class="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">
                  {{ item.stockType === 'service' ? 'Harga Service' : 'Harga Umum' }}
                </span>
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
              <label
                class="text-xs font-semibold mb-1 flex justify-between items-end"
              >
                <span>Harga/Unit:</span>
                <span class="text-[10px] font-normal text-gray-400 italic"
                  >harga bisa diubah</span
                >
              </label>
              <div class="relative">
                <span
                  class="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm"
                  >Rp</span
                >
                <input
                  :value="item.soldPrice ? formatNumber(item.soldPrice) : ''"
                  @input="handlePriceInput(item.id, $event)"
                  type="text"
                  inputmode="numeric"
                  class="w-full pl-8 pr-3 py-2 border border-orange-300 rounded font-semibold text-right focus:outline-none focus:ring-2 focus:ring-orange-500 bg-orange-50"
                />
              </div>
              <p
                v-if="item.soldPrice < item.buyPrice"
                class="text-xs text-red-600 mt-1 flex items-center gap-1"
              >
                <Icon name="lucide:alert-circle" class="w-4 h-4" />
                Harga di bawah modal!
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
            <div class="flex flex-col items-end">
              <span class="font-bold text-lg text-green-600">{{
                formatCurrency(cartStore.totalProfit)
              }}</span>
              <span
                v-if="cartStore.totalCost > 0"
                class="text-[10px] text-green-500 font-bold"
              >
                untung
                {{
                  ((cartStore.totalProfit / cartStore.totalCost) * 100).toFixed(
                    1,
                  )
                }}% dari modal
              </span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="border-t px-4 py-3 space-y-2">
          <button
            @click="handleCheckout"
            :disabled="cartStore.items.length === 0 || cartStore.isProcessing"
            class="w-full px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-lg rounded-lg transition"
          >
            {{ cartStore.isProcessing ? "Sabar..." : "Bayar Sekarang" }}
          </button>
          <button
            @click="handleClearCart"
            :disabled="cartStore.items.length === 0"
            class="w-full px-4 py-3 bg-orange-400 hover:bg-orange-500 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-bold rounded-lg transition"
          >
            Kosongin Keranjang
          </button>
        </div>
      </div>
    </div>

    <!-- Success Toast -->
    <Transition name="fade">
      <div
        v-if="showSuccessMessage"
        class="fixed left-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg font-semibold flex items-center gap-2 z-50"
        style="bottom: calc(1.5rem + env(safe-area-inset-bottom));"
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
        class="fixed inset-0 z-50 flex flex-col bg-white md:hidden mt-[calc(6rem+env(safe-area-inset-top))] pb-[env(safe-area-inset-bottom)]"
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
          <!-- Transaction Date Section -->
          <div class="border-b px-4 py-3 bg-orange-50">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-bold text-gray-900 flex items-center gap-1">
                <Icon name="lucide:calendar-days" class="w-4 h-4 text-orange-600" />
                Waktu Transaksi
              </span>
            </div>
            <input
              v-model="transactionDateTime"
              type="datetime-local"
              @input="stopLiveClock"
              class="w-full px-3 py-2 border border-orange-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
            />
          </div>

          <!-- Cart Items -->
          <div
            v-if="cartStore.items.length === 0"
            class="flex items-center justify-center py-20 text-gray-500"
          >
            <p>Keranjang masih sepi nih</p>
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
                  <span v-if="item.servicePrice" :class="item.stockType === 'service' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'" class="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">
                    {{ item.stockType === 'service' ? 'Harga Service' : 'Harga Umum' }}
                  </span>
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
                <label
                  class="text-xs font-semibold mb-1 flex justify-between items-end"
                >
                  <span>Harga/Unit:</span>
                  <span class="text-[10px] font-normal text-gray-400 italic"
                    >harga bisa diubah</span
                  >
                </label>
                <div class="relative">
                  <span
                    class="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm"
                    >Rp</span
                  >
                  <input
                    :value="item.soldPrice ? formatNumber(item.soldPrice) : ''"
                    @input="handlePriceInput(item.id, $event)"
                    type="text"
                    inputmode="numeric"
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
            <div class="flex flex-col items-end">
              <span class="font-bold text-lg text-green-600">{{
                formatCurrency(cartStore.totalProfit)
              }}</span>
              <span
                v-if="cartStore.totalCost > 0"
                class="text-[10px] text-green-500 font-bold"
              >
                untung
                {{
                  ((cartStore.totalProfit / cartStore.totalCost) * 100).toFixed(
                    1,
                  )
                }}% dari modal
              </span>
            </div>
          </div>
          <div class="space-y-2 pt-4">
            <button
              @click="handleCheckout"
              :disabled="cartStore.items.length === 0 || cartStore.isProcessing"
              class="w-full px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-lg transition"
            >
              {{ cartStore.isProcessing ? "Sabar..." : "Bayar Sekarang" }}
            </button>
            <button
              @click="handleClearCart"
              :disabled="cartStore.items.length === 0"
              class="w-full px-4 py-3 bg-orange-400 hover:bg-orange-500 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-bold rounded-lg transition"
            >
              Kosongin Keranjang
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Ref } from "vue";
import { watch, computed, ref, onActivated } from "vue";
import { useCartStore } from "../stores/cart";
import { useCurrency } from "../../composables/useCurrency";

definePageMeta({
  layout: "default",
});

const cartStore = useCartStore();
const { formatCurrency, formatNumber, parseFromDisplay } = useCurrency();

// Products
const products: Ref<any[]> = ref([]);
const loading = ref(false);
const searchQuery = ref("");

// Transaction Config
const transactionDateTime = ref("");
const isManualTime = ref(false);
const showMobileCart = ref(false);
const showCategories = ref(true);

// Messages
const showSuccessMessage = ref(false);
const successMessage = ref("");

// Computed
const filteredProducts = computed(() => {
  return [...products.value].sort((a, b) => 
    a.name.localeCompare(b.name, 'id', { sensitivity: 'base' })
  );
});

const lowStockProducts = computed(() => {
  return products.value.filter((p) => p.stock === 0);
});

let timeInterval: any = null;

const updateTimeToNow = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  transactionDateTime.value = now.toISOString().slice(0, 16);
};

const startLiveClock = () => {
  isManualTime.value = false;
  updateTimeToNow();
  if (timeInterval) clearInterval(timeInterval);
  timeInterval = setInterval(() => {
    if (!isManualTime.value) {
      updateTimeToNow();
    }
  }, 10000); 
};

const stopLiveClock = () => {
  isManualTime.value = true;
};

// Methods
const fetchProducts = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (searchQuery.value.trim()) {
      params.append("search", searchQuery.value);
    }
    params.append("limit", "100");
    params.append("activeOnly", "true");

    const url = `/api/products?${params.toString()}`;
    const response = await $fetch<any>(url);
    products.value = response.products || [];
  } catch (error) {
    console.error("Error loading products:", error);
    showToast("Yah, gagal muat produk nih");
  } finally {
    loading.value = false;
  }
};

const refreshProducts = async () => {
  await fetchProducts();
  showToast("Sip, produk udah refresh");
};

// Watch for search query changes with debounce
let searchTimeout: ReturnType<typeof setTimeout> | null = null;
watch(searchQuery, async () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    await fetchProducts();
  }, 300);
});

const addProductToCart = (product: any, priceType: "umum" | "service" = "umum") => {
  if (product.stock > 0) {
    const price = priceType === "service" ? product.servicePrice : product.askingPrice;
    cartStore.addToCart({ ...product, askingPrice: price }, priceType);
  } else {
    showToast("Stok abis bos!");
  }
};

const handlePriceInput = (cartItemId: string, event: Event) => {
  const input = event.target as HTMLInputElement;
  const value = parseFromDisplay(input.value);
  cartStore.updateSoldPrice(cartItemId, value);
};

const handleCheckout = async () => {
  try {
    await cartStore.checkout(transactionDateTime.value);
    showToast("✓ Mantap, transaksi berhasil!");
    startLiveClock();
    await fetchProducts(); 
  } catch (error: any) {
    showToast("❌ Duh, " + (error.message || "transaksinya gagal nih"));
  }
};

const handleClearCart = () => {
  if (confirm("Mau kosongin keranjang?")) {
    cartStore.clearCart();
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
  startLiveClock();
  fetchProducts();
});

onActivated(() => {
  fetchProducts();
});

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval);
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
