<template>
  <div class="fixed inset-0 w-full bg-orange-50 flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom)]">
    <!-- App Header with Navigation -->
    <AppHeader />

    <!-- Main Content - Split Layout (iPad Optimized, Responsive) -->
    <div class="mt-3 flex flex-1 min-h-0 gap-3 lg:gap-4 p-3 lg:p-4 overflow-hidden">
      <!-- Left Panel: Products Grid (Full width on mobile, flex-1 on desktop) -->
      <div class="flex-1 flex flex-col min-h-0 overflow-hidden bg-white rounded-lg shadow">
        <div class="px-4 pt-4 pb-2 shrink-0">
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
                  id="searchQueryInput"
                  name="searchQuery"
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

        </div>

        <!-- Products Grid -->
        <div class="flex-1 overflow-y-auto px-4 pb-4 overscroll-contain touch-pan-y">
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
            v-show="showDelayedLoading"
            class="flex flex-col items-center justify-center h-full text-center p-6"
          >
            <div class="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>

          <div
            v-show="!showDelayedLoading && filteredProducts.length > 0"
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
                <div class="min-h-12 flex flex-col justify-start">
                  <p class="font-bold text-sm line-clamp-2 group-hover:text-orange-700 transition-colors">
                    {{ getProductDisplayName(product) }}
                  </p>
                  <p v-if="product.model && product.model.trim() !== '' && product.model !== '-' && product.model.toLowerCase() !== 'standar' && product.model.toLowerCase() !== 'standard'" class="text-[11px] text-gray-500 font-semibold mt-0.5 line-clamp-1">
                    {{ product.model }}
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
        class="w-72 lg:w-96 flex flex-col min-h-0 bg-white rounded-lg shadow-lg overflow-hidden hidden md:flex"
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
            id="transactionDateTimeDesktop"
            name="transactionDateTimeDesktop"
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
                  :id="'qty-desktop-' + item.id"
                  name="quantity"
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
                  :id="'price-desktop-' + item.id"
                  name="price"
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
            @click="openPaymentModal"
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
              id="transactionDateTimeMobile"
              name="transactionDateTimeMobile"
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
                    :id="'qty-mobile-' + item.id"
                    name="quantity"
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
                    :id="'price-mobile-' + item.id"
                    name="price"
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
              @click="openPaymentModal"
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
    <!-- Premium Payment Modal -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="showPaymentModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          
          <!-- Header -->
          <div class="bg-orange-600 px-6 py-4 text-white flex justify-between items-center">
            <div class="flex items-center gap-2">
              <Icon name="lucide:banknote" class="w-6 h-6" />
              <h3 class="font-bold text-lg">Pembayaran Kasir</h3>
            </div>
            <button @click="closePaymentModal" class="text-white/80 hover:text-white p-1 hover:bg-orange-700/50 rounded-full transition">
              <Icon name="lucide:x" class="w-5 h-5" />
            </button>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-6">
            <!-- Total Tagihan -->
            <div class="bg-orange-50 rounded-xl p-4 border border-orange-100 flex justify-between items-center">
              <span class="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Tagihan</span>
              <span class="text-2xl font-black text-orange-600">{{ formatCurrency(cartStore.totalRevenue) }}</span>
            </div>

            <!-- Input Pembayaran -->
            <div class="space-y-2">
              <label class="text-sm font-bold text-gray-700 block">Jumlah Uang Diterima:</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-black text-gray-500">Rp</span>
                <input
                  id="paidAmountInput"
                  name="paidAmount"
                  :value="paidAmountInput"
                  @input="handlePaidAmountInput"
                  type="text"
                  inputmode="numeric"
                  placeholder="Masukkan nominal bayar..."
                  autofocus
                  class="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-right text-xl font-black text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-gray-50/50 transition-all"
                />
              </div>
            </div>

            <!-- Rekomendasi/Saran Pecahan Uang -->
            <div class="space-y-2">
              <span class="text-xs font-bold text-gray-500 uppercase tracking-wider block">Saran Nominal Uang:</span>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="suggest in paymentSuggestions"
                  :key="suggest.value"
                  @click="selectSuggestion(suggest.value)"
                  class="px-3.5 py-2 bg-gray-100 hover:bg-orange-500 hover:text-white text-gray-700 text-xs font-bold rounded-lg border border-gray-200 hover:border-orange-500 transition active:scale-95 flex items-center justify-center gap-1 shadow-sm"
                >
                  <Icon v-if="suggest.label === 'Uang Pas'" name="lucide:check-circle" class="w-3.5 h-3.5" />
                  {{ suggest.label }}
                </button>
              </div>
            </div>

            <!-- Kembalian Info -->
            <div
              v-if="changeAmount >= 0"
              class="rounded-xl p-4 flex justify-between items-center transition-all animate-in slide-in-from-top-2 duration-300"
              :class="changeAmount === 0 ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-blue-50 border border-blue-200 text-blue-800'"
            >
              <span class="text-sm font-bold uppercase tracking-wider">Kembalian</span>
              <span class="text-xl font-black">{{ formatCurrency(changeAmount) }}</span>
            </div>
            
            <div v-else-if="paidAmountValue > 0 && changeAmount < 0" class="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-center text-xs font-bold flex items-center justify-center gap-2">
              <Icon name="lucide:alert-circle" class="w-4 h-4 shrink-0" />
              Uang kurang {{ formatCurrency(Math.abs(changeAmount)) }}!
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
            <button
              @click="closePaymentModal"
              class="px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition active:scale-95 text-sm"
            >
              Batal
            </button>
            <button
              @click="handleCheckout"
              :disabled="cartStore.isProcessing || (paidAmountValue > 0 && changeAmount < 0)"
              class="px-6 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md transition active:scale-95 text-sm flex items-center justify-center gap-2"
            >
              <Icon name="lucide:check-circle" class="w-4 h-4" />
              Konfirmasi & Bayar
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
import { useDataCacheStore } from "../stores/data-cache";

