import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { RequiredConsents } from '../../models';

interface AuthPromptState {
  recentLogout: boolean;
  setRecentLogout: (recentLogout: boolean) => void;
  requiredConsents: RequiredConsents | undefined;
  setRequiredConsents: (requiredConsents: RequiredConsents | undefined) => void;
}

const AUTH_PROMPT_STORAGE_KEY = 'auth-prompt';

export const useAuthPrompt = create<AuthPromptState>()(
  persist(
    (set) => ({
      recentLogout: false,
      setRecentLogout: (recentLogout) => set((prev) => ({ ...prev, recentLogout })),
      requiredConsents: undefined,
      setRequiredConsents: (requiredConsents) => set((prev) => ({ ...prev, requiredConsents })),
    }),
    {
      name: AUTH_PROMPT_STORAGE_KEY,
      partialize: (state) => ({
        requiredConsents: state.requiredConsents,
      }),
    },
  ),
);
