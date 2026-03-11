import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from '../pages/DashboardPage';

const mockFetch = jest.fn();
beforeAll(() => { global.fetch = mockFetch; });
beforeEach(() => mockFetch.mockClear());

function renderPage() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
}

const baseStats = {
  totalRevenue: 1250.5,
  totalOrders: 25,
  totalCustomers: 10,
  avgOrderValue: 125.05,
};

describe('DashboardPage', () => {
  it('exibe estado de carregamento inicialmente', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
  });

  it('renderiza os KPIs: totalRevenue, totalOrders, totalCustomers, avgOrderValue', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => baseStats,
    });
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('25')).toBeInTheDocument(),
    );
    expect(screen.getByText('10')).toBeInTheDocument();
    // Revenue and avgOrderValue displayed as currency
    expect(screen.getByText(/1\.250,50|1250,50|1250.50/)).toBeInTheDocument();
  });

  it('exibe títulos dos KPI cards', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => baseStats,
    });
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/receita/i)).toBeInTheDocument(),
    );
    expect(screen.getByText(/pedidos/i)).toBeInTheDocument();
    expect(screen.getByText(/clientes/i)).toBeInTheDocument();
  });

  it('exibe erro ao falhar requisição', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 403 });
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole('alert')).toBeInTheDocument(),
    );
  });
});
