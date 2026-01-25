"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TestTube, Plus, TrendingUp, TrendingDown } from "lucide-react";

export function ABTestManager({ campaigns }: any) {
  // Mock A/B tests (in real app, would come from database)
  const [activeTests] = useState([
    {
      id: 1,
      name: "عنوان الإعلان - نسخة A vs B",
      status: "running",
      variant_a: {
        name: "النسخة A: خصم 50% لفترة محدودة!",
        impressions: 12500,
        clicks: 450,
        conversions: 28,
        ctr: 3.6,
        conversionRate: 6.2,
        spent: 850,
      },
      variant_b: {
        name: "النسخة B: وفر 500 جنيه الآن!",
        impressions: 12300,
        clicks: 520,
        conversions: 35,
        ctr: 4.2,
        conversionRate: 6.7,
        spent: 830,
      },
      duration: "5 أيام",
      winner: "b",
    },
    {
      id: 2,
      name: "صورة الإعلان - منتج vs نمط حياة",
      status: "running",
      variant_a: {
        name: "النسخة A: صورة المنتج فقط",
        impressions: 8200,
        clicks: 280,
        conversions: 15,
        ctr: 3.4,
        conversionRate: 5.4,
        spent: 620,
      },
      variant_b: {
        name: "النسخة B: شخص يرتدي المنتج",
        impressions: 8400,
        clicks: 350,
        conversions: 22,
        ctr: 4.2,
        conversionRate: 6.3,
        spent: 640,
      },
      duration: "3 أيام",
      winner: "b",
    },
    {
      id: 3,
      name: "الجمهور المستهدف - عام vs محدد",
      status: "running",
      variant_a: {
        name: "النسخة A: استهداف عام (نساء 18-45)",
        impressions: 15600,
        clicks: 380,
        conversions: 18,
        ctr: 2.4,
        conversionRate: 4.7,
        spent: 920,
      },
      variant_b: {
        name: "النسخة B: استهداف محدد (نساء 25-34، مهتمات بالموضة)",
        impressions: 9800,
        clicks: 420,
        conversions: 28,
        ctr: 4.3,
        conversionRate: 6.7,
        spent: 680,
      },
      duration: "7 أيام",
      winner: "b",
    },
  ]);

  const calculateImprovement = (a: number, b: number) => {
    return (((b - a) / a) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">اختبارات A/B النشطة</h2>
          <p className="text-gray-600">اختبر عناصر مختلفة لتحسين أداء إعلاناتك</p>
        </div>
        <Button className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700">
          <Plus className="w-5 h-5 ml-2" />
          إنشاء اختبار جديد
        </Button>
      </div>

      {/* Active Tests */}
      {activeTests.map((test) => {
        const variantA = test.variant_a;
        const variantB = test.variant_b;
        const winner = test.winner;

        return (
          <Card key={test.id} className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="w-5 h-5 text-orange-600" />
                  {test.name}
                </CardTitle>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    جاري التشغيل
                  </span>
                  <span className="text-sm text-gray-600">المدة: {test.duration}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Variant A */}
                <div className={`p-4 rounded-lg border-2 ${winner === "a" ? "border-green-500 bg-green-50" : "border-gray-300 bg-gray-50"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg">النسخة A</h3>
                    {winner === "a" && (
                      <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        الفائزة
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-4">{variantA.name}</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-white rounded">
                      <p className="text-xs text-gray-600">الظهور</p>
                      <p className="font-bold">{variantA.impressions.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-2 bg-white rounded">
                      <p className="text-xs text-gray-600">النقرات</p>
                      <p className="font-bold">{variantA.clicks}</p>
                    </div>
                    <div className="text-center p-2 bg-white rounded">
                      <p className="text-xs text-gray-600">CTR</p>
                      <p className="font-bold text-blue-600">{variantA.ctr}%</p>
                    </div>
                    <div className="text-center p-2 bg-white rounded">
                      <p className="text-xs text-gray-600">التحويلات</p>
                      <p className="font-bold text-green-600">{variantA.conversions}</p>
                    </div>
                    <div className="text-center p-2 bg-white rounded">
                      <p className="text-xs text-gray-600">معدل التحويل</p>
                      <p className="font-bold text-purple-600">{variantA.conversionRate}%</p>
                    </div>
                    <div className="text-center p-2 bg-white rounded">
                      <p className="text-xs text-gray-600">الإنفاق</p>
                      <p className="font-bold">{variantA.spent} ج</p>
                    </div>
                  </div>
                </div>

                {/* Variant B */}
                <div className={`p-4 rounded-lg border-2 ${winner === "b" ? "border-green-500 bg-green-50" : "border-gray-300 bg-gray-50"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg">النسخة B</h3>
                    {winner === "b" && (
                      <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        الفائزة
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-4">{variantB.name}</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-white rounded">
                      <p className="text-xs text-gray-600">الظهور</p>
                      <p className="font-bold">{variantB.impressions.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-2 bg-white rounded">
                      <p className="text-xs text-gray-600">النقرات</p>
                      <p className="font-bold">{variantB.clicks}</p>
                    </div>
                    <div className="text-center p-2 bg-white rounded">
                      <p className="text-xs text-gray-600">CTR</p>
                      <p className="font-bold text-blue-600">{variantB.ctr}%</p>
                      {variantB.ctr > variantA.ctr && (
                        <p className="text-xs text-green-600">+{calculateImprovement(variantA.ctr, variantB.ctr)}%</p>
                      )}
                    </div>
                    <div className="text-center p-2 bg-white rounded">
                      <p className="text-xs text-gray-600">التحويلات</p>
                      <p className="font-bold text-green-600">{variantB.conversions}</p>
                      {variantB.conversions > variantA.conversions && (
                        <p className="text-xs text-green-600">+{calculateImprovement(variantA.conversions, variantB.conversions)}%</p>
                      )}
                    </div>
                    <div className="text-center p-2 bg-white rounded">
                      <p className="text-xs text-gray-600">معدل التحويل</p>
                      <p className="font-bold text-purple-600">{variantB.conversionRate}%</p>
                      {variantB.conversionRate > variantA.conversionRate && (
                        <p className="text-xs text-green-600">+{calculateImprovement(variantA.conversionRate, variantB.conversionRate)}%</p>
                      )}
                    </div>
                    <div className="text-center p-2 bg-white rounded">
                      <p className="text-xs text-gray-600">الإنفاق</p>
                      <p className="font-bold">{variantB.spent} ج</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis */}
              <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  النتيجة والتوصية
                </h4>
                <p className="text-sm text-gray-700">
                  {winner === "b" ? (
                    <>
                      ✅ <strong>النسخة B فائزة</strong> بتحسن {calculateImprovement(variantA.conversionRate, variantB.conversionRate)}% في معدل التحويل
                      <br />
                      💡 <strong>التوصية:</strong> استخدم النسخة B في جميع الحملات المستقبلية
                      <br />
                      📈 <strong>التأثير المتوقع:</strong> زيادة {calculateImprovement(variantA.conversions, variantB.conversions)}% في التحويلات
                    </>
                  ) : (
                    <>
                      ✅ <strong>النسخة A فائزة</strong>
                      <br />
                      💡 <strong>التوصية:</strong> استخدم النسخة A في جميع الحملات المستقبلية
                    </>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* A/B Testing Best Practices */}
      <Card className="backdrop-blur-sm bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 shadow-xl">
        <CardHeader>
          <CardTitle>💡 أفضل ممارسات A/B Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-bold">ما يجب اختباره:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✅ العناوين والنصوص</li>
                <li>✅ الصور والفيديوهات</li>
                <li>✅ Call-to-Action</li>
                <li>✅ الاستهداف والجمهور</li>
                <li>✅ المواضع (Feed, Stories, إلخ)</li>
                <li>✅ الأوقات</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold">قواعد مهمة:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>🎯 اختبر عنصر واحد فقط في كل مرة</li>
                <li>⏱️ انتظر 3-7 أيام للحصول على بيانات كافية</li>
                <li>📊 تحتاج 100+ تحويل كحد أدنى</li>
                <li>🔄 اختبر باستمرار - لا تتوقف</li>
                <li>✅ طبق النتائج فوراً</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
