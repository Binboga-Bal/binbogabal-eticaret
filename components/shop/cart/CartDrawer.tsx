"use client";

import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice, formatWeight } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, subtotal } = useCartStore();

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />

        {/* Drawer */}
        <div className="relative w-full max-w-sm bg-white h-full flex flex-col shadow-2xl z-10">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h2 className="font-bold text-lg text-gray-800">Sepetim ({items.length})</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={22} />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <ShoppingBag size={48} className="mb-3 text-gray-300" />
                <p className="font-medium">Sepetiniz boş</p>
                <p className="text-sm mt-1">Ürün ekleyerek alışverişe başlayın</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.variantId} className="flex gap-3">
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
                    <Image
                      src={item.productImage || "/placeholder.jpg"}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.productName}</p>
                    <p className="text-xs text-gray-500">{formatWeight(item.size)}</p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-honey-dark">
                          {formatPrice((item.discountedPrice ?? item.price) * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t px-5 py-4 space-y-3">
              <div className="flex justify-between text-base font-bold">
                <span>Toplam</span>
                <span className="text-honey-dark">{formatPrice(subtotal())}</span>
              </div>
              <p className="text-xs text-gray-500">KDV dahil. Kargo ücreti ödeme adımında hesaplanır.</p>
              <Link href="/odeme" onClick={onClose}>
                <Button className="w-full" size="lg">
                  Siparişi Tamamla
                </Button>
              </Link>
              <Link href="/sepet" onClick={onClose}>
                <Button variant="outline" className="w-full mt-2">
                  Sepeti Görüntüle
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
