'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, Loader2, X, ScanBarcode, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

interface ScannedProductData {
  nameAr: string;
  name: string;
  barcode?: string;
  descriptionAr: string;
  description: string;
  suggestedPrice: number;
  category: string;
  sizes?: string[];
  colors?: string[];
  confidence: number;
}

interface SmartCameraProps {
  onProductScanned: (data: ScannedProductData, imageUrl: string) => void;
  onImageCaptured?: (imageUrl: string) => void;
}

export function SmartCamera({ onProductScanned, onImageCaptured }: SmartCameraProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScannedProductData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // فتح الكاميرا
  const openCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // الكاميرا الخلفية
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOpen(true);
      }
    } catch (err) {
      console.error('Error opening camera:', err);
      setError('فشل فتح الكاميرا. تأكد من منح الأذونات المطلوبة.');
    }
  }, []);

  // إغلاق الكاميرا
  const closeCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setCapturedImage(null);
    setScanResult(null);
    setError(null);
  }, []);

  // التقاط صورة
  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // ضبط حجم Canvas بناءً على الفيديو
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // رسم الصورة
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // تحويل لـ Base64
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedImage(imageDataUrl);

    // إيقاف الكاميرا بعد الالتقاط
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);

    // إرسال الصورة للـ parent component
    if (onImageCaptured) {
      onImageCaptured(imageDataUrl);
    }
  }, [onImageCaptured]);

  // معالجة رفع صورة من المعرض
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageDataUrl = event.target?.result as string;
      setCapturedImage(imageDataUrl);
      
      if (onImageCaptured) {
        onImageCaptured(imageDataUrl);
      }
    };
    reader.readAsDataURL(file);
  }, [onImageCaptured]);

  // تحليل الصورة باستخدام AI
  const scanProduct = useCallback(async () => {
    if (!capturedImage) return;

    setIsScanning(true);
    setError(null);

    try {
      // رفع الصورة أولاً
      const uploadFormData = new FormData();
      const blob = await fetch(capturedImage).then(r => r.blob());
      uploadFormData.append('files', blob, 'product-scan.jpg');

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        throw new Error('فشل رفع الصورة');
      }

      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.urls[0];

      // تحليل الصورة باستخدام AI
      const response = await fetch('/api/ai/scan-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل تحليل الصورة');
      }

      setScanResult(data.data);
      onProductScanned(data.data, imageUrl);

    } catch (err: any) {
      console.error('Error scanning product:', err);
      setError(err.message || 'حدث خطأ أثناء تحليل الصورة');
    } finally {
      setIsScanning(false);
    }
  }, [capturedImage, onProductScanned]);

  return (
    <div className="space-y-4">
      {/* أزرار التحكم */}
      {!isCameraOpen && !capturedImage && (
        <div className="grid grid-cols-2 gap-4">
          <Button
            type="button"
            onClick={openCamera}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white h-24 text-lg"
          >
            <Camera className="w-6 h-6 mr-2" />
            📸 فتح الكاميرا
          </Button>
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white h-24 text-lg"
          >
            <Image className="w-6 h-6 mr-2" alt="" width={24} height={24} />
            🖼️ اختر صورة
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      )}

      {/* عرض الكاميرا */}
      {isCameraOpen && (
        <Card className="bg-black/90 border-purple-500/50 overflow-hidden">
          <CardContent className="p-0 relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto max-h-[500px] object-contain"
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
              <Button
                type="button"
                onClick={captureImage}
                size="lg"
                className="bg-white text-black hover:bg-gray-200 rounded-full h-16 w-16 p-0"
              >
                <Camera className="w-8 h-8" />
              </Button>
              <Button
                type="button"
                onClick={closeCamera}
                size="lg"
                variant="destructive"
                className="rounded-full h-16 w-16 p-0"
              >
                <X className="w-8 h-8" />
              </Button>
            </div>
            {/* شبكة التوجيه */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full border-2 border-dashed border-purple-400/50 m-8"></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* الصورة الملتقطة */}
      {capturedImage && !scanResult && (
        <Card className="bg-white/5 border-white/20 overflow-hidden">
          <CardContent className="p-4">
            <div className="relative h-64 mb-4">
              <Image
                src={capturedImage}
                alt="Captured product"
                fill
                className="object-contain rounded-lg"
              />
            </div>
            <div className="flex gap-4">
              <Button
                type="button"
                onClick={scanProduct}
                disabled={isScanning}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white h-12"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    جاري التحليل...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    تحليل المنتج بالذكاء الاصطناعي
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={() => setCapturedImage(null)}
                variant="outline"
                className="border-red-500/50 hover:bg-red-500/20 text-red-400"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* نتيجة الفحص */}
      {scanResult && (
        <Card className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              <div>
                <h3 className="text-white font-bold text-xl">تم التعرف على المنتج!</h3>
                <p className="text-emerald-300 text-sm">
                  نسبة الثقة: {Math.round(scanResult.confidence * 100)}%
                </p>
              </div>
            </div>
            <div className="space-y-2 text-white bg-black/30 p-4 rounded-lg">
              <p><strong>الاسم:</strong> {scanResult.nameAr}</p>
              {scanResult.barcode && (
                <p className="flex items-center gap-2">
                  <ScanBarcode className="w-4 h-4" />
                  <strong>الباركود:</strong> {scanResult.barcode}
                </p>
              )}
              <p><strong>السعر المقترح:</strong> {scanResult.suggestedPrice} ج</p>
              <p><strong>الفئة:</strong> {scanResult.category}</p>
              {scanResult.sizes && scanResult.sizes.length > 0 && (
                <p><strong>المقاسات:</strong> {scanResult.sizes.join(', ')}</p>
              )}
              {scanResult.colors && scanResult.colors.length > 0 && (
                <p><strong>الألوان:</strong> {scanResult.colors.join(', ')}</p>
              )}
            </div>
            <Button
              type="button"
              onClick={() => {
                setCapturedImage(null);
                setScanResult(null);
              }}
              className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white"
            >
              مسح واستخدام البيانات
            </Button>
          </CardContent>
        </Card>
      )}

      {/* رسالة خطأ */}
      {error && (
        <Card className="bg-red-500/20 border-red-500/50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <p className="text-red-200">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Canvas مخفي للتقاط الصورة */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
