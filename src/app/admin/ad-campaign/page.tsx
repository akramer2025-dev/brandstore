import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdCampaignDashboard from '@/components/AdCampaignDashboard';

export const metadata: Metadata = {
  title: 'تحليل الإعلان الممول | Admin',
  description: 'متابعة أداء الحملة الإعلانية بالوقت الفعلي',
};

export default async function AdCampaignAnalyticsPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <AdCampaignDashboard />
    </div>
  );
}
