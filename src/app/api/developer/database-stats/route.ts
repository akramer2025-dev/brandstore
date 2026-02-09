import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "DEVELOPER") {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      )
    }

    // Get stats from database
    const [
      totalUsers,
      totalCustomers,
      totalVendors,
      totalProducts,
      totalOrders,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.user.count({ where: { role: "VENDOR" } }),
      prisma.product.count(),
      prisma.order.count(),
    ])

    return NextResponse.json({
      users: totalUsers,
      customers: totalCustomers,
      vendors: totalVendors,
      products: totalProducts,
      orders: totalOrders,
      revenue: 0, // Calculate if needed
    })

  } catch (error) {
    console.error("Error fetching database stats:", error)
    return NextResponse.json(
      { error: "حدث خطأ في جلب الإحصائيات" },
      { status: 500 }
    )
  }
}
