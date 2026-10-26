export default defineNuxtRouteMiddleware((to) => {
  // Gunakan cookie auth_token dengan masa aktif 7 hari (sliding expiration)
  const token = useCookie("auth_token", {
    maxAge: 60 * 60 * 24 * 7, // 7 hari
    path: "/",
    sameSite: "lax",
  });

  // Ambil preferensi tampilan POS (classic vs new)
  const posMode = useCookie<string>("mega_pos_view_mode", {
    path: "/",
    sameSite: "lax",
  });
  const defaultPosPath = posMode.value === "new" ? "/pos-new" : "/";

  // Proteksi rute: jika belum login dan bukan ke halaman login
  if (!token.value && to.path !== "/login") {
    return navigateTo("/login", { replace: true });
  }

  // Jika sudah login dan mencoba ke halaman login
  if (token.value && to.path === "/login") {
    return navigateTo(defaultPosPath, { replace: true });
  }

  // Jika sudah login dan membuka root "/", arahkan sesuai preferensi tampilan yang tersimpan
  if (token.value && to.path === "/" && posMode.value === "new") {
    return navigateTo("/pos-new", { replace: true });
  }

  // Sliding Session: Perbarui masa aktif cookie 7 hari setiap kali pengguna membuka / berpindah halaman
  if (token.value) {
    token.value = token.value;
  }
});
