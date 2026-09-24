<template>
  <div class="w-full flex flex-col gap-1.5 py-1">
    <!-- Grid/Pills Mini yang Lebih Padat -->
    <div class="flex flex-wrap items-center gap-1 sm:gap-1.5">
      <!-- "Semua" Pill -->
      <button
        type="button"
        @click="selectCategory('')"
        :class="[
          'px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all duration-150 flex items-center gap-1 sm:gap-1.5 shrink-0 shadow-2xs border active:scale-95 cursor-pointer select-none',
          !category
            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-500 shadow-orange-500/20 ring-2 ring-orange-400/30'
            : 'bg-white hover:bg-orange-50/80 text-gray-700 hover:text-orange-600 border-gray-200 hover:border-orange-300'
        ]"
      >
        <Icon name="lucide:layout-grid" class="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        <span>Semua</span>
        <span
          :class="[
            'px-1.5 py-0.2 text-[9px] sm:text-[10px] rounded-md font-extrabold',
            !category ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600'
          ]"
        >
          {{ totalProductsCount }}
        </span>
      </button>

      <!-- Category Pills -->
      <button
        v-for="cat in categoriesList"
        :key="cat.name"
        type="button"
        @click="selectCategory(cat.name)"
        :class="[
          'px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all duration-150 flex items-center gap-1 sm:gap-1.5 shrink-0 shadow-2xs border active:scale-95 cursor-pointer select-none',
          isCategoryActive(cat.name)
            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-500 shadow-orange-500/20 ring-2 ring-orange-400/30'
            : 'bg-white hover:bg-orange-50/80 text-gray-700 hover:text-orange-600 border-gray-200 hover:border-orange-300'
        ]"
      >
        <Icon :name="cat.icon" class="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        <span>{{ cat.name }}</span>
        <span
          v-if="cat.count > 0"
          :class="[
            'px-1.5 py-0.2 text-[9px] sm:text-[10px] rounded-md font-extrabold',
            isCategoryActive(cat.name) ? 'bg-white/25 text-white' : 'bg-orange-100/70 text-orange-700'
          ]"
        >
          {{ cat.count }}
        </span>
      </button>
    </div>

    <!-- Sub-filters Bar (Merek & Jenis Dropdown Compact + Opsional Urutan Harga) -->
    <div
      v-if="category && (availableBrands.length > 0 || availableJenis.length > 0 || showSort)"
      class="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1.5 border-t border-orange-200/60 animate-in fade-in slide-in-from-top-1 duration-200"
    >
      <!-- Category Indicator Badge -->
      <div class="inline-flex items-center gap-1 px-2 py-1 bg-orange-100/80 text-orange-800 rounded-lg text-[11px] font-bold shrink-0">
        <Icon :name="getCategoryIcon(category)" class="w-3.5 h-3.5 text-orange-600" />
        <span>{{ category }}</span>
        <button
          type="button"
          @click="selectCategory(category)"
          class="text-orange-500 hover:text-orange-800 ml-0.5 p-0.5 rounded hover:bg-orange-200/60 cursor-pointer"
          title="Tutup kategori"
        >
          <Icon name="lucide:x" class="w-3 h-3" />
        </button>
      </div>

      <!-- Dropdown Filter Merek -->
      <div
        v-if="availableBrands.length > 0"
        class="relative"
      >
        <button
          type="button"
          @click.stop="toggleBrandDropdown"
          :class="[
            'h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg text-xs font-bold transition-all duration-150 border cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-2xs select-none',
            brand
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-500 ring-2 ring-orange-400/30'
              : 'bg-white text-gray-700 border-gray-200 hover:border-orange-400 hover:text-orange-600'
          ]"
        >
          <Icon name="lucide:tag" class="w-3.5 h-3.5" :class="brand ? 'text-white' : 'text-orange-500'" />
          <span>{{ brand || 'Semua Merek' }}</span>
          <span
            v-if="!brand"
            class="text-[10px] text-gray-400 font-normal"
          >
            ({{ availableBrands.length }})
          </span>
          <Icon
            name="lucide:chevron-down"
            class="w-3.5 h-3.5 transition-transform duration-200 ml-0.5 opacity-70"
            :class="{ 'rotate-180': isBrandDropdownOpen }"
          />
        </button>

        <!-- Dropdown Menu Merek -->
        <div
          v-if="isBrandDropdownOpen"
          class="absolute left-0 top-full mt-1.5 w-52 sm:w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-40 animate-in fade-in zoom-in-95 duration-150 select-none max-w-[calc(100vw-32px)]"
        >
          <div class="px-3 py-1.5 border-b border-gray-100 flex items-center justify-between">
            <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Merek {{ category }}</span>
            <button
              v-if="brand"
              type="button"
              @click.stop="setBrand('')"
              class="text-[10px] text-orange-600 hover:underline font-bold cursor-pointer"
            >
              Reset
            </button>
          </div>
          <div class="max-h-56 overflow-y-auto overscroll-contain py-1">
            <button
              type="button"
              @click.stop="setBrand('')"
              class="w-full px-3 py-1.5 text-left text-xs font-semibold flex items-center justify-between hover:bg-orange-50 transition cursor-pointer"
              :class="!brand ? 'text-orange-600 font-bold bg-orange-50/60' : 'text-gray-700'"
            >
              <span>Semua Merek</span>
              <Icon v-if="!brand" name="lucide:check" class="w-3.5 h-3.5 text-orange-600" />
            </button>
            <button
              v-for="b in availableBrands"
              :key="b"
              type="button"
              @click.stop="setBrand(b)"
              class="w-full px-3 py-1.5 text-left text-xs font-semibold flex items-center justify-between hover:bg-orange-50 transition cursor-pointer"
              :class="brand === b ? 'text-orange-600 font-bold bg-orange-50/60' : 'text-gray-700'"
            >
              <span>{{ b }}</span>
              <Icon v-if="brand === b" name="lucide:check" class="w-3.5 h-3.5 text-orange-600" />
            </button>
          </div>
        </div>
      </div>

      <!-- Dropdown Filter Jenis -->
      <div
        v-if="availableJenis.length > 0"
        class="relative"
      >
        <button
          type="button"
          @click.stop="toggleJenisDropdown"
          :class="[
            'h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg text-xs font-bold transition-all duration-150 border cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-2xs select-none',
            jenis
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-500 ring-2 ring-orange-400/30'
              : 'bg-white text-gray-700 border-gray-200 hover:border-orange-400 hover:text-orange-600'
          ]"
        >
          <Icon name="lucide:layers" class="w-3.5 h-3.5" :class="jenis ? 'text-white' : 'text-orange-500'" />
          <span>{{ jenis || 'Semua Jenis' }}</span>
          <span
            v-if="!jenis"
            class="text-[10px] text-gray-400 font-normal"
          >
            ({{ availableJenis.length }})
          </span>
          <Icon
            name="lucide:chevron-down"
            class="w-3.5 h-3.5 transition-transform duration-200 ml-0.5 opacity-70"
            :class="{ 'rotate-180': isJenisDropdownOpen }"
          />
        </button>

        <!-- Dropdown Menu Jenis -->
        <div
          v-if="isJenisDropdownOpen"
          class="absolute left-0 top-full mt-1.5 w-52 sm:w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-40 animate-in fade-in zoom-in-95 duration-150 select-none max-w-[calc(100vw-32px)]"
        >
          <div class="px-3 py-1.5 border-b border-gray-100 flex items-center justify-between">
            <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Jenis {{ category }}</span>
            <button
              v-if="jenis"
              type="button"
              @click.stop="setJenis('')"
              class="text-[10px] text-orange-600 hover:underline font-bold cursor-pointer"
            >
              Reset
            </button>
          </div>
          <div class="max-h-56 overflow-y-auto overscroll-contain py-1">
            <button
              type="button"
              @click.stop="setJenis('')"
              class="w-full px-3 py-1.5 text-left text-xs font-semibold flex items-center justify-between hover:bg-orange-50 transition cursor-pointer"
              :class="!jenis ? 'text-orange-600 font-bold bg-orange-50/60' : 'text-gray-700'"
            >
              <span>Semua Jenis</span>
              <Icon v-if="!jenis" name="lucide:check" class="w-3.5 h-3.5 text-orange-600" />
            </button>
            <button
              v-for="j in availableJenis"
              :key="j.label"
              type="button"
              @click.stop="setJenis(j.label)"
              class="w-full px-3 py-1.5 text-left text-xs font-semibold flex items-center justify-between hover:bg-orange-50 transition cursor-pointer"
              :class="jenis === j.label ? 'text-orange-600 font-bold bg-orange-50/60' : 'text-gray-700'"
            >
              <span class="flex items-center gap-1.5">
                <span>{{ j.label }}</span>
                <span
                  v-if="j.count > 0"
                  class="px-1.5 py-0.2 text-[9px] rounded-md font-bold bg-orange-100/80 text-orange-700"
                >
                  {{ j.count }}
                </span>
              </span>
              <Icon v-if="jenis === j.label" name="lucide:check" class="w-3.5 h-3.5 text-orange-600" />
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Sort Buttons (Opsional jika showSort aktif) -->
      <div v-if="showSort" class="inline-flex items-center gap-1 shrink-0">
        <button
          type="button"
          @click="setSort('cheapest')"
          :class="[
            'h-7 sm:h-8 px-2 sm:px-2.5 rounded-lg text-xs font-bold transition-all duration-150 border cursor-pointer active:scale-95 flex items-center gap-1 shadow-2xs select-none',
            sortValue === 'cheapest'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-500 ring-2 ring-orange-400/30'
              : 'bg-white text-gray-700 border-gray-200 hover:border-orange-400 hover:text-orange-600'
          ]"
          title="Urutkan harga termurah"
        >
          <Icon name="lucide:trending-down" class="w-3.5 h-3.5" />
          <span>Termurah</span>
        </button>
        <button
          type="button"
          @click="setSort('expensive')"
          :class="[
            'h-7 sm:h-8 px-2 sm:px-2.5 rounded-lg text-xs font-bold transition-all duration-150 border cursor-pointer active:scale-95 flex items-center gap-1 shadow-2xs select-none',
            sortValue === 'expensive'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-500 ring-2 ring-orange-400/30'
              : 'bg-white text-gray-700 border-gray-200 hover:border-orange-400 hover:text-orange-600'
          ]"
          title="Urutkan harga tertinggi"
        >
          <Icon name="lucide:trending-up" class="w-3.5 h-3.5" />
          <span>Termahal</span>
        </button>
      </div>

      <!-- Reset Filter (jika Merek atau Jenis aktif) -->
      <button
        v-if="brand || jenis || (showSort && sortValue && sortValue !== 'cheapest' && sortValue !== 'default')"
        type="button"
        @click="resetSubFilters"
        class="text-[11px] text-gray-500 hover:text-orange-600 font-bold flex items-center gap-1 px-2 py-1 rounded-md hover:bg-orange-50 transition cursor-pointer"
        title="Hapus filter merek & jenis"
      >
        <Icon name="lucide:rotate-ccw" class="w-3 h-3 text-orange-500" />
        <span>Reset</span>
      </button>
    </div>

    <!-- Invisible backdrop to close dropdowns -->
    <div
      v-if="isBrandDropdownOpen || isJenisDropdownOpen"
      class="fixed inset-0 z-30 bg-transparent"
      @click="closeDropdowns"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDataCacheStore } from '~/stores/data-cache';
