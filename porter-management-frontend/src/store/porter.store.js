import { create } from "zustand";

export const usePorterStore = create((set) => ({
    porter: null,
    setPorter: (porter) => set({porter})
}))