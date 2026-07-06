export function getProductDisplayName(product: { name: string; brand?: string | null; model?: string | null }): string {
  if (!product) return '';
  const parts = [product.name];
  
  if (product.brand && product.brand !== 'No Brand') {
    parts.push(product.brand);
  }
  
  if (product.model && product.model !== 'Standard' && product.model !== 'Portable') {
    parts.push(product.model);
  }
  
  return parts.join(' ');
}
