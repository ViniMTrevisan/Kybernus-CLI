import { useEffect, useState } from 'react';
import { apiFetch } from '../../../shared/lib/apiFetch';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';

type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  total: number;
  trackingCode: string | null;
  createdAt: string;
}

const STATUS_OPTIONS: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const STATUS_COLORS: Record<OrderStatus, { bg: string; color: string }> = {
  PENDING:   { bg: '#fef3c7', color: '#92400e' },
  PAID:      { bg: '#dbeafe', color: '#1e40af' },
  SHIPPED:   { bg: '#ede9fe', color: '#5b21b6' },
  DELIVERED: { bg: '#d1fae5', color: '#065f46' },
  CANCELLED: { bg: '#fee2e2', color: '#991b1b' },
};

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function OrdersAdminPage() {
  usePageTitle('Pedidos (Admin)');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  function loadOrders(status: string) {
    setLoading(true);
    setError(null);
    const qs = status ? `?status=${status}` : '';
    apiFetch<{ items: Order[]; nextCursor: string | null }>(`/api/admin/orders${qs}`)
      .then((data) => {
        setOrders(data.items);
        setLoading(false);
      })
      .catch(() => {
        setError('Erro ao carregar pedidos');
        setLoading(false);
      });
  }

  useEffect(() => {
    loadOrders(statusFilter);
  }, [statusFilter]);

  async function handleStatusChange(orderId: string, newStatus: string) {
    setUpdatingId(orderId);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        setError(body.error ?? 'Erro ao atualizar status');
      } else {
        loadOrders(statusFilter);
      }
    } catch {
      setError('Erro ao atualizar status');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Pedidos</h1>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <span>Filtrar por status:</span>
          <select
            aria-label="Filtrar por status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.35rem 0.75rem', borderRadius: 6, border: '1px solid #d1d5db', fontSize: '0.875rem' }}
          >
            <option value="">Todos</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <p role="alert" style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>
      )}

      {loading && <p style={{ color: '#6b7280' }}>Carregando...</p>}

      {!loading && orders.length === 0 && (
        <p style={{ color: '#6b7280' }}>Nenhum pedido encontrado.</p>
      )}

      {!loading && orders.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Total</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Rastreio</th>
                <th style={thStyle}>Data</th>
                <th style={thStyle}>Atualizar</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const colors = STATUS_COLORS[order.status] ?? { bg: '#f3f4f6', color: '#374151' };
                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={tdStyle}>{order.id}</td>
                    <td style={tdStyle}>{formatBRL(order.total)}</td>
                    <td style={tdStyle}>
                      <span style={{ background: colors.bg, color: colors.color, padding: '2px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600 }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={tdStyle}>{order.trackingCode ?? '—'}</td>
                    <td style={tdStyle}>{new Date(order.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td style={tdStyle}>
                      <select
                        aria-label={`Alterar pedido ${order.id}`}
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => void handleStatusChange(order.id, e.target.value)}
                        style={{ padding: '0.25rem 0.5rem', borderRadius: 4, border: '1px solid #d1d5db', fontSize: '0.8rem' }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.75rem 1rem',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const tdStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  fontSize: '0.875rem',
  color: '#111827',
  verticalAlign: 'middle',
};
