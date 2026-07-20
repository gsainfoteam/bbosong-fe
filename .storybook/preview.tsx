import { withThemeByDataAttribute } from '@storybook/addon-themes';

import type { Preview } from '@storybook/react-vite';
import { RouterContextProvider } from '@tanstack/react-router';
import { router } from '@/router.ts';

import { withLocale } from './decorators';

import '../src/styles.css';

const preview: Preview = {
  globalTypes: {
    locale: {
      description: 'i18n locale',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'ko', title: '한국어' },
          { value: 'en', title: 'English' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    locale: 'ko',
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'navy', // 스토리북 실행 시 기본으로 선택될 배경 이름
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1e293b' },
        { name: 'navy', value: '#0b0742' }, // 우리 프로젝트의 어두운 배경색 추가
      ],
    },
  },
  decorators: [
    withThemeByDataAttribute({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
    withLocale,
    (Story, context) => {
      const theme = context.globals.theme ?? 'light';
      const bgColor = theme === 'dark' ? '#0b0742' : '#ffffff';
      const textColor = theme === 'dark' ? '#ffffff' : '#1a1a1a';
      return (
        <RouterContextProvider router={router}>
          <div style={{ backgroundColor: bgColor, color: textColor, minHeight: '100vh', padding: '24px', transition: 'background-color 0.2s' }}>
            <div className="mx-auto w-full max-w-100">
              <Story />
            </div>
          </div>
        </RouterContextProvider>
      );
    },
  ],
};

export default preview;
