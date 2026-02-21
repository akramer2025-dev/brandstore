import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Wrench, TrendingUp, Target, Lightbulb, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function ToolsPage() {
  const session = await auth();

  if (!session || session.user?.role !== 'MARKETING_STAFF') {
    redirect('/auth/login');
  }

  const staff = await prisma.marketingStaff.findFirst({
    where: { userId: session.user.id },
  });

  if (!staff) {
    return <div className="p-8 text-center">موظف التسويق غير موجود</div>;
  }

  // Get user's tools data
  const swotCount = await prisma.sWOTAnalysis.count({
    where: { staffId: staff.id }
  });

  const funnelCount = await prisma.marketingFunnel.count({
    where: { staffId: staff.id }
  });

  const campaignCount = await prisma.campaignPlan.count({
    where: { staffId: staff.id }
  });

  const tools = [
    {
      id: 'swot',
      title: 'SWOT Analysis',
      titleAr: 'تحليل SWOT',
      description: 'حلل نقاط القوة والضعف والفرص والتهديدات لأي مشروع أو منتج',
      icon: Target,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-300',
      count: swotCount,
      href: '/marketing-staff/tools/swot',
    },
    {
      id: 'funnel',
      title: 'Marketing Funnel',
      titleAr: 'قمع التسويق',
      description: 'صمم رحلة العميل من الوعي إلى الشراء وقس معدلات التحويل',
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-300',
      count: funnelCount,
      href: '/marketing-staff/tools/funnel',
    },
    {
      id: 'campaign',
      title: 'Campaign Planner',
      titleAr: 'مخطط الحملات',
      description: 'خطط حملاتك التسويقية باستخدام إطار عمل 4Ps و 4Cs',
      icon: Lightbulb,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/30',
      textColor: 'text-pink-300',
      count: campaignCount,
      href: '/marketing-staff/tools/campaign',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/marketing-staff/training"
            className="text-purple-300 hover:text-purple-200 mb-4 inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة للوحة التدريب
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Wrench className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">🛠️ أدوات التسويق</h1>
              <p className="text-purple-200">أدوات احترافية لتحليل وتخطيط استراتيجياتك التسويقية</p>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card 
                key={tool.id}
                className={`${tool.bgColor} backdrop-blur-sm ${tool.borderColor} border-2 hover:scale-105 transition-transform cursor-pointer`}
              >
                <CardHeader>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-white text-2xl mb-2">
                    {tool.titleAr}
                  </CardTitle>
                  <p className="text-sm text-gray-400">{tool.title}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-100 mb-4 min-h-[3rem]">
                    {tool.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-sm ${tool.textColor}`}>
                      {tool.count} عنصر محفوظ
                    </span>
                  </div>

                  <Link href={tool.href}>
                    <Button 
                      className={`w-full bg-gradient-to-r ${tool.color} hover:opacity-90 text-white`}
                    >
                      فتح الأداة
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Section */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">💡 نصائح الاستخدام</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-2">SWOT Analysis</h4>
                <p className="text-purple-200 text-sm">
                  استخدمها قبل إطلاق أي منتج أو حملة لفهم موقفك في السوق
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Marketing Funnel</h4>
                <p className="text-purple-200 text-sm">
                  حدد مراحل رحلة العميل وحسّن معدلات التحويل في كل مرحلة
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Campaign Planner</h4>
                <p className="text-purple-200 text-sm">
                  خطط حملاتك بشكل احترافي باستخدام أفضل الممارسات التسويقية
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
