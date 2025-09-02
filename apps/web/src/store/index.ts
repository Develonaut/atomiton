import { create } from "zustand";

type StoreProps = {
  isAnimationSettings: boolean;
  openAnimationSettings: () => void;
  closeAnimationSettings: () => void;
  isResizeImage: boolean;
  openResizeImage: () => void;
  closeResizeImage: () => void;
  isVisibleComments: boolean;
  openComments: () => void;
  closeComments: () => void;
};

const useStore = create<StoreProps>((set) => ({
  isAnimationSettings: false,
  openAnimationSettings: () => set({ isAnimationSettings: true }),
  closeAnimationSettings: () => set({ isAnimationSettings: false }),
  isResizeImage: false,
  openResizeImage: () => set({ isResizeImage: true }),
  closeResizeImage: () => set({ isResizeImage: false }),
  isVisibleComments: false,
  openComments: () => set({ isVisibleComments: true }),
  closeComments: () => set({ isVisibleComments: false }),
}));

export default useStore;
