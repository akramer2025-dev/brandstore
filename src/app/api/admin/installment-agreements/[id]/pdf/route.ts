import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const agreementId = resolvedParams.id;

    // Get the agreement with all details
    const agreement = await prisma.installmentAgreement.findUnique({
      where: { id: agreementId },
      include: {
        user: true,
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!agreement) {
      return NextResponse.json(
        { error: "الاتفاقية غير موجودة" },
        { status: 404 }
      );
    }

    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>اتفاقية تقسيط - ${agreement.agreementNumber}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            direction: rtl;
            text-align: right;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #4F46E5;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #4F46E5;
            margin: 0;
          }
          .section {
            margin-bottom: 30px;
            padding: 20px;
            background: #F9FAFB;
            border-radius: 8px;
          }
          .section h2 {
            color: #1F2937;
            border-bottom: 2px solid #E5E7EB;
            padding-bottom: 10px;
            margin-top: 0;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #E5E7EB;
          }
          .info-label {
            font-weight: bold;
            color: #6B7280;
          }
          .info-value {
            color: #111827;
          }
          .image-section {
            page-break-before: always;
          }
          .image-container {
            margin: 20px 0;
            text-align: center;
          }
          .image-container img {
            max-width: 100%;
            height: auto;
            border: 2px solid #E5E7EB;
            border-radius: 8px;
          }
          .image-label {
            font-weight: bold;
            color: #4F46E5;
            margin-bottom: 10px;
          }
          .terms {
            background: #FEF3C7;
            padding: 15px;
            border-right: 4px solid #F59E0B;
            margin-top: 20px;
          }
          @media print {
            body { padding: 20px; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>اتفاقية تقسيط</h1>
          <p>رقم الاتفاقية: <strong>${agreement.agreementNumber}</strong></p>
          <p>التاريخ: ${new Date(agreement.createdAt).toLocaleDateString('ar-EG')}</p>
        </div>

        <div class="section">
          <h2>بيانات العميل</h2>
          <div class="info-row">
            <span class="info-label">الاسم الكامل:</span>
            <span class="info-value">${agreement.fullName || 'غير متوفر'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">رقم البطاقة:</span>
            <span class="info-value">${agreement.nationalId || 'غير متوفر'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">العنوان:</span>
            <span class="info-value">${agreement.address || 'غير متوفر'}</span>
          </div>
        </div>

        <div class="section">
          <h2>تفاصيل التقسيط</h2>
          <div class="info-row">
            <span class="info-label">المبلغ الإجمالي:</span>
            <span class="info-value">${agreement.totalAmount} جنيه</span>
          </div>
          <div class="info-row">
            <span class="info-label">الدفعة المقدمة:</span>
            <span class="info-value">${agreement.downPayment} جنيه</span>
          </div>
          <div class="info-row">
            <span class="info-label">عدد الأقساط:</span>
            <span class="info-value">${agreement.numberOfInstallments} قسط</span>
          </div>
          <div class="info-row">
            <span class="info-label">القسط الشهري:</span>
            <span class="info-value">${agreement.monthlyInstallment} جنيه</span>
          </div>
          <div class="info-row">
            <span class="info-label">نسبة الفائدة:</span>
            <span class="info-value">${agreement.interestRate}%</span>
          </div>
        </div>

        ${agreement.order ? `
        <div class="section">
          <h2>تفاصيل الطلب</h2>
          ${agreement.order.items.map((item: any) => `
            <div class="info-row">
              <span class="info-label">${item.product.name}:</span>
              <span class="info-value">${item.quantity} × ${item.price} جنيه = ${item.quantity * item.price} جنيه</span>
            </div>
          `).join('')}
        </div>
        ` : ''}

        <div class="terms">
          <strong>✓ تم قبول الشروط والأحكام</strong><br>
          <small>توقيع العميل: ${new Date(agreement.createdAt).toLocaleDateString('ar-EG')}</small>
        </div>

        ${agreement.selfieImage || agreement.nationalIdImage || agreement.nationalIdBack || agreement.signature ? `
        <div class="image-section">
          <h2 style="text-align: center; color: #4F46E5;">المستندات والصور</h2>
          
          ${agreement.selfieImage ? `
          <div class="image-container">
            <div class="image-label">صورة شخصية (سيلفي)</div>
            <img src="${agreement.selfieImage}" alt="صورة شخصية" />
          </div>
          ` : ''}

          ${agreement.nationalIdImage ? `
          <div class="image-container">
            <div class="image-label">البطاقة الشخصية (الأمام)</div>
            <img src="${agreement.nationalIdImage}" alt="البطاقة الأمامية" />
          </div>
          ` : ''}

          ${agreement.nationalIdBack ? `
          <div class="image-container">
            <div class="image-label">البطاقة الشخصية (الخلف)</div>
            <img src="${agreement.nationalIdBack}" alt="البطاقة الخلفية" />
          </div>
          ` : ''}

          ${agreement.signature ? `
          <div class="image-container">
            <div class="image-label">التوقيع الإلكتروني</div>
            <img src="${agreement.signature}" alt="التوقيع" style="max-height: 200px;" />
          </div>
          ` : ''}
        </div>
        ` : ''}

        <div style="margin-top: 50px; text-align: center; color: #6B7280; font-size: 12px;">
          <p>هذا المستند تم إنشاؤه إلكترونياً ولا يحتاج لختم أو توقيع</p>
          <p>تاريخ الإصدار: ${new Date().toLocaleDateString('ar-EG', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
      </body>
      </html>
    `;

    // For now, return HTML that can be printed as PDF
    // In the future, you can use a library like puppeteer or pdf-lib to generate actual PDF
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="agreement-${agreement.agreementNumber}.html"`,
      },
    });

  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الملف" },
      { status: 500 }
    );
  }
}
