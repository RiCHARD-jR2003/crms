import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pwd.crms',
  appName: 'PWD CRMS',
  webDir: 'build',
  plugins: {
    ScreenReader: {
      // Plugin configuration options can be added here if needed
    }
  }
};

export default config;
