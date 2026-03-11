import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../../shared/lib/apiFetch';
import { useAuthStore } from '../../auth/useAuthStore';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';

interface ProductVariant {
  id?: string;
  sku: string;
  size?: string;
  color?: string;
  stock: number;
  price?: number | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  categoryId?: string;
  images: string[];
  status: string;
  variants: ProductVariant[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ── Blank variant template ────────────────────────────────────────────────────
const blankVariant = (): ProductVariant => ({ sku: '', size: '', color: '', stock: 0, price: null });

// ── Shared styles ─────────────────────────────────────────────────────────────
const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.75rem 1rem',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};
const tdStyle: React.CSSProperties = { padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#111827', verticalAlign: 'middle' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box', fontFamily: 'inherit' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.25rem' };
const fieldStyle: React.CSSProperties = { marginBottom: '0.875rem' };
const primaryBtn: React.CSSProperties = { background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 1.25rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' };
const secondaryBtn: React.CSSProperties = { background: 'transparent', border: '1px solid #d1d5db', color: '#374151', borderRadius: '6px', padding: '0.5rem 1.25rem', fontWeight: 500, cursor: 'pointer', fontSize: '0.875rem' };
const dangerBtn: React.CSSProperties = { background: 'transparent', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: '6px', padding: '0.4rem 0.875rem', fontWeight: 500, cursor: 'pointer', fontSize: '0.8rem' };

// ── Modal overlay ─────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #f3f4f6' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: '#9ca3af', lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ padding: '1.5rem' }}>{children}</div>
      </div>
    </div>
  );
}

// ── Variant row editor ─────────────────────────────────────────────────────────
function VariantRow({ variant, index, onChange, onRemove, canRemove }: {
  variant: ProductVariant;
  index: number;
  onChange: (i: number, v: ProductVariant) => void;
  onRemove: (i: number) => void;
  canRemove: boolean;
}) {
  const u = (field: keyof ProductVariant, val: string) =>
    onChange(index, { ...variant, [field]: field === 'stock' ? Number(val) : field === 'price' ? (val === '' ? null : Number(val)) : val });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
      <input placeholder="SKU *" value={variant.sku} onChange={(e) => u('sku', e.target.value)} style={inputStyle} required />
      <input placeholder="Tamanho" value={variant.size ?? ''} onChange={(e) => u('size', e.target.value)} style={inputStyle} />
      <input placeholder="Cor" value={variant.color ?? ''} onChange={(e) => u('color', e.target.value)} style={inputStyle} />
      <input placeholder="Estoque" type="number" min="0" value={variant.stock} onChange={(e) => u('stock', e.target.value)} style={inputStyle} />
      <input placeholder="Preço" type="number" min="0" step="0.01" value={variant.price ?? ''} onChange={(e) => u('price', e.target.value)} style={inputStyle} />
      <button type="button" onClick={() => onRemove(index)} disabled={!canRemove} style={{ ...dangerBtn, padding: '0.4rem 0.6rem', opacity: canRemove ? 1 : 0.3 }}>✕</button>
    </div>
  );
}

// ── Product form (shared between create & edit) ───────────────────────────────
interface ProductFormProps {
  initial?: Partial<Product>;
  categories: Category[];
  onSave: (data: Omit<Product, 'id' | 'slug' | 'status' | 'images'>) => Promise<void>;  onCancel: () => void;
  saving: boolean;
  formError: string | null;
}

function ProductForm({ initial, categories, onSave, onCancel, saving, formError }: ProductFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(String(initial?.price ?? ''));
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '');
  const [variants, setVariants] = useState<ProductVariant[]>(
    initial?.variants?.length ? initial.variants.map((v) => ({ sku: v.sku, size: v.size ?? '', color: v.color ?? '', stock: v.stock, price: v.price ?? null })) : [blankVariant()],
  );

