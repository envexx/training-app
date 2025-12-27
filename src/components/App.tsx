import { Navigate, Route, Routes, HashRouter } from 'react-router-dom';
import { useLaunchParams, useSignal, miniApp } from '@tma.js/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';

import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { routes } from '@/navigation/routes.tsx';

export function App() {
  // These hooks require SDK to be initialized first
  // The SDK is initialized in index.tsx before this component is rendered
  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);

  const platform = ['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base';

  return (
    <AuthProvider>
      <AppRoot
        appearance={isDark ? 'dark' : 'light'}
        platform={platform}
      >
        <HashRouter>
          <Routes>
            {routes.map((route) => {
              const Component = route.Component;
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    route.requiresAuth === false ? (
                      <Component />
                    ) : (
                      <ProtectedRoute>
                        <Component />
                      </ProtectedRoute>
                    )
                  }
                />
              );
            })}
            <Route path="*" element={<Navigate to="/"/>}/>
          </Routes>
        </HashRouter>
      </AppRoot>
    </AuthProvider>
  );
}
