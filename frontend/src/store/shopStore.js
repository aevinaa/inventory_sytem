import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useShopStore = create(
    persist(
        (set) => ({
            currentShop: null,
            setShop: (shop) => set({ currentShop: shop }),
        }),
        { name: 'shop-storage' }
    )
);

export default useShopStore;