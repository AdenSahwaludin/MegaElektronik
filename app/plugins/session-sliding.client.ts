export default defineNuxtPlugin(() => {
  if (!import.meta.client) return;

  const cookieOptions = {
    maxAge: 60 * 60 * 24, // 24 jam
    path: "/",
    sameSite: "lax" as const,
  };

  let lastRefreshTime = 0;
  const REFRESH_INTERVAL_MS = 60 * 1000; // Minimal 1 menit sekali saat user aktif

  const refreshSession = () => {
    const now = Date.now();
    if (now - lastRefreshTime < REFRESH_INTERVAL_MS) {
      return;
    }

    const token = useCookie("auth_token", cookieOptions);
    if (token.value) {
      lastRefreshTime = now;
      token.value = token.value; // Memperbarui expiry cookie di browser (sliding expiration)
    }
  };

  // Event listener untuk mendeteksi aktivitas pengguna (klik, ketik, sentuh, scroll)
  const activityEvents = ["pointerdown", "keydown", "touchstart", "scroll"];

  activityEvents.forEach((eventType) => {
    window.addEventListener(eventType, refreshSession, { passive: true });
  });
});
