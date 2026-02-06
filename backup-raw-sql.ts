import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function backupWithRawSQL() {
  console.log('🔄 Starting raw SQL backup...\n');

  try {
    // Backup Products (using raw SQL to avoid schema issues)
    const products = await prisma.$queryRaw`
      SELECT p.*, c.name as category_name, c."nameAr" as category_name_ar
      FROM products p
      LEFT JOIN categories c ON p."categoryId" = c.id
    `;
    console.log(`✅ Backed up ${(products as any[]).length} products`);

    // Backup Categories
    const categories = await prisma.$queryRaw`
      SELECT * FROM categories
    `;
    console.log(`✅ Backed up ${(categories as any[]).length} categories`);

    // Backup Users (without passwords)
    const users = await prisma.$queryRaw`
      SELECT id, name, email, phone, role, image, "createdAt", "updatedAt"
      FROM users
    `;
    console.log(`✅ Backed up ${(users as any[]).length} users`);

    // Backup Orders
    const orders = await prisma.$queryRaw`
      SELECT o.*, 
             u.name as customer_name, 
             u.email as customer_email,
             u.phone as customer_phone
      FROM orders o
      LEFT JOIN users u ON o."customerId" = u.id
    `;
    console.log(`✅ Backed up ${(orders as any[]).length} orders`);

    // Backup OrderItems
    const orderItems = await prisma.$queryRaw`
      SELECT oi.*, p.name as product_name, p."nameAr" as product_name_ar
      FROM order_items oi
      LEFT JOIN products p ON oi."productId" = p.id
    `;
    console.log(`✅ Backed up ${(orderItems as any[]).length} order items`);

    // Backup Vendors
    const vendors = await prisma.$queryRaw`
      SELECT * FROM vendors
    `;
    console.log(`✅ Backed up ${(vendors as any[]).length} vendors`);

    // Create backup object
    const backup = {
      timestamp: new Date().toISOString(),
      whatsapp: '00201555512778',
      website: 'https://www.remostore.net',
      note: 'Raw SQL backup - safe from schema changes',
      data: {
        products,
        categories,
        users,
        orders,
        orderItems,
        vendors,
      },
      stats: {
        products: (products as any[]).length,
        categories: (categories as any[]).length,
        users: (users as any[]).length,
        orders: (orders as any[]).length,
        orderItems: (orderItems as any[]).length,
        vendors: (vendors as any[]).length,
      },
    };

    // Save to file
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const filename = `backup-raw-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const filepath = path.join(backupDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));

    console.log(`\n✅ Raw SQL backup saved to: ${filepath}`);
    console.log('\n📊 Backup Summary:');
    console.log('┌──────────────┬────────┐');
    console.log('│ Table        │ Count  │');
    console.log('├──────────────┼────────┤');
    console.log(`│ Products     │ ${backup.stats.products.toString().padStart(6)} │`);
    console.log(`│ Categories   │ ${backup.stats.categories.toString().padStart(6)} │`);
    console.log(`│ Users        │ ${backup.stats.users.toString().padStart(6)} │`);
    console.log(`│ Orders       │ ${backup.stats.orders.toString().padStart(6)} │`);
    console.log(`│ Order Items  │ ${backup.stats.orderItems.toString().padStart(6)} │`);
    console.log(`│ Vendors      │ ${backup.stats.vendors.toString().padStart(6)} │`);
    console.log('└──────────────┴────────┘');
    console.log(`\n📱 WhatsApp: ${backup.whatsapp}`);
    console.log(`🌐 Website: ${backup.website}`);

    return filepath;
  } catch (error) {
    console.error('❌ Error during backup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

backupWithRawSQL()
  .then((filepath) => {
    console.log('\n✅ Raw SQL backup completed successfully!');
    console.log('📝 This backup is safe from schema changes');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  });
