'use client';

import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPWA() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Guard: Only run on client side
    if (typeof window === 'undefined') return;
    
    // Check if already installed (standalone mode)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(isStandaloneMode);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detect if coming from social media (Facebook, Instagram, etc.)
    const referrer = typeof document !== 'undefined' ? document.referrer : '';
    const isFromSocial = /facebook|instagram|fb\.com|t\.co|twitter|tiktok/i.test(referrer);
    const urlParams = new URLSearchParams(window.location.search);
    const hasFbclid = urlParams.has('fbclid') || urlParams.has('utm_source');

    // Listen for install prompt (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setInstallPrompt(promptEvent);
      setIsInstallable(true);
      
      // Show banner immediately if from social media, otherwise after 2 seconds
      const delay = (isFromSocial || hasFbclid) ? 500 : 2000;
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        const dismissedTime = localStorage.getItem('pwa-install-dismissed-time');
        
        // Re-show after 1 day instead of 7 days
        if (dismissed && dismissedTime) {
          const daysSinceDismiss = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
          if (daysSinceDismiss > 1) {
            localStorage.removeItem('pwa-install-dismissed');
            localStorage.removeItem('pwa-install-dismissed-time');
          }
        }
        
        if (!localStorage.getItem('pwa-install-dismissed')) {
          setShowBanner(true);
        }
      }, delay);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if dismissed before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (iOS && !isStandaloneMode && !dismissed) {
      const delay = (isFromSocial || hasFbclid) ? 500 : 2000;
      setTimeout(() => setShowBanner(true), delay);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []); // Empty dependency array - only run once on mount

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setShowBanner(false);
      }

      setInstallPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Error during installation:', error);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    localStorage.setItem('pwa-install-dismissed-time', Date.now().toString());
  };

  // Don't show if already installed
  if (isStandalone) return null;

  // Don't show if banner is hidden
  if (!showBanner) return null;

  return (
    <>
      {/* Floating Install Button - Always visible */}
      {isInstallable && (
        <button
          onClick={handleInstallClick}
          className="fixed bottom-20 left-4 z-50 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white rounded-full p-4 shadow-2xl hover:scale-110 transition-transform duration-300 animate-bounce"
          aria-label="تثبيت التطبيق"
        >
          <Download className="w-6 h-6" />
        </button>
      )}

      {/* Install Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white shadow-2xl animate-slide-up">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="bg-white/20 rounded-full p-2 backdrop-blur-sm">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">حمّل تطبيق Remostore</h3>
                <p className="text-sm text-white/90">
                  {isIOS 
                    ? 'اضغط على زر المشاركة ثم "إضافة إلى الشاشة الرئيسية"'
                    : 'ثبت التطبيق للحصول على تجربة أسرع وإشعارات فورية'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isIOS && isInstallable && (
                <Button
                  onClick={handleInstallClick}
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-white/90 font-bold shadow-lg"
                >
                  <Download className="w-4 h-4 ml-2" />
                  تثبيت
                </Button>
              )}

              <button
                onClick={handleDismiss}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* iOS Installation Guide Modal */}
      {isIOS && showBanner && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="bg-white rounded-t-3xl max-w-md w-full p-6 animate-slide-up">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                ثبت تطبيق Remostore
              </h3>
              <p className="text-gray-600">
                اتبع الخطوات البسيطة لإضافة التطبيق
              </p>
            </div>

            <div className="space-y-4 text-right">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                  1
                </div>
                <div>
                  <p className="text-gray-800 font-medium">
                    اضغط على زر المشاركة 
                    <span className="inline-block mx-1">
                      <svg className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                      </svg>
                    </span>
                    في أسفل الشاشة
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold">
                  2
                </div>
                <div>
                  <p className="text-gray-800 font-medium">
                    اختر "إضافة إلى الشاشة الرئيسية"
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                  3
                </div>
                <div>
                  <p className="text-gray-800 font-medium">
                    اضغط "إضافة" للتأكيد
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleDismiss}
              className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="lg"
            >
              فهمت
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
