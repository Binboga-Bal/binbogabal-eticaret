import * as React from "react";

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: "Onaylandı",
  PROCESSING: "Hazırlanıyor",
  SHIPPED: "Kargoya Verildi",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal Edildi",
  REFUND_REQUESTED: "İade Talebi Alındı",
  REFUNDED: "İade Edildi",
};

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: "#3182ce",
  PROCESSING: "#d69e2e",
  SHIPPED: "#805ad5",
  DELIVERED: "#38a169",
  CANCELLED: "#e53e3e",
  REFUND_REQUESTED: "#dd6b20",
  REFUNDED: "#718096",
};

interface Props {
  name: string;
  orderNumber: string;
  status: string;
  cargoTrackingNo?: string;
  cargoCompany?: string;
  orderUrl: string;
}

export function OrderStatusChangedTemplate({ name, orderNumber, status, cargoTrackingNo, cargoCompany, orderUrl }: Props) {
  const label = STATUS_LABELS[status] ?? status;
  const color = STATUS_COLORS[status] ?? "#555";

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 600, margin: "0 auto" }}>
      <div style={{ background: "#F9B10B", padding: "24px 32px" }}>
        <h1 style={{ margin: 0, color: "#fff", fontSize: 24 }}>Binboğa Kooperatif Balı</h1>
      </div>
      <div style={{ padding: "32px", background: "#fff" }}>
        <h2 style={{ color: "#1a1a1a" }}>Sipariş Durumu Güncellendi</h2>
        <p style={{ color: "#555" }}>Merhaba {name}, <strong>{orderNumber}</strong> numaralı siparişinizin durumu güncellendi.</p>
        <div style={{ background: "#f8f8f8", borderRadius: 8, padding: "16px 24px", margin: "24px 0", textAlign: "center" }}>
          <span style={{ color, fontWeight: "bold", fontSize: 18 }}>{label}</span>
        </div>
        {status === "SHIPPED" && cargoTrackingNo && (
          <div style={{ background: "#f0f4ff", borderRadius: 8, padding: "16px 24px", margin: "16px 0" }}>
            <p style={{ margin: 0, color: "#555", fontSize: 14 }}>
              <strong>Kargo Firması:</strong> {cargoCompany ?? "-"}<br />
              <strong>Takip Numarası:</strong> {cargoTrackingNo}
            </p>
          </div>
        )}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <a href={orderUrl} style={{ background: "#F9B10B", color: "#fff", padding: "12px 28px", borderRadius: 8, textDecoration: "none", fontWeight: "bold" }}>
            Siparişimi Görüntüle
          </a>
        </div>
      </div>
    </div>
  );
}
