import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function VendorDashboard() {
  const session = await auth();
  
  if (!session) {
    redirect('/auth/login');
  }

  // توجيه حسب نوع الحساب
  if (session.user.role === 'VEHICLE_DEALER') {
    redirect('/vehicle-dealer/dashboard');
  }

  if (session.user.role !== 'VENDOR' || !session.user.vendorType) {
    redirect('/');
  }

  // التحويل التلقائي لصفحة Dashboard
  redirect('/vendor/dashboard');
}
