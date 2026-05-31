import { CountdownTimer } from "./CountdownTimer";

interface Props {
  type: string;
  label?: string;
  endsAt?: Date | string | null;
  className?: string;
}

const TYPE_STYLES: Record<string, string> = {
  FLASH_SALE: "bg-red-500 text-white",
  CART_DISCOUNT: "bg-honey text-white",
  PRODUCT_DISCOUNT: "bg-honey-dark text-white",
  BUY_X_PAY_Y: "bg-blue-600 text-white",
  FREE_SHIPPING: "bg-green-600 text-white",
  BIRTHDAY: "bg-pink-500 text-white",
  CASHBACK: "bg-teal-600 text-white",
};

const TYPE_LABELS: Record<string, string> = {
  FLASH_SALE: "Flash Sale",
  CART_DISCOUNT: "İndirim",
  PRODUCT_DISCOUNT: "İndirim",
  BUY_X_PAY_Y: "X Al Y Öde",
  FREE_SHIPPING: "Ücretsiz Kargo",
  BIRTHDAY: "Doğum Günü",
  CASHBACK: "Cashback",
};

export function CampaignBadge({ type, label, endsAt, className = "" }: Props) {
  const style = TYPE_STYLES[type] ?? "bg-gray-800 text-white";
  const text = label ?? TYPE_LABELS[type] ?? type;

  return (
    <div className={`inline-flex flex-col items-start gap-0.5 ${className}`}>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style}`}>
        {text}
      </span>
      {endsAt && type === "FLASH_SALE" && (
        <CountdownTimer endsAt={endsAt} className="text-red-600" />
      )}
    </div>
  );
}
