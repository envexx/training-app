// Include Telegram UI styles first to allow our code override the package CSS.
import '@telegram-apps/telegram-ui/dist/styles.css';

import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { retrieveLaunchParams } from '@tma.js/sdk-react';

import { Root } from '@/components/Root.tsx';
import { EnvUnsupported } from '@/components/EnvUnsupported.tsx';
import { init } from '@/init.ts';

import './index.css';

// Mock the environment in case, we are outside Telegram.
import './mockEnv.ts';

const root = ReactDOM.createRoot(document.getElementById('root')!);

// Initialize app
(async () => {
  try {
    let launchParams;
    let platform = 'web';
    let debug = import.meta.env.DEV;

    try {
      launchParams = retrieveLaunchParams();
      platform = launchParams.tgWebAppPlatform || 'web';
      debug = (launchParams.tgWebAppStartParam || '').includes('debug') || import.meta.env.DEV;
    } catch (e) {
      // Not in Telegram environment, use defaults
      console.log('Running outside Telegram, using mock environment');
      platform = 'web';
      debug = import.meta.env.DEV;
    }

    // Configure all application dependencies.
    await init({
      debug,
      eruda: debug && ['ios', 'android'].includes(platform),
      mockForMacOS: platform === 'macos' || platform === 'web',
    });

    root.render(
      <StrictMode>
        <Root/>
      </StrictMode>
    );
  } catch (e) {
    console.error('Initialization error:', e);
    // Even if init fails, try to render the app
    root.render(
      <StrictMode>
        <Root/>
      </StrictMode>
    );
  }
})();
