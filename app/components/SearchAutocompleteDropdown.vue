<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import type { SearchSuggestionItem } from '../composables/useSearchAutocomplete'

const props = defineProps<{
  suggestions: SearchSuggestionItem[]
  query: string
  highlightedIndex?: number
  targetEl?: HTMLElement | null
}>()

const emit = defineEmits<{
  (e: 'select', item: SearchSuggestionItem): void
  (e: 'hover', index: number): void
}>()

const anchorRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const isMounted = ref(false)

const dropdownStyle = ref<Record<string, string>>({})
const dropdownListStyle = ref<Record<string, string>>({})

// Tinggi list dihitung dinamis mengikuti ruang yang terlihat (di atas keyboard)
const MAX_LIST_HEIGHT = 288 // = max-h-72 (desktop)

const updatePosition = () => {
  if (typeof window === 'undefined') return
  const el = props.targetEl || anchorRef.value?.parentElement
  if (!el) return

  const rect = el.getBoundingClientRect()
  if (rect.width === 0 && rect.height === 0) return

  const viewportWidth = window.innerWidth
  const isMobile = viewportWidth < 640
  const padding = 12

  // Region terlihat di layar: saat keyboard ponsel terbuka, visualViewport
  // menyusut — dropdown tidak boleh turun ke balik keyboard.
  const vv = window.visualViewport
  const keyboardOpen = !!vv && vv.height < window.innerHeight - 30
  const visibleTop = keyboardOpen && vv ? Math.max(0, vv.offsetTop) : 0
  const visibleBottom = keyboardOpen && vv
    ? window.visualViewport!.offsetTop + window.visualViewport!.height
    : window.innerHeight

  let top = rect.bottom + 6
  let maxHeight = visibleBottom - top - 4

  if (isMobile) {
    const width = viewportWidth - (padding * 2)

    // Jika ruang di bawah terlalu sempit (input dekat keyboard), tampilkan
    // dropdown ke atas input supaya tetap terlihat.
    const spaceBelow = visibleBottom - (rect.bottom + 6)
    const spaceAbove = rect.top - visibleTop
    const MIN_DROPDOWN = 170
    if (spaceBelow < MIN_DROPDOWN && spaceAbove > spaceBelow) {
      top = Math.max(visibleTop + 4, rect.top - Math.min(MAX_LIST_HEIGHT + 46, spaceAbove - 8))
      maxHeight = rect.top - top - 8
    }

    maxHeight = Math.max(120, Math.min(MAX_LIST_HEIGHT, maxHeight))
    dropdownStyle.value = {
      position: 'fixed',
      top: `${Math.round(top)}px`,
      left: `${padding}px`,
      width: `${width}px`,
      maxWidth: `${width}px`,
      maxHeight: `${Math.round(maxHeight + 46)}px`,
      overflowY: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      zIndex: '9999'
    }
    // 46px ≈ tinggi header "Saran Pencarian"
    dropdownListStyle.value = {
      maxHeight: `${Math.round(Math.max(80, maxHeight))}px`
    }
    return
  }

  // Desktop & Tablet
  const minWidth = 460
  const idealWidth = Math.max(minWidth, rect.width)
  const maxWidth = Math.min(idealWidth, viewportWidth - (padding * 2))

  // Ensure dropdown doesn't overflow right edge
  let left = rect.left
  if (left + maxWidth > viewportWidth - padding) {
    left = Math.max(padding, viewportWidth - padding - maxWidth)
  }

  const desktopMaxList = Math.max(120, Math.min(MAX_LIST_HEIGHT, maxHeight))
  dropdownStyle.value = {
    position: 'fixed',
    top: `${Math.round(rect.bottom + 6)}px`,
    left: `${Math.round(left)}px`,
    width: `${Math.round(maxWidth)}px`,
    minWidth: `${Math.round(Math.min(minWidth, maxWidth))}px`,
    maxWidth: `${Math.round(maxWidth)}px`,
    maxHeight: `${Math.round(desktopMaxList + 46)}px`,
    overflowY: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    zIndex: '9999'
  }
  dropdownListStyle.value = {
    maxHeight: `${Math.round(desktopMaxList)}px`
  }
}

const handleViewportChange = () => {
  updatePosition()
}

watch(
  () => props.suggestions.length,
  async (newLen) => {
    if (newLen > 0) {
      await nextTick()
      updatePosition()
    }
  }
)

onMounted(() => {
  isMounted.value = true
  nextTick(() => {
    updatePosition()
  })
  window.addEventListener('resize', handleViewportChange)
  window.addEventListener('scroll', handleViewportChange, true)
  // Keyboard ponsel/PWA mengubah visualViewport, bukan window -> wajib disimak
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleViewportChange)
    window.visualViewport.addEventListener('scroll', handleViewportChange)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleViewportChange)
  window.removeEventListener('scroll', handleViewportChange, true)
  if (window.visualViewport) {
    window.visualViewport.removeEventListener('resize', handleViewportChange)
    window.visualViewport.removeEventListener('scroll', handleViewportChange)
  }
})

let lastSelectTime = 0
const handleSelect = (item: SearchSuggestionItem) => {
  const now = Date.now()
  if (now - lastSelectTime < 200) return
  lastSelectTime = now
  emit('select', item)
}

