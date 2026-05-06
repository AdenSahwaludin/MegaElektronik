export default defineNuxtRouteMiddleware((to) => {
  // Hanya gunakan cookie ini di client-side atau saat rendering awal di server
  // useCookie otomatis sinkron dengan header Set-Cookie di response server
  const token = useCookie("auth_token", {
    maxAge: 60 * 60 * 24, // 24 jam
    path: "/",
    sameSite: "lax",
  });

  // Proteksi rute: jika belum login dan bukan ke halaman login
  if (!token.value && to.path !== "/login") {
    return navigateTo("/login");
  }

  // Jika sudah login dan mencoba ke halaman login
  if (token.value && to.path === "/login") {
    return navigateTo("/");
  }

  // Rolling Session: 
  // Jika token ada, kita "refresh" nilainya dengan mengisinya kembali.
  // Ini akan memicu Nuxt/Nitro untuk mengirimkan header Set-Cookie 
  // dengan maxAge baru (24 jam dari sekarang).
  if (token.value) {
    // Pada Nuxt 3, menugaskan ulang useCookie dengan nilai yang sama
    // akan memperbarui cookie dengan opsi maxAge yang telah dikonfigurasi
    token.value = token.value;
  }
});
