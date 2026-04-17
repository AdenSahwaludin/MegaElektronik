# Turso (LibSQL) Database Setup Guide

## 1. Installation

Dependencies sudah ditambahkan ke `package.json`:

- `@libsql/client`: ^0.7.0
- `@prisma/client`: 6
- `prisma`: 6

Jalankan:

```bash
pnpm install
```

## 2. Local Development Setup

### Create `.env.local` file

Buat file `.env.local` di root project:

```env
# Turso Database Configuration
DATABASE_URL="libsql://database-name-YOUR_ACCOUNT.turso.io?authToken=AUTH_TOKEN_ANDA"
DATABASE_AUTH_TOKEN="AUTH_TOKEN_ANDA"
```

### Mendapatkan Credentials

1. **Sign up di Turso**: https://turso.tech
2. **Create Organization & Database**:
   - Login ke Turso dashboard
   - Buat database baru (misal: `megateknik-db`)
   - Turso akan generate credentials secara otomatis
3. **Copy Connection String**:
   - Dari dashboard, copy string yang format: `libsql://[database].turso.io`
   - Copy juga `AUTH_TOKEN` (akan ada di dashboard)

### Format Database URL

```
libsql://database-name-YOUR_ACCOUNT.turso.io?authToken=AUTH_TOKEN_ANDA
```

**Contoh:**

```
libsql://megateknik-db-adebugs.turso.io?authToken=eyJhbGciOiJFZENTQSIsInR5cCI6IkpXVCJ9...
```

## 3. Push Schema ke Turso

Setelah environment variables sudah diset:

```bash
npx prisma db push
```

Atau pakai script yang sudah ada:

```bash
pnpm db:push
```

## 4. Vercel Deployment Setup

### Add Environment Variables di Vercel

1. Login ke **Vercel Dashboard** → Pilih Project
2. Go to **Settings** → **Environment Variables**
3. Tambahkan dua variables:

| Variable Name         | Value                                                                    | Scope                            |
| --------------------- | ------------------------------------------------------------------------ | -------------------------------- |
| `DATABASE_URL`        | `libsql://database-name-YOUR_ACCOUNT.turso.io?authToken=AUTH_TOKEN_ANDA` | Production, Preview, Development |
| `DATABASE_AUTH_TOKEN` | `AUTH_TOKEN_ANDA`                                                        | Production, Preview, Development |

### Secure Token Handling

- **JANGAN** commit `.env.local` ke Git (sudah di `.gitignore`)
- **JANGAN** hardcode token di kode
- Turso tokens di Vercel otomatis encrypt di Vercel
- Untuk development, pakai `.env.local` lokal

### Optional: Create Read-Only Token (Recommended)

Turso support read-only tokens untuk extra security:

1. Di Turso dashboard, create new API token dengan read-only permission
2. Gunakan token ini untuk API/server endpoints yang hanya read

## 5. Prisma Setup Files

- **Schema**: `prisma/schema.prisma` - sudah updated ke Turso provider
- **Tools**:
  - `pnpm db:push` - Push schema ke Turso
  - `pnpm db:studio` - Buka Prisma Studio (visual DB manager)
  - `pnpm db:reset` - Reset database (hati-hati: delete semua data)

## 6. Troubleshooting

### Error: "Invalid authentication token"

- Check DATABASE_AUTH_TOKEN di `.env.local`
- Pastikan tidak ada extra spaces
- Regenerate token di Turso dashboard jika perlu

### Error: "Cannot connect to database"

- Verifikasi DATABASE_URL format sudah benar
- Check internet connection
- Pastikan database sudah active di Turso dashboard

### Schema Push Gagal

- Jalankan `pnpm db:push` dengan flag `--force-reset` jika perlu (akan delete existing data)
- Check struktur schema.prisma untuk compatibility issues

## 7. API Endpoints Notes

Server API di `server/api/` sudah ready untuk Turso, tidak perlu changes khusus karena Prisma handle connection pooling otomatis.

Database URL dan token akan di-resolve otomatis dari environment variables saat deploy ke Vercel.

---

**Next Steps:**

1. Setup akun Turso jika belum ada
2. Create database dan dapatkan credentials
3. Update `.env.local` dengan actual credentials
4. Run `pnpm install && pnpm db:push`
5. Test dengan `pnpm dev`
6. Saat siap deploy, add environment variables ke Vercel
