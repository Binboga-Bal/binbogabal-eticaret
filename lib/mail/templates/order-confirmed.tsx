import * as React from "react";
import { EmailLayout, EmailIcon, EmailTitle, EmailBody, EmailButton, EmailDivider, HONEY } from "./email-layout";
import type { EmailTemplateContent } from "../template-content";

interface OrderItem {
  productName: string;
  variantInfo: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

interface Props {
  name: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  orderUrl: string;
  content: EmailTemplateContent;
  appUrl: string;
}

export function OrderConfirmedTemplate({ name, orderNumber, items, total, orderUrl, content, appUrl }: Props) {
  return (
    <EmailLayout appUrl={appUrl}>
      <EmailIcon>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          {/* Shopping bag */}
          <path d="M22 26 L16 68 L64 68 L58 26 Z" />
          <path d="M30 26 Q30 14 40 14 Q50 14 50 26" />
          {/* Checkmark */}
          <polyline points="30,46 38,54 54,36" strokeWidth="3" />
        </svg>
      </EmailIcon>
      <EmailTitle>{content.title}</EmailTitle>
      <EmailBody>
        <strong>Merhaba {name},</strong>
        <br />
        <strong>{orderNumber}</strong> numaralı {content.body}
      </EmailBody>

      <EmailDivider />

      {/* Sipariş kalemleri */}
      <table width="100%" cellPadding={0} cellSpacing={0} border={0} role="presentation" style={{ borderCollapse: "collapse", marginBottom: "16px" }}>
        <thead>
          <tr style={{ backgroundColor: "#FFF8E7" }}>
            <th colSpan={2} style={{ padding: "8px 12px", textAlign: "left" as const, fontSize: "12px", color: "#888", fontWeight: 600 }}>Ürün</th>
            <th style={{ padding: "8px 12px", textAlign: "right" as const, fontSize: "12px", color: "#888", fontWeight: 600 }}>Adet</th>
            <th style={{ padding: "8px 12px", textAlign: "right" as const, fontSize: "12px", color: "#888", fontWeight: 600 }}>Tutar</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #f5f5f5" }}>
              {/* Küçük ürün fotoğrafı */}
              <td style={{ padding: "10px 6px 10px 12px", width: "68px", verticalAlign: "middle" }}>
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    width={56}
                    height={56}
                    style={{ display: "block", width: "56px", height: "56px", border: "1px solid #eeeeee", borderRadius: "6px", backgroundColor: "#f9f9f9" }}
                  />
                ) : (
                  <table cellPadding={0} cellSpacing={0} border={0} role="presentation" style={{ width: "56px", height: "56px" }}>
                    <tbody><tr><td style={{ backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", borderRadius: "6px" }} /></tr></tbody>
                  </table>
                )}
              </td>
              {/* Ürün adı */}
              <td style={{ padding: "10px 12px 10px 6px", fontSize: "14px", color: "#333", verticalAlign: "middle" }}>
                <strong style={{ display: "block", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>{item.productName}</strong>
                {item.variantInfo && (
                  <span style={{ color: "#aaa", fontSize: "12px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>{item.variantInfo}</span>
                )}
              </td>
              <td style={{ padding: "10px 12px", textAlign: "right" as const, fontSize: "14px", color: "#555", verticalAlign: "middle", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
                {item.quantity}
              </td>
              <td style={{ padding: "10px 12px", textAlign: "right" as const, fontSize: "14px", fontWeight: 700, color: "#333", verticalAlign: "middle", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
                {(item.price * item.quantity).toFixed(2)} ₺
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} style={{ padding: "12px", textAlign: "right" as const, fontWeight: 700, fontSize: "14px", color: "#555", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
              Toplam:
            </td>
            <td style={{ padding: "12px", textAlign: "right" as const, fontWeight: 800, fontSize: "18px", color: HONEY, fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
              {total.toFixed(2)} ₺
            </td>
          </tr>
        </tfoot>
      </table>

      <EmailButton href={orderUrl}>{content.buttonText ?? "Siparişimi Görüntüle"}</EmailButton>
    </EmailLayout>
  );
}
