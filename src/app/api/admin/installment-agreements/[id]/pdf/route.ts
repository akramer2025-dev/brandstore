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
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif, 'Arial';
            direction: rtl;
            text-align: right;
            padding: 30px;
            max-width: 900px;
            margin: 0 auto;
            background: #fff;
            color: #111827;
            line-height: 1.8;
          }
          
          /* Header with Logo */
          .header {
            text-align: center;
            padding: 30px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 16px;
            margin-bottom: 40px;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
            position: relative;
            overflow: hidden;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: shimmer 3s infinite;
          }
          
          @keyframes shimmer {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(-20px, -20px); }
          }
          
          .logo-container {
            margin-bottom: 20px;
            position: relative;
            z-index: 1;
          }
          
          .logo {
            max-width: 180px;
            height: auto;
            background: white;
            padding: 15px 25px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          }
          
          .header h1 {
            color: #ffffff;
            margin: 15px 0 10px 0;
            font-size: 32px;
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
            position: relative;
            z-index: 1;
          }
          
          .agreement-number {
            background: rgba(255, 255, 255, 0.95);
            color: #667eea;
            padding: 12px 30px;
            border-radius: 50px;
            font-size: 18px;
            font-weight: 700;
            display: inline-block;
            margin: 10px 0;
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
            position: relative;
            z-index: 1;
          }
          
          .header-date {
            color: rgba(255, 255, 255, 0.95);
            font-size: 14px;
            margin-top: 10px;
            position: relative;
            z-index: 1;
          }
          
          /* Sections */
          .section {
            margin-bottom: 30px;
            padding: 25px;
            background: linear-gradient(to bottom, #ffffff 0%, #f9fafb 100%);
            border-radius: 12px;
            border: 2px solid #e5e7eb;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            transition: all 0.3s ease;
          }
          
          .section:hover {
            box-shadow: 0 4px 16px rgba(0,0,0,0.1);
            transform: translateY(-2px);
          }
          
          .section h2 {
            color: #667eea;
            border-bottom: 3px solid #667eea;
            padding-bottom: 12px;
            margin-bottom: 20px;
            font-size: 22px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .section h2::before {
            content: '●';
            color: #764ba2;
            font-size: 12px;
          }
          
          /* Info Rows */
          .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            margin-bottom: 8px;
            background: white;
            border-radius: 8px;
            border-right: 4px solid #667eea;
            transition: all 0.2s ease;
          }
          
          .info-row:hover {
            background: #f3f4f6;
            border-right-color: #764ba2;
          }
          
          .info-label {
            font-weight: 600;
            color: #4b5563;
            font-size: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .info-label::before {
            content: '◆';
            color: #667eea;
            font-size: 10px;
          }
          
          .info-value {
            color: #111827;
            font-weight: 700;
            font-size: 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          /* Installment Table */
          .installment-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-top: 20px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }
          
          .installment-table th {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            font-weight: 600;
            text-align: center;
            font-size: 15px;
          }
          
          .installment-table td {
            padding: 12px 15px;
            text-align: center;
            background: white;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .installment-table tr:last-child td {
            border-bottom: none;
          }
          
          .installment-table tr:nth-child(even) td {
            background: #f9fafb;
          }
          
          /* Terms Section */
          .terms {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            padding: 25px;
            border-radius: 12px;
            border: 2px solid #f59e0b;
            margin-top: 30px;
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
          }
          
          .terms-title {
            color: #92400e;
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .terms-content {
            color: #78350f;
            line-height: 2;
            font-size: 14px;
          }
          
          /* Image Section */
          .image-section {
            page-break-before: always;
            padding: 30px 0;
          }
          
          .image-section h2 {
            text-align: center;
            color: #667eea;
            font-size: 28px;
            margin-bottom: 40px;
            padding-bottom: 15px;
            border-bottom: 3px solid #667eea;
          }
          
          .image-container {
            margin: 30px 0;
            text-align: center;
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.1);
          }
          
          .image-label {
            font-weight: 700;
            color: #667eea;
            margin-bottom: 15px;
            font-size: 18px;
            display: inline-block;
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            padding: 10px 25px;
            border-radius: 8px;
          }
          
          .image-container img {
            max-width: 100%;
            height: auto;
            border: 3px solid #e5e7eb;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: all 0.3s ease;
          }
          
          .image-container img:hover {
            transform: scale(1.02);
            box-shadow: 0 8px 20px rgba(0,0,0,0.2);
          }
          
          /* Footer */
          .footer {
            margin-top: 60px;
            padding: 30px;
            text-align: center;
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            border-radius: 12px;
            border: 2px dashed #d1d5db;
          }
          
          .footer-title {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 15px;
            font-weight: 600;
          }
          
          .footer-details {
            font-size: 13px;
            color: #9ca3af;
            line-height: 1.8;
          }
          
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            color: rgba(102, 126, 234, 0.03);
            font-weight: 900;
            z-index: -1;
            user-select: none;
            pointer-events: none;
          }
          
          @media print {
            body { 
              padding: 15px;
              background: white;
            }
            .section { 
              page-break-inside: avoid;
              box-shadow: none;
            }
            .section:hover {
              transform: none;
            }
            .header::before {
              animation: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="watermark">RIMO STORE</div>
        
        <div class="header">
          <div class="logo-container">
            <img src="/rimo-full-logo.png" alt="Rimo Store Logo" class="logo" />
          </div>
          <h1>📄 اتفاقية تقسيط</h1>
          <div class="agreement-number">
            🔖 رقم الاتفاقية: ${agreement.agreementNumber}
          </div>
          <div class="header-date">
            📅 تاريخ الإصدار: ${new Date(agreement.createdAt).toLocaleDateString('ar-EG', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>

        <div class="section">
          <h2>👤 بيانات العميل</h2>
          <div class="info-row">
            <span class="info-label">الاسم الكامل</span>
            <span class="info-value">${agreement.fullName || 'غير متوفر'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">رقم البطاقة الشخصية</span>
            <span class="info-value">${agreement.nationalId || 'غير متوفر'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">العنوان الكامل</span>
            <span class="info-value">${agreement.address || 'غير متوفر'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">رقم الهاتف</span>
            <span class="info-value">${agreement.user?.phone || 'غير متوفر'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">البريد الإلكتروني</span>
            <span class="info-value">${agreement.user?.email || 'غير متوفر'}</span>
          </div>
        </div>

        <div class="section">
          <h2>💰 تفاصيل التقسيط</h2>
          <div class="info-row">
            <span class="info-label">المبلغ الإجمالي</span>
            <span class="info-value">${agreement.totalAmount.toFixed(2)} جنيه مصري</span>
          </div>
          <div class="info-row">
            <span class="info-label">الدفعة المقدمة</span>
            <span class="info-value">${agreement.downPayment.toFixed(2)} جنيه مصري</span>
          </div>
          <div class="info-row">
            <span class="info-label">المبلغ المتبقي</span>
            <span class="info-value">${(agreement.totalAmount - agreement.downPayment).toFixed(2)} جنيه مصري</span>
          </div>
          <div class="info-row">
            <span class="info-label">عدد الأقساط الشهرية</span>
            <span class="info-value">${agreement.numberOfInstallments} قسط</span>
          </div>
          <div class="info-row">
            <span class="info-label">قيمة القسط الشهري</span>
            <span class="info-value">${agreement.monthlyInstallment.toFixed(2)} جنيه مصري</span>
          </div>
          <div class="info-row">
            <span class="info-label">نسبة الفائدة السنوية</span>
            <span class="info-value">${agreement.interestRate}%</span>
          </div>
        </div>

        ${agreement.order ? `
        <div class="section">
          <h2>🛍️ تفاصيل المنتجات</h2>
          <table class="installment-table" style="margin-top: 15px;">
            <thead>
              <tr>
                <th>المنتج</th>
                <th>الكمية</th>
                <th>السعر</th>
                <th>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${agreement.order.items.map((item: any) => `
                <tr>
                  <td style="font-weight: 600; text-align: right; padding-right: 20px;">
                    ${item.product.nameAr || item.product.name}
                  </td>
                  <td>${item.quantity}</td>
                  <td>${item.price.toFixed(2)} ج.م</td>
                  <td style="font-weight: 700; color: #667eea;">
                    ${(item.quantity * item.price).toFixed(2)} ج.م
                  </td>
                </tr>
              `).join('')}
              <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                <td colspan="3" style="text-align: left; padding-right: 20px; font-weight: 700; font-size: 16px;">
                  الإجمالي الكلي
                </td>
                <td style="font-weight: 900; font-size: 18px;">
                  ${agreement.totalAmount.toFixed(2)} ج.م
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        ` : ''}

        <div class="section">
          <h2>📋 جدول الأقساط المتوقعة</h2>
          <table class="installment-table">
            <thead>
              <tr>
                <th>رقم القسط</th>
                <th>تاريخ الاستحقاق</th>
                <th>المبلغ المستحق</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              ${Array.from({ length: agreement.numberOfInstallments }, (_, index) => {
                const dueDate = new Date(agreement.createdAt);
                dueDate.setMonth(dueDate.getMonth() + index + 1);
                return `
                  <tr>
                    <td style="font-weight: 700; color: #667eea;">القسط ${index + 1}</td>
                    <td>${dueDate.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                    <td style="font-weight: 700;">${agreement.monthlyInstallment.toFixed(2)} ج.م</td>
                    <td style="color: ${index === 0 ? '#f59e0b' : '#9ca3af'}; font-weight: 600;">
                      ${index === 0 ? '⏳ قيد الانتظار' : '⏱️ مستقبلي'}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div class="terms">
          <div class="terms-title">
            ✅ الشروط والأحكام
          </div>
          <div class="terms-content">
            <p style="margin-bottom: 10px;">
              <strong>• الالتزام بالسداد:</strong> يلتزم العميل بسداد الأقساط الشهرية في مواعيدها المحددة دون تأخير.
            </p>
            <p style="margin-bottom: 10px;">
              <strong>• غرامة التأخير:</strong> في حالة التأخير عن سداد أي قسط، سيتم احتساب غرامة تأخير بنسبة 5% من قيمة القسط.
            </p>
            <p style="margin-bottom: 10px;">
              <strong>• الإلغاء والاسترجاع:</strong> لا يمكن إلغاء الاتفاقية بعد استلام المنتجات إلا بموافقة الإدارة.
            </p>
            <p style="margin-bottom: 10px;">
              <strong>• الملكية:</strong> تظل ملكية المنتجات للشركة حتى سداد كامل المبلغ المستحق.
            </p>
            <p style="margin-bottom: 15px;">
              <strong>• الموافقة:</strong> بالتوقيع أدناه، يقر العميل بقراءة وفهم جميع الشروط والموافقة عليها.
            </p>
            <div style="margin-top: 20px; padding-top: 15px; border-top: 2px dashed #f59e0b;">
              <strong style="font-size: 16px;">✍️ تم التوقيع والموافقة بتاريخ:</strong>
              <span style="margin-right: 10px; font-size: 16px;">
                ${new Date(agreement.createdAt).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>

        ${agreement.selfieImage || agreement.nationalIdImage || agreement.nationalIdBack || agreement.signature ? `
        <div class="image-section">
          <h2>📸 المستندات والصور المرفقة</h2>
          
          ${agreement.selfieImage ? `
          <div class="image-container">
            <div class="image-label">🤳 صورة شخصية (سيلفي)</div>
            <img src="${agreement.selfieImage}" alt="صورة شخصية" />
          </div>
          ` : ''}

          ${agreement.nationalIdImage ? `
          <div class="image-container">
            <div class="image-label">🪪 البطاقة الشخصية (الوجه الأمامي)</div>
            <img src="${agreement.nationalIdImage}" alt="البطاقة الأمامية" />
          </div>
          ` : ''}

          ${agreement.nationalIdBack ? `
          <div class="image-container">
            <div class="image-label">🪪 البطاقة الشخصية (الوجه الخلفي)</div>
            <img src="${agreement.nationalIdBack}" alt="البطاقة الخلفية" />
          </div>
          ` : ''}

          ${agreement.signature ? `
          <div class="image-container">
            <div class="image-label">✍️ التوقيع الإلكتروني</div>
            <img src="${agreement.signature}" alt="التوقيع" style="max-height: 250px; max-width: 500px;" />
          </div>
          ` : ''}
        </div>
        ` : ''}

        <div class="footer">
          <div class="footer-title">
            🔒 مستند قانوني معتمد
          </div>
          <div class="footer-details">
            <p style="margin-bottom: 8px;">
              <strong>📄 هذا المستند تم إنشاؤه إلكترونياً</strong> ويعتبر ملزماً قانونياً بين الطرفين
            </p>
            <p style="margin-bottom: 8px;">
              📅 تاريخ إصدار المستند: ${new Date().toLocaleDateString('ar-EG', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </p>
            <p style="margin-bottom: 8px;">
              🏢 <strong>شركة ريمو للتجارة الإلكترونية</strong>
            </p>
            <p style="margin-bottom: 8px;">
              🌐 الموقع الإلكتروني: <strong>www.remostore.net</strong>
            </p>
            <p style="margin-bottom: 8px;">
              📞 للاستفسارات: خدمة العملاء | 📧 البريد الإلكتروني: support@remostore.net
            </p>
            <p style="margin-top: 15px; color: #667eea; font-weight: 600;">
              ⚖️ جميع الحقوق محفوظة © ${new Date().getFullYear()} - Rimo Store
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // For now, return HTML that can be printed as PDF
    // In the future, you can use a library like puppeteer or pdf-lib to generate actual PDF
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="اتفاقية-${agreement.agreementNumber}.html"`,
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
