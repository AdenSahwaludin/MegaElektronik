// Daftar sub-kategori "Jenis" per Quick Category.
// Dipakai bareng oleh POS Biasa (index.vue) & Tampilan Baru (pos-new.vue)
// agar perilaku filter konsisten di kedua tampilan.

export const CATEGORY_JENIS_MAP: Record<string, string[]> = {
  'kipas': ['Dinding', 'Berdiri', 'Meja', '10"', '12"', '16"', '18"'],
  'kompor': ['1 Tungku', '2 Tungku', 'Cor'],
  'rice cooker': ['0,6 L', '1 L', '1,2 L', '1,8 L', '2 L'],
  'blender': ['Kaca', 'Plastik', '2 Gelas', '3 Gelas'],
  'ac': ['0,5 PK', '1 PK', '1,5 PK', '2 PK'],
  'mesin cuci': ['7 KG', '8 KG', '9 KG', '10 KG'],
  'kulkas': ['1 Pintu', '2 Pintu']
}

export const DEFAULT_QUICK_CATEGORIES = [
  'AC', 'Blender', 'Dispenser', 'Exhaust', 'Kipas',
  'Kompor', 'Kulkas', 'Mesin cuci', 'Rice cooker', 'Setrika',
  'Speaker', 'Teko'
];

export function getCategoryIcon(catName: string): string {
  const lower = (catName || '').toLowerCase();
  if (lower.includes('kipas')) return 'lucide:fan';
  if (lower.includes('kompor')) return 'lucide:flame';
  if (lower.includes('rice') || lower.includes('magic')) return 'lucide:cooking-pot';
  if (lower.includes('blender')) return 'lucide:plug-2';
  if (lower.includes('ac') || lower.includes('air conditioner')) return 'lucide:snowflake';
  if (lower.includes('mesin cuci') || lower.includes('cuci')) return 'lucide:washing-machine';
  if (lower.includes('kulkas') || lower.includes('lemari es')) return 'lucide:refrigerator';
  if (lower.includes('setrika') || lower.includes('iron')) return 'lucide:shirt';
  if (lower.includes('dispenser')) return 'lucide:droplets';
  if (lower.includes('teko') || lower.includes('kettle')) return 'lucide:coffee';
  if (lower.includes('exhaust') || lower.includes('ventilating')) return 'lucide:wind';
  if (lower.includes('pompa')) return 'lucide:gauge';
  if (lower.includes('tv') || lower.includes('televisi')) return 'lucide:tv';
  if (lower.includes('speaker') || lower.includes('audio') || lower.includes('sound')) return 'lucide:speaker';
  return 'lucide:tag';
}

export function normalizeCategoryKey(category: string): string {
  return (category || '').trim().toLowerCase()
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Cek apakah sebuah produk termasuk kategori quick-category tertentu.
 * Pencocokan dilakukan terhadap gabungan name + brand + model + otherName (case-insensitive).
 *
 * Kategori pendek (<= 3 huruf, mis. "AC") wajib cocok sebagai kata yang utuh
 * (word-boundary), supaya produk seperti "Blender Kaca" atau "Speaker Active"
 * tidak ikut kepilih hanya karena mengandung huruf "ac".
 */
export function matchesCategory(
  product: { name?: string | null, brand?: string | null, model?: string | null, otherName?: string | null },
  category: string
): boolean {
  const cat = (category || '').trim().toLowerCase()
  if (!cat) return true
  const text = `${product?.name || ''} ${product?.brand || ''} ${product?.model || ''} ${product?.otherName || ''}`.toLowerCase()
  if (cat.length <= 3) {
    const pattern = cat.split(/\s+/).map(escapeRegExp).join('\\s+')
    return new RegExp(`(^|[^a-z0-9])${pattern}([^a-z0-9]|$)`).test(text)
  }
  return text.includes(cat)
}

export function getJenisList(category: string): string[] {
  return CATEGORY_JENIS_MAP[normalizeCategoryKey(category)] || []
}

function buildSearchText(product: {
  name?: string | null
  brand?: string | null
  model?: string | null
  otherName?: string | null
}): { raw: string, norm: string } {
  const raw = `${product?.name || ''} ${product?.brand || ''} ${product?.model || ''} ${product?.otherName || ''}`.toLowerCase()
  // Normalisasi koma desimal Indonesia ke titik agar "0,6" == "0.6"
  const norm = raw.replace(/,/g, '.')
  return { raw, norm }
}

function extractRiceCapacities(normText: string): number[] {
  const out: number[] = []
  const re = /(\d+(?:\.\d+)?)\s*(liter|litre|ltr|\bl\b)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(normText)) !== null) {
    const v = parseFloat(m[1] ?? '')
    if (!Number.isNaN(v)) out.push(v)
  }
  return out
}

/**
 * Cek apakah sebuah produk cocok dengan pilihan "Jenis" pada kategori tertentu.
 * Pencocokan dilakukan terhadap gabungan name + brand + model + otherName (case-insensitive).
 */
