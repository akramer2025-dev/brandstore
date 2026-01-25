"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PerformanceMetric {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down" | "neutral";
  target: string;
  status: "excellent" | "good" | "warning" | "danger";
}

interface PerformanceIndicatorsProps {
  metrics: any;
}

export function PerformanceIndicators({ metrics }: PerformanceIndicatorsProps) {
  const indicators: PerformanceMetric[] = [
    {
      label: "ROAS (العائد على الإنفاق)",
      value: `${metrics.roas.toFixed(2)}x`,
      change: 12.5,
      trend: metrics.roas >= 3 ? "up" : metrics.roas >= 2 ? "neutral" : "down",
      target: "3.0x+",
      status: metrics.roas >= 3 ? "excellent" : metrics.roas >= 2 ? "good" : metrics.roas >= 1.5 ? "warning" : "danger"
    },
    {
      label: "CPA (تكلفة الاكتساب)",
      value: `${metrics.cpa.toFixed(0)} ج`,
      change: -8.3,
      trend: "up",
      target: "< 150 ج",
      status: metrics.cpa <= 150 ? "excellent" : metrics.cpa <= 200 ? "good" : metrics.cpa <= 250 ? "warning" : "danger"
    },
    {
      label: "CTR (نسبة النقر)",
      value: `${metrics.ctr.toFixed(2)}%`,
      change: 5.2,
      trend: metrics.ctr >= 3 ? "up" : metrics.ctr >= 2 ? "neutral" : "down",
      target: "3%+",
      status: metrics.ctr >= 3 ? "excellent" : metrics.ctr >= 2 ? "good" : metrics.ctr >= 1.5 ? "warning" : "danger"
    },
    {
      label: "معدل التحويل",
      value: `${metrics.conversionRate.toFixed(2)}%`,
      change: 3.1,
      trend: metrics.conversionRate >= 2.5 ? "up" : metrics.conversionRate >= 1.5 ? "neutral" : "down",
      target: "2.5%+",
      status: metrics.conversionRate >= 2.5 ? "excellent" : metrics.conversionRate >= 1.5 ? "good" : metrics.conversionRate >= 1 ? "warning" : "danger"
    },
    {
      label: "AOV (متوسط قيمة الطلب)",
      value: `${metrics.aov.toFixed(0)} ج`,
      change: 7.8,
      trend: "up",
      target: "500 ج+",
      status: metrics.aov >= 500 ? "excellent" : metrics.aov >= 350 ? "good" : metrics.aov >= 250 ? "warning" : "danger"
    },
    {
      label: "Frequency (تكرار الظهور)",
      value: "2.4",
      change: 0.3,
      trend: "neutral",
      target: "2-3",
      status: "good"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-gradient-to-br from-green-500 to-emerald-600 text-white";
      case "good":
        return "bg-gradient-to-br from-blue-500 to-cyan-600 text-white";
      case "warning":
        return "bg-gradient-to-br from-yellow-500 to-orange-600 text-white";
      case "danger":
        return "bg-gradient-to-br from-red-500 to-rose-600 text-white";
      default:
        return "bg-gradient-to-br from-gray-500 to-slate-600 text-white";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4" />;
      case "down":
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {indicators.map((indicator, index) => (
        <Card
          key={index}
          className={`border-2 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
            indicator.status === "excellent" ? "border-green-500" :
            indicator.status === "good" ? "border-blue-500" :
            indicator.status === "warning" ? "border-yellow-500" :
            "border-red-500"
          }`}
        >
          <div className={`h-2 ${getStatusColor(indicator.status)}`}></div>
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">{indicator.label}</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {indicator.value}
                </p>
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor(indicator.trend)}`}>
                {getTrendIcon(indicator.trend)}
                <span>{Math.abs(indicator.change)}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">الهدف: {indicator.target}</span>
              <span className={`px-2 py-1 rounded-full font-medium ${
                indicator.status === "excellent" ? "bg-green-100 text-green-700" :
                indicator.status === "good" ? "bg-blue-100 text-blue-700" :
                indicator.status === "warning" ? "bg-yellow-100 text-yellow-700" :
                "bg-red-100 text-red-700"
              }`}>
                {indicator.status === "excellent" ? "ممتاز" :
                 indicator.status === "good" ? "جيد" :
                 indicator.status === "warning" ? "تحذير" :
                 "خطر"}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${getStatusColor(indicator.status)}`}
                style={{
                  width: indicator.status === "excellent" ? "100%" :
                         indicator.status === "good" ? "75%" :
                         indicator.status === "warning" ? "50%" : "25%"
                }}
              ></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