  function handleVariantChange(i: number, v: ProductVariant) {
    setVariants((prev) => prev.map((x, idx) => (idx === i ? v : x)));
  }
  function addVariant() { setVariants((prev) => [...prev, blankVariant()]); }
  function removeVariant(i: number) { setVariants((prev) => prev.filter((_, idx) => idx !== i)); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSave({ name, description: description || undefined, price: Number(price), categoryId: categoryId || undefined, variants });
  }

  return (
    <form onSubmit={handleSubmit}>
      {formError && <p role="alert" style={{ color: '#dc2626', marginBottom: '1rem', padding: '0.625rem 0.75rem', background: '#fef2f2', borderRadius: '6px', fontSize: '0.875rem' }}>{formError}</p>}

      <div style={fieldStyle}>
        <label style={labelStyle} htmlFor="pf-name">Nome *</label>
        <input id="pf-name" style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} required placeholder="Camiseta Básica" />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle} htmlFor="pf-desc">Descrição</label>
        <textarea id="pf-desc" style={{ ...inputStyle, height: 72, resize: 'vertical' }} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição do produto..." />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.875rem' }}>
        <div>
          <label style={labelStyle} htmlFor="pf-price">Preço base (R$) *</label>
          <input id="pf-price" type="number" min="0" step="0.01" style={inputStyle} value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="49.90" />
        </div>
        <div>
          <label style={labelStyle} htmlFor="pf-cat">Categoria</label>
          <select id="pf-cat" style={inputStyle} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">— sem categoria —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1rem', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#374151' }}>Variações *</span>
          <button type="button" onClick={addVariant} style={{ ...secondaryBtn, padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>+ Adicionar</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.25rem' }}>
          {['SKU', 'Tamanho', 'Cor', 'Estoque', 'Preço'].map((h) => <span key={h} style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>{h}</span>)}
          <span />
        </div>
        {variants.map((v, i) => (
          <VariantRow key={i} variant={v} index={i} onChange={handleVariantChange} onRemove={removeVariant} canRemove={variants.length > 1} />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
        <button type="button" onClick={onCancel} style={secondaryBtn}>Cancelar</button>
        <button type="submit" disabled={saving} style={{ ...primaryBtn, opacity: saving ? 0.7 : 1 }}>{saving ? 'Salvando...' : 'Salvar'}</button>
      </div>
    </form>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function ProductsAdminPage() {
  usePageTitle('Produtos (Admin)');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  // Saving / deleting state
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Image upload
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);

  function loadProducts() {
    setLoading(true);
    Promise.all([
      apiFetch<{ items: Product[]; nextCursor: string | null }>('/api/products'),
      apiFetch<Category[]>('/api/categories').catch(() => [] as Category[]),
    ])
      .then(([prodData, cats]) => {
        setProducts(prodData.items);
        setCategories(cats);
        setLoading(false);
      })
      .catch(() => {
        setError('Erro ao carregar produtos');
        setLoading(false);
      });
  }

  useEffect(() => { loadProducts(); }, []);

  // ── Create ──────────────────────────────────────────────────────────────────
  async function handleCreate(data: Omit<Product, 'id' | 'slug' | 'status' | 'images'>) {
    setSaving(true);
    setFormError(null);
    try {
      await apiFetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, images: [] }),
      });      setShowCreate(false);
      loadProducts();
    } catch {
      setFormError('Erro ao criar produto. Verifique os campos.');
    } finally {
      setSaving(false);
    }
  }

  // ── Edit ────────────────────────────────────────────────────────────────────
  async function handleEdit(data: Omit<Product, 'id' | 'slug' | 'status' | 'images'>) {
    if (!editProduct) return;
    setSaving(true);
    setFormError(null);
    try {
      await apiFetch(`/api/products/${editProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, description: data.description, price: data.price }),
      });
      setEditProduct(null);
      loadProducts();
    } catch {
      setFormError('Erro ao atualizar produto.');
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/products/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      loadProducts();
    } catch {
      setError('Erro ao excluir produto.');
    } finally {
      setDeleting(false);
    }
  }

  // ── Image upload ────────────────────────────────────────────────────────────
  function handleUploadClick(productId: string) {
    setActiveUploadId(productId);
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !activeUploadId) return;

    setUploadingId(activeUploadId);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = useAuthStore.getState().accessToken;
      const res = await fetch(`/api/products/${activeUploadId}/image`, {
        method: 'POST',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        setError(body.error ?? 'Erro ao fazer upload');
      } else {
        loadProducts();
      }
    } catch {
      setError('Erro ao fazer upload');
    } finally {
      setUploadingId(null);
      setActiveUploadId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  if (loading) return <p style={{ color: '#6b7280', marginTop: '2rem' }}>Carregando...</p>;

  return (
    <main>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Produtos</h1>
        <button style={primaryBtn} onClick={() => { setFormError(null); setShowCreate(true); }}>+ Novo Produto</button>
      </div>

      {error && (
        <p role="alert" style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>
      )}

      {/* Hidden file input for image upload */}
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" style={{ display: 'none' }} onChange={handleFileChange} />

      {products.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Nenhum produto cadastrado.</p>
          <button
            type="button"
            onClick={() => { setFormError(null); setShowCreate(true); }}
            style={primaryBtn}
          >
            + Cadastrar primeiro produto
          </button>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={thStyle}>Imagem</th>
              <th style={thStyle}>Nome</th>
              <th style={thStyle}>Preço</th>
              <th style={thStyle}>Variantes</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={tdStyle}>
                  {p.images[0] ? (
                    <img src={p.images[0]} alt={p.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }} />
                  ) : (
                    <div style={{ width: 48, height: 48, background: '#e5e7eb', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>📦</div>
                  )}
                </td>
                <td style={tdStyle}>{p.name}</td>
                <td style={tdStyle}>{formatBRL(p.price)}</td>
                <td style={tdStyle}>{p.variants.length}</td>
                <td style={tdStyle}>
                  <span style={{ background: p.status === 'ACTIVE' ? '#d1fae5' : '#fee2e2', color: p.status === 'ACTIVE' ? '#065f46' : '#991b1b', padding: '2px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600 }}>
                    {p.status}
                  </span>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleUploadClick(p.id)}
                      disabled={uploadingId === p.id}
                      style={{ ...secondaryBtn, padding: '0.3rem 0.7rem', fontSize: '0.78rem' }}
                    >
                      {uploadingId === p.id ? '...' : '📷'}
                    </button>
                    <button
                      onClick={() => { setFormError(null); setEditProduct(p); }}
                      style={{ ...secondaryBtn, padding: '0.3rem 0.7rem', fontSize: '0.78rem' }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setDeleteTarget(p)}
                      style={{ ...dangerBtn, padding: '0.3rem 0.7rem', fontSize: '0.78rem' }}
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Create modal ──────────────────────────────────────────────────── */}
      {showCreate && (
        <Modal title="Novo Produto" onClose={() => setShowCreate(false)}>
          <ProductForm
            categories={categories}
            onSave={handleCreate}
            onCancel={() => setShowCreate(false)}
            saving={saving}
            formError={formError}
          />
        </Modal>
      )}

      {/* ── Edit modal ────────────────────────────────────────────────────── */}
      {editProduct && (
        <Modal title={`Editar: ${editProduct.name}`} onClose={() => setEditProduct(null)}>
          <ProductForm
            initial={editProduct}
            categories={categories}
            onSave={handleEdit}
            onCancel={() => setEditProduct(null)}
            saving={saving}
            formError={formError}
          />
        </Modal>
      )}

      {/* ── Delete confirm modal ──────────────────────────────────────────── */}
      {deleteTarget && (
        <Modal title="Confirmar exclusão" onClose={() => setDeleteTarget(null)}>
          <p style={{ marginTop: 0 }}>
            Tem certeza que deseja excluir <strong>{deleteTarget.name}</strong>? Esta ação não pode ser desfeita.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button onClick={() => setDeleteTarget(null)} style={secondaryBtn}>Cancelar</button>
            <button onClick={handleDelete} disabled={deleting} style={{ ...dangerBtn, padding: '0.5rem 1.25rem', opacity: deleting ? 0.7 : 1 }}>
              {deleting ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}
