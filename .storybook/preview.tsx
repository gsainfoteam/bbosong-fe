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
    viewport: {
      options: {
        phone: {
          name: 'Phone 390×844',
          styles: { width: '390px', height: '844px' },
          type: 'mobile',
        },
      },
    },
    options: {
      storySort: {
        order: ['Common', 'Auth', ['Screens', '*'], 'User', ['Screens', '*'], 'Admin'],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
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
    (Story) => (
      <RouterContextProvider router={router}>
        <div className="text-ink mx-auto w-full max-w-100">
          <Story />
        </div>
      </RouterContextProvider>
    ),
  ],
};

export default preview;
