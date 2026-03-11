import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { catalogService } from './catalog.registry';

// ── Validation schemas ────────────────────────────────────────────────────────
const variantSchema = z.object({
  sku: z.string().min(1),
  size: z.string().nullish(),
  color: z.string().nullish(),
  stock: z.number().int().min(0),
  price: z.number().positive().nullish(),
});

const createProductSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().nullish(),
  price: z.number({ required_error: 'Preço é obrigatório' }),
  categoryId: z.string().optional(),
  categorySlug: z.string().optional(),
  images: z.array(z.string().url()).default([]),
  variants: z.array(variantSchema).min(1, 'Pelo menos uma variação é necessária'),
});

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullish(),
  price: z.number().optional(),
  images: z.array(z.string().url()).optional(),
});

const stockUpdateSchema = z.object({
  variantId: z.string().min(1),
  delta: z.number().int(),
});

const listQuerySchema = z.object({
  categorySlug: z.string().optional(),
  categoryId: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  q: z.string().optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'newest']).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ── Controllers ───────────────────────────────────────────────────────────────
export async function listProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(422).json({ errors: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    // Resolve categorySlug → categoryId if needed
    let categoryId = parsed.data.categoryId;
    if (!categoryId && parsed.data.categorySlug) {
      const cats = await catalogService.listCategories();
      const cat = cats.find((c) => c.slug === parsed.data.categorySlug);
      if (cat) categoryId = cat.id;
    }

    const result = await catalogService.searchProducts({
      ...parsed.data,
      categoryId,
    });

    res.status(200).json({
      items: result.items.map((p) => p.toRecord()),
      nextCursor: result.nextCursor,
    });
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await catalogService.getProductBySlug(req.params['slug'] ?? '');
    res.status(200).json(product.toRecord());
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  const parsed = createProductSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ errors: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const product = await catalogService.createProduct(parsed.data);
    res.status(201).json(product.toRecord());
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  const parsed = updateProductSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ errors: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const product = await catalogService.updateProduct(req.params['id'] ?? '', parsed.data);
    res.status(200).json(product.toRecord());
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await catalogService.deleteProduct(req.params['id'] ?? '');
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function updateStock(req: Request, res: Response, next: NextFunction): Promise<void> {
  const parsed = stockUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ errors: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const result = await catalogService.updateStock({
      productId: req.params['id'] ?? '',
      variantId: parsed.data.variantId,
      delta: parsed.data.delta,
    });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function listCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cats = await catalogService.listCategories();
    res.status(200).json({ data: cats.map((c) => c.toRecord()) });
  } catch (err) {
    next(err);
  }
}

export async function uploadProductImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.file) {
    res.status(400).json({ error: 'Arquivo de imagem obrigatório' });
    return;
  }

  const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!ALLOWED_MIMETYPES.includes(req.file.mimetype)) {
    res.status(400).json({ error: 'Apenas imagens JPEG, PNG, GIF ou WebP são aceitas' });
    return;
  }

  try {
    const product = await catalogService.uploadProductImage(
      req.params['id'] ?? '',
      req.file.buffer,
      req.file.mimetype,
    );
    res.status(200).json(product.toRecord());
  } catch (err) {
    next(err);
  }
}
