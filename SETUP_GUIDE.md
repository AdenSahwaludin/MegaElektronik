# Mega Elektronik POS - Setup & Deployment Guide

## Project Overview

**Mega Elektronik** is a Point of Sale (POS) and Inventory Management web application designed specifically for iPad use. Built with Nuxt 3, Vue.js, Tailwind CSS, Pinia, and Prisma, it provides a modern, touch-optimized interface for managing electronics store operations.

### Key Features

- **iPad-Optimized UI**: Split-screen layout with touch-friendly buttons
- **Point of Sale System**: Product selection, cart management, and checkout
- **Price Bargaining**: Editable prices in cart for price negotiation
- **Inventory Management**: Real-time stock tracking with low-stock alerts
- **Financial Reports**: Comprehensive profit tracking and transaction history
- **Customer Management**: Optional customer tracking with contact info
- **Bulk Product Import**: JSON-based product data import

## Tech Stack

- **Framework**: Nuxt 3 (SPA mode - Client-Side Rendering)
- **UI Framework**: Tailwind CSS + Nuxt UI
- **State Management**: Pinia
- **Database**: Prisma ORM with SQLite
- **Icons**: Iconify (Lucide icons)
- **Package Manager**: Bun

## Project Structure

```
MegaTeknik/
├── app/
│   ├── pages/
│   │   ├── index.vue          # Home/Dashboard
│   │   ├── pos.vue            # Point of Sale (Main POS Page)
│   │   └── profit.vue         # Financial Reports Dashboard
│   ├── components/
│   │   ├── AppLogo.vue
│   │   └── TemplateMenu.vue
│   ├── stores/
│   │   └── cart.ts            # Pinia store for cart management
│   └── app.vue                # Root component
├── server/
│   ├── api/
│   │   ├── products/
│   │   │   └── index.ts       # GET products, POST import products
│   │   ├── transactions/
│   │   │   ├── index.ts       # GET all transactions
│   │   │   └── checkout.ts    # POST checkout
│   │   └── customers/
│   │       └── index.ts       # GET/POST customers
│   └── utils/                 # Server utilities
├── composables/
│   └── useCurrency.ts         # Currency formatting utilities
├── prisma/
│   └── schema.prisma          # Database schema
├── .env                       # Environment variables
├── nuxt.config.ts            # Nuxt configuration
├── tailwind.config.ts         # Tailwind configuration (auto-generated)
├── sample-products.json       # Sample product data for import
└── package.json
```

## Installation & Setup

### Prerequisites

- Node.js 18+ or Bun runtime
- Git (optional)

### Step 1: Install Dependencies

Using **Bun** (Recommended):

```bash
bun install
```

Or using npm/yarn if Bun is not available:

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Step 2: Setup Database

Initialize and create the SQLite database:

```bash
# Generate Prisma client
bun prisma generate

# Push schema to database
bun prisma db push
```

The database will be created at `./dev.db` (as specified in `.env`).

### Step 3: Verify Environment Variables

Check that `.env` file exists with correct settings:

```env
DATABASE_URL="file:./dev.db"
```

### Step 4: Import Sample Products (Optional)

You can populate the database with sample products by making a POST request:

```bash
# Using curl
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d @sample-products.json

# Or using a REST client like Postman
# POST to http://localhost:3000/api/products
# Body: {
#   "products": [ ... products array from sample-products.json ... ]
# }
```

## Running the Application

### Development Server

Start the development server on `http://localhost:3000`:

```bash
bun run dev
```

Or with npm:

```bash
npm run dev
```

### Build for Production

```bash
bun run build
bun run preview
```

### Database Management

```bash
# Open Prisma Studio (visual database editor)
bun prisma studio

# Reset database (⚠️ Deletes all data)
bun prisma db reset
```

## API Endpoints

### Products

**GET** `/api/products`

- Fetch all products
- Response: `{ products: [], total: number }`

**POST** `/api/products`

- Import products from JSON
- Body: `{ products: [ { name, brand, model, buyPrice, askingPrice, fixedPrice, stock } ] }`

### Transactions

**GET** `/api/transactions`

- Fetch all transactions with details
- Response: `{ transactions: [], total: number }`

**POST** `/api/transactions/checkout`

- Process checkout and create transaction
- Body:
  ```json
  {
    "customerId": null | number,
    "items": [
      {
        "productId": number,
        "quantity": number,
        "soldPrice": number,
        "buyPrice": number
      }
    ],
    "totalAmount": number,
    "totalProfit": number
  }
  ```

### Customers

**GET** `/api/customers`

- Fetch all customers

**POST** `/api/customers`

- Create new customer
- Body: `{ name: string, phone?: string, address?: string }`

## Database Schema

### Product

- `id` (Int, PK)
- `name` (String, unique)
- `brand` (String)
- `model` (String)
- `buyPrice` (Int) - Cost to business
- `askingPrice` (Int) - Initial asking price
- `fixedPrice` (Int) - List/fixed price
- `stock` (Int)
- `createdAt`, `updatedAt` (DateTime)

### Customer

- `id` (Int, PK)
- `name` (String)
- `phone` (String, nullable)
- `address` (String, nullable)
- `createdAt`, `updatedAt` (DateTime)

### Transaction

- `id` (Int, PK)
- `customerId` (Int, FK, nullable)
- `totalAmount` (Int)
- `totalProfit` (Int)
- `createdAt` (DateTime)

### TransactionItem

