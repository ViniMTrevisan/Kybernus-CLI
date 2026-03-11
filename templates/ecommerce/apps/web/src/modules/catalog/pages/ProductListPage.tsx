import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '../../../shared/lib/apiFetch';
import { ProductCard } from '../components/ProductCard';
import { ProductFilters } from '../components/ProductFilters';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductVariant {
  id: string;
  sku: string;
  stock: number;
  price: number | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  variants: ProductVariant[];
}

interface ProductsResponse {
  items: Product[];
  nextCursor: string | null;
}

export function ProductListPage() {
  usePageTitle('Produtos');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  useEffect(() => {
    apiFetch<{ data: Category[] }>('/api/categories')
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (filters['categorySlug']) params.set('categorySlug', String(filters['categorySlug']));
    if (filters['q']) params.set('q', String(filters['q']));
    const qs = params.toString();
    apiFetch<ProductsResponse>(`/api/products${qs ? `?${qs}` : ''}`)
      .then((res) => {
        setProducts(res.items);
        setError('');
      })
      .catch(() => setError('Erro ao carregar produtos'))
      .finally(() => setIsLoading(false));
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div>
      <h1 style={{ marginBottom: '1rem', fontFamily: 'var(--font-family)' }}>Produtos</h1>
      <ProductFilters categories={categories} onFilterChange={setFilters} />

      {isLoading && (
        <p style={{ marginTop: '2rem', color: 'var(--color-text-muted)' }}>Carregando...</p>
      )}
      {error && (
        <p role="alert" style={{ marginTop: '2rem', color: '#ef4444' }}>
          {error}
        </p>
      )}
      {!isLoading && !error && products.length === 0 && (
        <p style={{ marginTop: '2rem', color: 'var(--color-text-muted)' }}>
          Nenhum produto encontrado.
        </p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginTop: '1.5rem',
        }}
      >
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
