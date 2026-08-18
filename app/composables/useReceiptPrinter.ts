import { ref, computed } from "vue";
import {
  isIOSDevice,
  openThermerApp,
  buildThermerUrl,
  generateThermerReceiptEntries,
  THERMER_APP_STORE_URL,
} from "~/utils/thermer";
import { printBrowserReceipt } from "~/utils/browserPrint";

export function useReceiptPrinter() {
  const isFallbackModalOpen = ref(false);
  const isPrinting = ref(false);
  const pendingTransaction = ref<any>(null);

  // Reactive detection of iOS / iPhone
  const isIOS = computed(() => isIOSDevice());

  /**
   * Main print method. Automatically chooses Thermer for iOS/iPhone
   * and standard browser PDF printing for Desktop/Android.
   * Includes debounce lock to prevent Bluetooth connection drop on 2nd print.
   */
  const printReceipt = (transaction: any, forceMethod?: "thermer" | "browser") => {
    if (!transaction || isPrinting.value) return;

    if (forceMethod === "browser") {
      printBrowserReceipt(transaction);
      return;
    }

    if (forceMethod === "thermer" || isIOSDevice()) {
      isPrinting.value = true;
      pendingTransaction.value = transaction;

      openThermerApp(transaction, {
        timeoutMs: 2500,
        onFallback: () => {
          isPrinting.value = false;
          isFallbackModalOpen.value = true;
        },
      });

      // Cooldown timer to prevent rapid duplicate clicks that disrupt printer Bluetooth connection
      setTimeout(() => {
        isPrinting.value = false;
      }, 2500);

      return;
    }

    // Android / Desktop default
    printBrowserReceipt(transaction);
  };

  /**
   * Close the fallback modal
   */
  const closeFallbackModal = () => {
    isFallbackModalOpen.value = false;
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
   * Open Thermer app on Apple App Store
   */
  const openAppStore = () => {
    if (typeof window !== "undefined") {
      window.open(THERMER_APP_STORE_URL, "_blank");
    }
  };

  return {
    isIOS,
    isPrinting,
    isFallbackModalOpen,
    pendingTransaction,
    printReceipt,
    printBrowserReceipt,
    closeFallbackModal,
    printFallbackBrowser,
    openAppStore,
    buildThermerUrl,
    generateThermerReceiptEntries,
  };
}
