/**
 * Format currency values
 * Assumes values are stored in cents/smallest units
 * @param value - Amount in cents
 * @param currency - Currency code (default: IDR for Indonesian Rupiah)
 * @returns Formatted currency string
 */
export const useCurrency = () => {
  const formatCurrency = (value: number, currency: string = "IDR"): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const parseFromDisplay = (displayValue: string): number => {
    // Remove all non-digit characters and parse
    const cleaned = displayValue.replace(/\D/g, "");
    return parseInt(cleaned, 10) || 0;
  };

  return {
    formatCurrency,
    parseFromDisplay,
  };
};
