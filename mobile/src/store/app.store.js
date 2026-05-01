import { create } from 'zustand';

export const useAppStore = create((set) => ({
  // Loading states
  isLoading: false,
  setLoading:(val) => set({ isLoading: val }),

  // Toast / snackbar
  toast:        null,
  showToast:    (message, type = 'success') => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 3000);
  },
  hideToast:    () => set({ toast: null }),

  // Selected patient (for context)
  selectedPatient: null,
  setSelectedPatient: (patient) => set({ selectedPatient: patient }),

  // Selected doctor
  selectedDoctor: null,
  setSelectedDoctor: (doctor) => set({ selectedDoctor: doctor }),

  // Doctors list cache
  doctors: [],
  setDoctors: (doctors) => set({ doctors }),
}));