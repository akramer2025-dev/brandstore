import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.remostore.app',
  appName: 'Remo Store',
  webDir: 'public',
  server: {
    // التطبيق هيتصل بالسيرفر الحقيقي - آمن ومافيش تأثير على الكود
    url: 'https://www.remostore.net',
    cleartext: true
  },
  android: {
    buildOptions: {
      releaseType: 'APK'
    }
  }
};

export default config;
