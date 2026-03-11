import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../../shared/lib/apiFetch';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';

interface OrderSummary {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{ name: string; qty: number }>;
}

interface OrdersResponse {
  items: OrderSummary[];
  nextCursor: string | null;
}

export function OrderHistoryPage() {
  usePageTitle('Meus Pedidos');
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<OrdersResponse>('/api/orders')
      .then((data) => {
        setOrders(data.items);
        setLoading(false);
      })
      .catch(() => {
        setError('Erro ao carregar pedidos');
        setLoading(false);
      });
  }, []);

  const statusColor: Record<string, string> = {
    PENDING: '#f59e0b', CONFIRMED: '#3b82f6', PROCESSING: '#8b5cf6',
    SHIPPED: '#06b6d4', DELIVERED: '#10b981', CANCELLED: '#ef4444',
  };

  if (loading) return <p style={{ marginTop: '2rem', color: '#6b7280' }}>Carregando...</p>;
  if (error) return <p role="alert" style={{ color: '#ef4444' }}>{error}</p>;
  if (orders.length === 0) return (
    <main style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <p style={{ color: '#6b7280', fontSize: '1rem', marginBottom: '1.25rem' }}>
        Você ainda não fez nenhum pedido.
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-block',
          background: 'var(--color-primary)',
          color: '#fff',
          textDecoration: 'none',
          padding: '0.6rem 1.5rem',
          borderRadius: '6px',
          fontWeight: 600,
          fontSize: '0.9rem',
        }}
      >
        Ver produtos →
      </Link>
    </main>
  );

  return (
    <main>
      <h1 style={{ marginBottom: '1.5rem' }}>Meus Pedidos</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'box-shadow 0.15s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
            >
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Pedido #{order.id}</p>
                <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>{order.items.map((i) => `${i.name} x${i.qty}`).join(', ')}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 700, color: '#6366f1', marginBottom: '0.25rem' }}>R$ {order.total.toFixed(2).replace('.', ',')}</p>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.55rem', borderRadius: '9999px', background: `${statusColor[order.status] ?? '#6b7280'}20`, color: statusColor[order.status] ?? '#6b7280' }}>
                  {order.status}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
