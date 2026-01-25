"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MapPin, Clock, Smartphone, Target, TrendingUp } from "lucide-react";

export function AudienceAnalyzer({ campaigns, analytics, orders }: any) {
  // Analyze audience data from campaigns and orders
  const totalClicks = campaigns.reduce((sum: number, c: any) => sum + c.clicks, 0);
  const totalConversions = campaigns.reduce((sum: number, c: any) => sum + c.conversions, 0);
  
  // Mock audience segments (in real app, this would come from actual data)
  const audienceSegments = [
    {
      name: "النساء 25-34 سنة",
      percentage: 35,
      conversions: Math.floor(totalConversions * 0.35),
      avgOrderValue: 450,
      roas: 3.2,
    },
    {
      name: "النساء 35-44 سنة",
      percentage: 28,
      conversions: Math.floor(totalConversions * 0.28),
      avgOrderValue: 520,
      roas: 2.8,
    },
    {
      name: "الرجال 25-34 سنة",
      percentage: 20,
      conversions: Math.floor(totalConversions * 0.20),
      avgOrderValue: 380,
      roas: 2.1,
    },
    {
      name: "النساء 18-24 سنة",
      percentage: 17,
      conversions: Math.floor(totalConversions * 0.17),
      avgOrderValue: 320,
      roas: 1.8,
    },
  ];

  const topLocations = [
    { city: "القاهرة", percentage: 40, conversions: Math.floor(totalConversions * 0.40) },
    { city: "الإسكندرية", percentage: 18, conversions: Math.floor(totalConversions * 0.18) },
    { city: "الجيزة", percentage: 15, conversions: Math.floor(totalConversions * 0.15) },
    { city: "الدقهلية", percentage: 12, conversions: Math.floor(totalConversions * 0.12) },
    { city: "أخرى", percentage: 15, conversions: Math.floor(totalConversions * 0.15) },
  ];

  const deviceSplit = [
    { device: "موبايل", percentage: 68, roas: 2.4 },
    { device: "كمبيوتر", percentage: 25, roas: 3.1 },
    { device: "تابلت", percentage: 7, roas: 1.9 },
  ];

  const bestTimes = [
    { time: "8-11 صباحاً", conversions: Math.floor(totalConversions * 0.15), roas: 2.8 },
    { time: "12-3 ظهراً", conversions: Math.floor(totalConversions * 0.20), roas: 2.3 },
    { time: "4-7 مساءً", conversions: Math.floor(totalConversions * 0.30), roas: 3.2 },
    { time: "8-11 مساءً", conversions: Math.floor(totalConversions * 0.25), roas: 2.9 },
    { time: "12-3 صباحاً", conversions: Math.floor(totalConversions * 0.10), roas: 1.5 },
  ];

  return (
    <div className="space-y-6">
      {/* Audience Demographics */}
      <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            تحليل الجمهور حسب العمر والجنس
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {audienceSegments.map((segment, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold">
                      {segment.percentage}%
                    </div>
                    <div>
                      <h4 className="font-bold">{segment.name}</h4>
                      <p className="text-sm text-gray-600">{segment.conversions} تحويل</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">متوسط الطلب</p>
                    <p className="font-bold">{segment.avgOrderValue} ج</p>
                    <p className="text-xs text-green-600">ROAS: {segment.roas}x</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 h-full rounded-full"
                    style={{ width: `${segment.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              التوصية
            </h4>
            <p className="text-sm text-gray-700">
              ✅ ركز على النساء 25-34 سنة (أعلى ROAS: 3.2x)
              <br />
              ✅ استهدف النساء 35-44 سنة بمنتجات Premium (متوسط طلب 520 ج)
              <br />
              ⚠️ قلل الاستهداف للنساء 18-24 سنة (ROAS منخفض: 1.8x)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Geographic Analysis */}
      <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-600" />
            التوزيع الجغرافي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topLocations.map((location, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium">{location.city}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">{location.percentage}%</p>
                  <p className="text-sm text-gray-600">{location.conversions} تحويل</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
            <h4 className="font-bold mb-2">💡 اقتراحات:</h4>
            <p className="text-sm text-gray-700">
              • زِد ميزانية إعلانات القاهرة (40% من التحويلات)
              <br />
              • استهدف الإسكندرية والجيزة بحملات مخصصة
              <br />
              • جرب Local SEO للمدن الصغيرة
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Device Analysis */}
      <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-600" />
            تحليل الأجهزة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {deviceSplit.map((device, index) => (
              <div key={index} className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {device.percentage}%
                </div>
                <h4 className="font-bold mb-1">{device.device}</h4>
                <p className="text-sm text-gray-600">ROAS: {device.roas}x</p>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <h4 className="font-bold mb-2">📱 تحسينات مطلوبة:</h4>
            <p className="text-sm text-gray-700">
              ✅ 68% من الزوار على الموبايل - تأكد من سرعة الموقع على الجوال
              <br />
              ✅ ROAS الكمبيوتر أعلى (3.1x) - استهدف Desktop بمنتجات Premium
              <br />
              ⚠️ التابلت أداءه ضعيف - قلل الإنفاق عليه
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Time Analysis */}
      <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            أفضل أوقات النشر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bestTimes.map((timeSlot, index) => (
              <div key={index} className="p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{timeSlot.time}</span>
                  <div className="text-right">
                    <p className="font-bold text-orange-600">{timeSlot.conversions} تحويل</p>
                    <p className="text-sm text-gray-600">ROAS: {timeSlot.roas}x</p>
                  </div>
                </div>
                <div className="w-full bg-orange-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-600 to-yellow-600 h-full rounded-full"
                    style={{ width: `${(timeSlot.conversions / totalConversions) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg">
            <h4 className="font-bold mb-2">⏰ استراتيجية التوقيت:</h4>
            <p className="text-sm text-gray-700">
              🌟 أفضل وقت: 4-7 مساءً (30% من التحويلات، ROAS 3.2x)
              <br />
              ✅ وقت جيد: 8-11 مساءً و 8-11 صباحاً
              <br />
              ⚠️ تجنب: 12-3 صباحاً (أداء ضعيف)
              <br />
              💡 اجعل أعلى ميزانية في الفترة المسائية 4-11 مساءً
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Lookalike Audience Suggestions */}
      <Card className="backdrop-blur-sm bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            اقتراحات Lookalike Audience
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 bg-white/70 rounded-lg">
              <h4 className="font-bold mb-2">🎯 Audience 1: Top Buyers</h4>
              <p className="text-sm text-gray-700">
                استهدف جمهور مشابه لأفضل 5% من عملائك (حسب قيمة الطلب)
                <br />
                <span className="text-green-600 font-medium">العائد المتوقع: +40% في التحويلات</span>
              </p>
            </div>

            <div className="p-4 bg-white/70 rounded-lg">
              <h4 className="font-bold mb-2">🎯 Audience 2: Engaged Users</h4>
              <p className="text-sm text-gray-700">
                استهدف من تفاعل مع منشوراتك أو موقعك
                <br />
                <span className="text-green-600 font-medium">العائد المتوقع: +25% في CTR</span>
              </p>
            </div>

            <div className="p-4 bg-white/70 rounded-lg">
              <h4 className="font-bold mb-2">🎯 Audience 3: Add to Cart</h4>
              <p className="text-sm text-gray-700">
                استهدف من أضاف منتج للسلة خلال آخر 30 يوم
                <br />
                <span className="text-green-600 font-medium">العائد المتوقع: ROAS 4x+</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
