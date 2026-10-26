import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../api/auth";

import { queryClient } from "../lib/queryClient";

interface AuthState {
  token: string | null;
  user: User | null;

  setAuth: (token: string, user: User) => void;

  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,

      setAuth: (token, user) =>
        set({
          token,
          user,
        }),

      logout: () => {
        try {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_type');
          localStorage.removeItem('auth-storage');
          sessionStorage.clear();
          queryClient.clear();
        } catch (e) {
          console.warn('Storage cleanup error:', e);
        }
        set({
          token: null,
          user: null,
        });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);