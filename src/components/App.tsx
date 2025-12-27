import { Navigate, Route, Routes, HashRouter } from 'react-router-dom';
import { useLaunchParams, useSignal, miniApp } from '@tma.js/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';

import { routes } from '@/navigation/routes.tsx';

export function App() {
  // These hooks require SDK to be initialized first
  // The SDK is initialized in index.tsx before this component is rendered
  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);

  const platform = ['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base';

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={platform}
    >
      <HashRouter>
        <Routes>
          {routes.map((route) => <Route key={route.path} {...route} />)}
          <Route path="*" element={<Navigate to="/"/>}/>
        </Routes>
      </HashRouter>
    </AppRoot>
  );
}
