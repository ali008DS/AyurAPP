import create from 'zustand';
import { fetchColors } from '../api/fetchColors';
import { Color } from '../types/color';

interface ColorStore {
  colors: Color[];
  fetchAndSetColors: () => Promise<void>;
}

const useColorStore = create<ColorStore>((set) => ({
  colors: [],
  fetchAndSetColors: async () => {
    const colors = await fetchColors();
    set({ colors });
  },
}));

export default useColorStore;