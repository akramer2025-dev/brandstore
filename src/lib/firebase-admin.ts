// Firebase Admin SDK للإرسال من السيرفر
import * as admin from 'firebase-admin';

// تهيئة Firebase Admin (مرة واحدة فقط)
let isInitialized = false;

if (!admin.apps.length) {
  try {
    // من Firebase Console -> Project Settings -> Service Accounts
    // -> Generate new private key
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    // فقط إذا كانت كل الـ credentials موجودة
    if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });

      isInitialized = true;
      console.log('✅ Firebase Admin initialized');
    } else {
      console.warn('⚠️ Firebase credentials not found - Push notifications disabled');
    }
  } catch (error) {
    console.error('❌ خطأ في تهيئة Firebase Admin:', error);
  }
}

// Export messaging only if initialized
export const messaging = isInitialized ? admin.messaging() : null;
export const isFirebaseInitialized = isInitialized;
export default admin;
