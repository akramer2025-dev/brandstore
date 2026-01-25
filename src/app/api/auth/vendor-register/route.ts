import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      username,
      storeName,
      storeNameAr,
      phone,
      address,
      city,
      description,
      descriptionAr,
      bankName,
      accountNumber,
      iban,
    } = body

    // التحقق من البيانات المطلوبة
    if (!email || !password || !username || !storeName || !storeNameAr || !phone || !address || !city || !bankName || !accountNumber) {
      return NextResponse.json(
        { error: 'جميع الحقول المطلوبة مطلوبة' },
        { status: 400 }
      )
    }

    // التحقق من وجود المستخدم
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username },
        ],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني أو اسم المستخدم مستخدم بالفعل' },
        { status: 400 }
      )
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10)

    // إنشاء المستخدم والبائع في معاملة واحدة
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        role: 'VENDOR',
        vendor: {
          create: {
            storeName,
            storeNameAr,
            phone,
            address,
            city,
            description,
            descriptionAr,
            bankName,
            accountNumber,
            iban,
            isApproved: false, // يتطلب موافقة المدير
            isActive: false,
          },
        },
      },
      include: {
        vendor: true,
      },
    })

    return NextResponse.json({
      message: 'تم التسجيل بنجاح! في انتظار موافقة الإدارة',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        vendor: user.vendor,
      },
    })
  } catch (error: any) {
    console.error('Vendor registration error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء التسجيل' },
      { status: 500 }
    )
  }
}
