interface Props {
  cartTotal: number;
  freeShippingThreshold: number;
  freeShipping: boolean;
}

export function FreeShippingProgress({ cartTotal, freeShippingThreshold, freeShipping }: Props) {
  if (freeShipping) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 flex items-center gap-2">
        <span className="text-green-600 font-bold text-sm">✓</span>
        <span className="text-sm text-green-700 font-medium">Ücretsiz kargo kazandınız!</span>
      </div>
    );
  }

  const remaining = Math.max(0, freeShippingThreshold - cartTotal);
  const pct = Math.min(100, (cartTotal / freeShippingThreshold) * 100);

  if (remaining <= 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-600">
        Ücretsiz kargo için{" "}
        <span className="font-bold text-gray-900">{remaining.toFixed(0)} ₺</span> daha harca
      </p>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-honey rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
