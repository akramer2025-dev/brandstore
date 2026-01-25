"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, BarChart } from "lucide-react";

export function CampaignChart({ campaigns, analytics }: any) {
  // Calculate weekly performance
  const weeklyData = analytics.slice(0, 7).reverse();

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Conversions Trend */}
      <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="w-5 h-5 text-blue-600" />
            مسار التحويلات (آخر 7 أيام)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {weeklyData.map((day: any, index: number) => {
              const maxConversions = Math.max(...weeklyData.map((d: any) => d.conversions), 1);
              const height = (day.conversions / maxConversions) * 100;

              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full relative group">
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-500 cursor-pointer"
                      style={{ height: `${height}%`, minHeight: "20px" }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                        {day.conversions} تحويل
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(day.date).toLocaleDateString("ar-EG", { weekday: "short" })}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Budget Utilization */}
      <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5 text-purple-600" />
            استخدام ميزانية الحملات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.slice(0, 5).map((campaign: any) => {
              const percentage = (campaign.spent / campaign.budget) * 100;
              const isOverBudget = percentage > 100;

              return (
                <div key={campaign.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium truncate">{campaign.name}</span>
                    <span className={`font-bold ${isOverBudget ? "text-red-600" : "text-gray-700"}`}>
                      {campaign.spent.toFixed(0)} / {campaign.budget.toFixed(0)} ج
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverBudget
                          ? "bg-gradient-to-r from-red-600 to-red-500"
                          : percentage > 80
                          ? "bg-gradient-to-r from-orange-600 to-orange-500"
                          : "bg-gradient-to-r from-purple-600 to-pink-600"
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
