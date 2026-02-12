import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.remostore.app',
  appName: 'Remo Store',
  webDir: 'www',
  server: {
    // للتطوير: التطبيق يحمّل من الجهاز المحلي
    url: 'http://192.168.3.17:3002',
    cleartext: true,
    androidScheme: 'http'
  },
  android: {
    buildOptions: {
      releaseType: 'APK'
    }
  }
};

export default config;
