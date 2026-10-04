<script setup lang="ts">
import type { SearchSuggestionItem } from '../composables/useSearchAutocomplete'

defineProps<{
  suggestions: SearchSuggestionItem[]
  query: string
  highlightedIndex?: number
}>()

const emit = defineEmits<{
  (e: 'select', item: SearchSuggestionItem): void
  (e: 'hover', index: number): void
}>()

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
  <div
    v-if="suggestions.length > 0"
    class="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-xl shadow-2xl border border-gray-200/90 overflow-hidden backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150 text-left"
    @mousedown.stop
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
    <div class="max-h-72 overflow-y-auto divide-y divide-gray-100/80 scrollbar-thin">
      <div
        v-for="(item, index) in suggestions"
        :key="item.id"
        :class="[
          'px-3.5 py-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors select-none',
          highlightedIndex === index
            ? 'bg-orange-50 text-orange-950 border-l-4 border-orange-500 pl-2.5 font-medium'
            : 'hover:bg-orange-50/60 text-gray-800'
        ]"
        @mousedown.prevent="emit('select', item)"
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
          <div class="min-w-0 flex-1">
            <div class="text-sm font-semibold truncate leading-tight">
              <span
                v-for="(part, pIdx) in getHighlightedParts(item.title, query)"
                :key="pIdx"
                :class="part.isMatch ? 'text-orange-600 font-black bg-orange-100/70 px-0.5 rounded' : ''"
              >
                {{ part.text }}
              </span>
            </div>
            <div class="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5 truncate">
              <span
                v-if="item.model"
                class="font-mono text-gray-500"
              >Model: {{ item.model }}</span>
              <span v-else>{{ item.subtitle || item.badge }}</span>
            </div>
          </div>
        </div>

        <!-- Right: Badges -->
        <div class="flex items-center gap-1.5 shrink-0">
          <span
            v-if="item.stock !== undefined"
            class="text-[10px] font-bold px-1.5 py-0.5 rounded"
            :class="item.stock < 5 ? 'bg-red-50 text-red-600 border border-red-200/50' : 'bg-green-50 text-green-700 border border-green-200/50'"
          >
            Stok {{ item.stock }}
          </span>
          <span
            class="px-2 py-0.5 text-[10px] font-bold rounded-md border"
            :class="item.badgeClass"
          >
            {{ item.badge }}
          </span>
        </div>
      </div>
    </div>

    <!-- Footer keyboard navigation helper -->
    <div class="px-3.5 py-1.5 bg-gray-50/90 border-t border-gray-100 text-[10px] text-gray-400 flex items-center justify-between select-none">
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
</template>
