<template>
  <div class="min-h-[100dvh] bg-orange-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border-t-4 border-orange-600">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="lucide:user" class="w-8 h-8 text-orange-600" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Login Mega Elektronik</h1>
        <p class="text-gray-500 mt-2 text-sm">Masuk untuk mengelola penjualan dan produk</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label for="username" class="block text-sm font-semibold text-gray-700 mb-1">Username</label>
          <div class="relative">
            <Icon name="lucide:at-sign" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="username"
              v-model="username"
              type="text"
              required
              class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
              placeholder="Masukkan username"
            />
          </div>
        </div>

        <div>
          <label for="password" class="block text-sm font-semibold text-gray-700 mb-1">Password</label>
          <div class="relative">
            <Icon name="lucide:lock" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
              placeholder="Masukkan password"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Pesan Error -->
        <div v-if="errorMessage" class="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-start gap-2 animate-in fade-in zoom-in duration-200">
          <Icon name="lucide:alert-circle" class="w-5 h-5 shrink-0" />
          <p>{{ errorMessage }}</p>
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Icon v-if="isLoading" name="lucide:loader-2" class="w-5 h-5 animate-spin" />
          <span v-else>Masuk</span>
        </button>
      </form>
      
      <div class="mt-6 text-center text-xs text-gray-400">
        <p>&copy; {{ new Date().getFullYear() }} Mega Elektronik. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Mengatur layout ke custom agar header/footer utama tidak muncul di halaman login
definePageMeta({
  layout: 'empty', // Opsional: jika ada layout kosong. Jika tidak, Nuxt akan pakai default layout yang bisa kita sembunyikan headernya.
});

const username = ref('');
const password = ref('');
const errorMessage = ref('');
const showPassword = ref(false);
const isLoading = ref(false);

const handleLogin = async () => {
  errorMessage.value = '';
  isLoading.value = true;

  try {
    const response = await $fetch('/api/login', {
      method: 'POST',
      body: {
        username: username.value,
        password: password.value
      }
    });

    if (response.success) {
      // Login sukses, force reload ke halaman utama agar middleware server-side berjalan
      window.location.href = '/';
    }
  } catch (error: any) {
    // Menangkap pesan error dari server API
    errorMessage.value = error.data?.statusMessage || 'Terjadi kesalahan saat login. Coba lagi.';
  } finally {
    isLoading.value = false;
  }
};
</script>
