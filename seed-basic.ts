import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بدء تعبئة البيانات الأساسية...');
  console.log('⚠️  ملاحظة: هذا السكريبت يضيف بيانات جديدة فقط ولا يمسح البيانات الموجودة');

  // التحقق من وجود بيانات مسبقاً
  const existingProducts = await prisma.product.count();
  const existingUsers = await prisma.user.count();
  
  if (existingProducts > 0 || existingUsers > 0) {
    console.log(`📊 وجد ${existingProducts} منتج و ${existingUsers} مستخدم في قاعدة البيانات`);
    console.log('⚠️  لن يتم مسح أي بيانات موجودة. سيتم إضافة بيانات جديدة فقط إذا لزم الأمر.');
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise<string>((resolve) => {
      readline.question('هل تريد المتابعة؟ (yes/no): ', resolve);
    });
    
    readline.close();
    
    if (answer.toLowerCase() !== 'yes') {
      console.log('❌ تم إلغاء العملية');
      return;
    }
  }

  // إنشاء فئات أساسية (فقط إذا لم تكن موجودة)
  const existingCategories = await prisma.category.findMany();
  let categories = existingCategories;
  
  if (existingCategories.length === 0) {
    categories = await Promise.all([
      prisma.category.create({
        data: {
          name: 'Shirts',
          nameAr: 'قمصان',
          description: 'قمصان رجالية ونسائية',
        },
      }),
      prisma.category.create({
        data: {
          name: 'Pants',
          nameAr: 'بناطيل',
          description: 'بناطيل وجينز',
        },
      }),
      prisma.category.create({
        data: {
          name: 'Dresses',
          nameAr: 'فساتين',
          description: 'فساتين سهرة ويومية',
        },
      }),
    ]);
    console.log('✅ تم إنشاء', categories.length, 'فئة');
  } else {
    console.log('ℹ️  تخطي إنشاء الفئات - موجودة بالفعل');
  }

  // إنشاء مدير النظام (فقط إذا لم يكن موجود)
  let admin = await prisma.user.findUnique({ where: { email: 'admin@store.com' } });
  
  if (!admin) {
    const adminPassword = await bcrypt.hash('admin123', 10);
    admin = await prisma.user.create({
      data: {
        email: 'admin@store.com',
        username: 'admin',
        name: 'مدير النظام',
        password: adminPassword,
        role: 'ADMIN',
      },
    });
    console.log('✅ تم إنشاء المدير:', admin.email);
  } else {
    console.log('ℹ️  تخطي إنشاء المدير - موجود بالفعل');
  }

  // إنشاء حسابات الشركاء
  const partnersPassword = await bcrypt.hash('Aazxc', 10);

  // 1. صاحب محل
  const storeOwner = await prisma.user.create({
    data: {
      email: 'store@partner.com',
      username: 'store_owner',
      name: 'أحمد صاحب المحل',
      password: partnersPassword,
      role: 'VENDOR',
      vendor: {
        create: {
          businessName: 'Ahmad Store',
          businessNameAr: 'محل أحمد',
          businessType: 'store',
          storeName: 'Ahmad Fashion Store',
          storeNameAr: 'محل أحمد للأزياء',
          phone: '01111111111',
          city: 'القاهرة',
          category: 'ملابس',
          yearsOfExperience: 5,
          bankName: 'البنك الأهلي المصري',
          accountNumber: '123456789',
          isApproved: true,
          commissionRate: 15,
        },
      },
    },
  });
  console.log('✅ تم إنشاء صاحب محل:', storeOwner.email);

  // 2. صاحب مصنع
  const factoryOwner = await prisma.user.create({
    data: {
      email: 'factory@partner.com',
      username: 'factory_owner',
      name: 'محمد صاحب المصنع',
      password: partnersPassword,
      role: 'MANUFACTURER',
      vendor: {
        create: {
          businessName: 'Mohamed Factory',
          businessNameAr: 'مصنع محمد',
          businessType: 'factory',
          storeName: 'Mohamed Textile Factory',
          storeNameAr: 'مصنع محمد للمنسوجات',
          phone: '01222222222',
          city: 'الإسكندرية',
          category: 'ملابس',
          yearsOfExperience: 10,
          bankName: 'بنك مصر',
          accountNumber: '987654321',
          isApproved: true,
          commissionRate: 10,
        },
      },
    },
  });
  console.log('✅ تم إنشاء صاحب مصنع:', factoryOwner.email);

  // 3. مندوب توصيل
  const deliveryStaff = await prisma.user.create({
    data: {
      email: 'delivery@partner.com',
      username: 'delivery_staff',
      name: 'خالد مندوب التوصيل',
      password: partnersPassword,
      role: 'DELIVERY_STAFF',
      deliveryStaff: {
        create: {
          phone: '01333333333',
          email: 'delivery@partner.com',
          city: 'الجيزة',
          vehicleType: 'دراجة نارية',
          vehicleNumber: 'ABC-1234',
          bankName: 'البنك التجاري الدولي',
          accountNumber: '555555555',
          isApproved: true,
          isAvailable: true,
        },
      },
    },
  });
  console.log('✅ تم إنشاء مندوب توصيل:', deliveryStaff.email);

  // جلب بيانات vendor للشركاء
  const storeOwnerVendor = await prisma.vendor.findUnique({
    where: { userId: storeOwner.id }
  });
  
  const factoryOwnerVendor = await prisma.vendor.findUnique({
    where: { userId: factoryOwner.id }
  });

  // إنشاء بعض المنتجات التجريبية
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Classic White Shirt',
        nameAr: 'قميص أبيض كلاسيكي',
        description: 'High-quality cotton white shirt',
        descriptionAr: 'قميص أبيض قطني عالي الجودة',
        price: 299,
        originalPrice: 399,
        stock: 50,
        categoryId: categories[0].id,
        vendorId: storeOwnerVendor?.id,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Blue Jeans',
        nameAr: 'جينز أزرق',
        description: 'Comfortable blue denim jeans',
        descriptionAr: 'جينز أزرق مريح من القماش الدنيم',
        price: 499,
        originalPrice: 699,
        stock: 30,
        categoryId: categories[1].id,
        vendorId: factoryOwnerVendor?.id,
        isActive: true,
        isFlashDeal: true,
        flashDealEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        badge: 'خصم',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Evening Dress',
        nameAr: 'فستان سهرة',
        description: 'Elegant evening dress',
        descriptionAr: 'فستان سهرة أنيق للمناسبات الخاصة',
        price: 899,
        stock: 15,
        categoryId: categories[2].id,
        vendorId: storeOwner.vendor?.id,
        isActive: true,
      },
    }),
  ]);

  console.log('✅ تم إنشاء', products.length, 'منتج');

  console.log('\n🎉 تم إنشاء البيانات الأساسية بنجاح!');
  console.log('\n📧 بيانات الدخول:');
  console.log('════════════════════════════════');
  console.log('👤 المدير:');
  console.log('   البريد: admin@store.com');
  console.log('   كلمة المرور: admin123');
  console.log('\n🏪 الشركاء (كلمة المرور: Aazxc):');
  console.log('   1. صاحب محل: store@partner.com');
  console.log('   2. صاحب مصنع: factory@partner.com');
  console.log('   3. مندوب توصيل: delivery@partner.com');
  console.log('════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ خطأ:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
