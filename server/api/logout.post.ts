export default defineEventHandler((event) => {
  // Menghapus cookie dengan mengatur maxAge ke 0 (atau nilai negatif)
  deleteCookie(event, "auth_token", {
    path: "/",
  });

  return {
    success: true,
    message: "Logout berhasil",
  };
});
