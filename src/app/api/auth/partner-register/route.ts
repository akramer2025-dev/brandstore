import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { UserRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      // Account Info
      email,
      password,
      username,
      
      // Business Info
      businessName,
      businessNameAr,
      businessType,
      
      // Contact
      phone,
      alternativePhone,
      whatsapp,
      
      // Address
      address,
      city,
      region,
      postalCode,
      
      // Details
      description,
      descriptionAr,
      category,
      subCategory,
      yearsOfExperience,
      
      // Banking
      bankName,
      accountNumber,
      iban,
      accountHolderName,
      
      // Documents
      documents,
      
      // Delivery specific
      vehicleType,
      vehicleNumber,
    } = body

    // التحقق من البريد الإلكتروني واسم المستخدم
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني أو اسم المستخدم مستخدم بالفعل' },
        { status: 400 }
      )
    }

    // تحديد الدور بناءً على نوع الشريك
    let role: UserRole = 'VENDOR'
    if (businessType === 'factory') {
      role = 'MANUFACTURER'
    } else if (businessType === 'delivery') {
      role = 'DELIVERY_STAFF'
    }

    // تشفير كلمة المرور
    const hashedPassword = await hash(password, 10)

    // إنشاء المستخدم
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        name: businessNameAr || businessName,
        role,
      }
    })

    // إنشاء سجل الشريك بناءً على النوع
    if (businessType === 'delivery') {
      // إنشاء سجل مندوب التوصيل
      await prisma.deliveryStaff.create({
        data: {
          userId: user.id,
          phone,
          alternativePhone,
          whatsapp,
          address,
          city,
          region,
          vehicleType,
          vehicleNumber,
          drivingLicense: documents?.drivingLicense,
          nationalId: documents?.nationalId,
          isAvailable: false, // سيتم تفعيله بعد الموافقة
          isApproved: false,
          bankName,
          accountNumber,
          iban,
          accountHolderName,
        }
      })
    } else {
      // إنشاء سجل البائع/المصنع
      await prisma.vendor.create({
        data: {
          userId: user.id,
          businessName: businessName || businessNameAr,
          businessNameAr,
          businessType,
          phone,
          alternativePhone,
          whatsapp,
          address,
          city,
          region,
          postalCode,
          description,
          descriptionAr,
          category,
          subCategory,
          yearsOfExperience: parseInt(yearsOfExperience) || 0,
          bankName,
          accountNumber,
          iban,
          accountHolderName,
          commercialRegister: documents?.commercialRegister,
          taxCard: documents?.taxCard,
          nationalId: documents?.nationalId,
          businessLicense: documents?.businessLicense,
          isApproved: false,
          commissionRate: businessType === 'factory' ? 10 : 15, // نسبة العمولة
        }
      })
    }

    // يمكن إضافة إشعار للأدمن هنا
    // TODO: Send notification to admin for approval

    return NextResponse.json({
      message: 'تم إرسال طلبك بنجاح! سيتم مراجعته والموافقة عليه خلال 24-48 ساعة',
      userId: user.id,
    })
  } catch (error: any) {
    console.error('Partner registration error:', error)
    return NextResponse.json(
      { error: error.message || 'فشل التسجيل' },
      { status: 500 }
    )
  }
}
