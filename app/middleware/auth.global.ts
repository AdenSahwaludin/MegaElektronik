export default defineNuxtRouteMiddleware((to) => {
  // Hanya gunakan cookie ini di client-side atau saat rendering awal di server
  // useCookie otomatis sinkron dengan header Set-Cookie di response server
  const token = useCookie("auth_token", {
    maxAge: 60 * 60 * 48, // 48 jam
    path: "/",
    sameSite: "lax",
  });

  // Proteksi rute: jika belum login dan bukan ke halaman login
  if (!token.value && to.path !== "/login") {
    return navigateTo("/login", { replace: true });
  }

  // Jika sudah login dan mencoba ke halaman login
  if (token.value && to.path === "/login") {
    return navigateTo("/", { replace: true });
  }

  // Rolling Session: Perbarui masa aktif cookie jika sedang aktif
  // Hanya lakukan di server-side untuk memperbarui header Set-Cookie
  if (process.server && token.value) {
    token.value = token.value;
  }
});
