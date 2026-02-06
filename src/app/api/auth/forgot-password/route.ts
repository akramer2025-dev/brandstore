import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      );
    }

    // البحث عن المستخدم
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // لأسباب أمنية، نرجع نفس الرسالة حتى لو المستخدم غير موجود
    if (!user) {
      return NextResponse.json({
        message: 'إذا كان البريد الإلكتروني موجود في نظامنا، ستستلم رسالة لإعادة تعيين كلمة المرور',
      });
    }

    // توليد token عشوائي
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // ساعة واحدة

    // حذف أي tokens قديمة لنفس البريد
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    // حفظ الـ token الجديد
    await prisma.passwordResetToken.create({
      data: {
        email,
        token: resetToken,
        expiresAt,
      },
    });

    // رابط إعادة تعيين كلمة المرور
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;

    // إرسال Email
    try {
      await resend.emails.send({
        from: 'Remostore <noreply@remostore.net>',
        to: email,
        subject: 'إعادة تعيين كلمة المرور - Remostore',
        html: `
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 15px;
                padding: 40px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
              }
              .logo {
                text-align: center;
                margin-bottom: 30px;
              }
              .logo h1 {
                color: #667eea;
                font-size: 32px;
                margin: 0;
              }
              .content {
                color: #333;
                line-height: 1.8;
                font-size: 16px;
              }
              .button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-decoration: none;
                padding: 15px 40px;
                border-radius: 8px;
                margin: 30px 0;
                font-weight: bold;
                font-size: 16px;
              }
              .button:hover {
                opacity: 0.9;
              }
              .warning {
                background: #fff3cd;
                border-right: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
                border-radius: 5px;
                color: #856404;
              }
              .footer {
                text-align: center;
                color: #666;
                font-size: 14px;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">
                <h1>🛍️ Remostore</h1>
              </div>
              
              <div class="content">
                <h2 style="color: #333;">مرحباً ${user.name || 'عزيزنا العميل'},</h2>
                
                <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.</p>
                
                <p>لإعادة تعيين كلمة المرور، اضغط على الزر التالي:</p>
                
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">إعادة تعيين كلمة المرور</a>
                </div>
                
                <div class="warning">
                  ⚠️ <strong>تنبيه أمني:</strong> هذا الرابط صالح لمدة ساعة واحدة فقط. إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذه الرسالة.
                </div>
                
                <p>إذا لم يعمل الزر، يمكنك نسخ الرابط التالي ولصقه في متصفحك:</p>
                <p style="word-break: break-all; color: #667eea; font-size: 14px;">${resetUrl}</p>
                
                <p style="margin-top: 30px;">مع تحياتنا،<br><strong>فريق Remostore</strong></p>
              </div>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} Remostore. جميع الحقوق محفوظة.</p>
                <p style="font-size: 12px; color: #999;">هذه رسالة تلقائية، يرجى عدم الرد عليها.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      console.log('✅ Password reset email sent to:', email);
    } catch (emailError: any) {
      console.error('❌ Email sending failed:', emailError);
      
      // لو فشل إرسال الإيميل، نحذف الـ token
      await prisma.passwordResetToken.delete({
        where: { token: resetToken },
      });

      return NextResponse.json(
        { error: 'فشل إرسال البريد الإلكتروني. يرجى المحاولة لاحقاً.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني',
    });
  } catch (error: any) {
    console.error('Error in forgot-password:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء معالجة طلبك' },
      { status: 500 }
    );
  }
}
