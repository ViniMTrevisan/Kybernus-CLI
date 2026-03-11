/**
 * Prisma seed — popula o banco com dados de demonstração.
 * Execute com: npm run db:seed  (dentro de apps/api) ou
 *              npm run db:seed  (na raiz do monorepo)
 */
import { PrismaClient, Role, ProductStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database…');

  // ── Admin user ─────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@1234', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@minhaloja.com.br' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@minhaloja.com.br',
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log(`  ✔ Admin: ${admin.email}`);

  // ── Demo customer ──────────────────────────────────────────────────────────
  const customerPassword = await bcrypt.hash('Cliente@1234', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'cliente@exemplo.com.br' },
    update: {},
    create: {
      name: 'João Silva',
      email: 'cliente@exemplo.com.br',
      passwordHash: customerPassword,
      role: Role.CUSTOMER,
    },
  });
  console.log(`  ✔ Customer: ${customer.email}`);

  // ── Categories ─────────────────────────────────────────────────────────────
  const catCamisetas = await prisma.category.upsert({
    where: { slug: 'camisetas' },
    update: {},
    create: { name: 'Camisetas', slug: 'camisetas', description: 'Camisetas e básicos' },
  });

  const catCalcas = await prisma.category.upsert({
    where: { slug: 'calcas' },
    update: {},
    create: { name: 'Calças', slug: 'calcas', description: 'Calças e bermudas' },
  });

  const catAcessorios = await prisma.category.upsert({
    where: { slug: 'acessorios' },
    update: {},
    create: { name: 'Acessórios', slug: 'acessorios', description: 'Bolsas, cintos, bonés' },
  });
  console.log(`  ✔ Categories: ${catCamisetas.name}, ${catCalcas.name}, ${catAcessorios.name}`);

  // ── Products ───────────────────────────────────────────────────────────────
  const products = [
    {
      name: 'Camiseta Básica Branca',
      slug: 'camiseta-basica-branca',
      description: 'Camiseta 100% algodão, corte regular, disponível em vários tamanhos.',
      price: 49.9,
      categoryId: catCamisetas.id,
      images: ['https://placehold.co/600x600?text=Camiseta+Branca'],
      variants: [
        { sku: 'CAM-BRA-P', size: 'P', color: 'Branco', stock: 20 },
        { sku: 'CAM-BRA-M', size: 'M', color: 'Branco', stock: 30 },
        { sku: 'CAM-BRA-G', size: 'G', color: 'Branco', stock: 25 },
      ],
    },
    {
      name: 'Camiseta Básica Preta',
      slug: 'camiseta-basica-preta',
      description: 'Camiseta 100% algodão, corte regular.',
      price: 49.9,
      categoryId: catCamisetas.id,
      images: ['https://placehold.co/600x600?text=Camiseta+Preta'],
      variants: [
        { sku: 'CAM-PTO-P', size: 'P', color: 'Preto', stock: 15 },
        { sku: 'CAM-PTO-M', size: 'M', color: 'Preto', stock: 20 },
        { sku: 'CAM-PTO-G', size: 'G', color: 'Preto', stock: 18 },
      ],
    },
    {
      name: 'Calça Slim Jeans',
      slug: 'calca-slim-jeans',
      description: 'Calça slim fit em denim stretch, confortável para o dia a dia.',
      price: 149.9,
      categoryId: catCalcas.id,
      images: ['https://placehold.co/600x600?text=Calça+Jeans'],
      variants: [
        { sku: 'CAL-JEA-38', size: '38', color: 'Azul', stock: 10 },
        { sku: 'CAL-JEA-40', size: '40', color: 'Azul', stock: 12 },
        { sku: 'CAL-JEA-42', size: '42', color: 'Azul', stock: 8 },
      ],
    },
    {
      name: 'Boné Snapback',
      slug: 'bone-snapback',
      description: 'Boné aba reta com fecho snapback, tamanho único.',
      price: 59.9,
      categoryId: catAcessorios.id,
      images: ['https://placehold.co/600x600?text=Boné'],
      variants: [
        { sku: 'BON-BLK-UN', color: 'Preto', stock: 40 },
        { sku: 'BON-WHT-UN', color: 'Branco', stock: 35 },
      ],
    },
  ];

  for (const p of products) {
    const { variants, ...productData } = p;
    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: {
        ...productData,
        price: productData.price,
        status: ProductStatus.ACTIVE,
        variants: {
          createMany: { data: variants, skipDuplicates: true },
        },
      },
    });
    console.log(`  ✔ Product: ${product.name}`);
  }

  // ── Coupon ─────────────────────────────────────────────────────────────────
  const coupon = await prisma.coupon.upsert({
    where: { code: 'BEMVINDO10' },
    update: {},
    create: {
      code: 'BEMVINDO10',
      discountType: 'percent',
      discountValue: 10,
      minOrderValue: 50,
    },
  });
  console.log(`  ✔ Coupon: ${coupon.code} (${coupon.discountValue}% off)`);

  console.log('\n✅ Seed concluído!');
  console.log('\nCredenciais para teste:');
  console.log('  Admin  → admin@minhaloja.com.br / Admin@1234');
  console.log('  Cliente → cliente@exemplo.com.br / Cliente@1234');
  console.log('  Cupom  → BEMVINDO10 (10% off em pedidos acima de R$50)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
