"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ShieldCheck, 
  Camera, 
  FileText, 
  CheckCircle2, 
  Upload, 
  Loader2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import SignaturePad from '@/components/SignaturePad';
import Image from 'next/image';

export default function InstallmentAgreementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Agreement data from checkout
  const totalAmount = parseFloat(searchParams.get('totalAmount') || '0');
  const downPayment = parseFloat(searchParams.get('downPayment') || '0');
  const installments = parseInt(searchParams.get('installments') || '0');
  const monthlyAmount = parseFloat(searchParams.get('monthlyAmount') || '0');
  
  // Form data
  const [formData, setFormData] = useState({
    nationalIdImage: null as File | null,
    nationalIdPreview: null as string | null,
    nationalIdBack: null as File | null,
    nationalIdBackPreview: null as string | null,
    firstPaymentReceipt: null as File | null,
    firstPaymentReceiptPreview: null as string | null,
    signature: '',
    selfieImage: null as File | null,
    selfiePreview: null as string | null,
    fullName: '',
    nationalId: '',
    acceptedTerms: false,
  });
  
  // Video ref for camera
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);
  
  // Check if user has valid session and agreement params
  useEffect(() => {
    if (mounted && (!totalAmount || !installments)) {
      toast.error('بيانات الاتفاقية غير صحيحة');
      router.push('/checkout');
    }
  }, [mounted, totalAmount, installments, router]);
  
  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }
  
  // Handle national ID image upload
  const handleNationalIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار صورة صحيحة');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        nationalIdImage: file,
        nationalIdPreview: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };
  
  // Handle first payment receipt upload
  const handleFirstPaymentReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار صورة صحيحة');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        firstPaymentReceipt: file,
        firstPaymentReceiptPreview: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };
  
  // Start camera for selfie
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraActive(true);
      toast.success('تم تشغيل الكاميرا بنجاح');
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('لا يمكن الوصول للكاميرا. يرجى التأكد من الأذونات');
    }
  };
  
  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };
  
  // Capture photo from camera
  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
            const reader = new FileReader();
            reader.onloadend = () => {
              setFormData(prev => ({
                ...prev,
                selfieImage: file,
                selfiePreview: reader.result as string
              }));
              stopCamera();
              toast.success('✓ تم التقاط الصورة بنجاح');
            };
            reader.readAsDataURL(file);
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };
  
  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);
  
  // Handle signature completion
  const handleSignatureComplete = (signature: string) => {
    setFormData(prev => ({ ...prev, signature }));
  };
  
  // Validate step
  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return formData.nationalIdImage !== null && 
               formData.nationalIdBack !== null && 
               formData.firstPaymentReceipt !== null;
      case 2:
        return formData.signature !== '';
      case 3:
        return formData.selfieImage !== null && formData.acceptedTerms;
      default:
        return false;
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!canProceedToNextStep()) {
      toast.error('يرجى استكمال جميع المتطلبات');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload images using our API endpoint
      const uploadImage = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload-receipt', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) throw new Error('فشل رفع الصورة');
        
        const data = await response.json();
        return data.url;
      };
      
      // Convert signature to file
      const convertSignatureToFile = async  (signatureDataUrl: string): Promise<File> => {
        const response = await fetch(signatureDataUrl);
        const blob = await response.blob();
        return new File([blob], 'signature.png', { type: 'image/png' });
      };
      
      toast.loading('جاري رفع المستندات...', { id: 'upload' });
      
      // Upload all images
      const signatureFile = await convertSignatureToFile(formData.signature);
      const [nationalIdUrl, nationalIdBackUrl, firstPaymentReceiptUrl, signatureUrl, selfieUrl] = await Promise.all([
        formData.nationalIdImage ? uploadImage(formData.nationalIdImage) : Promise.resolve(''),
        formData.nationalIdBack ? uploadImage(formData.nationalIdBack) : Promise.resolve(''),
        formData.firstPaymentReceipt ? uploadImage(formData.firstPaymentReceipt) : Promise.resolve(''),
        uploadImage(signatureFile),
        formData.selfieImage ? uploadImage(formData.selfieImage) : Promise.resolve('')
      ]);
      
      toast.success('تم رفع جميع المستندات بنجاح', { id: 'upload' });
      
      // Save documents to sessionStorage
      sessionStorage.setItem('installmentDocuments', JSON.stringify({
        nationalIdImage: nationalIdUrl,
        nationalIdBack: nationalIdBackUrl,
        firstPaymentReceipt: firstPaymentReceiptUrl,
        signature: signatureUrl,
        selfieImage: selfieUrl,
        fullName: formData.fullName,
        nationalId: formData.nationalId,
        totalAmount,
        downPayment,
        numberOfInstallments: installments,
        monthlyInstallment: monthlyAmount,
        completedAt: new Date().toISOString()
      }));
      
      toast.success('✅ تم توثيق الكمبيالة بنجاح!');
      
      // Redirect back to checkout with agreement completion flag
      setTimeout(() => {
        router.push('/checkout?installmentAgreementCompleted=true');
      }, 1000);
      
    } catch (error: any) {
      console.error('Error submitting agreement:', error);
      toast.error(error.message || 'حدث خطأ أثناء رفع المستندات');
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-6 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header with Logo */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/logo.png"
              alt="Logo"
              width={80}
              height={80}
              className="rounded-full"
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            🏦 اتفاقية التقسيط
          </h1>
          <p className="text-gray-400 text-sm">
            يرجى استكمال الخطوات التالية للموافقة على التقسيط
          </p>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold
                  transition-all duration-300
                  ${currentStep === step
                    ? 'bg-blue-600 text-white scale-110'
                    : currentStep > step
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-400'
                  }
                `}
              >
                {currentStep > step ? <CheckCircle2 className="w-5 h-5" /> : step}
              </div>
              
              {step < 3 && (
                <div
                  className={`
                    h-1 w-20 md:w-32 mx-2
                    ${currentStep > step ? 'bg-green-600' : 'bg-gray-700'}
                  `}
                />
              )}
            </div>
          ))}
        </div>
        
        {/* Agreement Terms (shown on all steps) */}
        <Card className="bg-gray-800/50 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              شروط الاتفاقية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-900/30 border border-amber-600 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                <div className="text-amber-100 text-sm space-y-2">
                  <p className="font-bold text-lg">⚠️ تحذير قانوني - نظام التقسيط:</p>
                  <p className="font-bold text-blue-300 text-base">
                    📋 سيتم تقسيم المبلغ إلى 4 دفعات متساوية، مع دفع الدفعة الأولى الآن لتأكيد الطلب
                  </p>
                  <p>
                    بموجب القانون المصري، أنت ملتزم بسداد جميع الأقساط في المواعيد المحددة.
                    عدم الالتزام بالسداد قد يعرضك للمساءلة القانونية والعقوبات التالية:
                  </p>
                  <ul className="list-disc list-inside space-y-1 mr-4">
                    <li>غرامات تأخير تصل إلى 10% من قيمة القسط</li>
                    <li>الإبلاغ عن سجلك الائتماني</li>
                    <li>اتخاذ إجراءات قانونية ضدك</li>
                    <li>حجز الممتلكات في حالة عدم السداد</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-900/30 border-2 border-blue-500 rounded-lg p-4">
              <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                💰 تفاصيل نظام التقسيط (4 دفعات)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-gray-400 mb-1 text-sm">المبلغ الإجمالي</p>
                  <p className="text-white font-bold text-lg">{totalAmount.toLocaleString()} ج</p>
                </div>
                
                <div className="bg-green-600/30 border border-green-500 rounded-lg p-3">
                  <p className="text-green-200 mb-1 text-sm">✓ الدفعة الأولى (الآن)</p>
                  <p className="text-white font-bold text-lg">{downPayment.toLocaleString()} ج</p>
                </div>
                
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-gray-400 mb-1 text-sm">الدفعة الثانية</p>
                  <p className="text-white font-bold text-lg">{monthlyAmount.toLocaleString()} ج</p>
                  <p className="text-gray-400 text-xs mt-1">بعد شهر واحد</p>
                </div>
                
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-gray-400 mb-1 text-sm">الدفعة الثالثة</p>
                  <p className="text-white font-bold text-lg">{monthlyAmount.toLocaleString()} ج</p>
                  <p className="text-gray-400 text-xs mt-1">بعد شهرين</p>
                </div>
                
                <div className="bg-gray-700/50 rounded-lg p-3 col-span-2">
                  <p className="text-gray-400 mb-1 text-sm">الدفعة الرابعة (الأخيرة)</p>
                  <p className="text-white font-bold text-lg">{monthlyAmount.toLocaleString()} ج</p>
                  <p className="text-gray-400 text-xs mt-1">بعد 3 أشهر</p>
                </div>
              </div>
              
              <div className="mt-4 bg-green-900/30 border border-green-600 rounded-lg p-3">
                <p className="text-green-100 text-sm">
                  ✅ <strong>ملاحظة هامة:</strong> يجب دفع الدفعة الأولى ({downPayment.toLocaleString()} ج) الآن عبر WE Pay لتأكيد الطلب
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Step 1: National ID */}
        {currentStep === 1 && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                الخطوة 1: صورة البطاقة الشخصية (وجهين)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Important Notice */}
              <div className="bg-amber-900/30 border-2 border-amber-500 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                  <div className="text-amber-100 text-sm space-y-2">
                    <p className="font-bold text-lg">⚠️ مطلوب: صورتين للبطاقة الشخصية</p>
                    <ul className="list-disc list-inside space-y-1 mr-4">
                      <li><strong>الوجه الأمامي:</strong> يجب أن تكون جميع البيانات واضحة ومقروءة (الاسم، الرقم القومي، العنوان)</li>
                      <li><strong>الوجه الخلفي:</strong> يجب أن تكون الصورة واضحة وتظهر جميع التفاصيل</li>
                      <li>تأكد من عدم وجود ظلال أو انعكاسات على الصور</li>
                      <li>استخدم إضاءة جيدة وخلفية واضحة</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Front Side Upload */}
              <div className="space-y-3 bg-blue-900/20 border-2 border-blue-500 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                  <Label htmlFor="nationalId" className="text-white font-bold text-lg">
                    📄 الوجه الأمامي للبطاقة
                    <span className="text-red-400 mr-1">*</span>
                  </Label>
                </div>
                
                <p className="text-blue-200 text-sm mb-3">
                  ✅ يجب أن تكون هذه الصورة واضحة جداً - سيتم التحقق من البيانات (الاسم، الرقم القومي، تاريخ الميلاد، العنوان)
                </p>
                
                <Input
                  id="nationalId"
                  type="file"
                  accept="image/*"
                  onChange={handleNationalIdUpload}
                  className="bg-gray-700 border-gray-600 text-white file:bg-blue-600 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-md hover:file:bg-blue-700"
                />
                
                {formData.nationalIdPreview && (
                  <div className="relative mt-3">
                    <img
                      src={formData.nationalIdPreview}
                      alt="الوجه الأمامي للبطاقة"
                      className="w-full h-64 object-contain bg-gray-900 rounded-lg border-2 border-green-500"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        nationalIdImage: null, 
                        nationalIdPreview: null 
                      }))}
                      className="absolute top-2 right-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <div className="absolute bottom-2 left-2 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      ✓ تم رفع الوجه الأمامي
                    </div>
                  </div>
                )}
              </div>
              
              {/* Back Side Upload - Only show after front is uploaded */}
              {formData.nationalIdPreview && (
                <div className="space-y-3 bg-purple-900/20 border-2 border-purple-500 rounded-lg p-4 animate-in fade-in duration-500">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                    <Label htmlFor="nationalIdBack" className="text-white font-bold text-lg">
                      📄 الوجه الخلفي للبطاقة
                      <span className="text-red-400 mr-1">*</span>
                    </Label>
                  </div>
                  
                  <p className="text-purple-200 text-sm mb-3">
                    📸 الآن قم برفع صورة الوجه الخلفي للبطاقة - تأكد من وضوح جميع التفاصيل
                  </p>
                  
                  <Input
                    id="nationalIdBack"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      if (!file.type.startsWith('image/')) {
                        alert('يرجى اختيار صورة صحيحة');
                        return;
                      }
                      
                      if (file.size > 5 * 1024 * 1024) {
                        alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
                        return;
                      }
                      
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData(prev => ({
                          ...prev,
                          nationalIdBack: file,
                          nationalIdBackPreview: reader.result as string
                        }));
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="bg-gray-700 border-gray-600 text-white file:bg-purple-600 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-md hover:file:bg-purple-700"
                  />
                  
                  {formData.nationalIdBackPreview && (
                    <div className="relative mt-3">
                      <img
                        src={formData.nationalIdBackPreview}
                        alt="الوجه الخلفي للبطاقة"
                        className="w-full h-64 object-contain bg-gray-900 rounded-lg border-2 border-green-500"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          nationalIdBack: null, 
                          nationalIdBackPreview: null 
                        }))}
                        className="absolute top-2 right-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <div className="absolute bottom-2 left-2 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        ✓ تم رفع الوجه الخلفي
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Success Message */}
              {formData.nationalIdPreview && formData.nationalIdBackPreview && (
                <div className="bg-green-900/30 border-2 border-green-500 rounded-lg p-4 animate-in fade-in duration-500">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                    <div>
                      <p className="text-green-100 font-bold text-lg">✓ ممتاز!</p>
                      <p className="text-green-200 text-sm">تم رفع صورتي البطاقة بنجاح. الآن قم بدفع الدفعة الأولى.</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* First Payment Upload - Only show after both ID sides uploaded */}
              {formData.nationalIdPreview && formData.nationalIdBackPreview && (
                <div className="space-y-3 bg-green-900/20 border-2 border-green-500 rounded-lg p-4 animate-in fade-in duration-500">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                    <Label htmlFor="firstPayment" className="text-white font-bold text-lg">
                      💳 إيصال دفع الدفعة الأولى
                      <span className="text-red-400 mr-1">*</span>
                    </Label>
                  </div>
                  
                  <div className="bg-yellow-900/30 border border-yellow-500 rounded-lg p-3 mb-3">
                    <p className="text-yellow-100 text-sm font-bold mb-2">⚠️ مطلوب: دفع الدفعة الأولى الآن</p>
                    <div className="space-y-1 text-yellow-200 text-sm">
                      <p>💰 <strong>المبلغ المطلوب:</strong> {downPayment.toLocaleString()} جنيه</p>
                      <p>📱 <strong>رقم WE Pay:</strong> <span className="font-bold text-lg">01555512778</span></p>
                      <p>📋 <strong>الخطوات:</strong></p>
                      <ol className="list-decimal list-inside mr-4 space-y-1">
                        <li>افتح تطبيق WE Pay على هاتفك</li>
                        <li>اختر "تحويل أموال" أو "دفع"</li>
                        <li>أدخل الرقم: 01555512778</li>
                        <li>أدخل المبلغ: {downPayment.toLocaleString()} ج</li>
                        <li>أكمل عملية الدفع</li>
                        <li>التقط صورة لإيصال التحويل (screenshot)</li>
                        <li>ارفع الصورة هنا بالأسفل</li>
                      </ol>
                    </div>
                  </div>
                  
                  <p className="text-green-200 text-sm mb-3">
                    📸 بعد إتمام الدفع عبر WE Pay، قم برفع صورة الإيصال (screenshot) هنا
                  </p>
                  
                  <Input
                    id="firstPayment"
                    type="file"
                    accept="image/*"
                    onChange={handleFirstPaymentReceiptUpload}
                    className="bg-gray-700 border-gray-600 text-white file:bg-green-600 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-md hover:file:bg-green-700"
                  />
                  
                  {formData.firstPaymentReceiptPreview && (
                    <div className="relative mt-3">
                      <img
                        src={formData.firstPaymentReceiptPreview}
                        alt="إيصال الدفعة الأولى"
                        className="w-full h-64 object-contain bg-gray-900 rounded-lg border-2 border-green-500"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          firstPaymentReceipt: null, 
                          firstPaymentReceiptPreview: null 
                        }))}
                        className="absolute top-2 right-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <div className="absolute bottom-2 left-2 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        ✓ تم رفع إيصال الدفع
                      </div>
                    </div>
                  )}
                  
                  {formData.firstPaymentReceiptPreview && (
                    <div className="bg-green-900/30 border border-green-500 rounded-lg p-3">
                      <p className="text-green-100 text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <strong>تم استلام إيصال الدفع بنجاح! يمكنك الآن الانتقال للخطوة التالية ✓</strong>
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Tips Box */}
              <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-blue-400 text-2xl">💡</div>
                  <div className="text-blue-100 text-sm space-y-1">
                    <p className="font-bold">نصائح لصورة مثالية:</p>
                    <ul className="list-disc list-inside space-y-1 mr-4">
                      <li>ضع البطاقة على سطح مستوٍ ذو لون غامق</li>
                      <li>استخدم إضاءة جيدة من الأعلى (تجنب الفلاش المباشر)</li>
                      <li>تأكد من عدم وجود ظلال أو انعكاسات</li>
                      <li>التقط الصورة من مسافة قريبة لضمان وضوح النص</li>
                      <li>تأكد أن البطاقة تملأ إطار الصورة</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Step 2: Signature */}
        {currentStep === 2 && (
          <SignaturePad onSignatureComplete={handleSignatureComplete} required />
        )}
        
        {/* Step 3: Selfie & Accept Terms */}
        {currentStep === 3 && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-400" />
                الخطوة 3: صورة شخصية (سيلفي) للتحقق من الهوية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-900/30 border border-amber-500 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-1" />
                  <div className="text-amber-100 text-sm">
                    <p className="font-bold mb-2">⚠️ هام للغاية - التحقق من الهوية:</p>
                    <p>يجب التقاط صورة سيلفي حقيقية الآن باستخدام الكاميرا للتأكد من أنك نفس الشخص صاحب البطاقة الشخصية.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label className="text-white font-bold flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  التقاط صورة سيلفي (كاميرا مباشرة)
                  <span className="text-red-400">*</span>
                </Label>
                
                {!cameraActive && !formData.selfiePreview && (
                  <div className="space-y-3">
                    <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4">
                      <p className="text-blue-100 text-sm mb-3">📸 نصائح لصورة سيلفي مثالية:</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-200 text-sm mr-4">
                        <li>تأكد من الإضاءة الجيدة على وجهك</li>
                        <li>انظر مباشرة للكاميرا</li>
                        <li>تأكد من ظهور وجهك بالكامل</li>
                        <li>تجنب النظارات الشمسية أو القبعات</li>
                        <li>استخدم خلفية واضحة</li>
                      </ul>
                    </div>
                    
                    <Button
                      type="button"
                      onClick={startCamera}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4"
                    >
                      <Camera className="w-5 h-5 ml-2" />
                      تشغيل الكاميرا والتقاط صورة سيلفي
                    </Button>
                  </div>
                )}
                
                {cameraActive && (
                  <div className="space-y-3">
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-96 object-cover"
                      />
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                        🔴 الكاميرا نشطة
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        onClick={capturePhoto}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3"
                      >
                        <Camera className="w-5 h-5 ml-2" />
                        التقاط الصورة
                      </Button>
                      
                      <Button
                        type="button"
                        onClick={stopCamera}
                        variant="destructive"
                        className="px-6 py-3"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                    
                    <p className="text-gray-400 text-sm text-center">
                      💡 اضبط وضعية وجهك ثم اضغط "التقاط الصورة"
                    </p>
                  </div>
                )}
                
                {formData.selfiePreview && (
                  <div className="space-y-3">
                    <div className="relative">
                      <img
                        src={formData.selfiePreview}
                        alt="صورة السيلفي"
                        className="w-full h-96 object-cover bg-gray-900 rounded-lg border-2 border-green-500"
                      />
                      <div className="absolute top-2 left-2 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        ✓ تم التقاط الصورة
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          selfieImage: null, 
                          selfiePreview: null 
                        }))}
                        className="absolute top-2 right-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="bg-green-900/30 border border-green-500 rounded-lg p-3">
                      <p className="text-green-100 text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <strong>ممتاز! تم التقاط صورة السيلفي بنجاح</strong>
                      </p>
                      <p className="text-green-200 text-xs mt-1">
                        سيتم استخدام هذه الصورة للتحقق من هويتك مع البطاقة الشخصية
                      </p>
                    </div>
                    
                    <Button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ 
                          ...prev, 
                          selfieImage: null, 
                          selfiePreview: null 
                        }));
                        startCamera();
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      <Camera className="w-4 h-4 ml-2" />
                      إعادة التقاط الصورة
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Optional: Full Name and National ID Number */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="fullName" className="text-white">الاسم الكامل (اختياري)</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="كما هو مكتوب في البطاقة"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="nationalIdNumber" className="text-white">الرقم القومي (اختياري)</Label>
                  <Input
                    id="nationalIdNumber"
                    value={formData.nationalId}
                    onChange={(e) => setFormData(prev => ({ ...prev, nationalId: e.target.value }))}
                    placeholder="14 رقم"
                    maxLength={14}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              
              {/* Accept Terms */}
              <div className="flex items-start gap-3 bg-gray-700/50 rounded-lg p-4">
                <Checkbox
                  id="acceptTerms"
                  checked={formData.acceptedTerms}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, acceptedTerms: checked as boolean }))
                  }
                  className="mt-1"
                />
                <Label
                  htmlFor="acceptTerms"
                  className="text-white text-sm cursor-pointer leading-relaxed"
                >
                  <span className="text-red-400">*</span> أوافق على جميع شروط الاتفاقية الموضحة أعلاه، وأقر بأنني قرأت 
                  التحذيرات القانونية وأتحمل المسؤولية الكاملة عن السداد في المواعيد المحددة
                </Label>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-6 gap-4">
          <Button
            variant="outline"
            onClick={() => {
              if (currentStep === 1) {
                router.push('/checkout');
              } else {
                setCurrentStep(prev => prev - 1);
              }
            }}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            {currentStep === 1 ? 'إلغاء' : 'السابق'}
          </Button>
          
          {currentStep < 3 ? (
            <Button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!canProceedToNextStep()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              التالي
              <ArrowLeft className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceedToNextStep() || isSubmitting}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري التقديم...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  تقديم الاتفاقية
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
