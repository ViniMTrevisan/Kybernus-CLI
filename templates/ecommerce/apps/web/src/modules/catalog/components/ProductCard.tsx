import { Link } from 'react-router-dom';

interface ProductVariant {
  stock: number;
}

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: readonly string[];
    variants: ProductVariant[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { name, slug, price, images, variants } = product;
  const outOfStock = variants.length > 0 && variants.every((v) => v.stock === 0);
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);

  return (
    <Link
      to={`/products/${slug}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '0.75rem',
          overflow: 'hidden',
          transition: 'box-shadow 0.18s ease, transform 0.18s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)';
          el.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.boxShadow = 'none';
          el.style.transform = 'none';
        }}
      >
        {images[0] ? (
          <img
            src={images[0]}
            alt={name}
            style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', aspectRatio: '1', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
            🛍️
          </div>
        )}
        <div style={{ padding: '0.875rem' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.375rem', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {name}
          </h2>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: '#6366f1' }}>
            {formattedPrice}
          </p>
          {outOfStock && (
            <span style={{ display: 'inline-block', marginTop: '0.375rem', fontSize: '0.75rem', background: '#fee2e2', color: '#dc2626', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 500 }}>
              Sem Estoque
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
