import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 flex items-center justify-center">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse delay-75"></div>
      </div>

      <div className="relative z-10 text-center">
        {/* Logo Spinner */}
        <div className="relative mb-8">
          {/* Outer spinning ring */}
          <div className="absolute inset-0 w-32 h-32 mx-auto border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
          
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
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-400 bg-clip-text text-transparent mb-2 animate-pulse">
          جاري التحميل...
        </h2>
        <p className="text-gray-400">الرجاء الانتظار</p>

        {/* Animated Dots */}
        <div className="flex gap-2 justify-center mt-6">
          <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce delay-75"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-150"></div>
        </div>
      </div>
    </div>
  );
}
