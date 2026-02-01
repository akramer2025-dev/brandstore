import Image from "next/image";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Header مبسط للشريك */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <div className="relative w-10 h-10">
            <Image
              src="/logo.png"
              alt="Nody Store"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Nody Store</h1>
            <p className="text-xs text-gray-400">نظام الشركاء</p>
          </div>
        </div>
      </header>
      <main className="pt-16">
        {children}
      </main>
    </>
  );
}
