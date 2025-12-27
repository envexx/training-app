// Include Telegram UI styles first to allow our code override the package CSS.
import '@telegram-apps/telegram-ui/dist/styles.css';

import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { retrieveLaunchParams } from '@tma.js/sdk-react';

import { Root } from '@/components/Root.tsx';
import { init } from '@/init.ts';
import { setupMockEnvironment } from '@/mockEnv.ts';

import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);

// Initialize app
(async () => {
  try {
    // Step 1: Setup mock environment FIRST (before any SDK calls)
    // This must be done before retrieveLaunchParams() or init()
    await setupMockEnvironment();

    // Step 2: Try to retrieve launch params (may fail if not in Telegram)
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

    // Step 3: Initialize SDK (after mock environment is set up)
    await init({
      debug,
      eruda: debug && ['ios', 'android'].includes(platform),
      mockForMacOS: platform === 'macos' || platform === 'web',
    });

    // Step 4: Render app (after SDK is initialized)
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
