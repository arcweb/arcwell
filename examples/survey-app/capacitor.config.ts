import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: process.env['CAPACITOR_APP_ID'] || 'io.ionic.starter',
  appName: process.env['CAPACITOR_APP_NAME'] || 'starter-app',
  webDir: 'www',
  plugins: {
    Keyboard: {
      resize: KeyboardResize.Body,
      style: KeyboardStyle.Dark,
      resizeOnFullScreen: true
    },
    SplashScreen: {
      backgroundColor: '#016aff',
      splashFullScreen: true,
      splashImmersive: true,
      launchAutoHide: false,
    },
  }
};

export default config;
