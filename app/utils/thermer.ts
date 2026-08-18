/**
 * Thermer Print Entry Schema & Utility for iOS Thermer URL Scheme (thermer://)
 * Reference documentation: https://github.com/tussharmate/ios-thermer-custom-schema
 */

export interface ThermerPrintEntry {
  /**
   * Entry type:
   * 0 = Text Entry
   * 1 = Image Entry
   * 2 = Barcode Entry
   * 3 = QR Entry
   */
  type: number;

  /** Text content for type 0 */
  content?: string;

  /** 0 = Normal, 1 = Bold */
  bold?: number;

  /** 0 = Left, 1 = Center, 2 = Right */
  align?: number;

  /**
   * Text format:
   * 0 = Normal
   * 1 = Double Height
   * 2 = Double Height + Width
   * 3 = Double Width
   * 4 = Small
   */
  format?: number;

  /** Image URL for type 1 */
  path?: string;

  /** Base64 image string for type 1 */
  base64Image?: string;

  /** Value for barcode (type 2) or QR (type 3) */
  value?: string;

  /** Barcode height (10 to 80) for type 2 */
  height?: number;

  /** QR code size in mm (min 40) for type 3 */
  size?: number;
}

export type ThermerEntriesMap = Record<string, ThermerPrintEntry>;

/**
 * App Store URL for Thermer app on iOS
 */
export const THERMER_APP_STORE_URL = "https://apps.apple.com/app/id1477376905";

/**
 * Detect if current device is iPhone, iPad, or iOS Safari/Web
 */
export function isIOSDevice(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera || "";
  const isIos = /iPad|iPhone|iPod/.test(ua);
  const isMacWithTouch = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return isIos || isMacWithTouch;
}

/**
 * Format number into Indonesian Rupiah (IDR)
 */
export function formatRupiah(amount: number): string {
  return "Rp " + new Intl.NumberFormat("id-ID").format(Math.round(amount || 0));
}

/**
 * Format two columns of text aligned to a target character width (default 32 for 58mm thermal printers)
 */
export function formatTwoColumns(left: string, right: string, width = 32): string {
  const spaceNeeded = width - left.length - right.length;
  if (spaceNeeded > 0) {
    return left + " ".repeat(spaceNeeded) + right;
  }
  return `${left} ${right}`;
}

/**
 * Format date and time for receipt
 */
export function formatReceiptDateTime(dateStr?: string | Date): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const dateFormatted = d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const timeFormatted = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateFormatted} ${timeFormatted}`;
}

/**
 * Build Thermer Print Entries for a given transaction with strict sequential indexing (0, 1, 2, ...).
 * Follows the standard receipt layout optimized for 58mm Thermer MP-58M Pro:
 *  1. Nama Toko
 *  2. Subtitle / Header
 *  3. Tanggal & No Transaksi
 *  4. Garis Pembatas
 *  5. Daftar Item (Nama Produk, baris Qty x Harga & Subtotal 32 kolom)
 *  6. Garis Pembatas
 *  7. Total Pembayaran
 *  8. Jumlah Bayar & Kembalian
 *  9. Garis Penutup
 * 10. Footer / Ucapan
 * 11. Feed 3 baris di paling bawah
 */
export function generateThermerReceiptEntries(transaction: any): ThermerEntriesMap {
  const list: ThermerPrintEntry[] = [];

  const addText = (
    content: string,
    bold: number = 0,
    align: number = 0,
    format: number = 0
  ) => {
    list.push({
      type: 0,
      content,
      bold,
      align,
      format,
    });
  };

  // 1. NAMA TOKO (Double Height + Width, Bold, Center)
  // "MEGA ELEKTRONIK" (15 chars) fits perfectly in 16-char double width
  addText("MEGA ELEKTRONIK", 1, 1, 2);

  // 2. SUBTITLE / HEADER (Normal, Center)
  addText("Nota Pembayaran Toko", 0, 1, 0);

  // 3. TANGGAL (Normal, Center)
  const dateFormatted = formatReceiptDateTime(transaction?.createdAt || new Date());
  addText(dateFormatted, 0, 1, 0);

  // 4. GARIS PEMBATAS (30 Karakter aman)
  addText("------------------------------", 0, 0, 0);

  // 5. DAFTAR ITEM (Digabung 1 entry per item dengan \n untuk mencegah BLE packet burst)
  const items = Array.isArray(transaction?.transactionItems) ? transaction.transactionItems : [];
  for (const it of items) {
    const rawName = it.product?.name || it.productName || "Produk";
    const brand = (it.product?.brand || it.brand || "").trim();
    const model = (it.product?.model || it.model || "").trim();

    let displayName = rawName;
    if (
      brand &&
      brand !== "-" &&
      brand.toLowerCase() !== "no brand" &&
      !displayName.toLowerCase().includes(brand.toLowerCase())
    ) {
      displayName += ` ${brand}`;
    }
    if (
      model &&
      model !== "-" &&
      model.toLowerCase() !== "standar" &&
      model.toLowerCase() !== "standard" &&
      !displayName.toLowerCase().includes(model.toLowerCase())
    ) {
      displayName += ` ${model}`;
    }
    if (it.stockType === "service") {
      displayName += " (Service)";
    }

    const qty = it.quantity || 1;
    const unitPrice = it.soldPrice || 0;
    const subtotal = it.subtotal || unitPrice * qty;

    const leftPart = ` ${qty} x ${formatRupiah(unitPrice)}`;
    const rightPart = formatRupiah(subtotal);
    const itemLine = formatTwoColumns(leftPart, rightPart, 30);

    // Kirim Nama + Harga dalam 1 entry menggunakan \n agar tidak membanjiri buffer Bluetooth
    addText(`${displayName}\n${itemLine}`, 0, 0, 0);
  }

  // 6. GARIS PEMBATAS
  addText("------------------------------", 0, 0, 0);

  // 7. TOTAL PEMBAYARAN (30 Karakter)
  const totalAmount = transaction?.totalAmount || 0;
  const totalLine = formatTwoColumns("TOTAL", formatRupiah(totalAmount), 30);
  addText(totalLine, 1, 0, 0);

  // 8. JUMLAH BAYAR & KEMBALIAN (Hanya jika ada data pembayaran)
  if (transaction?.paidAmount != null && Number(transaction.paidAmount) > 0) {
    const paidAmount = Number(transaction.paidAmount);
    const paidLine = formatTwoColumns("JUMLAH BAYAR", formatRupiah(paidAmount), 30);
    addText(paidLine, 0, 0, 0);

    const changeVal = paidAmount - totalAmount;
    const changeLine = formatTwoColumns("KEMBALIAN", formatRupiah(Math.max(0, changeVal)), 30);
    addText(changeLine, 1, 0, 0);
  }

  // 9. GARIS PENUTUP
  addText("==============================", 0, 0, 0);

  // 10. FOOTER / UCAPAN (Center)
  addText("Terima Kasih Atas Kunjungan Anda!", 1, 1, 0);
  addText("Barang yang sudah dibeli", 0, 1, 0);
  addText("tidak dapat ditukar / dikembalikan.", 0, 1, 0);

  // 11. FEED DI PALING BAWAH
  addText("", 0, 0, 0);
  addText("", 0, 0, 0);

  // Convert array to sequential integer dictionary with 3-digit zero-padding:
  // e.g. { "000": entry0, "001": entry1, ..., "018": entry18 }
  // This prevents iOS string dictionary sorting from placing "10" before "2".
  const entriesMap: ThermerEntriesMap = {};
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (item) {
      const key = i.toString().padStart(3, "0");
      entriesMap[key] = item;
    }
  }

  return entriesMap;
}

/**
 * Generate full thermer:// URL for the transaction
 */
export function buildThermerUrl(transaction: any): string {
  const entries = generateThermerReceiptEntries(transaction);
  const jsonString = JSON.stringify(entries);
  const encodedJson = encodeURIComponent(jsonString);
  return `thermer://?data=${encodedJson}`;
}

