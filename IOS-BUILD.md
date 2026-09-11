# Build iOS — Mega Elektronik POS

Aplikasi web Mega Elektronik adalah **Nuxt full-stack** (API + login hidup di
server Nitro dengan Prisma/Turso). Server Node **tidak bisa berjalan di dalam
iPhone**, jadi versi iOS-nya dibuat sebagai **aplikasi wrapper Capacitor**:
WebView memuat langsung web Mega Elektronik yang sudah berjalan (online atau
LAN toko), lengkap dengan icon, splash, dan nama aplikasi sendiri.

## Konfigurasi URL server (WAJIB)

Aplikasi perlu tahu alamat web-nya. Isi **GitHub Variable**:

```
Settings → Secrets and variables → Actions → Variables → New repository variable
Name : CAP_SERVER_URL
Value: https://alamat-web-anda          (contoh Vercel)
       atau http://192.168.1.10:3000    (server LAN toko)
```

Nilai default di `capacitor.config.ts` adalah placeholder — tanpa variable ini,
aplikasi akan menampilkan halaman fallback, bukan POS-nya.

- Server **LAN http://** didukung (ATS exception sudah ditambahkan di Info.plist).
- Setelah mengubah variable, jalankan ulang workflow (tab Actions → Build iOS
  IPA → Run workflow) untuk menghasilkan .ipa dengan URL baru.

## Build via GitHub Actions (tanpa Mac)

1. Push ke `main` (atau jalankan manual: Actions → Build iOS IPA → Run workflow).
2. Hasil: artifact **Mega-Elektronik-POS-iOS-unsigned-IPA** (berlaku 30 hari).
3. Pasang ke iPhone:
   - Gratis: sign pakai **Sideloadly** / **AltStore** + Apple ID biasa (7 hari).
   - Resmi: Apple Developer $99/tahun → TestFlight / App Store.

## Build manual di Mac

```bash
bun install
CAP_SERVER_URL="https://alamat-web-anda" npx cap sync ios
open ios/App/App.xcodeproj   # pilih team signing → Run
```

## Struktur teknis

| Bagian | Lokasi |
|---|---|
| Konfigurasi Capacitor (URL server) | `capacitor.config.ts` |
| Halaman fallback bila URL kosong | `www/index.html` |
| Project Xcode | `ios/App/App.xcodeproj` |
| Shared scheme (dipakai CI) | `ios/App/App.xcodeproj/xcshareddata/xcschemes/App.xcscheme` |
| App icon & splash (brand oranye) | `ios/App/App/Assets.xcassets/` |
| Izin akses server http:// LAN | `ios/App/App/Info.plist` (NSAppTransportSecurity) |

## Catatan

- Mencetak struk: Web Bluetooth tidak tersedia di WebView iOS. Gunakan jalur
  **Thermer** (aplikasi iOS pihak ketiga, URL scheme `thermer://`) yang sudah
  didukung UI web-nya, atau cetak dari web di perangkat lain.
- Autentikasi & data tetap berjalan di server — cookie login dipakai normal
  karena aplikasi memuat domain server yang sama.
- Berbeda dengan *Program Mega Tehnik* (React + data lokal + printer native),
  di sini tidak ada plugin native tambahan — semuanya dimuat dari web.
