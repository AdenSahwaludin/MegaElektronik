<template>
  <div class="fixed inset-0 w-full bg-gradient-to-br from-orange-50 via-amber-50/50 to-orange-50 flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom)]">
    <!-- App Header -->
    <AppHeader />

    <!-- Main Content - Full Width -->
    <div class="flex-1 flex flex-col min-h-0 overflow-hidden">

      <!-- Top Search & Categories Control Panel -->
      <div class="shrink-0 bg-white/80 backdrop-blur-md border-b border-orange-100/60 shadow-sm py-3 px-4 lg:px-6 z-20">
        <div class="max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <!-- Search Bar -->
          <div class="flex items-center gap-2 w-full md:w-[450px] lg:w-[520px] shrink-0">
            <div class="relative flex-1">
              <Icon name="lucide:search" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
              <input
                id="searchQueryInput"
                name="searchQuery"
                v-model="searchQuery"
                type="text"
                placeholder="Cari produk..."
                class="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200"
              />
              <button
                v-if="searchQuery"
                @click="searchQuery = ''"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition p-0.5"
              >
                <Icon name="lucide:x-circle" class="w-4 h-4" />
              </button>
            </div>

            <!-- Sort Select Dropdown -->
            <div class="relative shrink-0">
              <select
                id="sortSelect"
                name="sortBy"
                v-model="sortBy"
                class="pl-3 pr-8 py-2.5 bg-white border border-gray-200 hover:border-orange-400 text-gray-600 rounded-xl shadow-sm text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 appearance-none cursor-pointer"
                title="Urutkan Produk"
              >
                <option value="name-asc">Nama A-Z</option>
                <option value="name-desc">Nama Z-A</option>
                <option value="price-asc">Harga Terendah</option>
                <option value="price-desc">Harga Tertinggi</option>
              </select>
              <Icon name="lucide:chevron-down" class="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            
            <!-- Tombol kembali ke POS Biasa -->
            <NuxtLink
              to="/"
              class="px-3 py-2.5 bg-white border border-gray-200 hover:bg-orange-500 hover:text-white hover:border-orange-500 text-gray-500 rounded-xl shadow-sm transition-all duration-200 active:scale-95 flex items-center gap-1.5 shrink-0 text-xs font-bold"
              title="Kembali ke POS Biasa"
            >
              <Icon name="lucide:arrow-left" class="w-4 h-4 text-orange-600" />
              <span>POS Biasa</span>
            </NuxtLink>
          </div>

          <!-- Quick Categories - Horizontal Scroll -->
          <div class="flex-1 min-w-0 overflow-x-auto py-1 scrollbar-hide flex gap-2 items-center scroll-smooth">
            <!-- "Semua" Pill -->
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
                {{ products.length }}
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
      </div>

      <!-- Products Grid - Full Width -->
      <div
        class="flex-1 overflow-y-auto px-3 lg:px-5 pt-3 overscroll-contain touch-pan-y"
        :style="{ 
          paddingBottom: `${(cartStore.items.length > 0 ? 100 : 24) + keyboardHeight}px`,
          transition: 'padding-bottom 300ms cubic-bezier(0.16, 1, 0.3, 1)'
        }"
      >
        <!-- Empty State -->
        <div
          v-if="!loading && filteredProducts.length === 0"
          class="flex flex-col items-center justify-center h-full text-center p-6"
        >
          <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
            <Icon
              :name="searchQuery ? 'lucide:search-x' : 'lucide:package-open'"
              class="w-8 h-8 text-gray-300"
            />
          </div>
          <p class="text-gray-500 font-bold text-sm">
            {{ searchQuery ? "Produk nggak ketemu" : "Belum ada produk" }}
          </p>
          <p class="text-xs text-gray-400 mt-1">
            {{ searchQuery ? "Coba cari dengan kata kunci lain." : "Daftar produk masih kosong." }}
          </p>
        </div>

        <!-- Loading State (delayed) -->
        <div
          v-show="showDelayedLoading"
          class="flex items-center justify-center h-full"
        >
          <div class="w-10 h-10 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <!-- Product List View -->
        <div
          v-show="!showDelayedLoading && filteredProducts.length > 0"
          class="flex flex-col gap-2 max-w-7xl mx-auto w-full pb-2"
        >
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            :class="[
              'group bg-white rounded-xl border border-gray-200/80 hover:border-orange-300/90 shadow-xs hover:shadow-md transition-all duration-150 p-3 lg:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left relative overflow-hidden',
              product.stock === 0
                ? 'opacity-50 cursor-not-allowed bg-gray-50/70 grayscale'
                : 'hover:bg-orange-50/20 cursor-pointer active:scale-[0.995]'
            ]"
            @click="product.stock > 0 && addProductToCart(product, 'umum')"
          >
            <!-- Highlight bar on hover -->
            <div
              v-if="product.stock > 0"
              class="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-orange-500 transition-colors"
            />

            <!-- Left: Product Identity & Details -->
            <div class="flex items-start gap-3 min-w-0 flex-1 pl-1">
              <!-- Icon/Badge Indicator -->
              <div
                :class="[
                  'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-colors',
                  product.stock === 0
                    ? 'bg-red-50 text-red-500 border border-red-100'
                    : 'bg-orange-100/60 group-hover:bg-orange-500 text-orange-600 group-hover:text-white'
                ]"
              >
                <Icon
                  :name="product.stock === 0 ? 'lucide:package-x' : 'lucide:package'"
                  class="w-4 h-4"
                />
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <!-- Product Name -->
                  <h3 class="font-bold text-sm text-gray-800 group-hover:text-orange-600 transition-colors leading-snug">
                    {{ getProductDisplayName(product) }}
                  </h3>
                  <!-- Model next to name -->
                  <span
                    v-if="product.model && product.model.trim() !== '' && product.model !== '-' && product.model.toLowerCase() !== 'standar' && product.model.toLowerCase() !== 'standard'"
                    class="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md shrink-0"
                  >
                    Model: {{ product.model }}
                  </span>
                </div>

                <div class="flex items-center gap-2 mt-1 flex-wrap text-xs text-gray-400 font-semibold">
                  <!-- Stock Status -->
                  <span
                    :class="[
                      'inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md text-[11px]',
                      product.stock === 0
                        ? 'bg-red-100 text-red-700'
                        : product.stock < 5
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                    ]"
                  >
                    <span
                      :class="[
                        'w-1.5 h-1.5 rounded-full',
                        product.stock === 0
                          ? 'bg-red-500'
                          : product.stock < 5
                            ? 'bg-amber-500 animate-pulse'
                            : 'bg-emerald-500'
                      ]"
                    />
                    {{ product.stock === 0 ? 'Stok Habis' : `Stok: ${product.stock}` }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Right: Pricing & Quick Action Buttons -->
            <div class="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 pl-1 sm:pl-0">
              <!-- Prices Column -->
              <div class="text-left sm:text-right">
                <p class="text-base font-black text-orange-600 leading-tight">
                  {{ formatCurrency(product.askingPrice) }}
                </p>
                <p class="text-[11px] text-gray-400 font-semibold mt-0.5">
                  Pas: <span class="text-gray-600 font-bold">{{ formatCurrency(product.fixedPrice) }}</span>
                </p>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center gap-1.5 shrink-0">
                <!-- Service Button (Optional) -->
                <button
                  v-if="product.servicePrice"
                  :disabled="product.stock === 0"
                  @click.stop="addProductToCart(product, 'service')"
                  class="px-2.5 py-2 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 rounded-xl transition-all active:scale-95 flex items-center gap-1 shadow-xs"
                  title="Tambah Jasa Service"
                >
                  <Icon name="lucide:wrench" class="w-3.5 h-3.5" />
                  <span>Svc {{ formatCurrency(product.servicePrice) }}</span>
                </button>

                <!-- Add to Cart Button -->
                <button
                  :disabled="product.stock === 0"
                  @click.stop="addProductToCart(product, 'umum')"
                  :class="[
                    'px-3.5 py-2 text-xs font-bold rounded-xl transition-all duration-150 flex items-center gap-1.5 shadow-xs active:scale-95',
                    product.stock === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                      : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20 group-hover:shadow-md'
                  ]"
                >
                  <Icon name="lucide:plus" class="w-4 h-4" />
                  <span class="hidden sm:inline">Tambah</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Gradient Fade to prevent product cards from clashing with cart bar when scrolling -->
    <div
      v-if="cartStore.items.length > 0"
      class="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-orange-50 via-orange-50/90 to-transparent pointer-events-none z-30"
      :style="{ 
        transform: `translateY(-${keyboardHeight}px)`,
        transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)'
      }"
    />

    <!-- ═══════════════ Floating Bottom Controls ═══════════════ -->
    <div
      class="absolute bottom-0 left-0 right-0 z-40 px-3 lg:px-5 pb-3 pointer-events-none"
      :style="{ 
        transform: `translateY(-${keyboardHeight}px)`,
        transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))'
      }"
    >
      <div class="max-w-5xl mx-auto w-full flex flex-col gap-2.5 pointer-events-auto">

        <!-- Floating Cart Bar -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="translate-y-4 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="translate-y-4 opacity-0"
        >
          <div
            v-if="cartStore.items.length > 0"
            class="bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_-2px_25px_rgba(0,0,0,0.08)] border border-white/60 px-4 py-3"
          >
            <div class="flex items-center justify-between gap-3">
              <!-- Left: Cart Info -->
              <div class="flex items-center gap-3 min-w-0">
                <div class="bg-orange-100 text-orange-600 rounded-xl p-2 shrink-0">
                  <Icon name="lucide:shopping-bag" class="w-5 h-5" />
                </div>
                <div class="min-w-0">
                  <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{{ cartStore.totalItems }} item</p>
                  <p class="text-lg font-black text-gray-800 truncate leading-tight">{{ formatCurrency(cartStore.totalRevenue) }}</p>
                </div>
              </div>
              <!-- Right: Actions -->
              <div class="flex items-center gap-2 shrink-0">
                <button
                  @click="showCartDrawer = true"
                  class="px-3 lg:px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs lg:text-sm rounded-xl transition-all active:scale-95"
                >
                  <Icon name="lucide:list" class="w-4 h-4 inline -mt-0.5 mr-1" />
                  <span class="hidden sm:inline">Keranjang</span>
                </button>
                <button
                  @click="openPaymentModal"
                  :disabled="cartStore.isProcessing"
                  class="px-4 lg:px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold text-xs lg:text-sm rounded-xl shadow-lg shadow-green-500/20 transition-all active:scale-95 disabled:cursor-not-allowed"
                >
                  {{ cartStore.isProcessing ? "Proses..." : "Bayar" }}
                </button>
              </div>
            </div>
          </div>
        </Transition>

      </div>
    </div>

    <!-- ═══════════════ Cart Drawer ═══════════════ -->
    <!-- Backdrop -->
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showCartDrawer"
        @click="showCartDrawer = false"
        class="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm"
      />
    </Transition>
    <!-- Panel -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-x-full"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="showCartDrawer"
        class="absolute right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
        :style="{ 
          bottom: `${keyboardHeight}px`,
          transition: 'bottom 300ms cubic-bezier(0.16, 1, 0.3, 1)'
        }"
      >
        <!-- Drawer Header -->
        <div class="bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-4 flex items-center justify-between shrink-0 pt-[calc(1rem+env(safe-area-inset-top))]">
          <div>
            <h2 class="text-lg font-bold text-white flex items-center gap-2">
              <Icon name="lucide:shopping-cart" class="w-5 h-5" />
              Keranjang
            </h2>
            <p class="text-sm text-orange-100">{{ cartStore.totalItems }} item</p>
          </div>
          <button
            @click="showCartDrawer = false"
            class="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-xl transition"
          >
            <Icon name="lucide:x" class="w-5 h-5" />
          </button>
        </div>

        <!-- Transaction DateTime -->
        <div class="border-b px-5 py-3 bg-orange-50/50 shrink-0">
          <div class="flex items-center gap-2 mb-1.5">
            <Icon name="lucide:calendar-days" class="w-3.5 h-3.5 text-orange-500" />
            <span class="text-xs font-bold text-gray-600">Waktu Transaksi</span>
          </div>
          <input
            id="transactionDateTimeDrawer"
            name="transactionDateTimeDrawer"
            v-model="transactionDateTime"
            type="datetime-local"
            @input="stopLiveClock"
            class="w-full px-3 py-2 border border-orange-200/60 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white transition"
          />
        </div>

        <!-- Empty Cart -->
        <div
          v-if="cartStore.items.length === 0"
          class="flex-1 flex flex-col items-center justify-center text-gray-400 p-6"
        >
          <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
            <Icon name="lucide:shopping-bag" class="w-8 h-8 text-gray-300" />
          </div>
          <p class="font-semibold text-sm">Keranjang masih kosong</p>
          <p class="text-xs mt-1">Tap produk untuk menambahkan</p>
        </div>

        <!-- Cart Items -->
        <div v-else class="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 overscroll-contain">
          <div
            v-for="item in cartStore.items"
            :key="item.id"
            class="bg-gray-50/80 rounded-xl p-3.5 border border-gray-100"
          >
            <!-- Product Info -->
            <div class="flex items-start justify-between mb-2.5">
              <div class="min-w-0 flex-1">
                <p class="font-bold text-sm text-gray-800 leading-snug">{{ item.productName }}</p>
                <p class="text-[11px] text-gray-400 font-medium mt-0.5">
                  {{ item.brand }}{{ item.model && item.model !== '-' ? ` · ${item.model}` : '' }}
                  <span
                    v-if="item.servicePrice"
                    :class="item.stockType === 'service' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'"
                    class="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase inline-block"
                  >
                    {{ item.stockType === 'service' ? 'Service' : 'Umum' }}
                  </span>
                </p>
              </div>
              <button
                @click="cartStore.removeFromCart(item.id)"
                class="text-gray-300 hover:text-red-500 p-1 -mr-1 transition shrink-0"
              >
                <Icon name="lucide:trash-2" class="w-4 h-4" />
              </button>
            </div>

            <!-- Qty & Price Row -->
            <div class="flex items-center gap-3 mb-2.5">
              <!-- Quantity -->
              <div class="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden shrink-0">
                <button
                  @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
                  class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-gray-500 font-bold transition"
                >−</button>
                <input
                  :id="'qty-' + item.id"
                  name="quantity"
                  :value="item.quantity"
                  @input="(e: any) => cartStore.updateQuantity(item.id, parseInt(e.target.value, 10) || 1)"
                  type="number"
                  min="1"
                  class="w-10 text-center text-sm font-bold border-l border-r border-gray-200 py-1 focus:outline-none bg-transparent"
                />
                <button
                  @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
                  class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-gray-500 font-bold transition"
                >+</button>
              </div>

              <!-- Price Input -->
              <div class="relative flex-1">
                <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">Rp</span>
                <input
                  :id="'price-' + item.id"
                  name="price"
                  :value="item.soldPrice ? formatNumber(item.soldPrice) : ''"
                  @input="handlePriceInput(item.id, $event)"
                  type="text"
                  inputmode="numeric"
                  class="w-full pl-8 pr-2 py-2 border border-orange-200 rounded-lg font-bold text-sm text-right focus:outline-none focus:ring-2 focus:ring-orange-400 bg-orange-50/50 transition"
                />
              </div>
            </div>

            <!-- Below-cost warning -->
            <p
              v-if="item.soldPrice < item.buyPrice"
              class="text-[10px] text-red-500 font-bold flex items-center gap-1 mb-2"
            >
              <Icon name="lucide:alert-circle" class="w-3 h-3" />
              Di bawah modal ({{ formatCurrency(item.buyPrice) }})
            </p>

            <!-- Subtotal & Profit -->
            <div class="flex items-center justify-between text-xs bg-white/80 rounded-lg px-2.5 py-2 border border-gray-100/50">
              <div>
                <span class="text-gray-400 font-medium">Subtotal</span>
                <p class="font-bold text-gray-700">{{ formatCurrency(item.soldPrice * item.quantity) }}</p>
              </div>
              <div class="text-right">
                <span class="text-gray-400 font-medium">Untung</span>
                <p
                  class="font-bold"
                  :class="item.soldPrice - item.buyPrice > 0 ? 'text-emerald-600' : 'text-red-500'"
                >
                  {{ formatCurrency((item.soldPrice - item.buyPrice) * item.quantity) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Cart Summary -->
        <div class="border-t bg-gray-50/80 px-5 py-3 space-y-1.5 shrink-0">
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-500 font-medium">Total Item</span>
            <span class="font-bold text-gray-700">{{ cartStore.totalItems }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-500 font-medium text-sm">Omset</span>
            <span class="font-black text-lg text-gray-800">{{ formatCurrency(cartStore.totalRevenue) }}</span>
          </div>
          <div class="flex justify-between items-center bg-emerald-50 -mx-5 px-5 py-2.5 border-y border-emerald-100">
            <span class="text-emerald-700 font-bold text-sm">Untung Bersih</span>
            <div class="text-right">
              <span class="font-black text-lg text-emerald-600">{{ formatCurrency(cartStore.totalProfit) }}</span>
              <span
                v-if="cartStore.totalCost > 0"
                class="text-[10px] text-emerald-500 font-bold block leading-tight"
              >
                {{ ((cartStore.totalProfit / cartStore.totalCost) * 100).toFixed(1) }}% dari modal
              </span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="px-5 py-3 space-y-2 shrink-0" style="padding-bottom: calc(0.75rem + env(safe-area-inset-bottom));">
          <button
            @click="openPaymentModal"
            :disabled="cartStore.items.length === 0 || cartStore.isProcessing"
            class="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold text-base rounded-xl shadow-lg shadow-green-500/20 transition-all active:scale-[0.98]"
          >
            {{ cartStore.isProcessing ? "Memproses..." : "Bayar Sekarang" }}
          </button>
          <button
            @click="handleClearCart"
            :disabled="cartStore.items.length === 0"
            class="w-full py-2.5 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-500 hover:text-red-500 font-semibold text-sm rounded-xl transition-all active:scale-[0.98]"
          >
            Kosongin Keranjang
          </button>
        </div>
      </div>
    </Transition>

    <!-- ═══════════════ Success Toast ═══════════════ -->
    <Transition name="fade">
      <div
        v-if="showSuccessMessage"
        class="absolute left-4 right-4 sm:left-6 sm:right-auto z-[60] flex items-center gap-2 px-5 py-3 bg-gray-800 text-white rounded-xl shadow-2xl font-semibold text-sm"
        :style="{ 
          transform: `translateY(-${keyboardHeight}px)`,
          transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          bottom: 'calc(1.5rem + env(safe-area-inset-bottom))'
        }"
      >
        <Icon name="lucide:check-circle" class="w-4 h-4 text-green-400 shrink-0" />
        {{ successMessage }}
      </div>
    </Transition>

    <!-- ═══════════════ Payment Modal (preserved) ═══════════════ -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="showPaymentModal" class="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div 
          class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
          :style="{ 
            transform: `translateY(-${keyboardHeight / 2}px)`,
            transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)'
          }"
        >

          <!-- Header -->
          <div class="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 text-white flex justify-between items-center">
            <div class="flex items-center gap-2">
              <Icon name="lucide:banknote" class="w-6 h-6" />
              <h3 class="font-bold text-lg">Pembayaran Kasir</h3>
            </div>
            <button @click="closePaymentModal" class="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-full transition">
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

            <!-- Saran Nominal -->
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

            <!-- Kembalian -->
            <div
              v-if="changeAmount >= 0"
              class="rounded-xl p-4 flex justify-between items-center transition-all"
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

          <!-- Footer -->
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
import { watch, computed, ref, onActivated, onDeactivated, onMounted, onUnmounted } from "vue";
import { useCartStore } from "../stores/cart";
import { useCurrency } from "../../composables/useCurrency";
import { useDataCacheStore } from "../stores/data-cache";

