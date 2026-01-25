"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, TrendingDown, TrendingUp, Zap, Bell } from "lucide-react";

interface Alert {
  id: string;
  type: "danger" | "warning" | "success" | "info";
  title: string;
  message: string;
  action?: string;
}

interface SmartAlertsProps {
  campaigns: any[];
  metrics: any;
}

export function SmartAlerts({ campaigns, metrics }: SmartAlertsProps) {
  const alerts: Alert[] = [];

  // Check ROAS
  if (metrics.roas < 2) {
    alerts.push({
      id: "low-roas",
      type: "danger",
      title: "⚠️ ROAS منخفض جداً!",
      message: `ROAS الحالي ${metrics.roas.toFixed(2)}x - أقل من 2x. استخدم Retargeting فوراً!`,
      action: "optimize"
    });
  } else if (metrics.roas >= 3) {
    alerts.push({
      id: "high-roas",
      type: "success",
      title: "🎉 ROAS ممتاز!",
      message: `ROAS ${metrics.roas.toFixed(2)}x - جاهز للـ Scaling!`,
      action: "scale"
    });
  }

  // Check CPA
  const averageCPA = metrics.cpa;
  if (averageCPA > 200) {
    alerts.push({
      id: "high-cpa",
      type: "warning",
      title: "📊 CPA مرتفع",
      message: `تكلفة الاكتساب ${averageCPA.toFixed(0)} ج - حسّن الاستهداف`,
      action: "improve-targeting"
    });
  }

  // Check CTR
  if (metrics.ctr < 2) {
    alerts.push({
      id: "low-ctr",
      type: "warning",
      title: "👆 CTR منخفض",
      message: `نسبة النقر ${metrics.ctr.toFixed(2)}% - غير الكرييتف!`,
      action: "change-creative"
    });
  }

  // Check conversion rate
  if (metrics.conversionRate < 1.5) {
    alerts.push({
      id: "low-conversion",
      type: "warning",
      title: "🔄 معدل تحويل منخفض",
      message: `${metrics.conversionRate.toFixed(2)}% - حسّن صفحة الهبوط`,
      action: "improve-landing-page"
    });
  }

  // Check for campaigns with negative ROI
  const negativeCampaigns = campaigns.filter((c: any) => c.roi < 0);
  if (negativeCampaigns.length > 0) {
    alerts.push({
      id: "negative-roi",
      type: "danger",
      title: "💸 حملات خاسرة!",
      message: `${negativeCampaigns.length} حملة بـ ROI سالب - أوقفهم فوراً!`,
      action: "stop-campaigns"
    });
  }

  // Check for high-performing campaigns
  const topCampaigns = campaigns.filter((c: any) => c.roi > 200);
  if (topCampaigns.length > 0) {
    alerts.push({
      id: "top-campaigns",
      type: "success",
      title: "🚀 حملات رابحة!",
      message: `${topCampaigns.length} حملة بـ ROI أكثر من 200% - زِد ميزانيتهم!`,
      action: "increase-budget"
    });
  }

  // Quick win opportunities
  const mediumCampaigns = campaigns.filter((c: any) => c.roi >= 100 && c.roi < 200);
  if (mediumCampaigns.length > 0) {
    alerts.push({
      id: "opportunities",
      type: "info",
      title: "💡 فرص تحسين",
      message: `${mediumCampaigns.length} حملة بأداء متوسط - يمكن تحسينهم بسهولة`,
      action: "optimize"
    });
  }

  const getAlertStyle = (type: string) => {
    switch (type) {
      case "danger":
        return "bg-red-50 border-red-500 text-red-900";
      case "warning":
        return "bg-yellow-50 border-yellow-500 text-yellow-900";
      case "success":
        return "bg-green-50 border-green-500 text-green-900";
      case "info":
        return "bg-blue-50 border-blue-500 text-blue-900";
      default:
        return "bg-gray-50 border-gray-500 text-gray-900";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "danger":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <TrendingDown className="w-5 h-5 text-yellow-600" />;
      case "success":
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case "info":
        return <Zap className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  if (alerts.length === 0) {
    return (
      <Card className="bg-green-50 border-green-500">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-bold text-green-900">✨ كل شيء تمام!</h3>
              <p className="text-green-700 text-sm">جميع حملاتك تعمل بشكل جيد</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-indigo-600" />
        <h3 className="font-bold text-lg">التنبيهات الذكية ({alerts.length})</h3>
      </div>
      
      {alerts.map((alert) => (
        <Card
          key={alert.id}
          className={`border-l-4 transition-all duration-300 hover:shadow-lg ${getAlertStyle(alert.type)}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {getAlertIcon(alert.type)}
              <div className="flex-1">
                <h4 className="font-bold mb-1">{alert.title}</h4>
                <p className="text-sm opacity-90">{alert.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
