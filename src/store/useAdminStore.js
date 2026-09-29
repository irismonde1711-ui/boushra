import { create } from "zustand";

export const useAdminStore = create((set) => ({
  user: null,
  authLoading: true,
  setUser: (user) => set({ user, authLoading: false }),
}));
