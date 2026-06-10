import * as React from "react";
import { EmailLayout, EmailIcon, EmailTitle, EmailBody, EmailButton } from "./email-layout";
import type { EmailTemplateContent } from "../template-content";

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
  content: EmailTemplateContent;
  appUrl: string;
}

export function OrderStatusChangedTemplate({ name, orderNumber, status, cargoTrackingNo, cargoCompany, orderUrl, content, appUrl }: Props) {
  const label = STATUS_LABELS[status] ?? status;
  const color = STATUS_COLORS[status] ?? "#555";

  return (
    <EmailLayout appUrl={appUrl}>
      <EmailIcon>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          {/* Truck */}
          <rect x="8" y="32" width="44" height="28" rx="3" />
          <path d="M52 42 L52 32 L64 32 L72 44 L72 60 L52 60" />
          {/* Wheels */}
          <circle cx="20" cy="60" r="7" />
          <circle cx="62" cy="60" r="7" />
          {/* Window */}
          <rect x="54" y="36" width="14" height="10" rx="2" />
        </svg>
      </EmailIcon>
      <EmailTitle>{content.title}</EmailTitle>
      <EmailBody>
        <strong>Merhaba {name},</strong>
        <br />
        <strong>{orderNumber}</strong> numaralı {content.body}
      </EmailBody>

      {/* Status badge */}
      <div style={{ textAlign: "center", margin: "0 0 20px" }}>
        <span
          style={{
            display: "inline-block",
            background: `${color}18`,
            color,
            border: `1.5px solid ${color}40`,
            borderRadius: 100,
            padding: "8px 24px",
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          {label}
        </span>
      </div>

      {/* Cargo info */}
      {status === "SHIPPED" && cargoTrackingNo && (
        <div
          style={{
            background: "#f8f4ff",
            border: "1px solid #d6bcfa",
            borderRadius: 8,
            padding: "14px 20px",
            margin: "0 0 20px",
            fontSize: 14,
            color: "#555",
          }}
        >
          <strong>Kargo Firması:</strong> {cargoCompany ?? "-"}
          <br />
          <strong>Takip Numarası:</strong> {cargoTrackingNo}
        </div>
      )}

      <EmailButton href={orderUrl}>{content.buttonText ?? "Siparişimi Görüntüle"}</EmailButton>
    </EmailLayout>
  );
}
