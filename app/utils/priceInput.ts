import { nextTick } from "vue";

/**
 * Util input harga ter-format (pemisah ribuan gaya id-ID):
 *
 * 1. onPriceInput  → kursor TIDAK lompat ke belakang/akhir saat mengedit
 *                    di tengah angka; posisinya dipertahankan di digit
 *                    yang sedang diedit.
 * 2. getSmartStep  → tombol -/+ harga unit yang "pintar": langkah
 *                    menyesuaikan besaran harga.
 * 3. formatStepRb  → label langkah, mis. "5rb" / "10rb" / "50rb".
 */

/** Parser angka dari teks ter-format "4.600.000" → 460000 */
export function parseDisplayNumber(raw: string): number {
  const cleaned = (raw || "").replace(/\D/g, "");
  return parseInt(cleaned, 10) || 0;
}

/**
 * Input harga ter-format yang aman kursor.
 * Pemakaian: @input="onPriceInput($event, v => newProduct.buyPrice = v)"
 */
export function onPriceInput(event: Event, apply: (value: number) => void): void {
  const input = event.target as HTMLInputElement;
  if (!input) return;

  const raw = input.value;
  const caret = input.selectionStart ?? raw.length;

  // Jumlah digit sebelum posisi kursor (tanda titik diabaikan)
  let digitsBefore = 0;
  for (let i = 0; i < caret && i < raw.length; i++) {
    if (raw[i] >= "0" && raw[i] <= "9") digitsBefore++;
  }

  apply(parseDisplayNumber(raw));

  // Setelah Vue merender nilai ter-format ulang, taruh kursor kembali
  // setelah digit ke-`digitsBefore` — jadi tetap di tempat user mengedit.
  nextTick(() => {
    if (document.activeElement !== input) return;
    const newValue = input.value;
    if (newValue === raw) return;

    let seen = 0;
    let pos = newValue.length;
    for (let i = 0; i < newValue.length; i++) {
      if (newValue[i] >= "0" && newValue[i] <= "9") {
        seen++;
        if (seen >= digitsBefore) {
          pos = i + 1;
          break;
        }
      }
    }
    input.setSelectionRange(pos, pos);
  });
}

/**
 * Step smart tombol -/+ harga unit di keranjang:
 * < 100rb → ±5.000 | 100rb s/d < 1jt → ±10.000 | ≥ 1jt → ±50.000
 */
export function getSmartStep(price: number): number {
  const p = Math.max(0, Number(price) || 0);
  if (p < 100_000) return 5_000;
  if (p < 1_000_000) return 10_000;
  return 50_000;
}

/** Label langkah untuk UI, mis. 5000 → "5rb" */
export function formatStepRb(step: number): string {
  return `${Math.round(step / 1000)}rb`;
}
