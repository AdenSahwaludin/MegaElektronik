import { ref, watch } from 'vue'

// State Quick Categories (kategori, merek, jenis) yang dibagi antara
// tampilan POS lama (index) dan tampilan POS baru (pos-new),
// supaya pilihan filter tetap bertahan saat pindah tampilan.
const STORAGE_KEY = 'mega_quick_filter_state'

const selectedCategory = ref('')
const selectedBrand = ref('')
const selectedJenis = ref('')

let initialized = false

function loadFromStorage() {
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      selectedCategory.value = parsed.category || ''
      selectedBrand.value = parsed.brand || ''
      selectedJenis.value = parsed.jenis || ''
    }
  } catch {
    // ignore korup
  }
}

function setupWatcher() {
  watch([selectedCategory, selectedBrand, selectedJenis], () => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          category: selectedCategory.value,
          brand: selectedBrand.value,
          jenis: selectedJenis.value
        })
      )
    } catch {
      // ignore
    }
  })
}

export function useQuickFilterState() {
  if (!initialized) {
    initialized = true
    loadFromStorage()
    setupWatcher()
  }

  return {
    category: selectedCategory,
    brand: selectedBrand,
    jenis: selectedJenis
  }
}
