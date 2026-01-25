import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      type,
      amount,
      paymentMethod,
      recipientName,
      payerName,
      category,
      reference,
      description,
    } = body;

    if (!type || !amount || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate voucher number
    const count = await prisma.paymentVoucher.count();
    const voucherNumber = `${type === "RECEIPT" ? "REC" : "PAY"}-${String(count + 1).padStart(6, "0")}`;

    const voucher = await prisma.paymentVoucher.create({
      data: {
        voucherNumber,
        type,
        amount,
        paymentMethod,
        recipientName,
        payerName,
        category,
        reference,
        description,
        status: "PAID",
        paidBy: session.user.id,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json(voucher);
  } catch (error) {
    console.error("Error creating voucher:", error);
    return NextResponse.json({ error: "Failed to create voucher" }, { status: 500 });
  }
}
