export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, password } = body;

  // Hardcoded users
  const users = [
    { username: "sekha1211@gmail.com", password: "Margamulya1." },
    { username: "megawahyuni931@gmail.com", password: "Margamulya1." },
    { username: "a", password: "a" },
  ];

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Username atau password salah",
    });
  }

  // Generate a simple token (in a real app, use JWT)
  const token = `token_${user.username}_${Date.now()}`;

  // Set cookie valid for 1 day (86400 seconds)
  setCookie(event, "auth_token", token, {
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
    sameSite: "lax",
  });

  return {
    success: true,
    message: "Login berhasil",
    user: { username: user.username },
  };
});