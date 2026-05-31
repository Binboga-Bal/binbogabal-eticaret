interface AppliedCampaign {
  campaignName: string;
  type: string;
  discountAmount: number;
  freeShipping: boolean;
  message: string;
}

interface Props {
  appliedCampaigns: AppliedCampaign[];
  totalDiscount: number;
  freeShipping: boolean;
  giftProducts?: { name: string; quantity: number }[];
  cashbackPoints?: number;
}

export function DiscountBreakdown({ appliedCampaigns, totalDiscount, freeShipping, giftProducts, cashbackPoints }: Props) {
  if (appliedCampaigns.length === 0 && !freeShipping) return null;

  return (
    <div className="bg-green-50 border border-green-100 rounded-xl p-4 space-y-2">
      <p className="text-xs font-bold text-green-800 uppercase tracking-wide">Uygulanan İndirimler</p>

      {appliedCampaigns.map((c, i) => (
        <div key={i} className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">{c.campaignName}</p>
            {c.message && <p className="text-xs text-green-600 mt-0.5">{c.message}</p>}
          </div>
          {c.discountAmount > 0 && (
            <span className="text-sm font-bold text-green-700 flex-shrink-0">
              -{c.discountAmount.toFixed(2)} ₺
            </span>
          )}
          {c.freeShipping && (
            <span className="text-xs font-bold text-green-700 flex-shrink-0">Ücretsiz kargo</span>
          )}
        </div>
      ))}

      {giftProducts && giftProducts.length > 0 && (
        <div className="pt-1 border-t border-green-200">
          {giftProducts.map((g, i) => (
            <p key={i} className="text-xs text-green-700">
              🎁 {g.quantity}x {g.name} hediye eklendi
            </p>
          ))}
        </div>
      )}

      {cashbackPoints !== undefined && cashbackPoints > 0 && (
        <p className="text-xs text-green-700">⭐ +{cashbackPoints} puan kazanacaksınız</p>
      )}

      {totalDiscount > 0 && (
        <div className="pt-2 border-t border-green-200 flex justify-between">
          <span className="text-sm font-bold text-green-800">Toplam İndirim</span>
          <span className="text-sm font-bold text-green-700">-{totalDiscount.toFixed(2)} ₺</span>
        </div>
      )}
    </div>
  );
}
