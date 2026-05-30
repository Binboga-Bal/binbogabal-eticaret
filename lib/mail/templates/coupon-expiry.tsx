import * as React from "react";

interface Props {
  name: string;
  couponCode: string;
  discountLabel: string;
  expiresAt: string;
  daysLeft: number;
  shopUrl: string;
}

export function CouponExpiryTemplate({ name, couponCode, discountLabel, expiresAt, daysLeft, shopUrl }: Props) {
  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 600, margin: "0 auto" }}>
      <div style={{ background: "#F9B10B", padding: "24px 32px" }}>
        <h1 style={{ margin: 0, color: "#fff", fontSize: 24 }}>Binboğa Kooperatif Balı</h1>
      </div>
      <div style={{ padding: "32px", background: "#fff" }}>
        <h2 style={{ color: "#e53e3e" }}>Kuponunuzun Süresi Dolmak Üzere!</h2>
        <p style={{ color: "#555" }}>Merhaba {name}, <strong>{daysLeft} gün</strong> içinde süresi dolacak bir kuponunuz var.</p>
        <div style={{ background: "#FFF8E7", border: "2px dashed #F9B10B", borderRadius: 8, padding: "20px", textAlign: "center", margin: "24px 0" }}>
          <p style={{ margin: "0 0 8px", fontSize: 13, color: "#888" }}>Kupon Kodu</p>
          <p style={{ margin: "0 0 8px", fontSize: 28, fontWeight: "bold", letterSpacing: 4, color: "#C57930" }}>{couponCode}</p>
          <p style={{ margin: "0 0 4px", fontSize: 16, color: "#1a1a1a" }}>{discountLabel}</p>
          <p style={{ margin: 0, fontSize: 13, color: "#e53e3e" }}>Son kullanım: {expiresAt}</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <a href={shopUrl} style={{ background: "#F9B10B", color: "#fff", padding: "12px 28px", borderRadius: 8, textDecoration: "none", fontWeight: "bold" }}>
            Hemen Kullan
          </a>
        </div>
      </div>
    </div>
  );
}
