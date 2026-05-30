import * as React from "react";

interface Props {
  name: string;
  shopUrl: string;
}

export function WelcomeTemplate({ name, shopUrl }: Props) {
  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 600, margin: "0 auto" }}>
      <div style={{ background: "#F9B10B", padding: "24px 32px" }}>
        <h1 style={{ margin: 0, color: "#fff", fontSize: 24 }}>Binboğa Kooperatif Balı</h1>
      </div>
      <div style={{ padding: "32px", background: "#fff" }}>
        <h2 style={{ color: "#1a1a1a" }}>Hoş geldiniz, {name}! 🍯</h2>
        <p style={{ color: "#555", lineHeight: 1.6 }}>
          Binboğa ailesine katıldığınız için teşekkür ederiz. Doğal ve saf bal ürünlerimizi keşfetmek için mağazamızı ziyaret edin.
        </p>
        <div style={{ textAlign: "center", margin: "32px 0" }}>
          <a
            href={shopUrl}
            style={{
              background: "#F9B10B",
              color: "#fff",
              padding: "14px 32px",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: 16,
            }}
          >
            Ürünleri Keşfet
          </a>
        </div>
      </div>
    </div>
  );
}
