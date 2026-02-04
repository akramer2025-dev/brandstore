import { NextRequest, NextResponse } from 'next/server';
// import webpush from 'web-push';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configure web-push with VAPID keys
// Generate keys: npx web-push generate-vapid-keys
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'YOUR_PUBLIC_KEY',
  privateKey: process.env.VAPID_PRIVATE_KEY || 'YOUR_PRIVATE_KEY',
};

// webpush.setVapidDetails(
//   'mailto:admin@remostore.net',
//   vapidKeys.publicKey,
//   vapidKeys.privateKey
// );

export async function POST(request: NextRequest) {
  try {
    const { subscription, userId } = await request.json();

    // Save subscription to database
    // You need to add PushSubscription model to your Prisma schema

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving subscription:', error);
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}

// Send notification to all subscribed users (helper function - not exported)
// To use: import this function from a separate utility file
// async function sendNotificationToAll(title: string, body: string, data?: any) {
//   try {
//     // Get all subscriptions from database
//     const subscriptions = await prisma.pushSubscription.findMany();
//
//     const notification = JSON.stringify({
//       title,
//       body,
//       icon: '/icon-192x192.png',
//       badge: '/icon-192x192.png',
//       data: data || {},
//     });
//
//     // Send to all subscriptions
//     for (const sub of subscriptions) {
//       await webpush.sendNotification(sub.subscription, notification);
//     }
//
//     return true;
//   } catch (error) {
//     console.error('Error sending notifications:', error);
//     return false;
//   }
// }
