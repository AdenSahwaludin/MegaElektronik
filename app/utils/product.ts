export function getProductDisplayName(product: { name: string; brand?: string | null; model?: string | null }): string {
  if (!product) return '';
  const parts = [product.name];
  
  if (product.brand && product.brand !== 'No Brand') {
    parts.push(product.brand);
  }
  
  // Model is intentionally omitted from the display name to be shown separately
  
  return parts.join(' ');
}
