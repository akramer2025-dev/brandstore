import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function backupAllData() {
  console.log('🔄 Starting full database backup...\n');

  try {
    // Backup Products
    const products = await prisma.product.findMany({
      include: {
        category: true,
        vendor: true,
      },
    });
    console.log(`✅ Backed up ${products.length} products`);

    // Backup Categories
    const categories = await prisma.category.findMany();
    console.log(`✅ Backed up ${categories.length} categories`);

    // Backup Users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    console.log(`✅ Backed up ${users.length} users`);

    // Backup Orders
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        vendor: {
          select: {
            id: true,
            businessName: true,
          },
        },
      },
    });
    console.log(`✅ Backed up ${orders.length} orders`);

    // Backup Vendors
    const vendors = await prisma.vendor.findMany();
    console.log(`✅ Backed up ${vendors.length} vendors`);

    // Create backup object
    const backup = {
      timestamp: new Date().toISOString(),
      whatsapp: '00201555512778',
      website: 'https://www.remostore.net',
      data: {
        products,
        categories,
        users,
        orders,
        vendors,
      },
      stats: {
        products: products.length,
        categories: categories.length,
        users: users.length,
        orders: orders.length,
        vendors: vendors.length,
      },
    };

    // Save to file
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const filename = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const filepath = path.join(backupDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));

    console.log(`\n✅ Full backup saved to: ${filepath}`);
    console.log('\n📊 Backup Summary:');
    console.log('┌─────────────┬────────┐');
    console.log('│ Table       │ Count  │');
    console.log('├─────────────┼────────┤');
    console.log(`│ Products    │ ${backup.stats.products.toString().padStart(6)} │`);
    console.log(`│ Categories  │ ${backup.stats.categories.toString().padStart(6)} │`);
    console.log(`│ Users       │ ${backup.stats.users.toString().padStart(6)} │`);
    console.log(`│ Orders      │ ${backup.stats.orders.toString().padStart(6)} │`);
    console.log(`│ Vendors     │ ${backup.stats.vendors.toString().padStart(6)} │`);
    console.log('└─────────────┴────────┘');
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

backupAllData()
  .then((filepath) => {
    console.log('\n✅ Backup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  });
