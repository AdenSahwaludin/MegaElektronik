import { ref, computed, watch, onMounted, onBeforeUnmount, type Ref, type ComputedRef } from 'vue'
import { DEFAULT_QUICK_CATEGORIES, CATEGORY_JENIS_MAP, getCategoryIcon } from '../utils/categoryJenis'
import { getProductDisplayName } from '../utils/product'

export interface SearchSuggestionItem {
  id: string
  type: 'category' | 'brand' | 'jenis' | 'product'
  text: string
  title: string
  subtitle?: string
  model?: string
  stock?: number
  badge: string
  badgeClass: string
  icon: string
  priority: number
}

export interface AutocompleteProductItem {
  id?: number | string
  name?: string | null
  brand?: string | null
  model?: string | null
  otherName?: string | null
  stock?: number
  askingPrice?: number
  [key: string]: unknown
}

export function useSearchAutocomplete(
  searchQuery: Ref<string>,
  productsSource: Ref<AutocompleteProductItem[]> | ComputedRef<AutocompleteProductItem[]>,
  options?: {
    onSelect?: (selectedText: string) => void
    maxProducts?: number
  }
) {
  const isDropdownOpen = ref(false)
  const highlightedIndex = ref(0)
  const searchWrapperRef = ref<HTMLElement | null>(null)

  // Auto set highlightedIndex to 0 (top item) on query change
  watch(searchQuery, (newVal) => {
    if (!newVal || !newVal.trim()) {
      isDropdownOpen.value = false
      highlightedIndex.value = -1
    } else {
      highlightedIndex.value = 0
    }
  })

  // Click outside to close
  const handleClickOutside = (e: MouseEvent) => {
    if (searchWrapperRef.value && !searchWrapperRef.value.contains(e.target as Node)) {
      isDropdownOpen.value = false
      highlightedIndex.value = -1
    }
  }

  onMounted(() => {
    if (typeof window !== 'undefined') {
      document.addEventListener('pointerdown', handleClickOutside)
    }
  })

  onBeforeUnmount(() => {
    if (typeof window !== 'undefined') {
      document.removeEventListener('pointerdown', handleClickOutside)
    }
  })

  // Suggestions computation
  const suggestions = computed<SearchSuggestionItem[]>(() => {
    const rawQuery = searchQuery.value || ''
    const q = rawQuery.trim().toLowerCase()
    if (!q) return []

    const products = productsSource.value || []

    // 1. Categories
    const categoryMatches: SearchSuggestionItem[] = []
    for (const cat of DEFAULT_QUICK_CATEGORIES) {
      const lower = cat.toLowerCase()
      if (lower.startsWith(q)) {
        categoryMatches.push({
          id: `cat-${cat}`,
          type: 'category',
          text: cat,
          title: cat,
          subtitle: 'Kategori Produk',
          badge: 'Kategori',
          badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: getCategoryIcon(cat),
          priority: 1
        })
      } else if (lower.includes(q)) {
        categoryMatches.push({
          id: `cat-${cat}`,
          type: 'category',
          text: cat,
          title: cat,
          subtitle: 'Kategori Produk',
          badge: 'Kategori',
          badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: getCategoryIcon(cat),
          priority: 2
        })
      }
    }

    // 2. Brands
    const brandMatches: SearchSuggestionItem[] = []
    const brandSet = new Set<string>()
    for (const p of products) {
      const b = (p.brand || '').trim()
      if (b && b !== '-' && b.toLowerCase() !== 'no brand') {
        brandSet.add(b)
      }
    }
    for (const b of Array.from(brandSet)) {
      const lower = b.toLowerCase()
      if (lower.startsWith(q)) {
        brandMatches.push({
          id: `brand-${b}`,
          type: 'brand',
          text: b,
          title: b,
          subtitle: 'Merek Produk',
          badge: 'Merek',
          badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: 'lucide:tag',
          priority: 1
        })
      } else if (lower.includes(q)) {
        brandMatches.push({
          id: `brand-${b}`,
          type: 'brand',
          text: b,
          title: b,
          subtitle: 'Merek Produk',
          badge: 'Merek',
          badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: 'lucide:tag',
          priority: 2
        })
      }
    }

    // 3. Jenis (Sub-categories)
    const jenisMatches: SearchSuggestionItem[] = []
    const seenJenis = new Set<string>()
    for (const jenisList of Object.values(CATEGORY_JENIS_MAP)) {
      for (const j of jenisList) {
        if (seenJenis.has(j.toLowerCase())) continue
        seenJenis.add(j.toLowerCase())
        const lower = j.toLowerCase()
        if (lower.startsWith(q)) {
          jenisMatches.push({
            id: `jenis-${j}`,
            type: 'jenis',
            text: j,
            title: j,
            subtitle: 'Tipe / Jenis',
            badge: 'Tipe',
            badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
            icon: 'lucide:layers',
            priority: 1
          })
        } else if (lower.includes(q)) {
          jenisMatches.push({
            id: `jenis-${j}`,
            type: 'jenis',
            text: j,
            title: j,
            subtitle: 'Tipe / Jenis',
            badge: 'Tipe',
            badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
            icon: 'lucide:layers',
            priority: 2
          })
        }
      }
    }

    // 4. Products
    const productMatches: SearchSuggestionItem[] = []
    const seenProducts = new Set<string>()

    for (const p of products) {
      const displayName = getProductDisplayName(p)
      const name = (p.name || '').trim()
      const brand = (p.brand || '').trim()
      const model = (p.model || '').trim()
      const otherName = (p.otherName || '').trim()

      // Model display
      const cleanModel = model && model !== '-' && model.toLowerCase() !== 'standar' && model.toLowerCase() !== 'standard' ? model : ''
      const uniqueKey = `${displayName}__${cleanModel}`.toLowerCase()
      if (seenProducts.has(uniqueKey)) continue

      const lowerDisp = displayName.toLowerCase()
      const lowerName = name.toLowerCase()
      const lowerModel = model.toLowerCase()
      const fullSearch = `${lowerDisp} ${lowerName} ${brand.toLowerCase()} ${lowerModel} ${otherName.toLowerCase()}`

      let priority = 0
      if (lowerDisp.startsWith(q) || lowerName.startsWith(q)) {
        priority = 1
      } else if (cleanModel && lowerModel.startsWith(q)) {
        priority = 2
      } else if (fullSearch.includes(q)) {
        priority = 3
      }

      if (priority > 0) {
        seenProducts.add(uniqueKey)
        productMatches.push({
          id: `prod-${p.id}`,
          type: 'product',
          text: displayName,
          title: displayName,
          model: cleanModel,
          stock: p.stock,
          badge: 'Produk',
          badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: 'lucide:package',
          priority
        })
      }
    }

    // Sort category & brand: priority 1 first, then alphabetical
    categoryMatches.sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title))
    brandMatches.sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title))
    jenisMatches.sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title))

    // Sort products: priority 1 first, then alphabetical
    productMatches.sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title))

    // Top suggestions:
    // Priority 1 categories & brands first
    const p1Meta = [
      ...categoryMatches.filter(c => c.priority === 1),
      ...brandMatches.filter(b => b.priority === 1),
      ...jenisMatches.filter(j => j.priority === 1)
    ].slice(0, 4)

    // Products starting with query
    const p1Products = productMatches.filter(p => p.priority === 1).slice(0, 6)

    // Remaining categories & brands
    const p2Meta = [
      ...categoryMatches.filter(c => c.priority > 1),
      ...brandMatches.filter(b => b.priority > 1),
      ...jenisMatches.filter(j => j.priority > 1)
    ].slice(0, 3)

    // Remaining products containing query
    const maxProds = options?.maxProducts || 8
    const remainingSlots = Math.max(maxProds - p1Products.length, 3)
    const p2Products = productMatches.filter(p => p.priority > 1).slice(0, remainingSlots)

    return [...p1Meta, ...p1Products, ...p2Meta, ...p2Products].slice(0, 12)
  })

  const selectSuggestion = (item: SearchSuggestionItem | string) => {
    const text = typeof item === 'string' ? item : item.text
    searchQuery.value = text
    isDropdownOpen.value = false
    highlightedIndex.value = -1
    if (options?.onSelect) {
      options.onSelect(text)
    }
  }

  const handleKeydown = (e: KeyboardEvent): boolean => {
    if (!isDropdownOpen.value || suggestions.value.length === 0) {
      return false
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (highlightedIndex.value < suggestions.value.length - 1) {
        highlightedIndex.value++
      } else {
        highlightedIndex.value = 0
      }
      return true
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (highlightedIndex.value > 0) {
        highlightedIndex.value--
      } else {
        highlightedIndex.value = suggestions.value.length - 1
      }
      return true
    }

    if (e.key === 'Enter') {
      const target = (highlightedIndex.value >= 0 ? suggestions.value[highlightedIndex.value] : null) || suggestions.value[0]
      if (target) {
        e.preventDefault()
        selectSuggestion(target)
        return true
      }
    }

    if (e.key === 'Escape') {
      e.preventDefault()
      isDropdownOpen.value = false
      highlightedIndex.value = -1
      return true
    }

    return false
  }

  const openDropdown = () => {
    if ((searchQuery.value || '').trim().length > 0) {
      isDropdownOpen.value = true
      highlightedIndex.value = 0
    }
  }

  const closeDropdown = () => {
    isDropdownOpen.value = false
    highlightedIndex.value = -1
  }

  return {
    isDropdownOpen,
    highlightedIndex,
    suggestions,
    searchWrapperRef,
    selectSuggestion,
    handleKeydown,
    openDropdown,
    closeDropdown
  }
}
