export default defineEventHandler((event) => {
  const path = event.path || "";

  // Abaikan request internal dev-server, HMR, websocket, dan aset statis
  if (
    path.startsWith("/_nuxt") ||
    path.startsWith("/_icon") ||
    path.startsWith("/__") ||
    path.startsWith("/favicon") ||
    (path.includes(".") && !path.startsWith("/api"))
  ) {
    return;
  }

  try {
    const token = getCookie(event, "auth_token");
    if (token) {
      // Sliding expiration: Perpanjang masa berlaku cookie auth_token 24 jam
      setCookie(event, "auth_token", token, {
        maxAge: 60 * 60 * 24, // 24 jam (86400 detik)
        path: "/",
        sameSite: "lax",
      });
    }
  } catch (e) {
    // Tangkap error jika response header sudah dikirim atau socket IPC terputus
  }
});
