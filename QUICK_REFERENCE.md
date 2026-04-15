# Mega Elektronik POS - Developer Quick Reference

## Quick Commands

```bash
# Install dependencies with Bun
bun install

# Setup database
bun prisma db push

# Start development server
bun run dev

# Open database editor
bun prisma studio

# Build for production
bun run build
bun run preview
```

## Key File Locations

| File                                  | Purpose                                  |
| ------------------------------------- | ---------------------------------------- |
| `app/pages/pos.vue`                   | Main POS interface (split-screen layout) |
| `app/pages/profit.vue`                | Financial reports dashboard              |
| `app/stores/cart.ts`                  | Pinia cart state management              |
| `server/api/products/index.ts`        | Products API (GET/POST)                  |
| `server/api/transactions/checkout.ts` | Checkout API                             |
| `server/api/customers/index.ts`       | Customer management API                  |
| `prisma/schema.prisma`                | Database schema                          |
| `composables/useCurrency.ts`          | Currency formatting                      |

## Component Hierarchy

```
App.vue
├── NuxtPage (pages/)
│   ├── pages/index.vue (home)
│   ├── pages/pos.vue (POS interface)
│   │   ├── Products Panel (grid)
│   │   └── Cart Panel (editable items)
│   └── pages/profit.vue (Reports)
│       ├── Summary Cards
│       └── Transaction Table
```

## State Management (Pinia Store)

**Location:** `app/stores/cart.ts`

**Key Properties:**

- `items` - Array of CartItem (with editable prices)
- `selectedCustomer` - Optional customer for transaction
- `isProcessing` - Checkout in progress flag

**Key Methods:**

- `addToCart(product)` - Add or increment item
- `updateSoldPrice(id, price)` - Edit price for bargaining
- `updateQuantity(id, qty)` - Change quantity
- `checkout()` - Process transaction

## Database Models Quick Reference

```prisma
Product
  - id, name (unique), brand, model
  - buyPrice, askingPrice, fixedPrice, stock
  - createdAt, updatedAt
  - Indexes: name, brand

Customer
  - id, name, phone?, address?
  - createdAt, updatedAt
  - Indexes: name

Transaction
  - id, customerId?, totalAmount, totalProfit
  - createdAt
  - Includes: customer, transactionItems

TransactionItem
  - id, transactionId, productId, quantity
  - soldPrice, profitPerItem
  - createdAt
```

## API Endpoints Summary

```
GET/POST  /api/products           - Product management
GET/POST  /api/customers          - Customer management
GET/POST  /api/transactions       - View transactions
POST      /api/transactions/checkout - Process sale
```

## Common Tasks

### Import Products

```typescript
const response = await $fetch("/api/products", {
  method: "POST",
  body: {
    products: [
      { name, brand, model, buyPrice, askingPrice, fixedPrice, stock },
    ],
  },
});
```

### Process Checkout

```typescript
const result = await cartStore.checkout();
// Cart auto-clears, stock updates, transaction saved
```

### Format Currency

```typescript
const { formatCurrency } = useCurrency();
formatCurrency(2500000); // "Rp 2.500.000"
```

## iPad Layout Notes

- **Grid**: 2-column product layout adapts to screen width
- **Split-screen**: Products (flex-1) + Cart (w-96)
- **Touch targets**: Min 44px height for buttons
- **No hover states**: Replaced with active:scale-95 for touch

## Common Errors & Fixes

| Error                              | Solution                               |
| ---------------------------------- | -------------------------------------- |
| "DATABASE_URL not set"             | Copy `.env.example` to `.env`          |
| "Module not found: @prisma/client" | Run `bun install`                      |
| "Port 3000 already in use"         | `bun run dev -- -p 3001`               |
| "Prisma schema not found"          | Run `bun prisma generate`              |
| "Cart not persisting"              | Check Pinia module in `nuxt.config.ts` |

## Performance Optimizations

- ✅ Client-side product search with computed properties
- ✅ Database transaction support for consistent checkout
- ✅ Stock indexes for fast queries
- ✅ Minimal API calls (batch on checkout)
- ✅ Lazy-loaded transaction history

## Next Steps for Production

1. Add authentication (JWT/OAuth)
2. Add rate limiting on API
3. Implement backup/export (transactions)
4. Add receipt printing feature
5. Add multi-currency support
6. Add user roles (cashier/manager/admin)
7. Add sales targets/KPI tracking
8. Add product variant support (color, size)

## Vue 3 & Composition API Pattern

```vue
<script setup lang="ts">
// Refs
const items = ref<CartItem[]>([]);

// Computed
const total = computed(() => {
  return items.value.reduce((sum, item) => sum + item.price, 0);
});

// Methods (use arrow functions for automatic 'this' binding)
const addItem = (item: CartItem) => {
  items.value.push(item);
};

// Hooks
onMounted(() => {
  // Load data
});
</script>
```

## Nuxt 3 Auto-imports

These are automatically available (no imports needed):

- All components in `app/components/`
- All pages in `app/pages/`
- All stores from `app/stores/`
- All composables from `composables/`
- `definePageMeta`, `navigateTo`, `useRouter`, `useRoute`, etc.

## Custom Composables Pattern

```typescript
// composables/useExample.ts
export const useExample = () => {
  const state = ref("value");

  const updateState = (newValue) => {
    state.value = newValue;
  };

  return { state, updateState };
};

// In component
const { state, updateState } = useExample();
```

## Tailwind Utility Classes to Remember

- `flex`, `grid`, `gap-4` - Layout
- `px-4 py-2` - Padding
- `bg-blue-500 hover:bg-blue-600` - Colors
- `rounded-lg` - Border radius
- `border border-gray-300` - Borders
- `text-lg font-bold` - Typography
- `transition transform` - Animations
- `active:scale-95` - Touch feedback

---

**Last Updated:** April 15, 2026  
**Dev Team:** Mega Elektronik  
**Status:** Production Ready