export function matchesJenis(
  product: { name?: string | null, brand?: string | null, model?: string | null, otherName?: string | null },
  category: string,
  jenis: string
): boolean {
  if (!jenis) return true
  const cat = normalizeCategoryKey(category)
  const j = (jenis || '').trim().toLowerCase()
  const { raw, norm } = buildSearchText(product)

  // ── Kipas ──
  if (cat === 'kipas') {
    if (j === 'dinding') return raw.includes('dinding')
    if (j === 'berdiri') return raw.includes('berdiri')
    if (j === 'meja') return raw.includes('meja')
    // Ukuran: '10"', '12"', '16"', '18"' — produk tertulis "10 Inci/Inchi", '10"', dsb.
    const sizeMatch = j.match(/(\d+)/)
    if (sizeMatch) {
      const size = sizeMatch[1]
      const hasSize = new RegExp(`\\b${size}\\b`).test(norm)
      if (!hasSize) return false
      const hasUnit = /inci|inchi|\binc\b|"/.test(raw)
      return hasUnit
    }
    return raw.includes(j)
  }

  // ── Kompor ──
  if (cat === 'kompor') {
    if (j.includes('1') && j.includes('tungku')) return /\b1\s*-?\s*tungku\b/.test(raw)
    if (j.includes('2') && j.includes('tungku')) return /\b2\s*-?\s*tungku\b/.test(raw)
    if (j === 'cor') return /\bcor\b/.test(raw)
    return raw.includes(j)
  }

  // ── Rice cooker ──
  if (cat === 'rice cooker') {
    const caps = extractRiceCapacities(norm)
    // Fallback: kalau tidak ada satuan liter tapi angka kapasitas ada (mis. "MCM-512"? jangan),
    // hanya andalkan angka+liter agar presisi. Jadi tanpa liter => tidak cocok.
    if (j.includes('0') && j.includes('6')) return caps.some(v => Math.abs(v - 0.6) < 0.001)
    if (j.includes('1') && j.includes('2')) return caps.some(v => Math.abs(v - 1.2) < 0.001)
    if (j.includes('1') && j.includes('8')) return caps.some(v => Math.abs(v - 1.8) < 0.001)
    // '1 L' harus persis 1.0 — jangan sampai match 1.2 / 1.8
    if (/^1\s*l$/.test(j)) return caps.some(v => Math.abs(v - 1) < 0.001)
    // '2 L' harus persis 2.0 — jangan sampai match 1.2
    if (/^2\s*l$/.test(j)) return caps.some(v => Math.abs(v - 2) < 0.001)
    return false
  }

  // ── Blender ──
  if (cat === 'blender') {
    if (j === 'kaca') return raw.includes('kaca') || raw.includes('glass')
    if (j === 'plastik') return raw.includes('plastik') || raw.includes('plastic') || /\bpf\b/.test(raw)
    if (j.includes('2') && j.includes('gelas')) return /\b2\s*gelas\b/.test(raw) || /\bgelas\s*2\b/.test(raw)
    if (j.includes('3') && j.includes('gelas')) return /\b3\s*gelas\b/.test(raw) || /\bgelas\s*3\b/.test(raw)
    return raw.includes(j)
  }

  // ── AC ──
  if (cat === 'ac') {
    if (j.includes('0') && j.includes('5')) return /\b0\.5\b/.test(norm)
    if (j.includes('1') && j.includes('5')) return /\b1\.5\b/.test(norm)
    if (/^1\s*pk$/.test(j)) {
      // Jangan sampai 1 PK match 1.5 PK / 0.5 PK
      if (/\b1\.5\b/.test(norm) || /\b0\.5\b/.test(norm)) {
        // Kalau teks mengandung 1.5, bukan 1 PK. Tapi kalau mengandung keduanya? anggap cocok hanya jika ada "1 pk" eksplisit.
        if (!/\b1\s*pk\b/.test(norm)) return false
        // Jika ada "1 pk" eksplisit plus "1.5", tetap anggap cocok (produk aneh) — prioritaskan eksplisit.
        return true
      }
      if (norm.includes('pk')) return /\b1\s*pk\b/.test(norm)
      // Tanpa tulisan PK (mis. varian lama): angka 1 polos rentan false-positive,
      // tapi dalam konteks kategori AC masih berguna. Kecualikan angka lain.
      return /\b1(\.0)?\b/.test(norm) && !/\b0\.5\b/.test(norm) && !/\b1\.5\b/.test(norm) && !/\b2(\.0)?\b/.test(norm)
    }
    if (/^2\s*pk$/.test(j)) {
      if (norm.includes('pk')) return /\b2\s*pk\b/.test(norm)
      return /\b2(\.0)?\b/.test(norm) && !/\b1\.2\b/.test(norm) && !/\b1\.5\b/.test(norm) && !/\b0\.5\b/.test(norm)
    }
    return raw.includes(j)
  }

  // ── Mesin cuci ──
  if (cat === 'mesin cuci') {
    const kgMatch = j.match(/(\d+)/)
    if (kgMatch) return new RegExp(`\\b${kgMatch[1]}\\s*kg\\b`).test(raw)
    return raw.includes(j)
  }

  // ── Kulkas ──
  if (cat === 'kulkas') {
    if (j.includes('1') && j.includes('pintu')) return /\b1\s*pintu\b/.test(raw)
    if (j.includes('2') && j.includes('pintu')) return /\b2\s*pintu\b/.test(raw)
    return raw.includes(j)
  }

  // Kategori lain belum punya Jenis — anggap selalu cocok.
  return true
}
