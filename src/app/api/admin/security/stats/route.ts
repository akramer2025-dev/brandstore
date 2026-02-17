/**
 * 🛡️ Security Monitoring Dashboard API
 * 
 * يوفر إحصائيات الأمان للأدمن فقط
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, secureResponse, handleError } from '@/lib/security';
import { 
  getSecurityStats, 
  getAllSecurityEvents,
  clearSecurityEvents 
} from '@/lib/security/monitoring';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/security/stats
 * الحصول على إحصائيات الأحداث الأمنية
 */
export async function GET(request: NextRequest) {
  try {
    // التحقق من صلاحيات الأدمن
    const authCheck = await requireAdmin(request);
    if (!authCheck.authorized) {
      return authCheck.response;
    }
    
    // الحصول على عدد الساعات من query params (افتراضياً 24 ساعة)
    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get('hours') || '24');
    const limit = parseInt(searchParams.get('limit') || '100');
    
    // الحصول على الإحصائيات
    const stats = getSecurityStats(hours);
    const allEvents = getAllSecurityEvents(limit);
    
    return secureResponse({
      success: true,
      stats,
      events: allEvents,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/admin/security/stats
 * مسح جميع الأحداث الأمنية المسجلة
 */
export async function DELETE(request: NextRequest) {
  try {
    // التحقق من صلاحيات الأدمن
    const authCheck = await requireAdmin(request);
    if (!authCheck.authorized) {
      return authCheck.response;
    }
    
    const count = clearSecurityEvents();
    
    return secureResponse({
      success: true,
      message: `تم مسح ${count} حدث أمني`,
      clearedCount: count
    });
  } catch (error) {
    return handleError(error);
  }
}
