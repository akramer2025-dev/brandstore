// src/app/api/vendor/store-address/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch vendor's store address
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
      select: {
        address: true,
        governorate: true,
        city: true,
        region: true,
        district: true,
        street: true,
        buildingNumber: true,
        floorNumber: true,
        apartmentNumber: true,
        landmark: true,
        postalCode: true,
        pickupInstructions: true,
      },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json(vendor);
  } catch (error: any) {
    console.error('Error fetching store address:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update vendor's store address
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    console.log('🔵 PUT /api/vendor/store-address - Start');
    console.log('📋 Session:', session?.user ? { id: session.user.id, role: session.user.role } : 'No session');

    if (!session || session.user.role !== 'VENDOR') {
      console.log('❌ Unauthorized: No session or not VENDOR role');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('📦 Request body:', body);

    const {
      address,
      governorate,
      city,
      region,
      district,
      street,
      buildingNumber,
      floorNumber,
      apartmentNumber,
      landmark,
      postalCode,
      pickupInstructions,
    } = body;

    // Validate required fields
    if (!governorate || !city || !street) {
      console.log('❌ Validation failed - Missing required fields:', { governorate, city, street });
      return NextResponse.json(
        { error: 'المحافظة والمدينة واسم الشارع مطلوبة' },
        { status: 400 }
      );
    }

    // Auto-generate full address if not provided
    let fullAddress = address;
    if (!fullAddress) {
      const parts = [];
      if (street) parts.push(street);
      if (buildingNumber) parts.push(`عمارة ${buildingNumber}`);
      if (floorNumber) parts.push(`الطابق ${floorNumber}`);
      if (apartmentNumber) parts.push(`شقة ${apartmentNumber}`);
      if (region) parts.push(region);
      if (city) parts.push(city);
      if (governorate) parts.push(governorate);
      
      fullAddress = parts.join('، ');
    }

    console.log('📍 Full address generated:', fullAddress);

    // التحقق من وجود سجل Vendor أولاً
    console.log('🔍 Checking for existing vendor with userId:', session.user.id);
    const existingVendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id }
    });

    console.log('👤 Existing vendor found?', existingVendor ? 'Yes' : 'No');

    if (!existingVendor) {
      console.log('❌ Vendor not found for userId:', session.user.id);
      return NextResponse.json(
        { error: 'لم يتم العثور على حساب البائع' },
        { status: 404 }
      );
    }

    console.log('💾 Updating vendor record...');
    const vendor = await prisma.vendor.update({
      where: { userId: session.user.id },
      data: {
        address: fullAddress,
        governorate,
        city,
        region: region || null,
        district: district || null,
        street,
        buildingNumber: buildingNumber || null,
        floorNumber: floorNumber || null,
        apartmentNumber: apartmentNumber || null,
        landmark: landmark || null,
        postalCode: postalCode || null,
        pickupInstructions: pickupInstructions || null,
        updatedAt: new Date(),
      },
    });

    console.log('✅ Vendor updated successfully');
    return NextResponse.json({
      success: true,
      message: 'تم حفظ عنوان المتجر بنجاح',
      vendor: {
        address: vendor.address,
        governorate: vendor.governorate,
        city: vendor.city,
      },
    });
  } catch (error: any) {
    console.error('❌ Error updating store address:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    return NextResponse.json(
      { error: error.message || 'حدث خطأ في حفظ العنوان' },
      { status: 500 }
    );
  }
}