// Module-level locks to prevent double requests and Bluetooth connection conflicts
let activePrintTimeout: ReturnType<typeof setTimeout> | null = null;
let activeCleanupListeners: (() => void) | null = null;
let lastPrintTimestamp = 0;

/**
 * Safely attempt to open Thermer custom scheme URL on iOS.
 * Includes throttling and single-request locking to prevent Bluetooth connection loops.
 */
export function openThermerApp(
  transaction: any,
  options?: {
    onFallback?: () => void;
    timeoutMs?: number;
  }
): boolean {
  if (typeof window === "undefined") return false;

  const now = Date.now();
  // Enforce 2s cooldown to prevent multiple rapid triggers that crash/lock Bluetooth socket in Thermer
  if (now - lastPrintTimestamp < 2000) {
    return false;
  }
  lastPrintTimestamp = now;

  // Clean up any pending timer and listeners from prior calls
  if (activePrintTimeout) {
    clearTimeout(activePrintTimeout);
    activePrintTimeout = null;
  }
  if (activeCleanupListeners) {
    activeCleanupListeners();
    activeCleanupListeners = null;
  }

  const url = buildThermerUrl(transaction);
  const timeoutMs = options?.timeoutMs ?? 2500;
  let appOpened = false;

  const handleAppOpened = () => {
    appOpened = true;
    if (activePrintTimeout) {
      clearTimeout(activePrintTimeout);
      activePrintTimeout = null;
    }
  };

  const onVisibilityChange = () => {
    if (document.hidden) {
      handleAppOpened();
    }
  };

  const onBlur = () => {
    handleAppOpened();
  };

  const onPageHide = () => {
    handleAppOpened();
  };

  window.addEventListener("visibilitychange", onVisibilityChange, { passive: true });
  window.addEventListener("blur", onBlur, { passive: true });
  window.addEventListener("pagehide", onPageHide, { passive: true });

  activeCleanupListeners = () => {
    window.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("blur", onBlur);
    window.removeEventListener("pagehide", onPageHide);
  };

  // Open URL scheme cleanly
  window.location.href = url;

  // Fallback check after timeout (only triggers if app did not open)
  activePrintTimeout = setTimeout(() => {
    if (activeCleanupListeners) {
      activeCleanupListeners();
      activeCleanupListeners = null;
    }
    activePrintTimeout = null;

    if (!appOpened && !document.hidden) {
      if (options?.onFallback) {
        options.onFallback();
      }
    }
  }, timeoutMs);

  return true;
}
