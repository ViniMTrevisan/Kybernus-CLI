import { useState } from 'react';
import { apiFetch } from '../../../shared/lib/apiFetch';

interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  qty: number;
  image: string | null;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  couponCode: string | null;
}

interface CheckoutDto {
  shippingCost: number;
  shippingAddress: Record<string, string> | null;
}

interface CheckoutResult {
  orderId: string;
  clientSecret: string;
}

export function useCheckout() {
  const [cart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout(dto: CheckoutDto): Promise<CheckoutResult> {
    setIsLoading(true);
    setError(null);
    try {
      return await apiFetch<CheckoutResult>('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar pedido';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  return { cart, checkout, isLoading, error };
}
