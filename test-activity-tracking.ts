import { PrismaClient } from '@prisma/client';
import { logUserActivity, getUserActivities, getUserActivityStats } from './src/lib/user-activity';

const prisma = new PrismaClient();

async function testActivityTracking() {
  console.log('\n🧪 اختبار نظام تتبع النشاط\n');
  console.log('═'.repeat(80));

  try {
    // الحصول على مستخدم testpartner
    const user = await prisma.user.findUnique({
      where: { email: 'testpartner@example.com' },
    });

    if (!user) {
      console.log('❌ المستخدم غير موجود');
      return;
    }

    console.log(`\n👤 المستخدم: ${user.name} (${user.email})`);
    console.log('═'.repeat(80));

    // 1. تسجيل أنشطة تجريبية
    console.log('\n📝 تسجيل أنشطة تجريبية...\n');

    await logUserActivity({
      userId: user.id,
      action: 'LOGIN',
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      metadata: { provider: 'credentials' },
    });
    console.log('✅ LOGIN (iPhone)');

    await logUserActivity({
      userId: user.id,
      action: 'ADD_PRODUCT',
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
      metadata: { productName: 'منتج تجريبي' },
    });
    console.log('✅ ADD_PRODUCT (Samsung Galaxy)');

    await logUserActivity({
      userId: user.id,
      action: 'VIEW_DASHBOARD',
      ip: '192.168.1.50',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      metadata: {},
    });
    console.log('✅ VIEW_DASHBOARD (Desktop Chrome)');

    // 2. عرض آخر الأنشطة
    console.log('\n📊 آخر 5 أنشطة:');
    console.log('-'.repeat(80));
    
    const activities = await getUserActivities(user.id, 5);
    activities.forEach((activity, index) => {
      console.log(`\n${index + 1}. ${activity.action}`);
      console.log(`   📅 ${activity.createdAt.toLocaleString('ar-EG')}`);
      console.log(`   📱 ${activity.deviceType || 'Unknown'} - ${activity.browser || 'Unknown'}`);
      console.log(`   💻 ${activity.os || 'Unknown'}`);
      if (activity.deviceModel) {
        console.log(`   📲 ${activity.deviceModel}`);
      }
      if (activity.ip) {
        console.log(`   🌐 IP: ${activity.ip}`);
      }
    });

    // 3. إحصائيات
    console.log('\n\n📈 إحصائيات النشاط:');
    console.log('═'.repeat(80));
    
    const stats = await getUserActivityStats(user.id);
    
    console.log(`\n🎯 إجمالي الأنشطة: ${stats.totalActivities}`);
    
    console.log('\n📱 الأجهزة:');
    Object.entries(stats.deviceTypes).forEach(([device, count]) => {
      console.log(`   ${device}: ${count}`);
    });
    
    console.log('\n🌐 المتصفحات:');
    Object.entries(stats.browsers).forEach(([browser, count]) => {
      console.log(`   ${browser}: ${count}`);
    });
    
    console.log('\n⚡ الأنشطة:');
    Object.entries(stats.actions).forEach(([action, count]) => {
      console.log(`   ${action}: ${count}`);
    });

    if (stats.lastActivity) {
      console.log(`\n⏰ آخر نشاط: ${stats.lastActivity.action}`);
      console.log(`   ${stats.lastActivity.createdAt.toLocaleString('ar-EG')}`);
    }

    console.log('\n═'.repeat(80));
    console.log('✅ الاختبار اكتمل بنجاح!');
    console.log('\n💡 يمكنك الآن:');
    console.log('   - الدخول على /api/user/activity لعرض نشاط المستخدم الحالي');
    console.log('   - الدخول على /api/user/activity?stats=true للإحصائيات');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testActivityTracking();
