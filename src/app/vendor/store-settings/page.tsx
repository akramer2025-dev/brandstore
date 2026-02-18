"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Redirect to /vendor/settings?tab=customize
 * This page is kept for backward compatibility
 */
export default function VendorStoreSettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/vendor/settings?tab=customize");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto mb-4" />
        <p className="text-gray-600 font-semibold">جاري التحويل إلى صفحة الإعدادات...</p>
      </div>
    </div>
  );
}
