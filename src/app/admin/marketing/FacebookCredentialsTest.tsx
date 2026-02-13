"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, TestTube } from "lucide-react";

export function FacebookCredentialsTest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTest = async () => {
    setTesting(true);
    setResult(null);
    
    try {
      const response = await fetch("/api/marketing/facebook/test");
      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        alert(`✅ Facebook API متصل بنجاح!\n\nUser: ${data.user?.name}\nAd Account: ${data.adAccount?.name}\nStatus: ${data.adAccount?.status}`);
      } else {
        alert(`❌ خطأ في الاتصال:\n${data.error}\n\nDetails: ${JSON.stringify(data.details, null, 2)}`);
      }
    } catch (error: any) {
      console.error("Test error:", error);
      setResult({
        success: false,
        error: error.message,
      });
      alert(`❌ فشل الاختبار: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="backdrop-blur-sm bg-gray-800/90 border-gray-700 shadow-xl">
      <CardHeader>
        <CardTitle className="text-gray-100 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TestTube className="w-5 h-5 text-blue-400" />
            اختبار اتصال Facebook API
          </span>
          <Button
            onClick={handleTest}
            disabled={testing}
            size="sm"
            variant="outline"
            className="border-blue-500/50 hover:bg-blue-500/10"
          >
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
                جاري الاختبار...
              </>
            ) : (
              <>
                <TestTube className="w-4 h-4 ml-2" />
                اختبار الآن
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      {result && (
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
              <span className={result.success ? "text-green-400" : "text-red-400"}>
                {result.success ? "✅ الاتصال ناجح" : "❌ فشل الاتصال"}
              </span>
            </div>

            {result.success && result.user && (
              <div className="bg-gray-900/50 p-3 rounded border border-gray-700 space-y-2">
                <div>
                  <span className="text-xs text-gray-400">User:</span>
                  <p className="text-sm text-gray-200">{result.user.name} (ID: {result.user.id})</p>
                </div>
                {result.adAccount && (
                  <>
                    <div>
                      <span className="text-xs text-gray-400">Ad Account:</span>
                      <p className="text-sm text-gray-200">{result.adAccount.name}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Status:</span>
                      <p className="text-sm text-gray-200">{result.adAccount.status}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Currency:</span>
                      <p className="text-sm text-gray-200">{result.adAccount.currency}</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {!result.success && result.error && (
              <div className="bg-red-500/10 p-3 rounded border border-red-500/30">
                <p className="text-sm text-red-300 font-semibold">{result.error}</p>
                {result.details && (
                  <pre className="text-xs text-red-200 mt-2 overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
