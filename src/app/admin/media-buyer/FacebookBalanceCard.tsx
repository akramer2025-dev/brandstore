"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function FacebookBalanceCard() {
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/marketing/facebook/balance');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في جلب الرصيد');
      }

      setBalance(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching Facebook balance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            رصيد Facebook Ads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="w-6 h-6 text-green-600 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            خطأ في جلب الرصيد
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <Button 
            onClick={fetchBalance} 
            size="sm" 
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 ml-2" />
            إعادة المحاولة
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!balance) {
    return null;
  }

  const { account, formatted } = balance;
  const isLowBalance = account.balance < 100; // Less than 100 EGP is low
  const isAccountDisabled = account.status !== 1;

  return (
    <Card className={`${
      isAccountDisabled 
        ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200' 
        : isLowBalance 
        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' 
        : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
    } shadow-lg transition-all hover:shadow-xl`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className={`w-5 h-5 ${
              isAccountDisabled ? 'text-red-600' : isLowBalance ? 'text-yellow-600' : 'text-green-600'
            }`} />
            <span>رصيد Facebook Ads</span>
          </div>
          <button 
            onClick={fetchBalance}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="تحديث"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Account Status */}
        {isAccountDisabled && (
          <div className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">الحساب معطل: {account.disableReason || 'غير معروف'}</span>
          </div>
        )}

        {/* Balance */}
        <div>
          <p className="text-sm text-gray-600 mb-1">الرصيد المتاح</p>
          <p className={`text-3xl font-bold ${
            isAccountDisabled ? 'text-red-600' : isLowBalance ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {formatted.balance}
          </p>
          {isLowBalance && !isAccountDisabled && (
            <p className="text-xs text-yellow-700 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              رصيد منخفض - قم بإعادة الشحن قريباً
            </p>
          )}
        </div>

        {/* Spent */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">إجمالي الإنفاق</span>
            <span className="text-sm font-semibold text-gray-800">{formatted.spent}</span>
          </div>
          
          {account.spendCap && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">حد الإنفاق</span>
              <span className="text-sm font-semibold text-gray-800">{formatted.spendCap}</span>
            </div>
          )}
        </div>

        {/* Account Name */}
        <div className="text-xs text-gray-500 border-t pt-2">
          <p><strong>الحساب:</strong> {account.name}</p>
          <p><strong>ID:</strong> {account.id}</p>
        </div>
      </CardContent>
    </Card>
  );
}
