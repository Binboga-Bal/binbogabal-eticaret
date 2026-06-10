import * as React from "react";
import { EmailLayout, EmailIcon, EmailTitle, EmailBody, EmailButton, EmailDivider, HONEY } from "./email-layout";
import type { EmailTemplateContent } from "../template-content";

interface OrderItem {
  productName: string;
  variantInfo: string;
  quantity: number;
  price: number;
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

      {/* Order items table */}
      <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderCollapse: "collapse", marginBottom: 16 }}>
        <thead>
          <tr style={{ background: "#FFF8E7" }}>
            <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 12, color: "#888", fontWeight: 600 }}>Ürün</th>
            <th style={{ padding: "8px 12px", textAlign: "right", fontSize: 12, color: "#888", fontWeight: 600 }}>Adet</th>
            <th style={{ padding: "8px 12px", textAlign: "right", fontSize: 12, color: "#888", fontWeight: 600 }}>Tutar</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #f5f5f5" }}>
              <td style={{ padding: "10px 12px", fontSize: 14, color: "#333" }}>
                {item.productName}
                {item.variantInfo && (
                  <>
                    <br />
                    <span style={{ color: "#aaa", fontSize: 12 }}>{item.variantInfo}</span>
                  </>
                )}
              </td>
              <td style={{ padding: "10px 12px", textAlign: "right", fontSize: 14, color: "#555" }}>{item.quantity}</td>
              <td style={{ padding: "10px 12px", textAlign: "right", fontSize: 14, fontWeight: 700, color: "#333" }}>
                {(item.price * item.quantity).toFixed(2)} ₺
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2} style={{ padding: "12px", textAlign: "right", fontWeight: 700, fontSize: 14, color: "#555" }}>
              Toplam:
            </td>
            <td style={{ padding: "12px", textAlign: "right", fontWeight: 800, fontSize: 18, color: HONEY }}>
              {total.toFixed(2)} ₺
            </td>
          </tr>
        </tfoot>
      </table>

      <EmailButton href={orderUrl}>{content.buttonText ?? "Siparişimi Görüntüle"}</EmailButton>
    </EmailLayout>
  );
}
