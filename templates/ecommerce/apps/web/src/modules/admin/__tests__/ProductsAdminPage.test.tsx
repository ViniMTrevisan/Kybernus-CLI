import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ProductsAdminPage } from '../pages/ProductsAdminPage';

const mockFetch = jest.fn();
beforeAll(() => { global.fetch = mockFetch; });
beforeEach(() => mockFetch.mockClear());

function renderPage() {
  return render(
    <MemoryRouter>
      <ProductsAdminPage />
    </MemoryRouter>,
  );
}

const products = [
  {
    id: 'p1',
    name: 'Camiseta Básica',
    slug: 'camiseta-basica',
    price: 49.9,
    images: [],
    variants: [],
    status: 'ACTIVE',
    categoryId: 'cat1',
    description: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p2',
    name: 'Tênis Runner',
    slug: 'tenis-runner',
    price: 299.9,
    images: ['http://example.com/img.jpg'],
    variants: [],
    status: 'ACTIVE',
    categoryId: 'cat2',
    description: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('ProductsAdminPage', () => {
  it('renderiza lista de produtos com nome e preço', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ items: products, nextCursor: null }),
    });
    renderPage();
    await waitFor(() => expect(screen.getByText('Camiseta Básica')).toBeInTheDocument());
    expect(screen.getByText('Tênis Runner')).toBeInTheDocument();
    expect(screen.getByText(/49[,.]9/)).toBeInTheDocument();
  });

  it('exibe botão "Novo Produto"', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ items: products, nextCursor: null }),
    });
    renderPage();
    await waitFor(() => expect(screen.getByText(/novo produto/i)).toBeInTheDocument());
  });

  it('aceita upload de imagem via input file', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ items: products, nextCursor: null }),
    });
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => expect(screen.getByText('Camiseta Básica')).toBeInTheDocument());

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).not.toBeNull();

    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' });
    await user.upload(fileInput, file);
    expect(fileInput.files?.[0]).toBe(file);
  });
});
