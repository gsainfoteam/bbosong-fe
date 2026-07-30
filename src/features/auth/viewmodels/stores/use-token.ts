import { create } from 'zustand';

interface TokenState {
  token: string | null;
  idpToken: string | null;
  saveToken: (token: string | null) => void;
  saveIdpToken: (idpToken: string | null) => void;
}

export const useToken = create<TokenState>((set) => ({
  token: null,
  idpToken: null,
  saveToken: (token) => set((state) => ({ ...state, token })),
  saveIdpToken: (idpToken) => set((state) => ({ ...state, idpToken })),
}));
