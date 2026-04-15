import { defineStore } from "pinia";

export interface CartItem {
  id: string; // unique cart item ID (uuid or same as product id)
  productId: number;
  productName: string;
  brand: string;
  model: string;
  buyPrice: number;
  askingPrice: number;
  fixedPrice: number;
  quantity: number;
  soldPrice: number; // editable price per unit - defaults to askingPrice
}

interface CustomerData {
  id?: number;
  name: string;
  phone?: string;
  address?: string;
}

export const useCartStore = defineStore("cart", () => {
  const items = ref<CartItem[]>([]);
  const selectedCustomer = ref<CustomerData | null>(null);
  const isProcessing = ref(false);

  // Add or update item in cart
  const addToCart = (product: any) => {
    const existingItem = items.value.find(
      (item) => item.productId === product.id,
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      const cartItem: CartItem = {
        id: `cart-${product.id}-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        brand: product.brand,
        model: product.model,
        buyPrice: product.buyPrice,
        askingPrice: product.askingPrice,
        fixedPrice: product.fixedPrice,
        quantity: 1,
        soldPrice: product.askingPrice, // default to asking price
      };
      items.value.push(cartItem);
    }
  };

  // Update quantity
  const updateQuantity = (cartItemId: string, quantity: number) => {
    const item = items.value.find((i) => i.id === cartItemId);
    if (item) {
      if (quantity <= 0) {
        removeFromCart(cartItemId);
      } else {
        item.quantity = quantity;
      }
    }
  };

  // Update sold price (for bargaining)
  const updateSoldPrice = (cartItemId: string, price: number) => {
    const item = items.value.find((i) => i.id === cartItemId);
    if (item) {
      item.soldPrice = Math.max(0, price);
    }
  };

  // Remove item from cart
  const removeFromCart = (cartItemId: string) => {
    const index = items.value.findIndex((i) => i.id === cartItemId);
    if (index > -1) {
      items.value.splice(index, 1);
    }
  };

  // Clear entire cart
  const clearCart = () => {
    items.value = [];
    selectedCustomer.value = null;
  };

  // Calculate totals
  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  const totalRevenue = computed(() => {
    return items.value.reduce(
      (sum, item) => sum + item.soldPrice * item.quantity,
      0,
    );
  });

  const totalProfit = computed(() => {
    return items.value.reduce((sum, item) => {
      const profitPerUnit = item.soldPrice - item.buyPrice;
      return sum + profitPerUnit * item.quantity;
    }, 0);
  });

  const cartSummary = computed(() => ({
    items: items.value,
    itemCount: totalItems.value,
    totalRevenue: totalRevenue.value,
    totalProfit: totalProfit.value,
    isEmpty: items.value.length === 0,
  }));

  // Checkout
  const checkout = async () => {
    if (items.value.length === 0) {
      throw new Error("Cart is empty");
    }

    isProcessing.value = true;
    try {
      const response = await $fetch("/api/transactions/checkout", {
        method: "POST",
        body: {
          customerId: selectedCustomer.value?.id || null,
          items: items.value.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            soldPrice: item.soldPrice,
            buyPrice: item.buyPrice,
          })),
          totalAmount: totalRevenue.value,
          totalProfit: totalProfit.value,
        },
      });

      clearCart();
      return response;
    } finally {
      isProcessing.value = false;
    }
  };

  return {
    items,
    selectedCustomer,
    isProcessing,
    addToCart,
    updateQuantity,
    updateSoldPrice,
    removeFromCart,
    clearCart,
    totalItems,
    totalRevenue,
    totalProfit,
    cartSummary,
    checkout,
  };
});
