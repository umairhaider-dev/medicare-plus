import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export const useAuthStore = create((set, get) => ({
  token:     null,
  user:      null,
  clinic:    null,
  doctor:    null,
  isLoading: true,

  init: async () => {
    try {
      const token  = await SecureStore.getItemAsync('token');
      const user   = await SecureStore.getItemAsync('user');
      const clinic = await SecureStore.getItemAsync('clinic');

      if (token && user) {
        let parsedUser   = null;
        let parsedClinic = null;

        try { parsedUser   = JSON.parse(user);   } catch (_) {}
        try { parsedClinic = JSON.parse(clinic);  } catch (_) {}

        set({
          token,
          user:      parsedUser,
          clinic:    parsedClinic,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.log('Auth init error:', err.message);
      set({ isLoading: false });
    }
  },

  login: async (token, user, clinic, doctor) => {
    try {
      await SecureStore.setItemAsync('token',  String(token));
      await SecureStore.setItemAsync('user',   JSON.stringify(user));
      await SecureStore.setItemAsync('clinic', JSON.stringify(clinic || {}));
    } catch (err) {
      console.log('SecureStore save error:', err.message);
    }
    set({ token, user, clinic, doctor });
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
      await SecureStore.deleteItemAsync('clinic');
    } catch (err) {
      console.log('SecureStore delete error:', err.message);
    }
    set({ token: null, user: null, clinic: null, doctor: null });
  },

  updateUser: (user) => set({ user }),
}));