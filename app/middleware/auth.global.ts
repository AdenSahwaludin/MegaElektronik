export default defineNuxtRouteMiddleware((to) => {
  // Gunakan cookie auth_token dengan masa aktif 7 hari (sliding expiration)
  const token = useCookie("auth_token", {
    maxAge: 60 * 60 * 24 * 7, // 7 hari
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

  // Sliding Session: Perbarui masa aktif cookie 7 hari setiap kali pengguna membuka / berpindah halaman
  if (token.value) {
    token.value = token.value;
  }
});
