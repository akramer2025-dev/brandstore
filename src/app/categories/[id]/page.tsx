import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { ProductCardPro } from '@/components/ProductCardPro';

interface PageProps {
  params: {
    id: string;
  };
}

async function getCategory(categoryId: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        products: {
          where: {
            stock: { gt: 0 }, // فقط المنتجات المتوفرة
          },
          include: {
            category: true,
            vendor: {
              select: {
                id: true,
                businessName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return category;
  } catch (error) {
    console.error('❌ خطأ في جلب الفئة:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = await getCategory(params.id);

  if (!category) {
    return {
      title: 'الفئة غير موجودة',
    };
  }

  return {
    title: `${category.nameAr} - ريمو ستور`,
    description: category.description || `تسوق ${category.nameAr} من ريمو ستور`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const category = await getCategory(params.id);

  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white py-12">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-4 text-white/80">
            <Link href="/" className="hover:text-white transition">
              الرئيسية
            </Link>
            <span>/</span>
            <span className="text-white font-semibold">
              {category.nameAr}
            </span>
          </div>

          {/* Category Header */}
          <div className="flex items-center gap-6">
            {category.image && (
              <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-white/30 flex-shrink-0">
                <Image
                  src={category.image}
                  alt={category.nameAr}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              </div>
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {category.nameAr}
              </h1>
              {category.description && (
                <p className="text-white/90 text-lg">{category.description}</p>
              )}
              <p className="text-white/80 mt-2">
                {category.products.length} منتج متاح
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        {category.products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              لا توجد منتجات في هذه الفئة حالياً
            </h2>
            <p className="text-gray-500 mb-6">
              تابعنا قريباً لإضافة منتجات جديدة
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition"
            >
              العودة للرئيسية
            </Link>
          </div>
        ) : (
          <>
            {/* Products Count */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                المنتجات المتاحة ({category.products.length})
              </h2>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
              {category.products.map((product, index) => (
                <ProductCardPro key={product.id} product={product} index={index} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