definePageMeta({
  layout: "default",
});

const cartStore = useCartStore();
const dataCacheStore = useDataCacheStore();
const { formatCurrency, formatNumber, parseFromDisplay } = useCurrency();

// Categories with Icons and Dynamic Counts
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
  const productsList = dataCacheStore.products || [];
  
  const defaultNames = [
    'Kipas', 'Kompor', 'Rice cooker', 'Blender', 'AC',
    'Mesin cuci', 'Kulkas', 'Setrika', 'Dispenser', 'Teko',
    'Exhaust', 'Speaker'
  ];

  const categoryMap = new Map<string, number>();

  defaultNames.forEach(name => {
    categoryMap.set(name, 0);
  });

  productsList.forEach((p: any) => {
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

// Products from cache store (filtered by isActive)
const products = computed(() => {
  return dataCacheStore.products.filter((p: any) => p.isActive !== false);
});
const loading = computed(() => dataCacheStore.loadingProducts);
const showDelayedLoading = ref(false);
let loadingTimer: ReturnType<typeof setTimeout> | null = null;
const searchQuery = ref("");
const sortBy = ref("name-asc");

// Transaction Config
const transactionDateTime = ref("");
const isManualTime = ref(false);
const showCartDrawer = ref(false);

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
  showCartDrawer.value = false; // Close drawer first
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
  
  return [...result].sort((a, b) => {
    if (sortBy.value === "name-asc") {
      return a.name.localeCompare(b.name, 'id', { sensitivity: 'base' });
    } else if (sortBy.value === "name-desc") {
      return b.name.localeCompare(a.name, 'id', { sensitivity: 'base' });
    } else if (sortBy.value === "price-asc") {
      return (a.askingPrice || 0) - (b.askingPrice || 0);
    } else if (sortBy.value === "price-desc") {
      return (b.askingPrice || 0) - (a.askingPrice || 0);
    }
    return 0;
  });
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
    showCartDrawer.value = false;
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

// Visual Viewport Handler to prevent keyboard pushing layout out of view on iOS/mobile
const keyboardHeight = ref(0);

const updateViewport = () => {
  if (typeof window !== 'undefined' && window.visualViewport) {
    const heightDiff = window.innerHeight - window.visualViewport.height;
    // Threshold of 30px to filter out minor address bar changes
    keyboardHeight.value = heightDiff > 30 ? Math.max(0, heightDiff) : 0;
  }
};

const handleWindowScroll = () => {
  if (typeof window !== 'undefined' && window.scrollY !== 0) {
    window.scrollTo(0, 0);
  }
};

let listenersActive = false;

const addViewportListeners = () => {
  if (typeof window === 'undefined' || listenersActive) return;
  window.addEventListener('scroll', handleWindowScroll);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateViewport);
    window.visualViewport.addEventListener('scroll', updateViewport);
    updateViewport();
  }
  listenersActive = true;
};

const removeViewportListeners = () => {
  if (typeof window === 'undefined' || !listenersActive) return;
  window.removeEventListener('scroll', handleWindowScroll);
  if (window.visualViewport) {
    window.visualViewport.removeEventListener('resize', updateViewport);
    window.visualViewport.removeEventListener('scroll', updateViewport);
  }
  listenersActive = false;
};

// Lifecycle
onMounted(() => {
  startLiveClock();
  fetchProducts();
  addViewportListeners();
});

onActivated(() => {
  fetchProducts();
  addViewportListeners();
});

onDeactivated(() => {
  removeViewportListeners();
});

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval);
  removeViewportListeners();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* Fix scroll di iPad/mobile */
.overscroll-contain {
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
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
