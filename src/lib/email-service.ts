import { Resend } from 'resend';

// Initialize Resend
function getResend() {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY is not set. Email functionality will be disabled.');
    return null;
  }
  try {
    return new Resend(process.env.RESEND_API_KEY);
  } catch (error) {
    console.error('❌ Error initializing Resend:', error);
    return null;
  }
}

const resend = getResend();

// Email Templates
export const EmailTemplates = {
  // إشعار طلب جديد للتاجر
  newOrderVendor: (data: {
    vendorName: string;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    itemsCount: number;
    orderLink: string;
  }) => `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 30px; }
    .order-info { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .order-info h2 { color: #333; margin-top: 0; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
    .info-label { font-weight: bold; color: #666; }
    .info-value { color: #333; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 طلب جديد!</h1>
    </div>
    <div class="content">
      <p>مرحباً ${data.vendorName}،</p>
      <p>لديك طلب جديد يحتاج إلى معالجة:</p>
      
      <div class="order-info">
        <h2>تفاصيل الطلب</h2>
        <div class="info-row">
          <span class="info-label">رقم الطلب:</span>
          <span class="info-value">#${data.orderNumber}</span>
        </div>
        <div class="info-row">
          <span class="info-label">اسم العميل:</span>
          <span class="info-value">${data.customerName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">عدد المنتجات:</span>
          <span class="info-value">${data.itemsCount} منتج</span>
        </div>
        <div class="info-row">
          <span class="info-label">المبلغ الإجمالي:</span>
          <span class="info-value">${data.totalAmount.toFixed(2)} جنيه</span>
        </div>
      </div>
      
      <center>
        <a href="${data.orderLink}" class="cta-button">عرض الطلب</a>
      </center>
      
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        💡 نصيحة: قم بمعالجة الطلب في أقرب وقت لضمان رضا العميل.
      </p>
    </div>
    <div class="footer">
      <p>Remostore - نظام إدارة المتاجر</p>
      <p>هذا البريد تم إرساله تلقائياً، يرجى عدم الرد عليه</p>
    </div>
  </div>
</body>
</html>
  `,

  // تأكيد الطلب للعميل
  orderConfirmation: (data: {
    customerName: string;
    orderNumber: string;
    totalAmount: number;
    items: Array<{ name: string; quantity: number; price: number }>;
    deliveryAddress: string;
    trackingLink?: string;
  }) => `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 30px; }
    .success-icon { font-size: 60px; text-align: center; margin: 20px 0; }
    .order-details { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
    .total { font-size: 18px; font-weight: bold; color: #059669; padding-top: 15px; text-align: left; }
    .cta-button { display: inline-block; background: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ تم تأكيد طلبك!</h1>
    </div>
    <div class="content">
      <div class="success-icon">🎉</div>
      <p>عزيزي ${data.customerName}،</p>
      <p>شكراً لك! تم استلام طلبك بنجاح وجاري تجهيزه.</p>
      
      <div class="order-details">
        <h3>رقم الطلب: #${data.orderNumber}</h3>
        <hr>
        ${data.items.map(item => `
          <div class="item">
            <span>${item.name} x ${item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)} ج.م</span>
          </div>
        `).join('')}
        <div class="total">
          الإجمالي: ${data.totalAmount.toFixed(2)} جنيه
        </div>
        <hr>
        <p><strong>📍 عنوان التوصيل:</strong><br>${data.deliveryAddress}</p>
      </div>
      
      ${data.trackingLink ? `
        <center>
          <a href="${data.trackingLink}" class="cta-button">تتبع طلبك</a>
        </center>
      ` : ''}
      
      <p style="color: #666; margin-top: 30px;">
        سنقوم بإرسال إشعار آخر عند شحن طلبك.
      </p>
    </div>
    <div class="footer">
      <p>Remostore - متجرك الإلكتروني</p>
      <p>للاستفسارات: support@remostore.com</p>
    </div>
  </div>
</body>
</html>
  `,

  // تحديث حالة الطلب
  orderStatusUpdate: (data: {
    customerName: string;
    orderNumber: string;
    status: string;
    statusMessage: string;
    trackingLink?: string;
  }) => `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .status-badge { display: inline-block; background: #dbeafe; color: #1e40af; padding: 10px 20px; border-radius: 20px; font-weight: bold; margin: 20px 0; }
    .cta-button { display: inline-block; background: #3b82f6; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📦 تحديث حالة الطلب</h1>
    </div>
    <div class="content">
      <p>عزيزي ${data.customerName}،</p>
      <p>تم تحديث حالة طلبك رقم <strong>#${data.orderNumber}</strong></p>
      
      <center>
        <div class="status-badge">${data.status}</div>
      </center>
      
      <p>${data.statusMessage}</p>
      
      ${data.trackingLink ? `
        <center>
          <a href="${data.trackingLink}" class="cta-button">تتبع طلبك</a>
        </center>
      ` : ''}
    </div>
    <div class="footer">
      <p>Remostore</p>
    </div>
  </div>
</body>
</html>
  `,

  // استرداد كلمة المرور
  passwordReset: (data: {
    name: string;
    resetLink: string;
    expiresIn: string;
  }) => `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .cta-button { display: inline-block; background: #f59e0b; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .warning { background: #fef3c7; border-right: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 استرداد كلمة المرور</h1>
    </div>
    <div class="content">
      <p>مرحباً ${data.name}،</p>
      <p>تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.</p>
      
      <center>
        <a href="${data.resetLink}" class="cta-button">إعادة تعيين كلمة المرور</a>
      </center>
      
      <div class="warning">
        <strong>⚠️ تنبيه:</strong> هذا الرابط صالح لمدة ${data.expiresIn} فقط.
      </div>
      
      <p style="color: #666;">
        إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد بأمان.
      </p>
    </div>
    <div class="footer">
      <p>Remostore</p>
      <p>للمساعدة: support@remostore.com</p>
    </div>
  </div>
</body>
</html>
  `,

  // موافقة على شريك جديد
  partnerApproval: (data: {
    partnerName: string;
    storeName: string;
    dashboardLink: string;
    supportEmail: string;
  }) => `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .cta-button { display: inline-block; background: #8b5cf6; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .tips { background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .tips ul { margin: 10px 0; padding-right: 20px; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎊 مبروك! تمت الموافقة</h1>
    </div>
    <div class="content">
      <p>عزيزي ${data.partnerName}،</p>
      <p>يسعدنا إبلاغك بأنه تمت الموافقة على انضمامك كشريك في Remostore!</p>
      
      <p><strong>اسم متجرك:</strong> ${data.storeName}</p>
      
      <center>
        <a href="${data.dashboardLink}" class="cta-button">الذهاب إلى لوحة التحكم</a>
      </center>
      
      <div class="tips">
        <h3>🚀 البدء السريع:</h3>
        <ul>
          <li>أضف منتجاتك الأولى</li>
          <li>اضبط إعدادات متجرك</li>
          <li>راجع سياسات البيع</li>
          <li>تابع طلباتك ومبيعاتك</li>
        </ul>
      </div>
      
      <p>إذا كان لديك أي استفسارات، لا تتردد في التواصل معنا على:</p>
      <p><strong>📧 ${data.supportEmail}</strong></p>
    </div>
    <div class="footer">
      <p>نتمنى لك تجربة ناجحة! 🎉</p>
    </div>
  </div>
</body>
</html>
  `,
};

