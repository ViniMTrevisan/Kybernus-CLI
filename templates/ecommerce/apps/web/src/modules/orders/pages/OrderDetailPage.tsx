import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../../../shared/lib/apiFetch';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';

interface OrderItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  qty: number;
  image: string | null;
}

interface OrderDetail {
  id: string;
  status: string;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  trackingCode: string | null;
  createdAt: string;
  items: OrderItem[];
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function OrderDetailPage() {
  usePageTitle('Detalhes do Pedido');
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<OrderDetail>(`/api/orders/${id}`)
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Pedido não encontrado');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Carregando...</p>;
  if (error || !order) return <p role="alert">{error ?? 'Erro desconhecido'}</p>;

  return (
    <main>
      <h1>Pedido #{order.id.slice(0, 8)}</h1>
      <p>
        Status: <strong>{order.status}</strong>
      </p>
      {order.trackingCode && (
        <p>Código de rastreamento: <strong>{order.trackingCode}</strong></p>
      )}
      <h2>Itens</h2>
      <ul>
        {order.items.map((item) => (
          <li key={item.id}>
            {item.name} × {item.qty} — {formatBRL(item.price)}
          </li>
        ))}
      </ul>
      <p>Total: {formatBRL(order.total)}</p>
    </main>
  );
}
