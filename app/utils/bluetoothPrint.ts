/**
 * ESC/POS Bluetooth Print Utility for 80mm Thermal Printer
 * Best practice: Direct ESC/POS commands via Web Bluetooth API
 * Bypasses window.print() entirely — no browser headers/footers, no clipping.
 *
 * POS-80 specs:
 *  - Paper width: 80mm
 *  - Printable width: ~72mm (576 dots at 203 DPI)
 *  - Character width: 48 chars (Font A) or 64 chars (Font B) per line
 */

// ─── ESC/POS Command Constants ───────────────────────────────────────
const ESC = 0x1b;
const GS = 0x1d;

const CMD = {
  // Initialize printer
  INIT: [ESC, 0x40],

  // Text alignment: 0=left, 1=center, 2=right
  ALIGN_LEFT: [ESC, 0x61, 0x00],
  ALIGN_CENTER: [ESC, 0x61, 0x01],
  ALIGN_RIGHT: [ESC, 0x61, 0x02],

  // Emphasis (bold)
  BOLD_ON: [ESC, 0x45, 0x01],
  BOLD_OFF: [ESC, 0x45, 0x00],

  // Double height+width
  DOUBLE_ON: [GS, 0x21, 0x11],
  // Double height only
  DOUBLE_HEIGHT: [GS, 0x21, 0x01],
  // Normal size
  SIZE_NORMAL: [GS, 0x21, 0x00],

  // Underline
  UNDERLINE_ON: [ESC, 0x2d, 0x01],
  UNDERLINE_OFF: [ESC, 0x2d, 0x00],

  // Line feed
  LF: [0x0a],

  // Feed N lines
  FEED_3: [ESC, 0x64, 0x03],
  FEED_5: [ESC, 0x64, 0x05],

  // Partial cut (if supported)
  CUT: [GS, 0x56, 0x01],
};

// ─── Text Encoder ────────────────────────────────────────────────────
const textEncoder = new TextEncoder();

function encodeText(text: string): number[] {
  return Array.from(textEncoder.encode(text));
}

// ─── Formatting Helpers ──────────────────────────────────────────────
const LINE_WIDTH = 48; // 48 chars for 80mm Font A

function formatRupiah(amount: number): string {
  return "Rp " + new Intl.NumberFormat("id-ID").format(Math.round(amount || 0));
}

function formatTwoColumns(left: string, right: string, width = LINE_WIDTH): string {
  const spaces = width - left.length - right.length;
  if (spaces > 0) {
    return left + " ".repeat(spaces) + right;
  }
  return left + " " + right;
}

function dashedLine(char = "-", width = LINE_WIDTH): string {
  return char.repeat(width);
}

