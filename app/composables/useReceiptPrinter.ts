import { ref, computed } from "vue";
import {
  isIOSDevice,
  openThermerApp,
  buildThermerUrl,
  generateThermerReceiptEntries,
  THERMER_APP_STORE_URL,
} from "~/utils/thermer";
import { printBrowserReceipt } from "~/utils/browserPrint";
import {
  printBluetoothReceipt,
  printViaRawBT,
  isWebBluetoothSupported,
  isPrinterConnected,
  disconnectPrinter,
} from "~/utils/bluetoothPrint";

export function useReceiptPrinter() {
  const isFallbackModalOpen = ref(false);
  const isPrinting = ref(false);
  const printError = ref<string | null>(null);
  const pendingTransaction = ref<any>(null);

  // Reactive detection of iOS / iPhone
  const isIOS = computed(() => isIOSDevice());

  // Check if Web Bluetooth is available (Chrome/Edge/Opera on Desktop/Android)
  const hasBluetooth = computed(() => isWebBluetoothSupported());

  // Check if printer is connected
  const isConnected = computed(() => isPrinterConnected());

  /**
   * Main print method.
   * Priority:
   *  1. "bluetooth" → Direct ESC/POS via Web Bluetooth (best for 58mm thermal)
   *  2. "rawbt"     → RawBT app (Android)
   *  3. "thermer"   → iOS Thermer app
   *  4. "browser"   → window.print() fallback
   *  5. Auto-detect based on device
   */
  const printReceipt = async (
    transaction: any,
    forceMethod?: "bluetooth" | "rawbt" | "thermer" | "browser"
  ) => {
    if (!transaction || isPrinting.value) return;

    printError.value = null;

    // Force browser print
    if (forceMethod === "browser") {
      printBrowserReceipt(transaction);
      return;
    }

    // Force RawBT (Android)
    if (forceMethod === "rawbt") {
      printViaRawBT(transaction);
      return;
    }

    // Force Bluetooth ESC/POS
    if (forceMethod === "bluetooth") {
      await printViaBluetooth(transaction);
      return;
    }

    // Force Thermer (iOS)
    if (forceMethod === "thermer") {
      printViaThermer(transaction);
      return;
    }

    // ── Auto-detect best method ──

    // iOS → Thermer
    if (isIOSDevice()) {
      printViaThermer(transaction);
      return;
    }

    // Desktop/Android with Web Bluetooth → ESC/POS Bluetooth
    if (isWebBluetoothSupported()) {
      await printViaBluetooth(transaction);
      return;
    }

    // Fallback → browser print
    printBrowserReceipt(transaction);
  };

  /**
   * Print via Bluetooth ESC/POS (best practice for 58mm thermal)
   */
  const printViaBluetooth = async (transaction: any) => {
    isPrinting.value = true;
    pendingTransaction.value = transaction;
    try {
      await printBluetoothReceipt(transaction);
    } catch (err: any) {
      console.error("Bluetooth print failed:", err);
      printError.value =
        err?.message || "Gagal koneksi Bluetooth. Pastikan Bluetooth aktif dan pilih printer.";
      // Show fallback modal so user can try browser print / RawBT
      isFallbackModalOpen.value = true;
    } finally {
      isPrinting.value = false;
    }
  };

  /**
   * Print via Thermer iOS app
   */
  const printViaThermer = (transaction: any) => {
    isPrinting.value = true;
    pendingTransaction.value = transaction;

    openThermerApp(transaction, {
      timeoutMs: 2500,
      onFallback: () => {
        isPrinting.value = false;
        isFallbackModalOpen.value = true;
      },
    });

    // Cooldown timer
    setTimeout(() => {
      isPrinting.value = false;
    }, 2500);
  };

  /**
   * Close the fallback modal
   */
  const closeFallbackModal = () => {
    isFallbackModalOpen.value = false;
    printError.value = null;
  };

  /**
   * Print via standard browser PDF from fallback modal
   */
  const printFallbackBrowser = () => {
    if (pendingTransaction.value) {
      printBrowserReceipt(pendingTransaction.value);
    }
    isFallbackModalOpen.value = false;
  };

  /**
   * Retry Bluetooth print from fallback modal
   */
  const retryBluetooth = async () => {
    if (pendingTransaction.value) {
      isFallbackModalOpen.value = false;
      await printViaBluetooth(pendingTransaction.value);
    }
  };

  /**
   * Open Thermer app on Apple App Store
   */
  const openAppStore = () => {
    if (typeof window !== "undefined") {
      window.open(THERMER_APP_STORE_URL, "_blank");
    }
  };

  return {
    // State
    isIOS,
    isPrinting,
    printError,
    isFallbackModalOpen,
    pendingTransaction,
    hasBluetooth,
    isConnected,

    // Actions
    printReceipt,
    printViaBluetooth,
    printViaRawBT,
    printBrowserReceipt,
    closeFallbackModal,
    printFallbackBrowser,
    retryBluetooth,
    openAppStore,
    disconnectPrinter,

    // Thermer exports
    buildThermerUrl,
    generateThermerReceiptEntries,
  };
}
