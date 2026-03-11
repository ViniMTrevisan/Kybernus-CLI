/**
 * TaxService — Pluggable tax calculator scaffold.
 * Currently returns 0 tax. Replace with real Brazilian tax rules as needed.
 */
export class TaxService {
  calculate(_subtotal: number, _region?: string): number {
    return 0;
  }
}
