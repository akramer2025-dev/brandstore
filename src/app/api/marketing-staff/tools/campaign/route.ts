import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'MARKETING_STAFF') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()

    if (!data.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Save to database (you'll need to create this table in schema)
    // For now, just return success
    const campaign = {
      id: Date.now().toString(),
      userId: session.user.id,
      ...data,
      createdAt: new Date()
    }

    console.log('Campaign Plan saved:', campaign)

    return NextResponse.json({ 
      success: true,
      message: 'تم حفظ خطة الحملة بنجاح',
      data: campaign
    })
  } catch (error) {
    console.error('Error saving campaign plan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'MARKETING_STAFF') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch saved campaigns from database
    // For now, return empty array
    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching campaign plans:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
