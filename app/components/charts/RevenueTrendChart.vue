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
  datasets: any[]
}>()

const chartData = computed(() => ({
  labels: props.labels.map(label => {
    const d = new Date(label)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  }),
  datasets: props.datasets.map((ds, index) => ({
    ...ds,
    backgroundColor: index === 0 ? 'rgba(234, 88, 12, 0.7)' : 'rgba(16, 185, 129, 0.85)',
    borderColor: index === 0 ? '#ea580c' : '#059669',
    borderWidth: 1,
    borderRadius: 4,
    hoverBackgroundColor: index === 0 ? '#ea580c' : '#059669',
    barPercentage: index === 0 ? 0.8 : 0.5,
    categoryPercentage: 0.8,
    yAxisID: index === 0 ? 'y' : 'y1',
  }))
}))

const chartOptions = computed(() => {
  // Calculate max values to coordinate axes
  const revenueMax = Math.max(...(props.datasets[0]?.data || [0])) || 1000000;
  
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800 },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { usePointStyle: true, pointStyle: 'rectRounded' }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        position: 'left' as const,
        beginAtZero: true,
        title: { display: true, text: 'Omset', color: '#ea580c', font: { size: 10, weight: 'bold' as const } },
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          font: { size: 10 },
          callback: (value: any) => value >= 1000000 ? 'Rp' + (value/1000000).toFixed(1) + 'jt' : 'Rp' + (value/1000).toLocaleString('id-ID') + 'rb'
        }
      },
      y1: {
        position: 'right' as const,
        beginAtZero: true,
        // Make Profit 3x more visible by setting its axis max to 1/3 of Revenue axis max
        // This makes Profit bars 3x taller than they would be on the same scale.
        suggestedMax: revenueMax / 3,
        title: { display: true, text: 'Profit', color: '#10b981', font: { size: 10, weight: 'bold' as const } },
        grid: { drawOnChartArea: false },
        ticks: {
          font: { size: 10 },
          callback: (value: any) => value >= 1000000 ? 'Rp' + (value/1000000).toFixed(1) + 'jt' : 'Rp' + (value/1000).toLocaleString('id-ID') + 'rb'
        }
      },
      x: {
        grid: { display: false },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 12,
          font: { size: 10, weight: 'bold' as const }
        }
      }
    }
  }
})
</script>

<template>
  <div class="h-[300px]">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>
