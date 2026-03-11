export interface ShippingOption {
  name: string;
  price: number;
  estimatedDays: number;
}

export interface IShippingService {
  calculate(cep: string, items: Array<{ qty: number; weight?: number }>): Promise<ShippingOption[]>;
}
