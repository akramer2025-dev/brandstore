import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import https from 'https';

const prisma = new PrismaClient();

// Prompts لتوليد صور واقعية للملابس
const productPrompts: Record<string, string> = {
  // تيشرتات
  'تيشرت': 'Professional product photography of premium cotton t-shirt with small embroidered colorful phoenix brand logo on left chest, {{COLOR}}, hanging on wooden hanger, clean boutique background, soft studio lighting, fashion catalog style, high detail, 4k quality',
  
  // هوديز
  'هودي': 'Professional product photography of premium hoodie with large embroidered colorful phoenix brand logo on center chest, {{COLOR}}, laid flat on clean surface, studio lighting, fashion catalog style, high detail, 4k quality',
  
  // سويتشيرت
  'سويتشيرت': 'Professional product photography of premium sweatshirt with embroidered colorful phoenix brand logo, {{COLOR}}, hanging on hanger, modern boutique interior, soft lighting, fashion catalog style, 4k quality',
  
  // بولو
  'بولو': 'Professional product photography of polo shirt with small embroidered brand logo on left chest, {{COLOR}}, hanging on hanger, clean background, studio lighting, premium fashion catalog style, high detail',
  
  // جاكيت
  'جاكيت': 'Professional product photography of premium jacket with embroidered brand logo, {{COLOR}}, hanging on hanger, boutique display style, soft lighting, fashion catalog photo, 4k quality',
  
  // بنطلون
  'بنطلون': 'Professional product photography of premium pants/joggers with small embroidered brand logo on pocket, {{COLOR}}, hanging on hanger, clean background, studio lighting, fashion catalog style, high detail',
  
  // طقم
  'طقم': 'Professional product photography of matching tracksuit set (sweatshirt and pants) with embroidered colorful phoenix brand logo on chest, {{COLOR}}, hanging together on hanger, sportswear catalog style, modern setting, 4k quality',
  
  // فستان
  'فستان': 'Professional product photography of elegant dress with small embroidered brand logo, {{COLOR}}, hanging on wooden hanger, boutique display style, soft lighting, fashion catalog photo, high detail'
};

// ألوان شائعة
const colors: Record<string, string> = {
  'أبيض': 'white',
  'أسود': 'black',
  'أزرق': 'navy blue',
  'رمادي': 'heather gray',
  'بيج': 'cream beige',
  'وردي': 'pink blush',
  'أخضر': 'sage green',
  'بني': 'brown',
  'أحمر': 'burgundy red',
  'تركواز': 'turquoise'
};

// دالة لتحديد نوع المنتج من الاسم
function getProductType(name: string): string {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('تيشرت') || lowerName.includes('تي شيرت')) return 'تيشرت';
  if (lowerName.includes('هودي')) return 'هودي';
  if (lowerName.includes('سويتشيرت') || lowerName.includes('سويت شيرت')) return 'سويتشيرت';
  if (lowerName.includes('بولو')) return 'بولو';
  if (lowerName.includes('جاكيت') || lowerName.includes('جاكت')) return 'جاكيت';
  if (lowerName.includes('بنطلون') || lowerName.includes('بنطال')) return 'بنطلون';
  if (lowerName.includes('طقم')) return 'طقم';
  if (lowerName.includes('فستان')) return 'فستان';
  
  return 'تيشرت'; // افتراضي
}

// دالة لاستخراج اللون من اسم المنتج
function getColorFromName(name: string): string {
  const lowerName = name.toLowerCase();
  
  for (const [arabicColor, englishColor] of Object.entries(colors)) {
    if (lowerName.includes(arabicColor.toLowerCase())) {
      return englishColor;
    }
  }
  
  // ألوان افتراضية عشوائية
  const defaultColors = ['navy blue', 'heather gray', 'black', 'white', 'cream beige'];
  return defaultColors[Math.floor(Math.random() * defaultColors.length)];
}

// دالة لتنزيل الصورة من URL
function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {}); // حذف الملف في حالة الخطأ
        reject(err);
      });
    }).on('error', reject);
  });
}

// دالة لتوليد الصورة باستخدام OpenAI DALL-E
async function generateImage(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.log('⚠️  OPENAI_API_KEY غير موجود - سيتم استخدام صور Unsplash بدلاً من ذلك');
    
    // استخدام Unsplash كبديل
    const clothingImages = [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', // T-shirt
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80', // Polo
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80', // Hoodie
      'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800&q=80', // Sweatshirt
      'https://images.unsplash.com/photo-1525450824786-227cbef70703?w=800&q=80', // Jacket
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80', // Pants
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80', // Dress
    ];
    
    return clothingImages[Math.floor(Math.random() * clothingImages.length)];
  }

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        style: 'natural'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API Error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.data[0].url;
  } catch (error) {
    console.error('خطأ في توليد الصورة:', error);
    // استخدام صورة Unsplash كبديل
    return 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80';
  }
}

async function generateProductImages() {
  try {
    console.log('🎨 بدء توليد صور المنتجات...\n');

    // جلب جميع المنتجات
    const products = await prisma.product.findMany({
      take: 10, // نبدأ بـ 10 منتجات كتجربة
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📦 وجدنا ${products.length} منتج\n`);

    // إنشاء مجلد uploads إذا لم يكن موجوداً
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`\n[${i + 1}/${products.length}] معالجة: ${product.nameAr}`);

      try {
        // تحديد نوع المنتج واللون
        const productType = getProductType(product.nameAr);
        const color = getColorFromName(product.nameAr);
        
        // إنشاء الـ prompt
        let prompt = productPrompts[productType] || productPrompts['تيشرت'];
        prompt = prompt.replace('{{COLOR}}', color);
        
        console.log(`  📝 النوع: ${productType} | اللون: ${color}`);
        console.log(`  🎨 توليد الصورة...`);

        // توليد الصورة
        const imageUrl = await generateImage(prompt);
        console.log(`  ✅ تم التوليد: ${imageUrl.substring(0, 60)}...`);

        // تنزيل الصورة
        const filename = `product-${product.id}-${Date.now()}.jpg`;
        const filepath = path.join(uploadsDir, filename);
        
        console.log(`  💾 تنزيل الصورة...`);
        await downloadImage(imageUrl, filepath);
        
        // تحديث المنتج في قاعدة البيانات
        const imageRelativePath = `/uploads/${filename}`;
        
        await prisma.product.update({
          where: { id: product.id },
          data: {
            images: imageRelativePath
          }
        });

        console.log(`  ✅ تم حفظ الصورة: ${imageRelativePath}`);
        successCount++;

        // تأخير بسيط لتجنب Rate Limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`  ❌ فشل: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
        failCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 النتائج النهائية:');
    console.log(`  ✅ نجح: ${successCount}`);
    console.log(`  ❌ فشل: ${failCount}`);
    console.log(`  📦 إجمالي: ${products.length}`);
    console.log('='.repeat(60) + '\n');

    if (successCount > 0) {
      console.log('🎉 تم! افتح المتجر وشوف الصور الجديدة');
      console.log('🌐 http://localhost:3000\n');
    }

  } catch (error) {
    console.error('❌ خطأ عام:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
console.log('🚀 مولد صور المنتجات الاحترافي');
console.log('='.repeat(60) + '\n');

generateProductImages()
  .then(() => {
    console.log('✅ اكتمل بنجاح!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ فشل:', error);
    process.exit(1);
  });