definePageMeta({
  layout: "default",
});

const cartStore = useCartStore();
const dataCacheStore = useDataCacheStore();
const { formatCurrency, formatNumber, parseFromDisplay } = useCurrency();

// Products from cache store (filtered by isActive)
const products = computed(() => {
  return dataCacheStore.products.filter((p: any) => p.isActive !== false);
});
const loading = computed(() => dataCacheStore.loadingProducts);
const showDelayedLoading = ref(false);
let loadingTimer: ReturnType<typeof setTimeout> | null = null;
const searchQuery = ref("");

// Transaction Config
const transactionDateTime = ref("");
const isManualTime = ref(false);
const showMobileCart = ref(false);
const showCategories = ref(true);

// Payment Config
const paidAmountInput = ref("");
const paidAmountValue = computed(() => parseFromDisplay(paidAmountInput.value));

const changeAmount = computed(() => {
  const paid = paidAmountValue.value;
  if (!paid) return -1;
  return paid - cartStore.totalRevenue;
});

const handlePaidAmountInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const value = parseFromDisplay(input.value);
  paidAmountInput.value = value > 0 ? formatNumber(value) : "";
};

// Payment Modal Config
const showPaymentModal = ref(false);

const openPaymentModal = () => {
  if (cartStore.items.length === 0) {
    return;
  }
  paidAmountInput.value = "";
  showPaymentModal.value = true;
};

const closePaymentModal = () => {
  showPaymentModal.value = false;
};

