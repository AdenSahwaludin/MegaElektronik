import type { H3Event } from "h3";

/**
 * Idempotency untuk endpoint yang "bisa ganda" (tombol simpan / bayar).
 *
 * Cara kerja:
 * - Frontend mengirim `x-idempotency-key` (atau `_idempotencyKey` di body).
 *   Key ini STABLE per form/klik submit (bukan per request), dan hanya
 *   diganti setelah submit sukses atau form dibuat ulang.
 * - Server menyimpan response sukses berdasarkan key + scope.
 * - Kalau ada submit ulang dengan key yang sama (klik dua kali, retry, dsb),
 *   response pertama diputar ulang — data TIDAK di-insert kedua kali.
 *
 * Catatan: penyimpanan in-memory (per proses server). Untuk skenario
 * klik-duplikat / retry ini sudah cukup; TTL default 10 menit.
 */

type StoredEntry = {
  ts: number;
  data: any;
};

const store = new Map<string, StoredEntry>();

const TTL_MS = 10 * 60 * 1000; // response diingat 10 menit
const MAX_ENTRIES = 1000;

function pruneStore() {
  if (store.size === 0) return;
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now - entry.ts > TTL_MS) store.delete(key);
  }
  if (store.size > MAX_ENTRIES) {
    // Buang entri paling lama sampai ukuran aman
    const excess = store.size - MAX_ENTRIES;
    const keys = Array.from(store.keys()).slice(0, excess);
    keys.forEach((k) => store.delete(k));
  }
}

/**
 * Ambil idempotency key dari request:
 * 1. Header `x-idempotency-key`
 * 2. Body `_idempotencyKey` (fallback, mis. saat header tak terkirim)
 */
export function readIdempotencyKey(event: H3Event, body?: any): string | null {
  try {
    const headerVal = event.node?.req?.headers?.["x-idempotency-key"];
    const fromHeader = Array.isArray(headerVal) ? headerVal[0] : headerVal;
    if (fromHeader && typeof fromHeader === "string" && fromHeader.trim()) {
      return fromHeader.trim().slice(0, 128);
    }
  } catch {
    // header tidak tersedia — lanjut cek body
  }

  const bodyKey = body?.idempotencyKey ?? body?._idempotencyKey;
  if (typeof bodyKey === "string" && bodyKey.trim()) {
    return bodyKey.trim().slice(0, 128);
  }
  return null;
}

/**
 * Jalankan handler dengan proteksi idempotency.
 *
 * - Tanpa key  → handler dijalankan biasa.
 * - Dengan key → submit pertama dijalankan & response disimpan;
 *                submit ulang dengan key sama mengembalikan response itu
 *                tanpa menulis ulang ke database.
 */
export async function withIdempotency(
  event: H3Event,
  body: any | undefined,
  scope: string,
  handler: () => Promise<any>,
): Promise<any> {
  const key = readIdempotencyKey(event, body);

  // Tanpa key: perilaku lama (tidak ada proteksi tambahan)
  if (!key) {
    return await handler();
  }

  pruneStore();

  const storageKey = `${scope}:${key}`;
  const existing = store.get(storageKey);
  if (existing) {
    // Replay response submission pertama
    return existing.data;
  }

  const data = await handler();

  // Hanya simpan kalau handler berhasil (tidak throw)
  try {
    store.set(storageKey, { ts: Date.now(), data });
  } catch {
    // Gagal menyimpan tidak boleh membuat request gagal
  }

  return data;
}
