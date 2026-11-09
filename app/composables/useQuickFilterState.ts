import { ref } from 'vue'

// State Quick Categories (kategori, merek, jenis) yang dibagi antara
// tampilan POS lama (index) dan tampilan POS baru (pos-new),
// supaya pilihan filter tetap bertahan saat pindah tampilan.
//
// TIDAK dipersist ke localStorage: setiap refresh/sesi baru selalu mulai
// dari "Semua" (tanpa Quick Categories aktif).
const selectedCategory = ref('')
const selectedBrand = ref('')
const selectedJenis = ref('')

let legacyCleaned = false

// Bersihkan sisa state lama yang sempat disimpan di localStorage
function clearLegacyStorage() {
  if (legacyCleaned || typeof window === 'undefined') return
  legacyCleaned = true
  try {
    window.localStorage.removeItem('mega_quick_filter_state')
  } catch {
    // ignore
  }
}

export function useQuickFilterState() {
  clearLegacyStorage()

  return {
    category: selectedCategory,
    brand: selectedBrand,
    jenis: selectedJenis
  }
}