const paymentSuggestions = computed(() => {
  const total = cartStore.totalRevenue;
  if (total <= 0) return [];

  const suggestions = new Set<number>();
  
  // 1. Uang Pas
  suggestions.add(total);

  // 2. Pembulatan Terdekat ke Rp 10.000
  const round10k = Math.ceil(total / 10000) * 10000;
  if (round10k > total) suggestions.add(round10k);

  // 3. Pembulatan Terdekat ke Rp 50.000
  const round50k = Math.ceil(total / 50000) * 50000;
  if (round50k > total) suggestions.add(round50k);

  // 4. Pembulatan Terdekat ke Rp 100.000
  const round100k = Math.ceil(total / 100000) * 100000;
  if (round100k > total) suggestions.add(round100k);

  // 5. Pecahan Lembar Uang Standar Besar
  const standardDenominations = [50000, 100000, 150000, 200000, 300000, 500000];
  for (const denom of standardDenominations) {
    if (denom > total) {
      suggestions.add(denom);
    }
  }

  // Convert to sorted array of objects
  return Array.from(suggestions)
    .sort((a, b) => a - b)
    .slice(0, 5) // Maksimal 5 saran agar tampilan rapi
    .map((val) => {
      let label = formatCurrency(val);
      if (val === total) {
        label = "Uang Pas";
      }
      return { value: val, label };
    });
});

const selectSuggestion = (val: number) => {
  paidAmountInput.value = formatNumber(val);
};

// Messages
const showSuccessMessage = ref(false);
const successMessage = ref("");

const getProductDisplayName = (product: any) => {
  if (!product) return '';
  let name = product.name || '';
  if (product.brand && product.brand !== 'No Brand' && product.brand.trim() !== '') {
    name += ` ${product.brand}`;
  }
  // Model is intentionally omitted from the display name to be shown separately
  // otherName is intentionally omitted from the display name
  return name.trim();
};

// Computed
const filteredProducts = computed(() => {
  let result = products.value;
  if (searchQuery.value.trim()) {
    const keywords = searchQuery.value.toLowerCase().trim().split(/\s+/);
    result = result.filter(p => {
      const searchStr = `${p.name || ''} ${p.brand || ''} ${p.model || ''} ${p.otherName || ''}`.toLowerCase();
      return keywords.every(k => searchStr.includes(k));
    });
  }
  return [...result].sort((a, b) => 
    a.name.localeCompare(b.name, 'id', { sensitivity: 'base' })
  );
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
const fetchProducts = async (silent = false) => {
  if (!silent && !dataCacheStore.isProductsLoaded) {
    showDelayedLoading.value = false;
    if (loadingTimer) clearTimeout(loadingTimer);
    loadingTimer = setTimeout(() => {
      showDelayedLoading.value = true;
    }, 3000);
  }
  try {
    // Call cache store to fetch in background
    await dataCacheStore.fetchProducts(!silent);
  } catch (error) {
    console.error("Error loading products:", error);
    showToast("Yah, gagal muat produk nih");
  } finally {
    showDelayedLoading.value = false;
    if (loadingTimer) clearTimeout(loadingTimer);
  }
};

const refreshProducts = async () => {
  await fetchProducts();
  showToast("Sip, produk udah refresh");
};

// (Removed server-side search fetch on searchQuery watch for client-side filtering)

const addProductToCart = (product: any, priceType: "umum" | "service" = "umum") => {
  if (product.stock > 0) {
    const price = priceType === "service" ? product.servicePrice : product.askingPrice;
    const added = cartStore.addToCart({ ...product, askingPrice: price }, priceType);
    if (!added) {
      showToast("Stok maksimal sudah tercapai!");
    }
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
    let finalDateStr = undefined;
    if (transactionDateTime.value) {
      const localDate = new Date(transactionDateTime.value);
      finalDateStr = localDate.toISOString();
    }
    
    await cartStore.checkout(finalDateStr, paidAmountValue.value || null);
    showToast("✓ Mantap, transaksi berhasil!");
    paidAmountInput.value = "";
    closePaymentModal();
    startLiveClock();
    await fetchProducts(); 
  } catch (error: any) {
    showToast("❌ Duh, " + (error.message || "transaksinya gagal nih"));
  }
};

const handleClearCart = () => {
  cartStore.clearCart();
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

/* Fix scroll di iPad/mobile - pastikan hanya product grid yang scroll */
.overscroll-contain {
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}
</style>
