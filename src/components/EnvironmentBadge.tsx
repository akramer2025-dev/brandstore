"use client";

import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

export function EnvironmentBadge() {
  const isDevelopment = process.env.NODE_ENV === "development";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const isLocalhost = siteUrl.includes("localhost");

  if (!isDevelopment && !isLocalhost) {
    // Production mode - لا نعرض شيء
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Badge 
        variant="outline" 
        className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50 flex items-center gap-2 px-3 py-2"
      >
        <AlertCircle className="w-4 h-4" />
        <div className="flex flex-col items-start">
          <span className="text-xs font-bold">Development Mode</span>
          <span className="text-[10px]">{siteUrl}</span>
        </div>
      </Badge>
    </div>
  );
}
