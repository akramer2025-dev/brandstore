"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SyncAllFacebookProps {
  language?: "ar" | "en";
}

export function SyncAllFacebook({ language = "ar" }: SyncAllFacebookProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<{
    syncedCount: number;
    totalCount: number;
    results: any[];
  } | null>(null);

  const t = {
    ar: {
      syncAll: "مزامنة جميع حملات فيسبوك",
      syncing: "جاري المزامنة...",
      lastSync: "آخر مزامنة",
      synced: "تم المزامنة",
      failed: "فشل",
      campaigns: "حملات",
      noLinkedCampaigns: "لا توجد حملات مربوطة بفيسبوك",
    },
    en: {
      syncAll: "Sync All Facebook Campaigns",
      syncing: "Syncing...",
      lastSync: "Last Sync",
      synced: "Synced",
      failed: "Failed",
      campaigns: "campaigns",
      noLinkedCampaigns: "No campaigns linked to Facebook",
    },
  };

  const translations = t[language];

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch("/api/marketing/facebook/sync?all=true");
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to sync");
      }

      const data = await response.json();
      setLastSync(data);
      
      alert(
        `✅ تم تحديث ${data.syncedCount} من ${data.totalCount} حملة\n\n` +
        data.results
          .filter((r: any) => r.synced)
          .map((r: any) => `✓ ${r.campaignName}: ${r.insights.clicks} نقرة`)
          .join('\n')
      );
      
      // Refresh page to show updated data
      window.location.reload();
    } catch (error: any) {
      console.error("Sync all error:", error);
      alert(`❌ حدث خطأ: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card className="backdrop-blur-sm bg-gray-800/90 border-gray-700 shadow-xl">
      <CardHeader>
        <CardTitle className="text-gray-100 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-400" />
            {translations.syncAll}
          </span>
          <Button
            onClick={handleSyncAll}
            disabled={isSyncing}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
                {translations.syncing}
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 ml-2" />
                {translations.syncAll}
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      {lastSync && (
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">{translations.lastSync}:</span>
              <span className="text-gray-200">
                {lastSync.syncedCount} / {lastSync.totalCount} {translations.campaigns}
              </span>
            </div>
            <div className="space-y-1">
              {lastSync.results.map((result: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-xs p-2 bg-gray-900/50 rounded border border-gray-700"
                >
                  <span className="text-gray-300">{result.campaignName}</span>
                  {result.synced ? (
                    <span className="flex items-center gap-1 text-green-400">
                      <CheckCircle className="w-3 h-3" />
                      {translations.synced}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-400">
                      <XCircle className="w-3 h-3" />
                      {translations.failed}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
