import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function VendorDashboard() {
  const session = await auth();
  
  if (!session) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'VENDOR' || !session.user.vendorType) {
    redirect('/');
  }

  // التحويل التلقائي لصفحة Dashboard
  redirect('/vendor/dashboard');
}
