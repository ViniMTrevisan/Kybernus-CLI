import { useEffect, useState } from 'react';
import { apiFetch } from '../../../shared/lib/apiFetch';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';

type DiscountType = 'percent' | 'fixed';

interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  usageLimit: number | null;
  usageCount: number;
  expiresAt: string | null;
}

function formatDiscount(coupon: Coupon): string {
  if (coupon.discountType === 'percent') return `${coupon.discountValue}%`;
  return coupon.discountValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function CouponsAdminPage() {
  usePageTitle('Cupons');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function loadCoupons() {
    setLoading(true);
    apiFetch<{ items: Coupon[] }>('/api/admin/coupons')
      .then((data) => {
        setCoupons(data.items);
        setLoading(false);
      })
      .catch(() => {
        setError('Erro ao carregar cupons');
        setLoading(false);
      });
  }

  useEffect(() => {
    loadCoupons();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await apiFetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.toUpperCase(),
          discountType,
          discountValue: Number(discountValue),
          minOrderValue: 0,
          usageLimit: usageLimit ? Number(usageLimit) : null,
          expiresAt: null,
        }),
      });
      setCode('');
      setDiscountValue('');
      setUsageLimit('');
      loadCoupons();
    } catch {
      setFormError('Erro ao criar cupom');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    await apiFetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
    loadCoupons();
  }

  return (
    <main>
      <h1>Cupons</h1>

      <section aria-label="Novo cupom">
        <h2>Novo Cupom</h2>
        {formError && <p role="alert">{formError}</p>}
        <form onSubmit={handleCreate}>
          <label htmlFor="coupon-code">Código</label>
          <input
            id="coupon-code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <label htmlFor="coupon-type">Tipo</label>
          <select
            id="coupon-type"
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as DiscountType)}
          >
            <option value="percent">Percentual</option>
            <option value="fixed">Valor fixo</option>
          </select>

          <label htmlFor="coupon-value">Valor</label>
          <input
            id="coupon-value"
            type="number"
            min="0.01"
            step="0.01"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            required
          />

          <label htmlFor="coupon-limit">Limite de uso</label>
          <input
            id="coupon-limit"
            type="number"
            min="1"
            value={usageLimit}
            onChange={(e) => setUsageLimit(e.target.value)}
            placeholder="Ilimitado"
          />

          <button type="submit" disabled={submitting}>
            Criar Cupom
          </button>
        </form>
      </section>

      {loading && <p>Carregando...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && (
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Desconto</th>
              <th>Limite</th>
              <th>Uso</th>
              <th>Validade</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id}>
                <td>{coupon.code}</td>
                <td>{formatDiscount(coupon)}</td>
                <td>{coupon.usageLimit ?? '∞'}</td>
                <td>{coupon.usageCount}</td>
                <td>{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('pt-BR') : '—'}</td>
                <td>
                  <button
                    aria-label={`Excluir cupom ${coupon.code}`}
                    onClick={() => handleDelete(coupon.id)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