function formatReceiptDate(dateStr?: string | Date): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const date = d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} ${time}`;
}

// ─── Logo Raster Helper ──────────────────────────────────────────────
// Logo dipakai sebagai header struk (dicetak di tengah atas).
// Konversi PNG → 1-bit bitmap ESC/POS (GS v 0) lewat canvas.
const LOGO_URL =
  typeof window !== "undefined" ? window.location.origin + "/logo.png" : "/logo.png";

// Lebar cetak penuh 80mm = 576 dot (72 byte). Logo dibungkus padding putih
// supaya benar-benar ke tengah (posisi raster tidak selalu ikut ESC a).
const FULL_WIDTH_BYTES = 72;

interface LogoRaster {
  widthBytes: number;
  height: number;
  rows: Uint8Array;
}

export async function loadLogoRaster(): Promise<LogoRaster | null> {
  try {
    if (typeof window === "undefined") return null;
    const img = new Image();
    img.src = LOGO_URL;
    await img.decode();

    const targetWidth = 144; // ~18mm pada 203 DPI — proporsional utk 80mm
    const targetHeight = Math.max(
      1,
      Math.round((img.naturalHeight / img.naturalWidth) * targetWidth)
    );

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Latar putih (logo PNG bisa punya background transparan)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const pixelData = ctx.getImageData(0, 0, targetWidth, targetHeight).data;
    const widthBytes = Math.ceil(targetWidth / 8);
    const rows = new Uint8Array(widthBytes * targetHeight);

    for (let y = 0; y < targetHeight; y++) {
      for (let x = 0; x < targetWidth; x++) {
        const i = (y * targetWidth + x) * 4;
        // Piksel transparan dianggap putih (tidak dicetak)
        const alpha = pixelData[i + 3] ?? 255;
        if (alpha < 128) continue;
        const lum =
          0.299 * (pixelData[i] ?? 255) +
          0.587 * (pixelData[i + 1] ?? 255) +
          0.114 * (pixelData[i + 2] ?? 255);
        if (lum < 170) {
          const byteIdx = y * widthBytes + (x >> 3);
          rows[byteIdx] = (rows[byteIdx] ?? 0) | (0x80 >> (x & 7));
        }
      }
    }

    return { widthBytes, height: targetHeight, rows };
  } catch (err) {
    console.warn("Gagal memuat logo struk:", err);
    return null;
  }
}

/**
 * Bangun command GS v 0 (raster bitmap) yang sudah di-center ke lebar 576 dot.
 */
function buildLogoRasterCommand(logo: LogoRaster): number[] {
  const leftPadBytes = Math.floor((FULL_WIDTH_BYTES - logo.widthBytes) / 2);
  const rightPadBytes = FULL_WIDTH_BYTES - logo.widthBytes - leftPadBytes;

  const bytes: number[] = [
    GS, 0x76, 0x30, 0x00,
    FULL_WIDTH_BYTES & 0xff,
    (FULL_WIDTH_BYTES >> 8) & 0xff,
    logo.height & 0xff,
    (logo.height >> 8) & 0xff,
  ];

  for (let y = 0; y < logo.height; y++) {
    const rowStart = y * logo.widthBytes;
    for (let p = 0; p < leftPadBytes; p++) bytes.push(0x00);
    for (let b = 0; b < logo.widthBytes; b++) bytes.push(logo.rows[rowStart + b] || 0x00);
    for (let p = 0; p < rightPadBytes; p++) bytes.push(0x00);
  }

  bytes.push(0x0a); // LF agar teks berikutnya mulai di baris baru
  return bytes;
}

// ─── Receipt Builder ─────────────────────────────────────────────────
export function buildReceiptBytes(
  transaction: any,
  logoRaster?: LogoRaster | null
): Uint8Array {
  const bytes: number[] = [];

  const add = (...cmds: number[][]) => {
    for (const cmd of cmds) {
      bytes.push(...cmd);
    }
  };

  const text = (str: string) => {
    bytes.push(...encodeText(str));
  };

  const line = (str: string) => {
    text(str);
    add(CMD.LF);
  };

  // ── Initialize ──
  add(CMD.INIT);

  // ── Logo toko (tengah atas) — dikirim sebagai raster bitmap ──
  if (logoRaster) {
    add(buildLogoRasterCommand(logoRaster));
  }

  // ── Store Name (center, bold, double size) ──
  add(CMD.ALIGN_CENTER, CMD.BOLD_ON, CMD.DOUBLE_ON);
  line("MEGA ELEKTRONIK");
  add(CMD.SIZE_NORMAL, CMD.BOLD_OFF);

  // ── Subtitle + Alamat & WhatsApp ──
  add(CMD.ALIGN_CENTER);
  line("Nota Pembayaran Toko");
  line("Blok Gebangmampang Desa Margamulya");
  line("Kecamatan Bongas");
  line("WhatsApp : 083115603569");

  // ── Date & Transaction ID ──
  const dateStr = formatReceiptDate(transaction?.createdAt || new Date());
  line(dateStr);
  const trxId = transaction?.id ? `No: TRX-${transaction.id}` : "";
  if (trxId) line(trxId);

  // ── Separator ──
  add(CMD.ALIGN_LEFT);
  line(dashedLine("-"));

  // ── Items ──
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
      displayName += " (Svc)";
    }

    // Truncate if too long
    if (displayName.length > LINE_WIDTH) {
      displayName = displayName.substring(0, LINE_WIDTH - 1) + ".";
    }

    // Item name (bold)
    add(CMD.BOLD_ON);
    line(displayName);
    add(CMD.BOLD_OFF);

    // Qty x Price = Subtotal
    const qty = it.quantity || 1;
    const unitPrice = it.soldPrice || 0;
    const subtotal = it.subtotal || unitPrice * qty;

    const leftPart = ` ${qty}x${formatRupiah(unitPrice)}`;
    const rightPart = formatRupiah(subtotal);
    line(formatTwoColumns(leftPart, rightPart));
  }

  // ── Separator ──
  line(dashedLine("-"));

  // ── Total (bold, double height) ──
  add(CMD.BOLD_ON, CMD.DOUBLE_HEIGHT);
  const totalAmount = transaction?.totalAmount || 0;
  line(formatTwoColumns("TOTAL", formatRupiah(totalAmount)));
  add(CMD.SIZE_NORMAL, CMD.BOLD_OFF);

  // ── Paid & Change ──
  if (transaction?.paidAmount != null && Number(transaction.paidAmount) > 0) {
    const paidAmount = Number(transaction.paidAmount);
    line(formatTwoColumns("BAYAR", formatRupiah(paidAmount)));

    const changeVal = Math.max(0, paidAmount - totalAmount);
    add(CMD.BOLD_ON);
    line(formatTwoColumns("KEMBALI", formatRupiah(changeVal)));
    add(CMD.BOLD_OFF);
  }

  // ── Footer separator ──
  line(dashedLine("="));

  // ── Thank you ──
  add(CMD.ALIGN_CENTER, CMD.BOLD_ON);
  line("Terima Kasih!");
  add(CMD.BOLD_OFF);
  line("Barang yg sudah dibeli");
  line("tidak dapat ditukar/dikembalikan");

  // ── Feed and cut ──
  add(CMD.FEED_5);
  add(CMD.CUT);

  return new Uint8Array(bytes);
}

// ─── Web Bluetooth Connection ────────────────────────────────────────
// Known Bluetooth service/characteristic UUIDs for thermal printers (POS-80, VSC, Zijiang, etc.)
const PRINTER_SERVICE_UUIDS = [
  "000018f0-0000-1000-8000-00805f9b34fb", // Standard POS Printer Service
  "e7810a71-73ae-499d-8c15-faa9aef0c3f2", // Common Chinese POS BLE Service (VSC MP-58M)
  "49535343-fe7d-4ae5-8fa9-9fafd205e455", // Microchip / ISSC BLE UART
  "0000ff00-0000-1000-8000-00805f9b34fb", // Custom FF00 Serial
  "0000fee7-0000-1000-8000-00805f9b34fb", // Custom FEE7 Serial
  "0000ffe0-0000-1000-8000-00805f9b34fb", // HM-10 / CC2541 BLE UART
  "0000fff0-0000-1000-8000-00805f9b34fb", // FFF0 POS Service
];

const PRINTER_CHAR_UUIDS = [
  "00002af1-0000-1000-8000-00805f9b34fb",
  "bef8d6c9-9c21-4c9e-b632-bd58c1009f9f",
  "49535343-8841-43f4-a8d4-ecbe34729bb3",
  "0000ff02-0000-1000-8000-00805f9b34fb",
  "0000fee8-0000-1000-8000-00805f9b34fb",
  "0000ffe1-0000-1000-8000-00805f9b34fb",
  "0000fff1-0000-1000-8000-00805f9b34fb",
  "0000fff2-0000-1000-8000-00805f9b34fb",
];

interface PrinterConnection {
  device: any;
  server: any;
  characteristic: any;
}

let cachedConnection: PrinterConnection | null = null;

/**
 * Connect to Bluetooth thermal printer.
 * MUST be called from a user gesture (click event).
 */
export async function connectPrinter(): Promise<PrinterConnection> {
  if (!isWebBluetoothSupported()) {
    throw new Error(
      "Browser ini tidak mendukung Web Bluetooth. Buka di Google Chrome (Android/PC) dan pastikan Bluetooth aktif."
    );
  }

  // Reuse cached connection if still active. Tidak pakai probe write 0 byte —
  // sebagian firmware printer merespons aneh terhadap write kosong. Kalau
  // koneksi ternyata sudah basi, sendBytes gagal dan cache dibuang (lihat
  // printBluetoothReceipt) sehingga percobaan berikutnya konek fresh.
  if (cachedConnection?.server?.connected) {
    return cachedConnection;
  }
  cachedConnection = null;

  // Request Bluetooth device - accept all devices that look like printers
  const device = await (navigator as any).bluetooth.requestDevice({
    // Accept any device - thermal printers often don't advertise standard services
    acceptAllDevices: true,
    optionalServices: PRINTER_SERVICE_UUIDS,
  });

  if (!device.gatt) {
    throw new Error("Bluetooth GATT tidak tersedia di perangkat ini");
  }

  const server = await device.gatt.connect();

  // Try each known service UUID until we find one that works
  let characteristic: any = null;

  for (const serviceUuid of PRINTER_SERVICE_UUIDS) {
    try {
      const service = await server.getPrimaryService(serviceUuid);
      for (const charUuid of PRINTER_CHAR_UUIDS) {
        try {
          const char = await service.getCharacteristic(charUuid);
          // Check if this characteristic supports write
          if (char.properties.write || char.properties.writeWithoutResponse) {
            characteristic = char;
            break;
          }
        } catch {
          // Try next characteristic
        }
      }
      if (characteristic) break;

      // If no known char UUID works, try to find any writable characteristic
      const chars = await service.getCharacteristics();
      for (const char of chars) {
        if (char.properties.write || char.properties.writeWithoutResponse) {
          characteristic = char;
          break;
        }
      }
      if (characteristic) break;
    } catch {
      // Try next service
    }
  }

  // Last resort: scan all services for any writable characteristic
  if (!characteristic) {
    try {
      const services = await server.getPrimaryServices();
      for (const service of services) {
        const chars = await service.getCharacteristics();
        for (const char of chars) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            characteristic = char;
            break;
          }
        }
        if (characteristic) break;
      }
    } catch {
      // Could not enumerate services
    }
  }

  if (!characteristic) {
    server.disconnect();
    throw new Error(
      "Gagal menemukan service write printer Bluetooth. Pastikan printer Bluetooth 80mm menyala dan Bluetooth aktif."
    );
  }

  cachedConnection = { device, server, characteristic };

  // Listen for disconnection
  device.addEventListener("gattserverdisconnected", () => {
    cachedConnection = null;
  });

  return cachedConnection;
}

/**
 * Send raw bytes to printer in safe chunk sizes (64 bytes with 25ms delay).
 * Safe for 80mm thermal printers to prevent RX buffer overflow.
 */
async function sendBytes(
  characteristic: any,
  data: Uint8Array
): Promise<void> {
  const CHUNK_SIZE = 64; // Safe chunk size
  for (let offset = 0; offset < data.length; offset += CHUNK_SIZE) {
    const chunk = data.slice(offset, offset + CHUNK_SIZE);
    if (characteristic.properties.writeWithoutResponse) {
      await characteristic.writeValueWithoutResponse(chunk);
    } else {
      await characteristic.writeValueWithResponse(chunk);
    }
    // Small delay between chunks to prevent buffer overflow on printer
    if (offset + CHUNK_SIZE < data.length) {
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  }
}

/**
 * Print receipt via Web Bluetooth ESC/POS (Direct Chrome Android / PC).
 * Must be called from a user click event handler.
 */
export async function printBluetoothReceipt(transaction: any): Promise<void> {
  const connection = await connectPrinter();
  // Load logo struk dulu (kalau gagal group, lanjut tanpa logo)
  const logoRaster = await loadLogoRaster();
  const receiptData = buildReceiptBytes(transaction, logoRaster);
  try {
    await sendBytes(connection.characteristic, receiptData);
  } catch (err) {
    // Koneksi cache kemungkinan sudah basi (event gattserverdisconnected
    // kadang terlambat) — buang supaya percobaan berikutnya konek fresh.
    cachedConnection = null;
    throw err;
  }
}

/**
 * Print receipt via RawBT app on Android (via official intent / custom scheme)
 */
export function printViaRawBT(transaction: any): boolean {
  if (typeof window === "undefined" || !transaction) return false;

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) +
    " " +
    new Date(s).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatCurr = (val: number) =>
    "Rp " + new Intl.NumberFormat("id-ID").format(Math.round(val || 0));

  const center = (text: string, width = 48) => {
    const t = text.trim();
    if (t.length >= width) return t.slice(0, width);
    const leftPad = Math.floor((width - t.length) / 2);
    const rightPad = width - t.length - leftPad;
    return " ".repeat(leftPad) + t + " ".repeat(rightPad);
  };

  const lines: string[] = [];
  lines.push(center("MEGA ELEKTRONIK"));
  lines.push(center("Nota Pembayaran Toko"));
  lines.push(center("Blok Gebangmampang Desa Margamulya"));
  lines.push(center("Kecamatan Bongas"));
  lines.push(center("WhatsApp : 083115603569"));
  lines.push(center(formatDate(transaction.createdAt || new Date())));
  lines.push("-".repeat(48));

  const items = Array.isArray(transaction.transactionItems) ? transaction.transactionItems : [];
  for (const it of items) {
    const name = it.product?.name || it.productName || "Produk";
    const qty = it.quantity || 1;
    const price = it.soldPrice || 0;
    const subtotal = it.subtotal || price * qty;
    lines.push(name);
    const leftCol = ` ${qty} x ${formatCurr(price)}`;
    const rightCol = formatCurr(subtotal);
    lines.push(formatTwoColumns(leftCol, rightCol, 48));
  }

  lines.push("-".repeat(48));
  lines.push(formatTwoColumns("TOTAL", formatCurr(transaction.totalAmount || 0), 48));
  if (transaction.paidAmount != null && Number(transaction.paidAmount) > 0) {
    lines.push(formatTwoColumns("BAYAR", formatCurr(transaction.paidAmount), 48));
    lines.push(formatTwoColumns("KEMBALIAN", formatCurr(Math.max(0, transaction.paidAmount - transaction.totalAmount)), 48));
  }
  lines.push("=".repeat(48));
  lines.push(center("Terima Kasih!"));
  lines.push(center("Barang yg sudah dibeli"));
  lines.push(center("tidak dapat ditukar/dikembalikan"));
  lines.push("\n\n\n");

  const plainText = lines.join("\n");
  const encodedText = encodeURIComponent(plainText);

  const rawbtIntentUrl = `intent:${encodedText}#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;end;`;
  const rawbtSchemeUrl = `rawbt:${encodedText}`;

  try {
    const isAndroid = /android/i.test(navigator.userAgent);
    if (isAndroid) {
      window.location.href = rawbtIntentUrl;
    } else {
      window.location.href = rawbtSchemeUrl;
    }
    return true;
  } catch (err) {
    console.error("Error triggering RawBT print:", err);
    return false;
  }
}

/**
 * Disconnect the Bluetooth printer
 */
export function disconnectPrinter(): void {
  if (cachedConnection?.server?.connected) {
    cachedConnection.server.disconnect();
  }
  cachedConnection = null;
}

/**
 * Check if Web Bluetooth is supported in current browser
 */
export function isWebBluetoothSupported(): boolean {
  return typeof navigator !== "undefined" && "bluetooth" in navigator;
}

/**
 * Check if printer is currently connected
 */
export function isPrinterConnected(): boolean {
  return cachedConnection?.server?.connected === true;
}
