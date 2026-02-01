"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  Package,
  ArrowRight,
  Minus,
  Plus,
  Loader2,
  Check,
  Star,
  User,
} from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  nameAr: string;
  descriptionAr: string;
  price: number;
  stock: number;
  images: string | null;
  categoryId: string;
  category: {
    id: string;
    nameAr: string;
  };
  createdAt: string;
  reviews?: Review[];
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem } = useCartStore();

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}`);
      if (!res.ok) throw new Error("فشل تحميل المنتج");
      const data = await res.json();
      setProduct(data);

      // Fetch related products from same category
      const relatedRes = await fetch(`/api/products?categoryId=${data.categoryId}`);
      const relatedData = await relatedRes.json();
      setRelatedProducts(relatedData.filter((p: Product) => p.id !== data.id).slice(0, 4));
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("فشل تحميل المنتج");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (quantity > product.stock) {
      toast.error(`الكمية المتاحة فقط ${product.stock}`);
      return;
    }

    addItem({
      id: product.id,
      name: product.nameAr,
      nameAr: product.nameAr,
      price: product.price,
      image: images[0],
    });

    toast.success("تمت الإضافة إلى السلة", {
      icon: <Check className="w-4 h-4" />,
    });
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 flex items-center justify-center">
        <Card className="bg-gray-800/80 border-teal-500/20 p-12 text-center">
          <p className="text-xl text-gray-400 mb-4">المنتج غير موجود</p>
          <Link href="/products">
            <Button className="bg-teal-600 hover:bg-teal-700">
              العودة للمنتجات
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Parse images from comma-separated string
  const images = product.images 
    ? product.images.split(',').map(img => img.trim()).filter(img => img)
    : ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-teal-400">الرئيسية</Link>
          <ArrowRight className="w-4 h-4 rotate-180" />
          <Link href="/products" className="hover:text-teal-400">المنتجات</Link>
          <ArrowRight className="w-4 h-4 rotate-180" />
          <Link href={`/products?category=${product.categoryId}`} className="hover:text-teal-400">
            {product.category.nameAr}
          </Link>
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span className="text-white">{product.nameAr}</span>
        </div>

        {/* Product Details */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <Card className="bg-gray-800/80 border-teal-500/20 overflow-hidden">
              <div className="aspect-square relative bg-gray-900">
                <Image
                  src={images[selectedImage] || '/placeholder.jpg'}
                  alt={product.nameAr}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.jpg';
                  }}
                />
                
                {/* Logo Watermark */}
                <div className="absolute top-4 left-4 w-20 h-20 bg-white/98 backdrop-blur-md shadow-2xl animate-glow-rotate overflow-hidden" style={{ clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)' }}>
                  <img 
                    src="/logo.png?v=2026" 
                    alt="BS Brand Store" 
                    className="w-full h-full scale-150 -translate-y-2 object-contain"
                  />
                </div>
              </div>
            </Card>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-teal-500 ring-2 ring-teal-500/50'
                        : 'border-gray-700 hover:border-teal-500/50'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.nameAr} ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 25vw, 15vw"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-600/20 text-teal-400 rounded-full text-sm mb-4">
                <Package className="w-4 h-4" />
                {product.category.nameAr}
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">{product.nameAr}</h1>
              <p className="text-gray-400 text-lg leading-relaxed">{product.descriptionAr}</p>
            </div>

            {/* Price & Stock */}
            <div className="flex items-baseline gap-4">
              <span className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                {product.price.toLocaleString()}
              </span>
              <span className="text-2xl text-gray-400">جنيه</span>
            </div>

            <div className="flex items-center gap-3">
              {product.stock > 0 ? (
                <>
                  <div className="flex items-center gap-2 text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">متوفر</span>
                  </div>
                  <span className="text-gray-500">({product.stock} قطعة متاحة)</span>
                </>
              ) : (
                <div className="flex items-center gap-2 text-red-400">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="font-medium">غير متوفر</span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="space-y-3">
                <label className="text-gray-300 font-medium">الكمية:</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-gray-800 rounded-lg p-2 border border-gray-700">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-5 h-5 text-white" />
                    </button>
                    <span className="text-2xl font-bold text-white min-w-[40px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= product.stock}
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  <span className="text-gray-400">
                    الإجمالي: <span className="text-teal-400 font-bold text-xl">
                      {(product.price * quantity).toLocaleString()} جنيه
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-6 h-6 ml-2" />
                إضافة للسلة
              </Button>
              <Button variant="outline" className="border-teal-500/50 hover:bg-teal-500/10 p-6">
                <Heart className="w-6 h-6 text-teal-400" />
              </Button>
              <Button variant="outline" className="border-teal-500/50 hover:bg-teal-500/10 p-6">
                <Share2 className="w-6 h-6 text-teal-400" />
              </Button>
            </div>

            {/* Brand & Quality Features */}
            <div className="bg-gradient-to-br from-teal-900/40 to-cyan-900/40 rounded-xl p-6 border border-teal-500/30 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 flex-shrink-0">
                  <img 
                    src="/logo.png?v=2026" 
                    alt="Brand Store" 
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">منتج أصلي من براند ستور</h3>
                  <p className="text-teal-400 text-sm">Original Brand Store Product</p>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3">
                  <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-teal-600/20 rounded-full">
                    <Check className="w-5 h-5 text-teal-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1">تطريز الشعار الأصلي</h4>
                    <p className="text-gray-400 text-sm">محفور بالتطريز الاحترافي على صدر القطعة - دليل الجودة والأصالة</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3">
                  <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-teal-600/20 rounded-full">
                    <Check className="w-5 h-5 text-teal-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1">خامات فاخرة 100%</h4>
                    <p className="text-gray-400 text-sm">أقمشة مستوردة عالية الجودة - قطن طبيعي ناعم ومريح</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3">
                  <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-teal-600/20 rounded-full">
                    <Check className="w-5 h-5 text-teal-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1">ألوان ثابتة لا تبهت</h4>
                    <p className="text-gray-400 text-sm">صبغات عالمية - تحافظ على لونها بعد الغسيل</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3">
                  <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-teal-600/20 rounded-full">
                    <Check className="w-5 h-5 text-teal-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1">تصميم عصري أنيق</h4>
                    <p className="text-gray-400 text-sm">قصات حديثة تناسب جميع المناسبات</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-teal-500/20">
                <Shield className="w-5 h-5 text-teal-400" />
                <span className="text-gray-300 text-sm">كل منتج يحمل شعار الجودة المطرز</span>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-700">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center bg-teal-600/20 rounded-full">
                  <Truck className="w-6 h-6 text-teal-400" />
                </div>
                <p className="text-sm text-gray-400">شحن سريع</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center bg-teal-600/20 rounded-full">
                  <Shield className="w-6 h-6 text-teal-400" />
                </div>
                <p className="text-sm text-gray-400">ضمان الجودة</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center bg-teal-600/20 rounded-full">
                  <Package className="w-6 h-6 text-teal-400" />
                </div>
                <p className="text-sm text-gray-400">فحص عند الاستلام</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">منتجات مشابهة</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.id} href={`/products/${relatedProduct.id}`}>
                  <Card className="bg-gray-800/80 border-teal-500/20 hover:border-teal-500/50 transition-all cursor-pointer group">
                    <div className="aspect-square relative overflow-hidden">
                      <Image
                        src={relatedProduct.images?.split(',')[0]?.trim() || '/placeholder.jpg'}
                        alt={relatedProduct.nameAr}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.jpg';
                        }}
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-white font-bold mb-2 group-hover:text-teal-400 transition-colors">
                        {relatedProduct.nameAr}
                      </h3>
                      <p className="text-teal-400 font-bold text-xl">
                        {relatedProduct.price.toLocaleString()} جنيه
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-16 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white">آراء العملاء</h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 ${
                        star <= Math.round(product.reviews!.reduce((acc, r) => acc + r.rating, 0) / product.reviews!.length)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-400 text-lg">
                  ({product.reviews.length} {product.reviews.length === 1 ? 'تقييم' : 'تقييمات'})
                </span>
              </div>
            </div>

            <div className="grid gap-6">
              {product.reviews.map((review) => (
                <Card key={review.id} className="bg-gray-800/80 border-teal-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-bold text-lg">{review.user.name}</h3>
                          <span className="text-gray-400 text-sm">
                            {new Date(review.createdAt).toLocaleDateString('ar-EG', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${
                                star <= review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-300 leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
