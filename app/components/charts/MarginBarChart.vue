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
  soldCounts?: number[]
}>()

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: 'Total Profit',
      data: props.data,
      backgroundColor: '#10b981', // Emerald 500
      borderColor: '#059669', // Emerald 600
      borderWidth: 1,
      borderRadius: 6,
      hoverBackgroundColor: '#059669'
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          const profit = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(context.parsed.y);
          const count = props.soldCounts ? props.soldCounts[context.dataIndex] : 0;
          return [
            `Profit: ${profit}`,
            `Terjual: ${count} unit`
          ];
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        callback: function(value: any) {
          if (value >= 1000000) return 'Rp ' + (value / 1000000).toFixed(1) + 'jt';
          if (value >= 1000) return 'Rp ' + (value / 1000).toLocaleString('id-ID') + 'rb';
          return 'Rp ' + value;
        }
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: { size: 10 }
      }
    }
  }
}
</script>

<template>
  <div class="h-[350px]">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>