import { DEFAULT_QUICK_CATEGORIES, getCategoryIcon, getJenisList, matchesCategory, matchesJenis } from '~/utils/categoryJenis';

interface Props {
  category?: string;
  brand?: string;
  jenis?: string;
  products?: any[];
  showSort?: boolean;
  sortValue?: string;
}

const props = withDefaults(defineProps<Props>(), {
  category: '',
  brand: '',
  jenis: '',
  products: undefined,
  showSort: false,
  sortValue: '',
});

const emit = defineEmits<{
  (e: 'update:category', value: string): void;
  (e: 'update:brand', value: string): void;
  (e: 'update:jenis', value: string): void;
  (e: 'update:sortValue', value: string): void;
  (e: 'change-category', value: string): void;
}>();

const dataCacheStore = useDataCacheStore();

const allProducts = computed(() => {
  const list = props.products !== undefined ? props.products : (dataCacheStore.products || []);
  return list.filter((p: any) => p.isActive !== false);
});

const totalProductsCount = computed(() => allProducts.value.length);

const categoriesList = computed(() => {
  const prods = allProducts.value;
  const categoryMap = new Map<string, number>();

  DEFAULT_QUICK_CATEGORIES.forEach(name => {
    categoryMap.set(name, 0);
  });

  prods.forEach((p: any) => {
    categoryMap.forEach((_, catName) => {
      if (matchesCategory(p, catName)) {
        categoryMap.set(catName, (categoryMap.get(catName) || 0) + 1);
      }
    });
  });

  return Array.from(categoryMap.entries()).map(([name, count]) => ({
    name,
    count,
    icon: getCategoryIcon(name)
  })).sort((a, b) => a.name.localeCompare(b.name, 'id', { sensitivity: 'base' }));
});

