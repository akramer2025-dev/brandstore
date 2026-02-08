import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-white flex items-center justify-center">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse delay-75"></div>
      </div>

      <div className="relative z-10 text-center">
        {/* Logo Spinner */}
        <div className="relative mb-8">
          {/* Outer spinning ring */}
          <div className="absolute inset-0 w-32 h-32 mx-auto border-4 border-purple-500/30 border-t-purple-600 rounded-full animate-spin"></div>
          
          {/* Logo with animations */}
          <div className="w-32 h-32 mx-auto flex items-center justify-center">
            <div className="relative w-24 h-24 animate-bounce-scale">
              <img 
                src="/logo.png" 
                alt="ريمو ستور - Remo Store" 
                className="w-full h-full rounded-full object-contain animate-glow-pulse"
              />
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent mb-2 animate-pulse">
          جاري التحميل...
        </h2>
        <p className="text-gray-500">الرجاء الانتظار</p>

        {/* Animated Dots */}
        <div className="flex gap-2 justify-center mt-6">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce delay-75"></div>
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce delay-150"></div>
        </div>
      </div>
    </div>
  );
}