// Function to split text into matched and non-matched parts for safe highlighting
const getHighlightedParts = (text: string, query: string): Array<{ text: string, isMatch: boolean }> => {
  if (!query || !query.trim() || !text) {
    return [{ text: text || '', isMatch: false }]
  }
  const q = query.trim()
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  const parts = text.split(regex)
  return parts.filter(Boolean).map(part => ({
    text: part,
    isMatch: part.toLowerCase() === q.toLowerCase()
  }))
}
</script>

<template>
  <div ref="anchorRef" class="hidden" />
  <Teleport to="body">
    <div
      v-if="suggestions.length > 0 && isMounted"
      ref="dropdownRef"
      data-search-autocomplete-dropdown="true"
      :style="dropdownStyle"
      class="bg-white rounded-xl shadow-2xl border border-gray-200/90 overflow-hidden backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150 text-left select-none"
      @mousedown.stop
      @pointerdown.stop
    >
      <!-- Header -->
      <div class="px-3.5 py-2 bg-gradient-to-r from-orange-50/90 to-amber-50/70 border-b border-orange-100/70 text-[11px] font-bold text-orange-800 flex items-center justify-between">
        <span class="flex items-center gap-1.5">
          <Icon
            name="lucide:sparkles"
            class="w-3.5 h-3.5 text-orange-500"
          />
          Saran Pencarian
        </span>
        <span class="text-[10px] text-orange-600 font-semibold bg-white/70 px-1.5 py-0.5 rounded-full border border-orange-200/50">
          {{ suggestions.length }} saran
        </span>
      </div>

      <!-- Suggestion Items List -->
      <div
        :style="dropdownListStyle"
        class="max-h-72 overflow-y-auto divide-y divide-gray-100/80 scrollbar-thin"
      >
        <div
          v-for="(item, index) in suggestions"
          :key="item.id"
          :class="[
            'px-3.5 py-2.5 flex items-center justify-between gap-2.5 sm:gap-3 cursor-pointer transition-colors select-none',
            highlightedIndex === index
              ? 'bg-orange-50 text-orange-950 border-l-4 border-orange-500 pl-2.5 font-medium'
              : 'hover:bg-orange-50/60 text-gray-800'
          ]"
          @mousedown.prevent="handleSelect(item)"
          @click="handleSelect(item)"
          @mouseenter="emit('hover', index)"
        >
          <!-- Left: Icon & Text -->
          <div class="flex items-center gap-2.5 min-w-0 flex-1">
            <!-- Icon Pill -->
            <div
              class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              :class="[
                item.type === 'category' ? 'bg-orange-100 text-orange-600' : '',
                item.type === 'brand' ? 'bg-blue-100 text-blue-600' : '',
                item.type === 'jenis' ? 'bg-purple-100 text-purple-600' : '',
                item.type === 'product' ? 'bg-gray-100 text-gray-600' : ''
              ]"
            >
              <Icon
                :name="item.icon"
                class="w-4 h-4"
              />
            </div>

            <!-- Title & Subtitle -->
            <div class="min-w-0 flex-1" :title="item.title">
              <div class="text-xs sm:text-sm font-semibold truncate leading-tight">
                <span
                  v-for="(part, pIdx) in getHighlightedParts(item.title, query)"
                  :key="pIdx"
                  :class="part.isMatch ? 'text-orange-600 font-black bg-orange-100/70 px-0.5 rounded' : ''"
                >
                  {{ part.text }}
                </span>
              </div>
              <div class="text-[10px] sm:text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5 truncate">
                <span
                  v-if="item.model"
                  class="font-mono text-gray-500"
                >Model: {{ item.model }}</span>
                <span v-else>{{ item.subtitle || item.badge }}</span>
              </div>
            </div>
          </div>

          <!-- Right: Badges -->
          <div class="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <span
              v-if="item.stock !== undefined"
              class="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap"
              :class="item.stock < 5 ? 'bg-red-50 text-red-600 border border-red-200/50' : 'bg-green-50 text-green-700 border border-green-200/50'"
            >
              Stok {{ item.stock }}
            </span>
            <span
              class="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-md border whitespace-nowrap"
              :class="item.badgeClass"
            >
              {{ item.badge }}
            </span>
          </div>
        </div>
      </div>

      <!-- Footer keyboard navigation helper (Desktop only) -->
      <div class="hidden sm:flex px-3.5 py-1.5 bg-gray-50/90 border-t border-gray-100 text-[10px] text-gray-400 items-center justify-between select-none">
        <span class="flex items-center gap-1">
          <kbd class="px-1 py-0.5 bg-white border border-gray-200 rounded font-mono text-[9px] shadow-2xs">↑</kbd>
          <kbd class="px-1 py-0.5 bg-white border border-gray-200 rounded font-mono text-[9px] shadow-2xs">↓</kbd>
          navigasi
          <span class="mx-1">·</span>
          <kbd class="px-1 py-0.5 bg-white border border-gray-200 rounded font-mono text-[9px] shadow-2xs">↵ Enter</kbd>
          pilih (teratas)
        </span>
        <span>
          <kbd class="px-1 py-0.5 bg-white border border-gray-200 rounded font-mono text-[9px] shadow-2xs">Esc</kbd>
          tutup
        </span>
      </div>
    </div>
  </Teleport>
</template>
