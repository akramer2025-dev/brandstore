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

    const { title, strengths, weaknesses, opportunities, threats, strategies } = await req.json()

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Save to database (you'll need to create this table in schema)
    // For now, just return success
    const analysis = {
      id: Date.now().toString(),
      userId: session.user.id,
      title,
      strengths,
      weaknesses,
      opportunities,
      threats,
      strategies,
      createdAt: new Date()
    }

    console.log('SWOT Analysis saved:', analysis)

    return NextResponse.json({ 
      success: true,
      message: 'تم حفظ التحليل بنجاح',
      data: analysis
    })
  } catch (error) {
    console.error('Error saving SWOT analysis:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'MARKETING_STAFF') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch saved analyses from database
    // For now, return empty array
    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching SWOT analyses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
