import { useEffect, useRef, useState } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Filters {
  categorySlug?: string;
  q?: string;
}

interface ProductFiltersProps {
  categories: Category[];
  onFilterChange: (filters: Record<string, unknown>) => void;
}

export function ProductFilters({ categories, onFilterChange }: ProductFiltersProps) {
  const [filters, setFilters] = useState<Filters>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    const next: Filters = value ? { ...filters, categorySlug: value } : { ...filters };
    if (!value) delete next.categorySlug;
    setFilters(next);
    onFilterChange(value ? { categorySlug: value } : {});
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const next = { ...filters, q: value };
    setFilters(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFilterChange(value ? { q: value } : {});
    }, 300);
  }

  function handleClear() {
    setFilters({});
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onFilterChange({});
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem' }}>
      <select
        aria-label="Filtrar por categoria"
        value={filters.categorySlug ?? ''}
        onChange={handleCategoryChange}
        style={{ width: 'auto', minWidth: '180px' }}
      >
        <option value="">Todas as categorias</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.slug}>
            {cat.name}
          </option>
        ))}
      </select>
      <input
        type="text"
        aria-label="Buscar produtos"
        value={filters.q ?? ''}
        onChange={handleSearchChange}
        placeholder="Buscar produtos..."
        style={{ width: 'auto', minWidth: '220px', flex: 1 }}
      />
      <button
        type="button"
        onClick={handleClear}
        style={{
          padding: '0.5625rem 1rem',
          background: 'transparent',
          border: '1.5px solid #d1d5db',
          borderRadius: '0.5rem',
          color: '#6b7280',
          fontWeight: 500,
          fontSize: '0.875rem',
          whiteSpace: 'nowrap',
          transition: 'border-color 0.15s, color 0.15s',
          width: 'auto',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#6366f1';
          (e.currentTarget as HTMLButtonElement).style.color = '#6366f1';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#d1d5db';
          (e.currentTarget as HTMLButtonElement).style.color = '#6b7280';
        }}
      >
        Limpar
      </button>
    </div>
  );
}
