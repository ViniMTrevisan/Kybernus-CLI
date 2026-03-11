import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../../shared/lib/apiFetch';
import { useAuthStore } from '../../auth/useAuthStore';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';

interface ProductVariant {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  stock: number;
  price: number | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  images: string[];
  variants: ProductVariant[];
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

type AddStatus = 'idle' | 'adding' | 'added' | 'error';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [product, setProduct] = useState<Product | null>(null);
  usePageTitle(product?.name ?? 'Produto');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addStatus, setAddStatus] = useState<AddStatus>('idle');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    apiFetch<Product>(`/api/products/${slug}`)
      .then((p) => {
        setProduct(p);
        const inStock = p.variants.find((v) => v.stock > 0);
        setSelectedVariant(inStock ?? p.variants[0] ?? null);
      })
      .catch(() => setError('Produto não encontrado'))
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleAddToCart() {
    if (!accessToken) {
      navigate('/login');
      return;
    }
    if (!selectedVariant) return;
    setAddStatus('adding');
    try {
      await apiFetch('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({ variantId: selectedVariant.id, qty: 1 }),
      });
      setAddStatus('added');
      setTimeout(() => setAddStatus('idle'), 2500);
    } catch {
      setAddStatus('error');
      setTimeout(() => setAddStatus('idle'), 2500);
    }
  }

  if (loading) return <p style={{ marginTop: '2rem', color: 'var(--color-text-muted)' }}>Carregando...</p>;
  if (error || !product) return <p role="alert" style={{ color: '#ef4444' }}>{error || 'Produto não encontrado'}</p>;

  const inStock = selectedVariant ? selectedVariant.stock > 0 : product.variants.some((v) => v.stock > 0);
  const addLabel =
    addStatus === 'adding' ? 'Adicionando...' :
    addStatus === 'added'  ? '✓ Adicionado!' :
    addStatus === 'error'  ? 'Erro — tente novamente' :
    'Adicionar ao carrinho';

  return (
    <div style={{ maxWidth: 860 }}>
      <button
        type="button"
        onClick={() => navigate(-1)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', marginBottom: '1.5rem', padding: 0, fontSize: '0.95rem' }}
      >
        ← Voltar
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: product.images.length ? '1fr 1fr' : '1fr', gap: '2.5rem', alignItems: 'start' }}>
        {product.images.length > 0 && (
          <img
            src={product.images[0]}
            alt={product.name}
            style={{ width: '100%', borderRadius: '10px', objectFit: 'cover', aspectRatio: '1' }}
          />
        )}

        <div>
          <h1 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-family)', fontSize: '1.75rem' }}>
            {product.name}
          </h1>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '1rem' }}>
            {formatBRL(product.price)}
          </p>

          {product.description && (
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: 1.65 }}>
              {product.description}
            </p>
          )}

          {product.variants.length > 1 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Variação</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={v.stock === 0}
                      onClick={() => setSelectedVariant(v)}
                      style={{
                        padding: '0.4rem 0.9rem',
                        border: `2px solid ${isSelected ? 'var(--color-primary)' : '#d1d5db'}`,
                        borderRadius: '5px',
                        cursor: v.stock === 0 ? 'not-allowed' : 'pointer',
                        opacity: v.stock === 0 ? 0.45 : 1,
                        background: isSelected ? 'var(--color-primary)' : 'white',
                        color: isSelected ? 'white' : 'inherit',
                        fontFamily: 'var(--font-family)',
                      }}
                    >
                      {v.size ?? v.color ?? v.sku}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!inStock && (
            <p style={{ color: '#ef4444', marginBottom: '1rem', fontWeight: 600 }}>Produto sem estoque</p>
          )}

          <button
            type="button"
            disabled={!inStock || addStatus === 'adding'}
            onClick={handleAddToCart}
            style={{
              width: '100%',
              padding: '0.85rem 1.5rem',
              background: inStock ? 'var(--color-primary)' : '#9ca3af',
              color: 'white',
              border: 'none',
              borderRadius: '7px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: inStock ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--font-family)',
              transition: 'opacity 0.15s',
            }}
          >
            {addLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
