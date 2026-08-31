interface DealFields {
  price: number;
  deal_price?: number | null;
  deal_ends_at?: string | null;
  is_deal_active?: boolean | null;
}

export function isProductOnDeal(product: DealFields): boolean {
  if (!product.deal_price || !product.deal_ends_at) return false;
  if (product.is_deal_active === false) return false;
 
  const endsAt =
    product.deal_ends_at.length <= 10
      ? new Date(`${product.deal_ends_at}T23:59:59`)
      : new Date(product.deal_ends_at);
 
  return endsAt > new Date();
}
 
export function getActivePrice(product: DealFields): number {
  return isProductOnDeal(product) ? (product.deal_price as number) : product.price;
}