// Email Service Functions
export const EmailService = {
  // إرسال بريد طلب جديد للتاجر
  async sendNewOrderToVendor(data: {
    vendorEmail: string;
    vendorName: string;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    itemsCount: number;
    orderLink: string;
  }) {
    if (!resend) {
      console.warn('⚠️ Email service not available');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const result = await resend.emails.send({
        from: 'Remostore <orders@remostore.com>',
        to: [data.vendorEmail],
        subject: `🎉 طلب جديد - #${data.orderNumber}`,
        html: EmailTemplates.newOrderVendor(data),
      });

      console.log('✅ Email sent to vendor:', data.vendorEmail);
      return { success: true, result };
    } catch (error) {
      console.error('❌ Failed to send email to vendor:', error);
      return { success: false, error };
    }
  },

  // إرسال تأكيد الطلب للعميل
  async sendOrderConfirmation(data: {
    customerEmail: string;
    customerName: string;
    orderNumber: string;
    totalAmount: number;
    items: Array<{ name: string; quantity: number; price: number }>;
    deliveryAddress: string;
    trackingLink?: string;
  }) {
    if (!resend) {
      console.warn('⚠️ Email service not available');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const result = await resend.emails.send({
        from: 'Remostore <orders@remostore.com>',
        to: [data.customerEmail],
        subject: `✅ تأكيد الطلب - #${data.orderNumber}`,
        html: EmailTemplates.orderConfirmation(data),
      });

      console.log('✅ Order confirmation sent to:', data.customerEmail);
      return { success: true, result };
    } catch (error) {
      console.error('❌ Failed to send order confirmation:', error);
      return { success: false, error };
    }
  },

  // إرسال تحديث حالة الطلب
  async sendOrderStatusUpdate(data: {
    customerEmail: string;
    customerName: string;
    orderNumber: string;
    status: string;
    statusMessage: string;
    trackingLink?: string;
  }) {
    if (!resend) {
      console.warn('⚠️ Email service not available');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const result = await resend.emails.send({
        from: 'Remostore <orders@remostore.com>',
        to: [data.customerEmail],
        subject: `📦 تحديث الطلب - #${data.orderNumber}`,
        html: EmailTemplates.orderStatusUpdate(data),
      });

      console.log('✅ Status update sent to:', data.customerEmail);
      return { success: true, result };
    } catch (error) {
      console.error('❌ Failed to send status update:', error);
      return { success: false, error };
    }
  },

  // إرسال رابط استرداد كلمة المرور
  async sendPasswordReset(data: {
    email: string;
    name: string;
    resetLink: string;
    expiresIn?: string;
  }) {
    if (!resend) {
      console.warn('⚠️ Email service not available');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const result = await resend.emails.send({
        from: 'Remostore <noreply@remostore.com>',
        to: [data.email],
        subject: '🔐 استرداد كلمة المرور - Remostore',
        html: EmailTemplates.passwordReset({
          ...data,
          expiresIn: data.expiresIn || 'ساعة واحدة',
        }),
      });

      console.log('✅ Password reset email sent to:', data.email);
      return { success: true, result };
    } catch (error) {
      console.error('❌ Failed to send password reset:', error);
      return { success: false, error };
    }
  },

  // إشعار موافقة الشريك
  async sendPartnerApproval(data: {
    partnerEmail: string;
    partnerName: string;
    storeName: string;
    dashboardLink: string;
    supportEmail?: string;
  }) {
    if (!resend) {
      console.warn('⚠️ Email service not available');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const result = await resend.emails.send({
        from: 'Remostore <partners@remostore.com>',
        to: [data.partnerEmail],
        subject: '🎊 مبروك! تمت الموافقة على انضمامك',
        html: EmailTemplates.partnerApproval({
          ...data,
          supportEmail: data.supportEmail || 'support@remostore.com',
        }),
      });

      console.log('✅ Partner approval sent to:', data.partnerEmail);
      return { success: true, result };
    } catch (error) {
      console.error('❌ Failed to send partner approval:', error);
      return { success: false, error };
    }
  },

  // إرسال بريد عام
  async sendEmail(data: {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
  }) {
    if (!resend) {
      console.warn('⚠️ Email service not available');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const result = await resend.emails.send({
        from: data.from || 'Remostore <noreply@remostore.com>',
        to: Array.isArray(data.to) ? data.to : [data.to],
        subject: data.subject,
        html: data.html,
      });

      console.log('✅ Email sent successfully');
      return { success: true, result };
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return { success: false, error };
    }
  },
};
