export default defineEventHandler((event) => {
  const token = getCookie(event, "auth_token");
  if (token) {
    // Sliding expiration: Perpanjang masa berlaku cookie auth_token 24 jam dari setiap aktivitas/request
    setCookie(event, "auth_token", token, {
      maxAge: 60 * 60 * 24, // 24 jam (86400 detik)
      path: "/",
      sameSite: "lax",
    });
  }
});
