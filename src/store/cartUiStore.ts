import { create } from "zustand"

interface CartUiState {
  count: number
  badgePulseKey: number
  addOne: () => void
}

export const useCartUiStore = create<CartUiState>((set) => ({
  count: 0,
  badgePulseKey: 0,
  addOne: () =>
    set((state) => ({
      count: state.count + 1,
      badgePulseKey: state.badgePulseKey + 1,
    })),
}))
