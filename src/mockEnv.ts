import { emitEvent, isTMA, mockTelegramEnv } from '@tma.js/sdk-react';

/**
 * Mock environment for both dev and production when not in Telegram
 * This allows the app to run in regular browsers (like Vercel deployment)
 * This function must be called and awaited before initializing the SDK
 */
export async function setupMockEnvironment(): Promise<void> {
  try {
    const isInTelegram = await isTMA('complete');
    if (!isInTelegram) {
      const themeParams = {
        accent_text_color: '#6ab2f2',
        bg_color: '#F8F9FA',
        button_color: '#4A90E2',
        button_text_color: '#ffffff',
        destructive_text_color: '#ec3942',
        header_bg_color: '#FFFFFF',
        hint_color: '#999999',
        link_color: '#4A90E2',
        secondary_bg_color: '#F8F9FA',
        section_bg_color: '#FFFFFF',
        section_header_text_color: '#1A1A1A',
        subtitle_text_color: '#999999',
        text_color: '#1A1A1A',
      } as const;
      const noInsets = { left: 0, top: 0, bottom: 0, right: 0 } as const;

      mockTelegramEnv({
        onEvent(e) {
          if (e.name === 'web_app_request_theme') {
            return emitEvent('theme_changed', { theme_params: themeParams });
          }
          if (e.name === 'web_app_request_viewport') {
            return emitEvent('viewport_changed', {
              height: window.innerHeight,
              width: window.innerWidth,
              is_expanded: true,
              is_state_stable: true,
            });
          }
          if (e.name === 'web_app_request_content_safe_area') {
            return emitEvent('content_safe_area_changed', noInsets);
          }
          if (e.name === 'web_app_request_safe_area') {
            return emitEvent('safe_area_changed', noInsets);
          }
        },
        launchParams: new URLSearchParams([
          ['tgWebAppThemeParams', JSON.stringify(themeParams)],
          ['tgWebAppData', new URLSearchParams([
            ['auth_date', (new Date().getTime() / 1000 | 0).toString()],
            ['hash', 'some-hash'],
            ['signature', 'some-signature'],
            ['user', JSON.stringify({ id: 1, first_name: 'User' })],
          ]).toString()],
          ['tgWebAppVersion', '8.4'],
          ['tgWebAppPlatform', 'web'],
        ]),
      });

      if (import.meta.env.DEV) {
        console.info(
          '⚠️ Running outside Telegram, using mock environment. This is normal for development and Vercel deployment.',
        );
      }
    }
  } catch (e) {
    // If isTMA check fails, assume we're not in Telegram and mock anyway
    console.log('Telegram environment check failed, using mock environment');
    
    // Still try to mock even if check failed
    const themeParams = {
      accent_text_color: '#6ab2f2',
      bg_color: '#F8F9FA',
      button_color: '#4A90E2',
      button_text_color: '#ffffff',
      destructive_text_color: '#ec3942',
      header_bg_color: '#FFFFFF',
      hint_color: '#999999',
      link_color: '#4A90E2',
      secondary_bg_color: '#F8F9FA',
      section_bg_color: '#FFFFFF',
      section_header_text_color: '#1A1A1A',
      subtitle_text_color: '#999999',
      text_color: '#1A1A1A',
    } as const;
    const noInsets = { left: 0, top: 0, bottom: 0, right: 0 } as const;

    try {
      mockTelegramEnv({
        onEvent(e) {
          if (e.name === 'web_app_request_theme') {
            return emitEvent('theme_changed', { theme_params: themeParams });
          }
          if (e.name === 'web_app_request_viewport') {
            return emitEvent('viewport_changed', {
              height: window.innerHeight,
              width: window.innerWidth,
              is_expanded: true,
              is_state_stable: true,
            });
          }
          if (e.name === 'web_app_request_content_safe_area') {
            return emitEvent('content_safe_area_changed', noInsets);
          }
          if (e.name === 'web_app_request_safe_area') {
            return emitEvent('safe_area_changed', noInsets);
          }
        },
        launchParams: new URLSearchParams([
          ['tgWebAppThemeParams', JSON.stringify(themeParams)],
          ['tgWebAppData', new URLSearchParams([
            ['auth_date', (new Date().getTime() / 1000 | 0).toString()],
            ['hash', 'some-hash'],
            ['signature', 'some-signature'],
            ['user', JSON.stringify({ id: 1, first_name: 'User' })],
          ]).toString()],
          ['tgWebAppVersion', '8.4'],
          ['tgWebAppPlatform', 'web'],
        ]),
      });
    } catch (mockError) {
      console.error('Failed to mock Telegram environment:', mockError);
    }
  }
}
