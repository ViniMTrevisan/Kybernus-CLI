import type { IShippingService, ShippingOption } from '../../../application/ports/shipping.port';

/**
 * Returns deterministic mock options — pluggable with Correios / Melhor Envio
 * in a real deployment by swapping the implementation.
 */
export class MockShippingService implements IShippingService {
  async calculate(
    _cep: string,
    _items: Array<{ qty: number; weight?: number }>,
  ): Promise<ShippingOption[]> {
    return [
      { name: 'PAC', price: 18.5, estimatedDays: 7 },
      { name: 'SEDEX', price: 32.0, estimatedDays: 2 },
    ];
  }
}
