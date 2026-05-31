import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  size: number;
  packagingType: string;
  price: number;
  discountedPrice: number | null;
  quantity: number;
}

export interface AppliedCampaign {
  campaignId: string;
  campaignName: string;
  type: string;
  discountAmount: number;
  freeShipping: boolean;
  message: string;
}

export interface CampaignResult {
  appliedCampaigns: AppliedCampaign[];
  totalDiscount: number;
  freeShipping: boolean;
  giftProducts: { productId: string; quantity: number; name: string }[];
  cashbackPoints: number;
  messages: string[];
}

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  couponDiscount: number;
  campaignResult: CampaignResult | null;

  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  setCampaignResult: (result: CampaignResult | null) => void;

  subtotal: () => number;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      couponDiscount: 0,
      campaignResult: null,

      addItem: (newItem) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === newItem.variantId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === newItem.variantId
                  ? { ...i, quantity: i.quantity + newItem.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, newItem] };
        }),

      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
          campaignResult: null,
        })),

      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.variantId !== variantId)
              : state.items.map((i) =>
                  i.variantId === variantId ? { ...i, quantity } : i
                ),
          campaignResult: null,
        })),

      clearCart: () => set({ items: [], couponCode: null, couponDiscount: 0, campaignResult: null }),

      applyCoupon: (code, discount) =>
        set({ couponCode: code, couponDiscount: discount, campaignResult: null }),

      removeCoupon: () => set({ couponCode: null, couponDiscount: 0, campaignResult: null }),

      setCampaignResult: (result) => set({ campaignResult: result }),

      subtotal: () =>
        get().items.reduce((sum, item) => {
          const price = item.discountedPrice ?? item.price;
          return sum + price * item.quantity;
        }, 0),

      total: () => {
        const state = get();
        const sub = state.subtotal();
        // Kampanya motoru sonucu varsa onu kullan, yoksa eski couponDiscount'a geri dön
        const discount = state.campaignResult
          ? state.campaignResult.totalDiscount
          : state.couponDiscount;
        return Math.max(0, sub - discount);
      },

      itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "binbogabal-cart",
      version: 1,
    }
  )
);