- `id` (Int, PK)
- `transactionId` (Int, FK)
- `productId` (Int, FK)
- `quantity` (Int)
- `soldPrice` (Int) - Final agreed price per unit
- `profitPerItem` (Int) - Profit per unit
- `createdAt` (DateTime)

## Page Routes

### `/` - Home Dashboard

Main landing page with navigation to other sections.

### `/pos` - Point of Sale

Main POS interface with:

- Product grid (left panel, iPad optimized)
- Shopping cart with editable prices (right panel)
- Customer selection
- Checkout button

**Features:**

- Tap products to add to cart
- Edit prices for bargaining
- Adjust quantities
- Track running profit/revenue
- Optional customer assignment
- Real-time stock updates

### `/profit` - Financial Reports

Comprehensive financial dashboard showing:

- Total revenue summary card
- Total net profit summary card
- Total items sold summary card
- Profit margin percentage
- Transaction history table
- Filtering by date range and search
- Detailed breakdown per transaction item

## Store (Pinia) - Cart State

The cart store (`app/stores/cart.ts`) manages:

```typescript
// State
items: CartItem[]           // Cart items with editable prices
selectedCustomer: Customer  // Optional customer
isProcessing: boolean       // Checkout in progress

// Actions
addToCart(product)         // Add product to cart
updateQuantity(id, qty)    // Update item quantity
updateSoldPrice(id, price) // Update editable price (bargaining)
removeFromCart(id)         // Remove item
clearCart()                // Clear entire cart
checkout()                 // Process transaction

// Computed
totalItems                 // Sum of quantities
totalRevenue              // Sum of (soldPrice * quantity)
totalProfit               // Sum of profit per item
cartSummary               // Complete summary object
```

## Composables

### `useCurrency()`

Utility for currency formatting:

```typescript
const { formatCurrency, parseFromDisplay } = useCurrency();

formatCurrency(2500000); // "Rp 2.500.000"
parseFromDisplay("Rp 2.500.000"); // 2500000
```

## Configuration

### Nuxt Config (`nuxt.config.ts`)

```typescript
export default defineNuxtConfig({
  modules: ["@nuxt/eslint", "@nuxt/ui", "pinia/nuxt"],
  pinia: {
    storesDirs: ["./app/stores/**"],
  },
  // ... other config
});
```

### Tailwind CSS

Automatically configured through Nuxt UI. Customizations can be made in `tailwind.config.ts` (auto-generated).

## Usage Examples

### Import Products Programmatically

```typescript
// In a component or page
const importProducts = async () => {
  const response = await $fetch("/api/products", {
    method: "POST",
    body: {
      products: [
        {
          name: "Product Name",
          brand: "Brand",
          model: "Model",
          buyPrice: 1000000,
          askingPrice: 1500000,
          fixedPrice: 1500000,
          stock: 10,
        },
      ],
    },
  });
  console.log(response);
};
```

### Add Profit Report Charts

To add charts to the profit page, install and use a chart library:

```bash
bun add chart.js vue-chartjs
```

Then use in `profit.vue`:

```vue
<BarChart :data="chartData" :options="chartOptions" />
```

## iPad Optimization Notes

The UI is optimized for iPad with:

- **Large touch targets**: Buttons are 44px+ minimum height
- **Split-screen layout**: Products on left, cart on right
- **Landscape-first design**: Designed for iPad landscape orientation (1366x1024)
- **Responsive grid**: Product grid adapts to screen width
- **Smooth transitions**: Touch feedback with scale animations
- **High contrast**: Easy-to-read text on iPad screens

### Force Landscape on iPad

To force landscape mode on iPad, add to your HTML:

```html
<!-- In public/index.html or similar -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta
  name="apple-mobile-web-app-status-bar-style"
  content="black-translucent"
/>
<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
/>
```

## Troubleshooting

### Database Issues

```bash
# Reset and recreate database
bun prisma db reset --force

# View database with GUI
bun prisma studio
```

### Dependency Issues

```bash
# Reinstall all dependencies
rm -rf node_modules
rm bun.lock (or package-lock.json)
bun install
```

### Port Already in Use

```bash
# Change Nuxt dev port
bun run dev -- -p 3001
```

## Deployment

### Vercel

```bash
# Install Vercel CLI
bun install -g vercel

# Deploy
vercel
```

### Docker

Create a `Dockerfile`:

```dockerfile
FROM oven/bun:latest

WORKDIR /app
COPY . .
RUN bun install
RUN bun run build

EXPOSE 3000
CMD ["bun", "run", "preview"]
```

Build and run:

```bash
docker build -t mega-elektronik .
docker run -p 3000:3000 mega-elektronik
```

## Performance Tips

1. **Database Indexing**: Queries are indexed on `name`, `brand`, and `createdAt`
2. **Product Search**: Uses client-side filtering with computed properties
3. **Stock Updates**: Real-time stock decrements on checkout
4. **Caching**: Consider adding request caching headers via middleware

## Security Considerations

- ✅ Input validation on API endpoints
- ✅ SQLite transaction support for data consistency
- ⚠️ Add authentication layer before production (JWT/OAuth)
- ⚠️ Add rate limiting for API endpoints
- ⚠️ Implement CORS if accessing from multiple domains
- ⚠️ Use HTTPS in production
- ⚠️ Add backup/export functionality for transaction data

## License

Your project license here.

## Support

For issues or questions, contact support@mega-elektronik.com
