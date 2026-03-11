import { useEffect, useState } from 'react';
import { apiFetch } from '../../../shared/lib/apiFetch';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  avgOrderValue: number;
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function DashboardPage() {
  usePageTitle('Dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<DashboardStats>('/api/admin/dashboard/stats')
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Erro ao carregar estatísticas');
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={{ marginTop: '2rem', color: '#6b7280' }}>Carregando...</p>;
  if (error || !stats) return <p role="alert" style={{ color: '#ef4444' }}>{error ?? 'Erro desconhecido'}</p>;

  const statCards = [
    { label: 'Receita Total', value: formatBRL(stats.totalRevenue), icon: '💰', color: '#10b981' },
    { label: 'Total de Pedidos', value: String(stats.totalOrders), icon: '📦', color: '#6366f1' },
    { label: 'Total de Clientes', value: String(stats.totalCustomers), icon: '👥', color: '#f59e0b' },
    { label: 'Ticket Médio', value: formatBRL(stats.avgOrderValue), icon: '📊', color: '#3b82f6' },
  ];

  return (
    <main>
      <h1 style={{ marginBottom: '1.75rem' }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.25rem' }}>
        {statCards.map((card) => (
          <div key={card.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.875rem', padding: '1.25rem 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{card.icon}</div>
            <p style={{ fontSize: '0.8rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>{card.label}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
