/**
 * Idempotency key untuk submit yang bisa dobel-klik / retry.
 *
 * Key dibuat STABLE per "logical submit" (dipakai ulang saat submit ulang
 * dengan form yang sama), dan HANYA diganti setelah submit sukses atau
 * form dibuat ulang. Dikirim via header `x-idempotency-key`, dan server
 * memainkan ulang response submit pertama jika key sama muncul lagi.
 */

const keys = new Map<string, string>();

function generateKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/** Ambil key stable untuk scope tertentu (generate bila belum ada). */
export function getIdempotencyKey(scope: string): string {
  const existing = keys.get(scope);
  if (existing) return existing;
  const fresh = generateKey();
  keys.set(scope, fresh);
  return fresh;
}

/** Key baru untuk scope — dipanggil setelah submit sukses / form dibuka ulang. */
export function renewIdempotencyKey(scope: string): string {
  const fresh = generateKey();
  keys.set(scope, fresh);
  return fresh;
}

/** Header siap pakai untuk $fetch. */
export function idempotencyHeaders(scope: string): Record<string, string> {
  return { "x-idempotency-key": getIdempotencyKey(scope) };
}
