import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// نسخة من دالة Levenshtein من الكود الأصلي
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []
  for (let i = 0; i <= str2.length; i++) matrix[i] = [i]
  for (let j = 0; j <= str1.length; j++) matrix[0][j] = j
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  return matrix[str2.length][str1.length]
}

interface ProductInfo {
  id: string
  name: string
  nameAr: string
  category: string | null
}

// نسخة من دالة البحث الجديدة
function findMatchingProducts(message: string, products: ProductInfo[]): ProductInfo[] {
  const query = message.toLowerCase()
  
  const stopWords = ['عاوز', 'عايز', 'عاوزة', 'عاوزه', 'عاوزين', 'عندكم', 'فين', 'ايه', 'عن', 'في', 'من', 'على', 'ال', 'ده', 'دي', 'هل', 'كم', 'سعر', 'اسعار', 'منتج', 'منتجات', 'حاجة', 'حاجات', 'ابغى', 'ابي', 'وش', 'شو', 'بكام', 'كام', 'قد', 'ايش', 'شنو', 'يا', 'لو', 'ممكن', 'عرض', 'اعرض', 'ورينى', 'وريني', 'ورينا', 'فيه', 'جيبلي', 'جيبلى', 'اجيب', 'احسن', 'اروع', 'اجمل', 'ابحث', 'دور', 'دوري', 'ابحثلي']
  
  const scored = products.map(p => {
    let score = 0
    const productName = p.name.toLowerCase()
    const productNameAr = p.nameAr.toLowerCase()
    const productCategory = (p.category || '').toLowerCase()
    
    if (productName === query || productNameAr === query) score += 100
    if (productName.includes(query) || query.includes(productName)) score += 50
    if (productNameAr.includes(query) || query.includes(productNameAr)) score += 50
    
    const queryWords = query.split(/\s+/).filter(w => w.length > 1 && !stopWords.includes(w))
    
    for (const word of queryWords) {
      if (word.length < 2) continue
      
      if (word.length > 3) {
        if (productName.includes(word)) score += 30
        if (productNameAr.includes(word)) score += 30
        if (productCategory.includes(word)) score += 20
      } else {
        if (productName.includes(word)) score += 15
        if (productNameAr.includes(word)) score += 15
        if (productCategory.includes(word)) score += 10
        
        const nameWords = productNameAr.split(/\s+/)
        for (const nameWord of nameWords) {
          if (nameWord.length >= 2 && nameWord.length <= 3) {
            const distance = levenshteinDistance(word, nameWord)
            if (distance === 1) {
              score += 3
            }
          }
        }
      }
    }
    
    const hasLongWords = queryWords.some(w => w.length > 3)
    if (hasLongWords) {
      let hasExactMatch = false
      for (const word of queryWords) {
        if (word.length > 3) {
          if (productNameAr.includes(word) || productName.includes(word) || productCategory.includes(word)) {
            hasExactMatch = true
            break
          }
        }
      }
      if (!hasExactMatch) {
        score = Math.max(0, score - 50)
      }
    }
    
    return { product: p, score }
  })
  
  const filtered = scored
    .filter(s => s.score > 15)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
  
  if (filtered.length === 0) {
    return []
  }
  
  return filtered.map(s => s.product)
}

async function testProductSearch() {
  console.log('🔍 اختبار دقة البحث عن المنتجات...\n');

  try {
    const products = await prisma.product.findMany({
      where: { 
        isActive: true,
        isVisible: true,
      },
      select: {
        id: true,
        name: true,
        nameAr: true,
        category: {
          select: {
            nameAr: true,
          }
        },
      },
    });

    const testCases = [
      'اسدال',
      'ايشادو',
      'بريمر',
      'بلاشر',
      'حذاء',
      'قميص',
      'بنطلون',
    ];

    console.log(`📦 إجمالي المنتجات في القاعدة: ${products.length}\n`);
    console.log('═'.repeat(60));

    for (const testQuery of testCases) {
      console.log(`\n🔎 البحث عن: "${testQuery}"`);
      console.log('─'.repeat(60));
      
      const results = findMatchingProducts(testQuery, products.map(p => ({
        id: p.id,
        name: p.name,
        nameAr: p.nameAr,
        category: p.category?.nameAr || null,
      })));

      if (results.length === 0) {
        console.log('   ❌ لم يتم العثور على منتجات مطابقة');
      } else {
        console.log(`   ✅ وجدنا ${results.length} منتج مطابق:\n`);
        results.forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.nameAr}`);
          if (product.category) {
            console.log(`      الفئة: ${product.category}`);
          }
        });
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log('\n✅ الاختبار انتهى بنجاح!\n');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProductSearch();
