import { defineStore } from "pinia";
import { ref } from "vue";

export const useDataCacheStore = defineStore("dataCache", () => {
  const products = ref<any[]>([]);
  const isProductsLoaded = ref(false);
  const loadingProducts = ref(false);

  // Cache for transactions/reports
  // key: stringified params (e.g. "page=1&limit=10&dateRange=thisMonth&search=")
  // value: transactions API response
  const transactionsCache = ref<Record<string, any>>({});
  
  // Cache for analytics
  // key: stringified params (e.g. "dateRange=thisMonth&startDate=&endDate=")
  // value: { summary, trendData, topProductsData, priceDistData, marginData, heatmapData, problemProducts }
  const analyticsCache = ref<Record<string, any>>({});

  // Fetch all products (limit 10000, activeOnly = false)
  const fetchProducts = async (force = false) => {
    if (loadingProducts.value) return;
    if (isProductsLoaded.value && !force) return;

    loadingProducts.value = true;
    try {
      const response = await $fetch<any>("/api/products?limit=10000&activeOnly=false");
      products.value = response.products || [];
      isProductsLoaded.value = true;
    } catch (error) {
      console.error("Error loading products cache:", error);
    } finally {
      loadingProducts.value = false;
    }
  };

  // Update a single product in the local in-memory store
  const updateLocalProduct = (updated: any) => {
    const idx = products.value.findIndex(p => p.id === updated.id);
    if (idx !== -1) {
      products.value[idx] = { ...products.value[idx], ...updated };
    }
    // Clear caches because product changes can affect analytics
    clearAnalyticsCache();
  };

  // Add a new product to the local in-memory store
  const addLocalProduct = (newProd: any) => {
    products.value.unshift(newProd);
    // Sort products by name to maintain order
    products.value.sort((a, b) => a.name.localeCompare(b.name, 'id', { sensitivity: 'base' }));
    clearAnalyticsCache();
  };

  // Delete a product from the local in-memory store
  const deleteLocalProduct = (id: number) => {
    products.value = products.value.filter(p => p.id !== id);
    clearAnalyticsCache();
  };

  // Receive stock arrival locally
  const receiveLocalArrival = (productId: number, additionalStock: number) => {
    const idx = products.value.findIndex(p => p.id === productId);
    if (idx !== -1) {
      products.value[idx].stock += additionalStock;
    }
    clearAnalyticsCache();
  };

  // Caching helper for transactions (SWR)
  const getCachedTransactions = (key: string) => {
    return transactionsCache.value[key] || null;
  };

  const setCachedTransactions = (key: string, data: any) => {
    transactionsCache.value[key] = data;
  };

  // Caching helper for analytics (SWR)
  const getCachedAnalytics = (key: string) => {
    return analyticsCache.value[key] || null;
  };

  const setCachedAnalytics = (key: string, data: any) => {
    analyticsCache.value[key] = data;
  };

  // Clear caches when mutations happen (e.g. checkout, CRUD)
  const clearTransactionsCache = () => {
    transactionsCache.value = {};
  };

  const clearAnalyticsCache = () => {
    analyticsCache.value = {};
  };

  const clearAllCaches = () => {
    transactionsCache.value = {};
    analyticsCache.value = {};
  };

  return {
    products,
    isProductsLoaded,
    loadingProducts,
    transactionsCache,
    analyticsCache,
    fetchProducts,
    updateLocalProduct,
    addLocalProduct,
    deleteLocalProduct,
    receiveLocalArrival,
    getCachedTransactions,
    setCachedTransactions,
    getCachedAnalytics,
    setCachedAnalytics,
    clearTransactionsCache,
    clearAnalyticsCache,
    clearAllCaches,
  };
});
