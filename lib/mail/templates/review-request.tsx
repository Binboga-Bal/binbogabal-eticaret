import * as React from "react";

interface OrderItem {
  productName: string;
  variantInfo: string;
  reviewUrl: string;
}

interface Props {
  name: string;
  orderNumber: string;
  items: OrderItem[];
}

export function ReviewRequestTemplate({ name, orderNumber, items }: Props) {
  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 600, margin: "0 auto" }}>
      <div style={{ background: "#F9B10B", padding: "24px 32px" }}>
        <h1 style={{ margin: 0, color: "#fff", fontSize: 24 }}>Binboğa Kooperatif Balı</h1>
      </div>
      <div style={{ padding: "32px", background: "#fff" }}>
        <h2 style={{ color: "#1a1a1a" }}>Ürünlerimizi Değerlendirin!</h2>
        <p style={{ color: "#555" }}>
          Merhaba {name}, <strong>{orderNumber}</strong> siparişinizdeki ürünleri aldığınız için teşekkür ederiz.
          Deneyiminizi paylaşarak diğer müşterilere yardımcı olun.
        </p>
        {items.map((item, i) => (
          <div key={i} style={{ border: "1px solid #f0f0f0", borderRadius: 8, padding: "16px", margin: "12px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: "0 0 4px", fontWeight: "bold", color: "#1a1a1a" }}>{item.productName}</p>
              <p style={{ margin: 0, fontSize: 13, color: "#999" }}>{item.variantInfo}</p>
            </div>
            <a href={item.reviewUrl} style={{ background: "#F9B10B", color: "#fff", padding: "8px 18px", borderRadius: 6, textDecoration: "none", fontWeight: "bold", fontSize: 13, whiteSpace: "nowrap" }}>
              Yorum Yaz
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