const isCategoryActive = (catName: string) => {
  if (!catName && !props.category) return true;
  if (!props.category) return false;
  return props.category.trim().toLowerCase() === catName.trim().toLowerCase();
};

const isBrandDropdownOpen = ref(false);
const isJenisDropdownOpen = ref(false);

const closeDropdowns = () => {
  isBrandDropdownOpen.value = false;
  isJenisDropdownOpen.value = false;
};

const toggleBrandDropdown = () => {
  isBrandDropdownOpen.value = !isBrandDropdownOpen.value;
  if (isBrandDropdownOpen.value) {
    isJenisDropdownOpen.value = false;
  }
};

const toggleJenisDropdown = () => {
  isJenisDropdownOpen.value = !isJenisDropdownOpen.value;
  if (isJenisDropdownOpen.value) {
    isBrandDropdownOpen.value = false;
  }
};

const selectCategory = (catName: string) => {
  closeDropdowns();
  if (!catName || isCategoryActive(catName)) {
    emit('update:category', '');
    emit('update:brand', '');
    emit('update:jenis', '');
    emit('change-category', '');
    return;
  }
  emit('update:category', catName);
  emit('update:brand', '');
  emit('update:jenis', '');
  emit('change-category', catName);
};

const setBrand = (b: string) => {
  emit('update:brand', b);
  isBrandDropdownOpen.value = false;
};

