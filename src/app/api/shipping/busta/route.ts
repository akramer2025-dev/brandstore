import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set. Email functionality will be disabled.');
    return null;
  }
  try {
    return new Resend(process.env.RESEND_API_KEY);
  } catch (error) {
    console.error('Error initializing Resend:', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });
    }

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "مُعرف الطلب مطلوب" }, { status: 400 });
    }

    // البحث عن الطلب
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                titleAr: true,
                title: true,
                price: true,
                image: true,
              },
            },
          },
        },
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    // إنشاء قائمة المنتجات
    const productsHtml = order.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">
            ${item.product?.titleAr || item.product?.title}
          </td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">
            ${(item.quantity * item.price).toFixed(2)} جنيه
          </td>
        </tr>
      `
      )
      .join("");

    // إرسال الإيميل لشركة بوسطة
    const bustaEmail = process.env.BUSTA_EMAIL || 'shipping@busta-egypt.com';

    const resend = getResend();
    if (!resend) {
      console.warn('Resend is not configured. Skipping Busta email.');
      // Update order status but skip email
      await prisma.order.update({
        where: { id: orderId },
        data: {
          bustaStatus: "SENT_TO_BUSTA",
          bustaSentAt: new Date(),
          shippingCompany: "BOSTA",
          shippingNotes: "تم تحديث الحالة محلياً - خدمة البريد غير متاحة",
        },
      });
      
      return NextResponse.json({
        success: true,
        message: "تم تحديث حالة الطلب (خدمة البريد غير متاحة حالياً)",
        warning: "لم يتم إرسال الإيميل لشركة بوسطة",
      });
    }

    const emailResult = await resend.emails.send({
      from: "Remostore <orders@remostore.net>",
      to: [bustaEmail], // إيميل شركة بوسطة
      subject: `طلب شحن جديد - رقم الطلب: ${order.orderNumber}`,
      html: `
<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; line-height: 1.6; }
    .order-card { border: 2px solid #e1e5e9; border-radius: 10px; padding: 20px; margin: 20px 0; background: #f8f9fa; }
    .highlight { background: #fff3cd; padding: 5px 10px; border-radius: 5px; margin: 5px 0; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th { background: #667eea; color: white; padding: 12px; text-align: right; }
    td { padding: 10px; border: 1px solid #ddd; }
    .important { color: #dc3545; font-weight: bold; }
    .amount { font-size: 1.2em; font-weight: bold; color: #28a745; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚚 طلب شحن جديد من Remostore</h1>
    <p>شركة بوسطة المحترمة</p>
  </div>

  <div class="content">
    <div class="order-card">
      <h2>📦 تفاصيل الطلب</h2>
      <div class="highlight">
        <strong>رقم الطلب:</strong> ${order.orderNumber}
      </div>
      <div class="highlight">
        <strong>تاريخ الطلب:</strong> ${new Date(order.createdAt).toLocaleDateString('ar-EG')}
      </div>
      <div class="highlight">
        <strong>طريقة الدفع:</strong> ${order.paymentMethod === 'CASH_ON_DELIVERY' ? 'دفع عند الاستلام' : 'مدفوع مسبقاً'}
      </div>
    </div>

    <div class="order-card">
      <h2>👤 بيانات العميل</h2>
      <p><strong>الاسم:</strong> ${order.customer.name}</p>
      <p><strong>الهاتف:</strong> ${order.deliveryPhone}</p>
      <p class="important"><strong>عنوان التوصيل:</strong><br>${order.deliveryAddress}</p>
      ${order.governorate ? `<p><strong>المحافظة:</strong> ${order.governorate}</p>` : ''}
      ${order.customerNotes ? `<p><strong>ملاحظات العميل:</strong><br>${order.customerNotes}</p>` : ''}
    </div>

    <div class="order-card">
      <h2>🛍️ المنتجات المطلوبة</h2>
      <table>
        <thead>
          <tr>
            <th>المنتج</th>
            <th>الكمية</th>
            <th>السعر</th>
          </tr>
        </thead>
        <tbody>
          ${productsHtml}
        </tbody>
      </table>
      
      <div style="margin-top: 20px; text-align: left;">
        <p><strong>إجمالي المنتجات:</strong> ${order.totalAmount.toFixed(2)} جنيه</p>
        ${order.deliveryFee > 0 ? `<p><strong>رسوم الشحن:</strong> ${order.deliveryFee.toFixed(2)} جنيه</p>` : ''}
        <p class="amount">💰 <strong>إجمالي الطلب:</strong> ${order.finalAmount.toFixed(2)} جنيه</p>
      </div>
    </div>

    <div class="order-card" style="background: #e3f2fd;">
      <h2>⚡ إجراءات مطلوبة</h2>
      <ul>
        <li><strong>استلام الطلب:</strong> من متجر ريموستور</li>
        <li><strong>التواصل مع العميل:</strong> ${order.deliveryPhone}</li>
        <li><strong>التوصيل إلى:</strong> ${order.deliveryAddress}</li>
        ${order.paymentMethod === 'CASH_ON_DELIVERY' 
          ? `<li class="important"><strong>تجميع المبلغ:</strong> ${order.finalAmount.toFixed(2)} جنيه عند التوصيل</li>` 
          : '<li><strong>مدفوع مسبقاً</strong> - لا حاجة لتجميع مبلغ</li>'
        }
      </ul>
    </div>

    <div style="margin: 30px 0; padding: 20px; background: #f0f8ff; border-radius: 10px; text-align: center;">
      <p><strong>للاستفسار أو التواصل:</strong></p>
      <p>📧 البريد: support@remostore.net</p>
      <p>📱 الهاتف: +20 100 123 4567</p>
      <p>💻 الموقع: <a href="https://remostore.net">remostore.net</a></p>
    </div>

    <div style="text-align: center; color: #666; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
      <p>شكراً لكم على التعامل معنا</p>
      <p><strong>فريق ريموستور</strong></p>
    </div>
  </div>
</body>
</html>
      `,
    });

    // تحديث الطلب في قاعدة البيانات
    await prisma.order.update({
      where: { id: orderId },
      data: {
        bustaStatus: "SENT_TO_BUSTA",
        bustaSentAt: new Date(),
        shippingCompany: "BOSTA",
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم إرسال تفاصيل الطلب لشركة بوسطة بنجاح",
      emailId: emailResult.data?.id,
    });
  } catch (error: any) {
    console.error("Error sending to Busta:", error);
    return NextResponse.json(
      { error: "فشل في إرسال الطلب لشركة بوسطة" },
      { status: 500 }
    );
  }
}

// GET - لجلب جميع الطلبات المرسلة لبوسطة
export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { bustaStatus: { not: null } },
          { shippingCompany: "BOSTA" },
        ],
      },
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
        items: {
          select: {
            quantity: true,
            product: {
              select: {
                titleAr: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        bustaSentAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("Error fetching Busta orders:", error);
    return NextResponse.json(
      { error: "فشل في جلب طلبات بوسطة" },
      { status: 500 }
    );
  }
}