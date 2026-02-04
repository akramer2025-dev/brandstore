'use client';

import Image from "next/image";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <>
      {/* Header مبسط للشريك */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image
                src="/logo.png"
                alt="Brand Store"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Brand Store</h1>
              <p className="text-xs text-gray-400">نظام الشركاء</p>
            </div>
          </div>
          
          {/* زر تسجيل الخروج */}
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20 hover:text-red-200"
          >
            <LogOut className="w-4 h-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>
      </header>
      <main className="pt-16">
        {children}
      </main>
    </>
  );
}
