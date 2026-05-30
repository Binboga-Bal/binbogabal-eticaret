import * as React from "react";

interface DiscountedProduct {
  name: string;
  oldPrice: number;
  newPrice: number;
  productUrl: string;
}

interface Props {
  name: string;
  products: DiscountedProduct[];
}

export function FavoriteDiscountTemplate({ name, products }: Props) {
  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 600, margin: "0 auto" }}>
      <div style={{ background: "#F9B10B", padding: "24px 32px" }}>
        <h1 style={{ margin: 0, color: "#fff", fontSize: 24 }}>Binboğa Kooperatif Balı</h1>
      </div>
      <div style={{ padding: "32px", background: "#fff" }}>
        <h2 style={{ color: "#1a1a1a" }}>Favori Ürününüzde İndirim!</h2>
        <p style={{ color: "#555" }}>Merhaba {name}, favorilediğiniz ürünlerde indirim var:</p>
        {products.map((p, i) => (
          <div key={i} style={{ border: "1px solid #f0f0f0", borderRadius: 8, padding: "16px", margin: "12px 0" }}>
            <p style={{ margin: "0 0 8px", fontWeight: "bold", color: "#1a1a1a" }}>{p.name}</p>
            <p style={{ margin: 0, fontSize: 14 }}>
              <span style={{ textDecoration: "line-through", color: "#999", marginRight: 8 }}>{p.oldPrice.toFixed(2)} ₺</span>
              <span style={{ color: "#38a169", fontWeight: "bold", fontSize: 16 }}>{p.newPrice.toFixed(2)} ₺</span>
            </p>
            <a href={p.productUrl} style={{ display: "inline-block", marginTop: 10, color: "#F9B10B", fontWeight: "bold", textDecoration: "none" }}>
              Ürünü İncele →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
