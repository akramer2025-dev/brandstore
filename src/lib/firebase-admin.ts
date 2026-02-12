// Firebase Admin SDK للإرسال من السيرفر
import * as admin from 'firebase-admin';

// تهيئة Firebase Admin (مرة واحدة فقط)
if (!admin.apps.length) {
  try {
    // من Firebase Console -> Project Settings -> Service Accounts
    // -> Generate new private key
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });

    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.error('❌ خطأ في تهيئة Firebase Admin:', error);
  }
}

export const messaging = admin.messaging();
export default admin;
