<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
)

const props = defineProps<{
  labels: string[]
  data: number[]
}>()

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      data: props.data,
      backgroundColor: [
        '#f97316', // Orange
        '#16a34a', // Green
        '#2563eb', // Blue
        '#9333ea'  // Purple
      ],
      hoverOffset: 4
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
    }
  }
}
</script>

<template>
  <div class="h-[300px]">
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
</template>
