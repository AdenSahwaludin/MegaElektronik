export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.client) return;

  let lastRefreshTime = 0;
  const REFRESH_INTERVAL_MS = 60 * 1000; // Minimal 1 menit sekali saat user aktif

  const refreshSession = () => {
    const now = Date.now();
    if (now - lastRefreshTime < REFRESH_INTERVAL_MS) {
      return;
    }

    // Jalankan dalam Nuxt App Context agar composable useCookie aman dipanggil dari event listener
    nuxtApp.runWithContext(() => {
      try {
        const token = useCookie("auth_token", {
          maxAge: 60 * 60 * 24,
          path: "/",
          sameSite: "lax" as const,
        });
        if (token.value) {
          lastRefreshTime = now;
          token.value = token.value; // Memperbarui expiry cookie di browser (sliding expiration)
        }
      } catch (e) {
        // Safe catch
      }
    });
  };

  // Event listener untuk mendeteksi aktivitas pengguna (klik, ketik, sentuh, scroll)
  const activityEvents = ["pointerdown", "keydown", "touchstart", "scroll"];

  activityEvents.forEach((eventType) => {
    window.addEventListener(eventType, refreshSession, { passive: true });
  });
});
