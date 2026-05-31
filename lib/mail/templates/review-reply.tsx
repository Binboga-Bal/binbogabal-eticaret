import * as React from "react";

interface Props {
  name: string;
  productName: string;
  reviewComment: string;
  adminReply: string;
  reviewUrl: string;
}

export function ReviewReplyTemplate({ name, productName, reviewComment, adminReply, reviewUrl }: Props) {
  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 600, margin: "0 auto" }}>
      <div style={{ background: "#F9B10B", padding: "24px 32px" }}>
        <h1 style={{ margin: 0, color: "#fff", fontSize: 24 }}>Binboğa Kooperatif Balı</h1>
      </div>
      <div style={{ padding: "32px", background: "#fff" }}>
        <h2 style={{ color: "#1a1a1a", marginTop: 0 }}>Yorumunuza Yanıt Geldi!</h2>
        <p style={{ color: "#555" }}>
          Merhaba {name}, <strong>{productName}</strong> ürününe yazdığınız yoruma yanıt verildi.
        </p>

        <div style={{ background: "#f9f9f9", borderLeft: "4px solid #ddd", borderRadius: 4, padding: "12px 16px", margin: "16px 0" }}>
          <p style={{ margin: 0, fontSize: 13, color: "#888", marginBottom: 6 }}>Yorumunuz:</p>
          <p style={{ margin: 0, color: "#555", fontStyle: "italic" }}>{reviewComment}</p>
        </div>

        <div style={{ background: "#FFF8E7", borderLeft: "4px solid #F9B10B", borderRadius: 4, padding: "12px 16px", margin: "16px 0" }}>
          <p style={{ margin: 0, fontSize: 13, color: "#C57930", fontWeight: "bold", marginBottom: 6 }}>Satıcı Yanıtı:</p>
          <p style={{ margin: 0, color: "#333" }}>{adminReply}</p>
        </div>

        <div style={{ marginTop: 24 }}>
          <a
            href={reviewUrl}
            style={{ background: "#F9B10B", color: "#fff", padding: "12px 24px", borderRadius: 8, textDecoration: "none", fontWeight: "bold", fontSize: 14 }}
          >
            Ürünü Görüntüle
          </a>
        </div>
      </div>
      <div style={{ background: "#f5f5f5", padding: "16px 32px", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 12, color: "#999" }}>Binboğa Kooperatif Balı — Doğal ve Saf Bal</p>
      </div>
    </div>
  );
}
