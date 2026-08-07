import { defineStore } from "pinia";
import { ref } from "vue";

const PRODUCTS_STORAGE_KEY = "mega_elektronik_products_cache_v1";

export const useDataCacheStore = defineStore("dataCache", () => {
  const products = ref<any[]>([]);
  const isProductsLoaded = ref(false);
  const loadingProducts = ref(false);

  // Cache for transactions/reports
  const transactionsCache = ref<Record<string, any>>({});

  // Cache for analytics
  const analyticsCache = ref<Record<string, any>>({});

  // Save products to persistent localStorage
  const saveProductsToStorage = (data: any[]) => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(data));
      } catch (err) {
        console.warn("Failed to persist products cache to localStorage:", err);
      }
    }
  };

  // Load products from persistent localStorage for instant 0ms load
  const loadProductsFromStorage = (): boolean => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const cached = localStorage.getItem(PRODUCTS_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            products.value = parsed;
            isProductsLoaded.value = true;
            return true;
          }
        }
      } catch (err) {
        console.warn("Failed to read products cache from localStorage:", err);
      }
    }
    return false;
  };

  // Fetch all products (Stale-While-Revalidate pattern)
  // If force is false, it uses local storage cache first for 0ms load, then revalidates in background
  const fetchProducts = async (force = false) => {
    if (loadingProducts.value) return;

    // Load from storage immediately if not loaded yet
    if (!isProductsLoaded.value) {
      loadProductsFromStorage();
    }

    // If already loaded and force is false, do background sync without blocking UI
    if (isProductsLoaded.value && !force) {
      // Background revalidation
      fetchProductsFromNetwork();
      return;
    }

    await fetchProductsFromNetwork();
  };

  const fetchProductsFromNetwork = async () => {
    loadingProducts.value = true;
    try {
      const response = await $fetch<any>("/api/products?limit=10000&activeOnly=false");
      const fetchedProducts = response.products || [];
      products.value = fetchedProducts;
      isProductsLoaded.value = true;
      saveProductsToStorage(fetchedProducts);
    } catch (error) {
      console.error("Error loading products cache from server:", error);
    } finally {
      loadingProducts.value = false;
    }
  };

  // Update a single product in the local store & storage
  const updateLocalProduct = (updated: any) => {
    const idx = products.value.findIndex((p) => p.id === updated.id);
    if (idx !== -1) {
      products.value[idx] = { ...products.value[idx], ...updated };
      saveProductsToStorage(products.value);
    }
    clearAnalyticsCache();
  };

  // Add a new product to the local store & storage
  const addLocalProduct = (newProd: any) => {
    products.value.unshift(newProd);
    const getFullName = (p: any) => `${p.name || ''} ${p.brand || ''} ${p.model || ''}`.trim();
    products.value.sort((a, b) => getFullName(a).localeCompare(getFullName(b), 'id', { sensitivity: 'base' }));
    saveProductsToStorage(products.value);
    clearAnalyticsCache();
  };

  // Delete a product from the local store & storage
  const deleteLocalProduct = (id: number) => {
    products.value = products.value.filter((p) => p.id !== id);
    saveProductsToStorage(products.value);
    clearAnalyticsCache();
  };

  // Receive stock arrival locally
  const receiveLocalArrival = (productId: number, additionalStock: number) => {
    const idx = products.value.findIndex((p) => p.id === productId);
    if (idx !== -1) {
      products.value[idx].stock += additionalStock;
      saveProductsToStorage(products.value);
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
    loadProductsFromStorage,
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
