import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../../shared/lib/apiFetch';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';

interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  qty: number;
  image: string | null;
}

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  days: number;
}

interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  total: number;
  couponCode: string | null;
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function CartPage() {
  usePageTitle('Meu Carrinho');
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [cepInput, setCepInput] = useState('');
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);

  useEffect(() => {
    apiFetch<Cart>('/api/cart')
      .then((data) => { setCart(data); setLoading(false); })
      .catch(() => { setError('Erro ao carregar carrinho'); setLoading(false); });
  }, []);

  async function handleQtyChange(variantId: string, qty: number) {
    try {
      const updated = await apiFetch<Cart>(`/api/cart/items/${variantId}`, {
        method: 'PATCH',
        body: JSON.stringify({ qty }),
      });
      setCart(updated);
    } catch {
      setError('Erro ao atualizar quantidade');
    }
  }

  async function handleRemove(variantId: string) {
    try {
      const updated = await apiFetch<Cart>(`/api/cart/items/${variantId}`, {
        method: 'PATCH',
        body: JSON.stringify({ qty: 0 }),
      });
      setCart(updated);
    } catch {
      setError('Erro ao remover item');
    }
  }

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const updated = await apiFetch<Cart>('/api/cart/coupon', {
        method: 'POST',
        body: JSON.stringify({ code: couponInput.trim() }),
      });
      setCart(updated);
      setCouponInput('');
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : 'Cupom inválido');
    } finally {
      setCouponLoading(false);
    }
  }

  async function handleCalculateShipping() {
    if (!cepInput.trim()) return;
    setShippingLoading(true);
    setShippingError(null);
    try {
      const data = await apiFetch<{ options: ShippingOption[] }>(
        `/api/cart/shipping?cep=${cepInput.replace(/\D/g, '')}`,
      );
      setShippingOptions(data.options);
    } catch {
      setShippingError('Erro ao calcular frete. Verifique o CEP informado.');
    } finally {
      setShippingLoading(false);
    }
  }

  if (loading) {
    return <p style={{ marginTop: '2rem', color: '#6b7280' }}>Carregando...</p>;
  }

  if (error) {
    return <p role="alert" style={{ marginTop: '2rem', color: '#ef4444' }}>{error}</p>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main style={{ maxWidth: 680, margin: '4rem auto', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '1rem' }}>Carrinho</h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Seu carrinho está vazio.</p>
        <Link
          to="/"
          style={{
            display: 'inline-block',
            padding: '0.6rem 1.5rem',
            background: 'var(--color-primary)',
            color: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Ver produtos
        </Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 880, margin: '2rem auto', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }}>
      {/* Items list */}
      <section>
        <h1 style={{ marginBottom: '1.5rem' }}>Carrinho</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {cart.items.map((item) => (
            <div
              key={item.variantId}
              style={{
                display: 'grid',
                gridTemplateColumns: '56px 1fr auto',
                gap: '1rem',
                alignItems: 'center',
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 10,
                padding: '0.875rem 1rem',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  background: '#f3f4f6',
                  borderRadius: 6,
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {item.image && (
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.15rem' }}>{item.name}</p>
                <p style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '0.5rem' }}>SKU: {item.sku}</p>
                <p style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{formatBRL(item.price)}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
                <input
                  type="number"
                  min={1}
                  value={item.qty}
                  onChange={(e) => handleQtyChange(item.variantId, Number(e.target.value))}
                  style={{ width: 60, padding: '0.3rem 0.5rem', border: '1px solid #d1d5db', borderRadius: 6, textAlign: 'center' }}
                />
                <button
                  onClick={() => handleRemove(item.variantId)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Summary sidebar */}
      <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Coupon */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1rem' }}>
          <p style={{ fontWeight: 600, marginBottom: '0.6rem', fontSize: '0.875rem' }}>Cupom de desconto</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Código do cupom"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              style={{ flex: 1, padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.875rem' }}
            />
            <button
              onClick={handleApplyCoupon}
              disabled={couponLoading}
              style={{ padding: '0.4rem 0.9rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
            >
              {couponLoading ? '...' : 'Aplicar'}
            </button>
          </div>
          {couponError && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.4rem' }}>{couponError}</p>}
          {cart.couponCode && (
            <p style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '0.4rem' }}>
              Cupom <strong>{cart.couponCode}</strong> aplicado
            </p>
          )}
        </div>

        {/* Shipping calculator */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1rem' }}>
          <p style={{ fontWeight: 600, marginBottom: '0.6rem', fontSize: '0.875rem' }}>Calcular frete</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="CEP (somente números)"
              value={cepInput}
              onChange={(e) => setCepInput(e.target.value)}
              maxLength={9}
              style={{ flex: 1, padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.875rem' }}
            />
            <button
              onClick={handleCalculateShipping}
              disabled={shippingLoading}
              style={{ padding: '0.4rem 0.9rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
            >
              {shippingLoading ? '...' : 'Calcular'}
            </button>
          </div>
          {shippingError && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.4rem' }}>{shippingError}</p>}
          {shippingOptions.length > 0 && (
            <ul style={{ marginTop: '0.6rem', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {shippingOptions.map((opt) => (
                <li key={opt.id} style={{ fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{opt.name} ({opt.days} dias)</span>
                  <span style={{ fontWeight: 600 }}>{formatBRL(opt.price)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Order summary */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1rem' }}>
          <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>Resumo do pedido</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <span>{formatBRL(cart.subtotal)}</span>
            </div>
            {cart.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                <span>Desconto</span>
                <span>- {formatBRL(cart.discount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Frete</span>
              <span>{cart.shippingCost > 0 ? formatBRL(cart.shippingCost) : 'A calcular'}</span>
            </div>
            <hr style={{ margin: '0.4rem 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem' }}>
              <span>Total</span>
              <span style={{ color: 'var(--color-primary)' }}>{formatBRL(cart.total)}</span>
            </div>
          </div>
          <Link
            to="/checkout"
            style={{
              display: 'block',
              marginTop: '1rem',
              padding: '0.75rem',
              background: 'var(--color-primary)',
              color: '#fff',
              borderRadius: 8,
              textDecoration: 'none',
              textAlign: 'center',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}
          >
            Ir para Checkout
          </Link>
        </div>
      </aside>
    </main>
  );
}