const setJenis = (j: string) => {
  emit('update:jenis', j);
  isJenisDropdownOpen.value = false;
};

const setSort = (s: string) => {
  emit('update:sortValue', s);
};

const resetSubFilters = () => {
  emit('update:brand', '');
  emit('update:jenis', '');
  if (props.showSort) {
    emit('update:sortValue', 'cheapest');
  }
};

const availableBrands = computed(() => {
  if (!props.category) return [];
  const prods = allProducts.value;

  const brandMap = new Map<string, string>();
  prods.forEach((p: any) => {
    if (matchesCategory(p, props.category)) {
      const b = (p.brand || '').trim();
      if (b && b !== '-' && b.toLowerCase() !== 'no brand') {
        if (!brandMap.has(b.toLowerCase())) {
          brandMap.set(b.toLowerCase(), b);
        }
      }
    }
  });

  return Array.from(brandMap.values()).sort((a, b) => a.localeCompare(b, 'id', { sensitivity: 'base' }));
});

const availableJenis = computed(() => {
  if (!props.category) return [] as { label: string; count: number }[];
  const labels = getJenisList(props.category);
  if (labels.length === 0) return [] as { label: string; count: number }[];

  const brandLower = props.brand.trim().toLowerCase();
  const base = allProducts.value.filter((p: any) => {
    if (!matchesCategory(p, props.category)) return false;
    if (brandLower) {
      const b = (p.brand || '').trim().toLowerCase();
      if (b !== brandLower) return false;
    }
    return true;
  });

  return labels.map(label => ({
    label,
    count: base.filter((p: any) => matchesJenis(p, props.category, label)).length,
  })).sort((a, b) => a.label.localeCompare(b.label, 'id', { numeric: true, sensitivity: 'base' }));
});
</script>
