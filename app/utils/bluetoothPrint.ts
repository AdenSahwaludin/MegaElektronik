/**
 * ESC/POS Bluetooth Print Utility for 58mm Thermal Printer
 * Best practice: Direct ESC/POS commands via Web Bluetooth API
 * Bypasses window.print() entirely — no browser headers/footers, no clipping.
 *
 * POS-58 specs:
 *  - Paper width: 58mm
 *  - Printable width: ~48mm (384 dots at 203 DPI)
 *  - Character width: 32 chars (Font A) or 42 chars (Font B) per line
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
const LINE_WIDTH = 32; // 32 chars for 58mm Font A

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

// ─── Receipt Builder ─────────────────────────────────────────────────
export function buildReceiptBytes(transaction: any): Uint8Array {
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

  // ── Store Name (center, bold, double size) ──
  add(CMD.ALIGN_CENTER, CMD.BOLD_ON, CMD.DOUBLE_ON);
  line("MEGA ELEKTRONIK");
  add(CMD.SIZE_NORMAL, CMD.BOLD_OFF);

  // ── Subtitle ──
  add(CMD.ALIGN_CENTER);
  line("Nota Pembayaran Toko");

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
// Known Bluetooth service/characteristic UUIDs for common thermal printers
const PRINTER_SERVICE_UUIDS = [
  "000018f0-0000-1000-8000-00805f9b34fb", // Common POS printer service
  "e7810a71-73ae-499d-8c15-faa9aef0c3f2", // Another common UUID
  "49535343-fe7d-4ae5-8fa9-9fafd205e455", // Microchip/generic BLE UART
];

const PRINTER_CHAR_UUIDS = [
  "00002af1-0000-1000-8000-00805f9b34fb", // Common write characteristic
  "bef8d6c9-9c21-4c9e-b632-bd58c1009f9f", // Another common UUID
  "49535343-8841-43f4-a8d4-ecbe34729bb3", // Microchip/generic BLE UART TX
];

interface PrinterConnection {
  device: BluetoothDevice;
  server: BluetoothRemoteGATTServer;
  characteristic: BluetoothRemoteGATTCharacteristic;
}

let cachedConnection: PrinterConnection | null = null;

/**
 * Connect to Bluetooth thermal printer.
 * MUST be called from a user gesture (click event).
 */
export async function connectPrinter(): Promise<PrinterConnection> {
  // Try to reuse cached connection
  if (cachedConnection?.server?.connected) {
    try {
      // Test if still valid
      await cachedConnection.characteristic.writeValue(new Uint8Array([]));
      return cachedConnection;
    } catch {
      cachedConnection = null;
    }
  }

  // Request Bluetooth device - accept all devices that look like printers
  const device = await navigator.bluetooth.requestDevice({
    // Accept any device - thermal printers often don't advertise standard services
    acceptAllDevices: true,
    optionalServices: PRINTER_SERVICE_UUIDS,
  });

  if (!device.gatt) {
    throw new Error("Bluetooth GATT not available on this device");
  }

  const server = await device.gatt.connect();

  // Try each known service UUID until we find one that works
  let characteristic: BluetoothRemoteGATTCharacteristic | null = null;

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
      "Tidak dapat menemukan characteristic printer Bluetooth. " +
        "Pastikan printer dalam mode Bluetooth dan sudah di-pair."
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
 * Send raw bytes to printer in chunks.
 * BLE has a max packet size (usually 20 bytes, sometimes 512).
 * We chunk to 20 bytes to be safe with all printers.
 */
async function sendBytes(
  characteristic: BluetoothRemoteGATTCharacteristic,
  data: Uint8Array
): Promise<void> {
  const CHUNK_SIZE = 100; // Safe chunk size for most BLE printers
  for (let offset = 0; offset < data.length; offset += CHUNK_SIZE) {
    const chunk = data.slice(offset, offset + CHUNK_SIZE);
    if (characteristic.properties.writeWithoutResponse) {
      await characteristic.writeValueWithoutResponse(chunk);
    } else {
      await characteristic.writeValueWithResponse(chunk);
    }
    // Small delay between chunks to prevent buffer overflow on printer
    if (offset + CHUNK_SIZE < data.length) {
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }
}

/**
 * Print receipt via Bluetooth ESC/POS.
 * Must be called from a user click event handler.
 */
export async function printBluetoothReceipt(transaction: any): Promise<void> {
  const connection = await connectPrinter();
  const receiptData = buildReceiptBytes(transaction);
  await sendBytes(connection.characteristic, receiptData);
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
