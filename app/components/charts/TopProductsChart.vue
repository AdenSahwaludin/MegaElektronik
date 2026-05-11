<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const props = defineProps<{
  labels: string[]
  data: number[]
  label: string
  isCurrency?: boolean
}>()

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: props.label,
      data: props.data,
      backgroundColor: '#f97316',
      borderRadius: 6
    }
  ]
}))

const chartOptions = {
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: {
        callback: function(value: any) {
          if (props.isCurrency) {
            return 'Rp ' + value.toLocaleString('id-ID');
          }
          return value;
        }
      }
    }
  }
}
</script>

<template>
  <div class="h-[400px]">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>
