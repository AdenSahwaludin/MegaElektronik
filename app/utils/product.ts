export function getProductDisplayName(product: { name: string; brand?: string | null; model?: string | null }): string {
  if (!product) return '';
  let name = product.name || '';
  const brand = (product.brand || '').trim();

  if (brand && brand !== '-' && brand.toLowerCase() !== 'no brand') {
    if (!name.toLowerCase().includes(brand.toLowerCase())) {
      name += ` ${brand}`;
    }
  }

  // Model is intentionally omitted from the display name to be shown separately

  return name.trim();
}
