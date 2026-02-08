import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { page, referrer } = body;

    // Get IP address
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';

    // Get User Agent
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Parse device type from user agent
    const isMobile = /mobile/i.test(userAgent);
    const isTablet = /tablet|ipad/i.test(userAgent);
    const device = isMobile ? 'mobile' : (isTablet ? 'tablet' : 'desktop');

    // Parse browser
    let browser = 'unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    // Save visitor
    await prisma.visitor.create({
      data: {
        ipAddress: ip,
        userAgent: userAgent.substring(0, 500), // Limit length
        page: page || '/',
        referrer: referrer || null,
        device,
        browser,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking visitor:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
