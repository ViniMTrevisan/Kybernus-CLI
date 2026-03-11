import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';

const mockProduct = {
  id: 'prod-1',
  name: 'Camiseta Básica',
  slug: 'camiseta-basica',
  price: 49.9,
  images: ['https://via.placeholder.com/300'],
  variants: [
    { id: 'var-1', sku: 'CAM-P', size: 'P', color: 'Branco', stock: 5 },
  ],
};

const outOfStockProduct = {
  ...mockProduct,
  id: 'prod-2',
  slug: 'camiseta-sem-estoque',
  variants: [{ id: 'var-2', sku: 'CAM-P2', size: 'P', color: 'Preto', stock: 0 }],
};

function renderCard(product = mockProduct) {
  return render(
    <MemoryRouter>
      <ProductCard product={product} />
    </MemoryRouter>,
  );
}

describe('ProductCard', () => {
  it('deve exibir nome, preço formatado em BRL e imagem', () => {
    renderCard();

    expect(screen.getByText('Camiseta Básica')).toBeInTheDocument();
    // Price should be formatted as BRL currency
    expect(screen.getByText(/R\$\s*49[,.]?90?/)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /camiseta básica/i })).toBeInTheDocument();
  });

  it('deve exibir badge "Sem Estoque" quando todo o estoque é 0', () => {
    renderCard(outOfStockProduct);

    expect(screen.getByText(/sem estoque/i)).toBeInTheDocument();
  });

  it('não deve exibir badge "Sem Estoque" quando há variação disponível', () => {
    renderCard();

    expect(screen.queryByText(/sem estoque/i)).not.toBeInTheDocument();
  });

  it('deve ter link que navega para página de detalhe (/products/:slug)', () => {
    renderCard();

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/products/camiseta-basica');
  });
});
