<template>
  <!-- Hint untung/rugi live: harga jual dibanding harga beli (modal) -->
  <p
    v-if="profit !== null"
    class="text-[11px] font-bold mt-1 flex items-center gap-1 leading-tight select-none"
    :class="profit >= 0 ? 'text-emerald-600' : 'text-red-500'"
  >
    <Icon
      :name="profit >= 0 ? 'lucide:trending-up' : 'lucide:trending-down'"
      class="w-3 h-3 shrink-0"
    />
    <span>{{ profit >= 0 ? 'Untung' : 'Rugi' }}: {{ formatCurrency(Math.abs(profit)) }}</span>
    <span
      v-if="percent !== null"
      class="font-semibold opacity-75"
    >({{ percent }})</span>
  </p>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCurrency } from '../../composables/useCurrency'

const props = defineProps<{
  price?: number | string | null
  buyPrice?: number | string | null
}>()

const { formatCurrency } = useCurrency()

const profit = computed<number | null>(() => {
  const priceNum = Number(props.price) || 0
  const buyNum = Number(props.buyPrice) || 0
  // Tampilkan hanya jika kedua harga sudah diisi
  if (!priceNum || !buyNum) return null
  return priceNum - buyNum
})

const percent = computed<string | null>(() => {
  const buyNum = Number(props.buyPrice) || 0
  if (!buyNum || profit.value === null) return null
  return `+${Math.round((Math.abs(profit.value) / buyNum) * 100)}%`
})
</script>
